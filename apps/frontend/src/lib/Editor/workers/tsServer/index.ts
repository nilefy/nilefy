import ts, {
  DiagnosticCategory,
  flattenDiagnosticMessageText,
} from 'typescript';
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import { GLOBAL_CONTEXT_FILE, TypeScriptVirtualFileSystem } from './tsfs';
import {
  AutocompleteRequest,
  AutocompleteResponse,
  LintDiagnosticRequest,
  LintDiagnosticResponse,
  TSQuickInfoRequest,
  TSQuickInfoResponse,
} from '../common/interface';
import { concat } from 'lodash';
import log from 'loglevel';
import { makeObservable, observable } from 'mobx';
import { Diagnostic } from '@codemirror/lint';
import { bindingRegexGlobal } from '@/lib/utils';
const wrappers = {
  query: (content: string) => {
    const beforeLine = `(async function() { `;
    const afterLine = ' })();';
    return {
      content: `${beforeLine}${content}${afterLine}`,
      shift: beforeLine.length,
      contentLength: content.length,
    };
  },
  expression: (content: string) => {
    const beforeLine = `(function () { return `;
    const afterLine = ' })();';
    return {
      content: `${beforeLine}${content}${afterLine}`,
      shift: beforeLine.length,
      contentLength: content.length,
    };
  },
  event: (content: string) => {
    const beforeLine = `(async function (): void { `;
    const afterLine = ' })();';
    return {
      content: `${beforeLine}${content}${afterLine}`,
      shift: beforeLine.length,
      contentLength: content.length,
    };
  },
} as const;

// todo maybe give user control over this
export const tsServerCompilerOptions: ts.CompilerOptions = {
  lib: ['ES2020'],
  // we don't want the user to type strict typescript, rather the types are there to help them
  noImplicitAny: false,
  allowJs: true,
  strict: false,
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ES2020,
  skipLibCheck: true,
  moduleDetection: ts.ModuleDetectionKind.Force,
};

const addTSExtension = (fileName: string) => {
  if (!fileName.endsWith('.ts') && !fileName.endsWith('.d.ts')) {
    return fileName + '.ts';
  }
  return fileName;
};
const removeTsExtension = (fileName: string) => {
  if (fileName.endsWith('.ts')) {
    return fileName.slice(0, -3);
  }
  return fileName;
};
const extractBindingsWithPositions = (content: string) => {
  const bindings: {
    content: string;
    start: number;
  }[] = [];
  const matches = content.matchAll(bindingRegexGlobal);
  for (const match of matches) {
    bindings.push({
      content: match[1],
      start: content.indexOf(match[1], match.index),
    });
  }
  return bindings;
};

const wrapCode = (content: string, type: keyof typeof wrappers) => {
  const res = wrappers[type](content);
  return {
    content: wrapExportNothing(res.content),
    shift: res.shift,
    contentLength: res.contentLength,
  };
};

const wrapExportNothing = (content: string) => {
  return content + '\nexport {}';
};
const getBindingName = (fileName: string, index: number) => {
  return `/${fileName}_${index}.ts`;
};
export class TypeScriptServer {
  fileToShift: Map<string, number> = new Map();
  originalBindingFilesContent: Map<
    string,
    {
      content: string;
      bindingPositions: number[];
    }
  > = new Map();
  vfs!: TypeScriptVirtualFileSystem;
  system!: ts.System;
  env!: VirtualTypeScriptEnvironment;
  rootFiles: string[] = [GLOBAL_CONTEXT_FILE];
  initted = false;
  static instance: TypeScriptServer;
  constructor() {
    makeObservable(this, {
      initted: observable,
    });
  }
  static async getInstance() {
    if (TypeScriptServer.instance === undefined) {
      TypeScriptServer.instance = new TypeScriptServer();
      await TypeScriptServer.instance.init();
    }
    return TypeScriptServer.instance;
  }

  async init() {
    if (this.initted) {
      return;
    }
    this.vfs = new TypeScriptVirtualFileSystem();
    await this.vfs.init();
    this.system = createSystem(this.vfs.fs);
    this.env = createVirtualTypeScriptEnvironment(
      this.system,
      this.rootFiles,
      ts,
      tsServerCompilerOptions,
    );
    log.info('ts server initialized');
    this.initted = true;
  }
  createIfNotExists(fileName: string) {
    fileName = addTSExtension(fileName);
    if (this.env.getSourceFile(fileName) === undefined) {
      this.env.createFile(fileName, ' ');
    }
  }
  setFile({
    fileName,
    content,
    isBinding = false,
    isEvent = false,
  }: {
    fileName: string;
    content: string;
    isBinding?: boolean;
    isEvent?: boolean;
  }) {
    if (isBinding) {
      this.handleBindingSetFile(fileName, content, isEvent);
      return;
    }
    fileName = addTSExtension(fileName);
    if (content === '') {
      // we don't want to remove files unless deleteFile is explicitly called
      content = ' ';
    }
    const wrapped = wrapCode(content, 'query');
    this.fileToShift.set(fileName, wrapped.shift);
    this._setFile({
      fileName,
      content: wrapped.content,
    });
  }

