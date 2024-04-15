import { nanoid } from 'nanoid';
import {
  AutocompleteRequest,
  AutocompleteResponse,
  LintDiagnosticResponse,
  TSQuickInfoResponse,
} from '../workers/common/interface';
import { PendingRequest, WorkerBroker } from './workerBroker';

export class TSServerBroker {
  // todo do we need more than one pending auto complete request?
  pendingAutoCompleteRequest: PendingRequest<
    AutocompleteResponse['body']['completions']
  > | null = null;
  pendingAutoCompletePromise: Promise<
    AutocompleteResponse['body']['completions']
  > | null = null;
  pendingLintDiagnosticRequest: PendingRequest<
    LintDiagnosticResponse['body']['diagnostics']
  > | null = null;
  lintDiagnosticPromise: Promise<
    LintDiagnosticResponse['body']['diagnostics']
  > | null = null;
  pendingQuickInfoRequest: PendingRequest<
    TSQuickInfoResponse['body']['info']
  > | null = null;
  pendingQuickInfoPromise: Promise<TSQuickInfoResponse['body']['info']> | null =
    null;
  constructor(private readonly workerBroker: WorkerBroker) {}
  async fulfillAutoComplete(body: AutocompleteResponse['body']) {
    const { completions } = body;
    if (!this.pendingAutoCompleteRequest) return;
    this.pendingAutoCompleteRequest.resolve(completions);
    this.pendingAutoCompleteRequest = null;
  }
  autoCompleteRequest = (autoCompleteRequest: AutocompleteRequest) => {
    if (this.pendingAutoCompleteRequest) {
      return this.pendingAutoCompletePromise;
    }
    const promise = new Promise<AutocompleteResponse['body']['completions']>(
      (resolve, reject) => {
        this.pendingAutoCompleteRequest = {
          resolve,
          reject,
          id: nanoid(),
        };
      },
    );
    this.workerBroker.postMessege(autoCompleteRequest);
    this.pendingAutoCompletePromise = promise;
    return promise;
  };

  lintDiagnosticRequest = async (fileName: string) => {
    if (this.pendingLintDiagnosticRequest) {
      return await this.lintDiagnosticPromise;
    }
    const id = nanoid();
    const promise = new Promise<LintDiagnosticResponse['body']['diagnostics']>(
      (resolve, reject) => {
        this.pendingLintDiagnosticRequest = {
          resolve,
          reject,
          id,
        };
      },
    );
    this.workerBroker.postMessege({
      event: 'lint',
      body: { fileName, requestId: id },
    });
    this.lintDiagnosticPromise = promise;
    return await promise;
  };

  fulfillLint = (body: LintDiagnosticResponse['body']) => {
    const { diagnostics } = body;
    if (!this.pendingLintDiagnosticRequest) return;
    this.pendingLintDiagnosticRequest.resolve(diagnostics);
    this.pendingLintDiagnosticRequest = null;
  };

  updateFile(fileName: string, content: string) {
    this.workerBroker.postMessege({
      event: 'updateTSFile',
      body: { fileName, content },
    });
  }

  removeFile(fileName: string) {
    this.workerBroker.postMessege({
      event: 'removeTsFile',
      body: { fileName },
    });
  }

  quickInfo = (fileName: string, position: number) => {
    if (this.pendingQuickInfoRequest) {
      return this.pendingQuickInfoPromise;
    }
    const id = nanoid();
    const promise = new Promise<TSQuickInfoResponse['body']['info']>(
      (resolve, reject) => {
        this.pendingQuickInfoRequest = {
          resolve,
          reject,
          id,
        };
      },
    );
    this.workerBroker.postMessege({
      event: 'quickInfo',
      body: { fileName, position, requestId: id },
    });
    this.pendingQuickInfoPromise = promise;
    return promise;
  };

  fulfillQuickInfo = (body: TSQuickInfoResponse['body']) => {
    const { info } = body;
    if (!this.pendingQuickInfoRequest) return;
    this.pendingQuickInfoRequest.resolve(info);
    this.pendingQuickInfoRequest = null;
  };
}
