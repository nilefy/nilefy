import ts, {
  DiagnosticCategory,
  flattenDiagnosticMessageText,
} from 'typescript';
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import { GLOBAL_CONTEXT_FILE, TSFS } from './tsfs';
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
// todo maybe give user control over this
export const tsServerCompilerOptions: ts.CompilerOptions = {
  lib: ['ESNext'],
  // we don't want the user to type strict typescript, rather the types are there to help them
  noImplicitAny: false,
  allowJs: true,
  strict: false,
  skipLibCheck: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  rootDir: '/',
  moduleDetection: ts.ModuleDetectionKind.Force,
  target: ts.ScriptTarget.ESNext,
};

const addTSExtension = (fileName: string) => {
  if (!fileName.endsWith('.ts') && !fileName.endsWith('.d.ts')) {
    return fileName + '.ts';
  }
  return fileName;
};

const addExportsNothing = (content: string) => {
  return content + '\nexport {}';
};
export class TypeScriptServer {
  vfs!: TSFS;
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
    this.vfs = new TSFS();
    await this.vfs.init();
    this.system = createSystem(this.vfs.fs);
    this.env = createVirtualTypeScriptEnvironment(
      this.system,
      this.rootFiles,
      ts,
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
  setFile(fileName: string, content: string, addExports = true) {
    fileName = addTSExtension(fileName);
    if (content === '') {
      // we don't want to remove files unless deleteFile is explicitly called
      content = ' ';
    }
    const existingFile = this.env.getSourceFile(fileName);
    if (existingFile === undefined) {
      this.env.createFile(fileName, content);
    } else {
      this.env.updateFile(
        fileName,
        addExports ? addExportsNothing(content) : content,
      );
    }
  }

  updateGlobalContextFile(content: string) {
    console.log('updating global context file');
    this.setFile(GLOBAL_CONTEXT_FILE, content, false);
  }
  deleteFile(fileName: string) {
    if (!this.initted) return;
    fileName = addTSExtension(fileName);
    if (this.env.getSourceFile(fileName) === undefined) return;
    this.env.updateFile(fileName, '');
  }

  handleAutoCompleteRequest(
    body: AutocompleteRequest['body'],
  ): AutocompleteResponse {
    body.fileName = addTSExtension(body.fileName);
    const { fileName, position, requestId } = body;
    const completions = this.env.languageService.getCompletionsAtPosition(
      fileName,
      position,
      //todo figure the best options for ux
      {
        includeInlayVariableTypeHints: true,
      },
    );

    return {
      event: 'fulfillAutoComplete',
      body: {
        requestId,
        completions,
      },
    };
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
          diagnostics: convertToCodeMirrorDiagnostic(tsErrors),
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
      body.fileName = addTSExtension(body.fileName);
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
        from: d.start!, // `!` is fine because of the `.filter()` before the `.map()`
        to: d.start! + d.length!, // `!` is fine because of the `.filter()` before the `.map()`
        severity,
        message: flattenDiagnosticMessageText(d.messageText, '\n', 0),
      };
    });