  _setFile({ fileName, content }: { fileName: string; content: string }) {
    const existingFile = this.env.getSourceFile(fileName);
    if (existingFile === undefined) {
      this.env.createFile(fileName, content);
    } else {
      this.env.updateFile(fileName, content);
    }
  }
  handleBindingSetFile(fileName: string, content: string, isEvent: boolean) {
    fileName = removeTsExtension(fileName);
    //delete old binding files if they exist
    const i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const bindingFileName = getBindingName(fileName, i);
      if (this.env.getSourceFile(bindingFileName) === undefined) {
        break;
      }
      this.env.updateFile(bindingFileName, '');
      this.fileToShift.delete(bindingFileName);
    }
    const bindings = extractBindingsWithPositions(content);
    for (const [i, binding] of bindings.entries()) {
      const wrappedCode = wrapCode(
        binding.content,
        isEvent ? 'event' : 'expression',
      );
      this.env.createFile(getBindingName(fileName, i), wrappedCode.content);
      this.fileToShift.set(getBindingName(fileName, i), wrappedCode.shift);
    }

    this.originalBindingFilesContent.set(fileName, {
      content,
      bindingPositions: bindings.map((b) => b.start),
    });
  }
  updateGlobalContextFile(content: string) {
    console.log('updating global context file');
    this._setFile({
      fileName: GLOBAL_CONTEXT_FILE,
      content,
    });
  }
  deleteFile(fileName: string) {
    fileName = addTSExtension(fileName);
    if (this.env.getSourceFile(fileName) === undefined) return;
    this.env.updateFile(fileName, '');
    this.fileToShift.delete(fileName);
    this.originalBindingFilesContent.delete(fileName);
  }
  shiftPosition(fileName: string, position: number) {
    return position + (this.fileToShift.get(fileName) ?? 0);
  }
  unShiftPosition(fileName: string, position: number) {
    return position - (this.fileToShift.get(fileName) ?? 0);
  }
  /**
   *
   * @param fileName
   * @param position the cursor position in the editor
   */
  getPositionInBindingFile(fileName: string, position: number) {
    fileName = removeTsExtension(fileName);
    const bindingFile = this.originalBindingFilesContent.get(fileName);
    if (bindingFile === undefined) {
      return { fileName, position };
    }
    const { bindingPositions } = bindingFile;
    let bindingIndex = 0;
    for (const [i, pos] of bindingPositions.entries()) {
      if (position >= pos) {
        bindingIndex = i;
      }
    }
    if (position > bindingPositions[bindingPositions.length - 1])
      bindingIndex = bindingPositions.length - 1;
    const fileNameWithIndex = getBindingName(fileName, bindingIndex);
    const positionInFile = position - bindingPositions[bindingIndex];

    return { fileName: fileNameWithIndex, position: positionInFile };
  }

  handleAutoCompleteRequest(
    body: AutocompleteRequest['body'],
  ): AutocompleteResponse {
    try {
      const res = this.getPositionInBindingFile(body.fileName, body.position);
      body.fileName = res.fileName;
      body.position = res.position;
      body.fileName = addTSExtension(body.fileName);
      body.position = this.shiftPosition(body.fileName, body.position);
      const { fileName, position, requestId } = body;
      const completions = this.env.languageService.getCompletionsAtPosition(
        fileName,
        position,
        //todo figure the best options for ux
        {},
      );

      return {
        event: 'fulfillAutoComplete',
        body: {
          requestId,
          completions,
        },
      };
    } catch (_) {
      return {
        event: 'fulfillAutoComplete',
        body: {
          requestId: body.requestId,
          completions: undefined,
        },
      };
    }
  }

  handleLintRequest(
    body: LintDiagnosticRequest['body'],
  ): LintDiagnosticResponse {
    try {
      body.fileName = addTSExtension(body.fileName);
      const { fileName, requestId } = body;
      this.createIfNotExists(fileName);
      const tsErrors = concat(
        this.env.languageService.getSyntacticDiagnostics(fileName),
        this.env.languageService.getSemanticDiagnostics(fileName),
      );
      //todo filter out the errors that are not related to the user code
      return {
        event: 'fulfillLint',
        body: {
          diagnostics: convertToCodeMirrorDiagnostic(
            tsErrors,
            this.fileToShift.get(fileName) ?? 0,
          ),
          requestId: requestId,
        },
      };
    } catch (_) {
      return {
        event: 'fulfillLint',
        body: {
          diagnostics: [],
          requestId: body.requestId,
        },
      };
    }
  }
  quickInfo(body: TSQuickInfoRequest['body']): TSQuickInfoResponse {
    try {
      const res = this.getPositionInBindingFile(body.fileName, body.position);
      body.fileName = res.fileName;
      body.position = res.position;
      body.fileName = addTSExtension(body.fileName);
      body.position = this.shiftPosition(body.fileName, body.position);
      const { fileName, position } = body;
      this.createIfNotExists(fileName);
      const info = this.env.languageService.getQuickInfoAtPosition(
        fileName,
        position,
      );
      return {
        event: 'fulfillQuickInfo',
        body: {
          requestId: body.requestId,
          info,
        },
      };
    } catch (_) {
      return {
        event: 'fulfillQuickInfo',
        body: {
          requestId: body.requestId,
          info: undefined,
        },
      };
    }
  }
}

const convertToCodeMirrorDiagnostic = (
  tsErrors: ts.Diagnostic[],
  shift = 0,
): Array<Diagnostic> =>
  tsErrors
    .filter((d) => d.start !== undefined && d.length !== undefined)
    .map((d) => {
      let severity: 'info' | 'warning' | 'error' = 'info';
      if (d.category === DiagnosticCategory.Error) {
        severity = 'error';
      } else if (d.category === DiagnosticCategory.Warning) {
        severity = 'warning';
      }

      return {
        from: d.start! - shift, // `!` is fine because of the `.filter()` before the `.map()`
        to: d.start! + d.length! - shift, // `!` is fine because of the `.filter()` before the `.map()`
        severity,
        message: flattenDiagnosticMessageText(d.messageText, '\n', 0),
      };
    });
