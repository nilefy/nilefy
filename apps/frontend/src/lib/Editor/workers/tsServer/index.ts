import ts, { WithMetadata } from 'typescript';
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import { TSFS } from './tsfs';
import {
  AutocompleteRequest,
  AutocompleteResponse,
  LintRequest,
  LintResponse,
} from '../common/interface';
import { concat } from 'lodash';
import log from 'loglevel';
import { EDITOR_CONSTANTS } from '@webloom/constants';
// todo maybe give user control over this
export const tsServerCompilerOptions: ts.CompilerOptions = {
  lib: ['esnext'],
  // we don't want the user to type strict typescript, rather the types are there to help them
  noImplicitAny: false,
  allowJs: true,
  strict: false,
};

const addTSExtension = (fileName: string) => {
  if (!fileName.endsWith('.ts')) {
    return fileName + '.ts';
  }
  return fileName;
};
export class TypeScriptServer {
  vfs!: TSFS;
  system!: ts.System;
  env!: VirtualTypeScriptEnvironment;
  rootFiles: string[] = [
    '/' + EDITOR_CONSTANTS.JS_AUTOCOMPLETE_FILE_NAME + '.d.ts',
  ];
  initted = false;
  static instance: TypeScriptServer;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    const instance = new TypeScriptServer();
    instance.init();
    this.instance = instance;
    return instance;
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

  setFile(fileName: string, content: string) {
    if (!this.initted) return;
    fileName = addTSExtension(fileName);
    if (content === '') {
      // we don't want to remove files unless deleteFile is explicitly called
      content = ' ';
    }
    const existingFile = this.env.getSourceFile(fileName);
    if (existingFile === undefined) {
      this.env.createFile(fileName, content);
    } else {
      this.env.updateFile(fileName, content);
    }
  }

  deleteFile(fileName: string) {
    if (!this.initted) return;
    fileName = addTSExtension(fileName);
    this.env.updateFile(fileName, '');
  }

  handleAutoCompleteRequest(
    body: AutocompleteRequest['body'],
  ): AutocompleteResponse {
    if (!this.initted)
      return {
        event: 'fulfillAutoComplete',
        body: {
          requestId: body.requestId,
          // @ts-expect-error todo figure out the best way to handle this
          completions: [] as WithMetadata<ts.CompletionEntry>,
        },
      };
    body.fileName = addTSExtension(body.fileName);
    const { fileName, fileContent, position, requestId } = body;
    this.setFile(fileName, fileContent);
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
  }

  handleLintRequest(body: LintRequest['body']): LintResponse {
    if (!this.initted)
      return {
        event: 'fulfillLint',
        body: {
          requestId: 'todo',
          diagnostics: [],
        },
      };
    body.fileName = addTSExtension(body.fileName);
    const { fileName, fileContent } = body;
    this.setFile(fileName, fileContent);
    const tsErrors = concat(
      this.env.languageService.getSyntacticDiagnostics(fileName),
      this.env.languageService.getSemanticDiagnostics(fileName),
    );

    //todo filter out the errors that are not related to the user code
    return {
      event: 'fulfillLint',
      body: {
        diagnostics: tsErrors,
        requestId: 'todo',
      },
    };
  }
}
