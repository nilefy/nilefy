import {
  makeObservable,
  observable,
  action,
  computed,
  toJS,
  override,
} from 'mobx';
import { Snapshotable } from './interface';
import { Entity } from './entity';
import { WorkerBroker } from './workerBroker';

import { QueryClient } from '@tanstack/query-core';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';
import { EntityInspectorConfig } from '../interface';
import { concat, debounce } from 'lodash';
import { JsQueryI, updateJSquery } from '@/api/jsQueries.api';
import { commandManager } from '@/actions/CommandManager';
import { UpdateQuery } from '@/actions/editor/updateQuery';
import { EDITOR_CONSTANTS } from '@nilefy/constants';

const onSuccessKey = 'config.onSuccess';
const onFailureKey = 'config.onFailure';
const onMutateKey = 'config.onMutate';

const inspectorConfig: EntityInspectorConfig = [
  {
    sectionName: 'Interactions',
    children: [
      {
        path: onSuccessKey,
        label: 'onSuccess',
        type: 'inlineCodeInput',
        options: {
          placeholder: `{{${EDITOR_CONSTANTS.GLOBALS_ID}.alert("onSuccess")}}`,
        },
        isEvent: true,
      },
      {
        path: onFailureKey,
        label: 'onFailure',
        type: 'inlineCodeInput',
        options: {
          placeholder: `{{${EDITOR_CONSTANTS.GLOBALS_ID}.alert("failed")}}`,
        },
        isEvent: true,
      },
      {
        path: onMutateKey,
        label: 'onMutate',
        type: 'inlineCodeInput',
        options: {
          placeholder: `{{${EDITOR_CONSTANTS.GLOBALS_ID}.alert("query started working")}}`,
        },
        isEvent: true,
      },
    ],
  },
  {
    sectionName: 'General',
    children: [
      { path: 'query', label: 'Query', type: 'codeInput', isCode: true },
    ],
  },
];

export type JSQueryRawValues = {
  /**
   * @description data returned from the query
   * @NOTE start with undefined
   */
  data: unknown;

  /**
   * if the plugin returned error will be here
   */
  error?: string;

  // JS queries also have a query state because they are async by nature
  queryState: 'idle' | 'loading' | 'success' | 'error';

  query: string;
};

const QueryActions = {
  run: {
    type: 'SIDE_EFFECT',
    name: 'run',
    fn: async (entity: WebloomJSQuery) => {
      await entity.run();
    },
  },
  reset: {
    type: 'SIDE_EFFECT',
    name: 'reset',
    fn: (entity: WebloomJSQuery) => {
      entity.reset();
    },
  },
};

const defaultQueryInspectorConfig: EntityInspectorConfig = [
  {
    sectionName: 'Trigger Mode',
    children: [
      {
        path: 'triggerMode',
        type: 'select',
        label: 'Trigger Mode',
        options: {
          items: [
            {
              label: 'On App Load',
              value: 'onAppLoad',
            },
            {
              label: 'Manual',
              value: 'manually',
            },
          ],
        },
      },
    ],
  },
];

export class WebloomJSQuery
  extends Entity
  implements
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomJSQuery>[0],
        | keyof ConstructorParameters<typeof Entity>[0]
        | 'queryClient'
        | 'workspaceId'
      >
    >
{
  appId: JsQueryI['appId'];
  workspaceId: number;
  createdAt: JsQueryI['createdAt'];
  updatedAt: JsQueryI['updatedAt'];
  baseDataSource: { type: string } = { type: 'jsQuery' };
  // as inconvenient as it is, this makes things consistent across all queries
  dataSource = {
    dataSource: {
      type: 'jsQuery',
    },
  };
  private readonly queryClient: QueryClient;
  updateQueryMutator: MobxMutation<
    Awaited<ReturnType<typeof updateJSquery>>,
    FetchXError,
    void,
    void
  >;
  queryRunner: MobxMutation<
    Awaited<{
      data: unknown;
      error: string;
    }>,
    FetchXError,
    void,
    void
  >;

  constructor({
    query,
    settings = {},
    id,
    appId,
    workspaceId,
    createdAt,
    updatedAt,
    workerBroker,
    queryClient,
    triggerMode,
  }: Omit<JsQueryI, 'createdById' | 'updatedById'> & {
    workerBroker: WorkerBroker;
    queryClient: QueryClient;
    workspaceId: number;
  }) {
    super({
      id,
      rawValues: {
        query: query,
        data: undefined,
        queryState: 'idle',
        error: undefined,
        settings,
        triggerMode: triggerMode ?? 'manually',
      },
      workerBroker,
      publicAPI: {
        data: {
          type: 'dynamic',
          description: 'Data returned from the query',
        },
        queryState: {
          type: 'static',
          typeSignature: 'string',
          description: 'State of the query',
        },
        run: {
          type: 'function',
          description: 'Run the query',
        },
        reset: {
          type: 'function',
          description: 'Reset the query',
        },
      },
      entityType: 'jsQuery',
      inspectorConfig: concat(inspectorConfig, defaultQueryInspectorConfig),
      // @ts-expect-error TODO: fix this
      entityActionConfig: QueryActions,
    });
    this.queryClient = queryClient;
    this.updateQueryMutator = new MobxMutation(this.queryClient, () => ({
      mutationFn: () => {
        return updateJSquery({
          appId,
          workspaceId,
          queryId: this.id,
          dto: {
            id: this.id,
            settings: toJS(this.rawValues.settings),
            query: this.rawValues.query as string,
            triggerMode: this.triggerMode,
          },
        });
      },
      onSuccess: (data) => {
        this.updateQuery(data);
      },
      onError: (error) => {
        console.error('error', error);
      },
    }));
    this.queryRunner = new MobxMutation(this.queryClient, () => ({
      mutationFn: () => {
        return this.workerBroker.jsQueryExecutionRequest(this.id);
      },
      onMutate: () => {
        this.setValue('queryState', 'loading');
        this.handleEvent(onMutateKey);
      },
      onError: (error) => {
        this.setValue('queryState', 'error');
        this.setValue('error', error.message);
        this.handleEvent(onFailureKey);
      },
      onSuccess: (data) => {
        this.setValue('data', data);
        this.setValue('error', undefined);
        this.setValue('queryState', 'success');
        this.handleEvent(onSuccessKey);
      },
    }));
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.workspaceId = workspaceId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    makeObservable(this, {
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setQueryState: action,
      reset: action.bound,
      triggerMode: computed,
      setValue: override,
    });
  }
  get triggerMode() {
    return this.rawValues.triggerMode as 'onAppLoad' | 'manually';
  }
  setQueryState(state: 'idle' | 'loading' | 'success' | 'error') {
    this.rawValues.queryState = state;
  }

  updateQuery(
    dto: Omit<
      Partial<JsQueryI & { rawValues: Partial<JSQueryRawValues> }>,
      'id'
    >,
  ) {
    if (dto.query) this.rawValues.query = dto.query;
    if (dto.updatedAt) this.updatedAt = dto.updatedAt;
    if (dto.rawValues) {
      this.rawValues.data = dto.rawValues.data;
      this.rawValues.error = dto.rawValues.error;
    }
  }

  /**
   * trigger the query async, but don't return the promise
   */
  async run() {
    await this.queryRunner.mutateAsync();
  }

  /**
   * Clear the data and error properties of the query.
   */
  reset() {
    this.setValue('data', undefined);
    this.setValue('queryState', 'idle');
    this.setValue('error', undefined);
    this.setValue('statusCode', undefined);
  }
  setValue(path: string, value: unknown, autoSync = true): void {
    const queryMetaProps = ['data', 'error', 'statusCode', 'queryState'];
    if (!queryMetaProps.includes(path) && autoSync) {
      this.updatedAt = new Date();
      this.debouncedSyncRawValuesWithServer();
    }
    super.setValue(path, value);
  }
  syncRawValuesWithServer() {
    commandManager.executeCommand(new UpdateQuery(this.id));
  }
  debouncedSyncRawValuesWithServer = debounce(
    this.syncRawValuesWithServer,
    500,
  );
  get snapshot() {
    return {
      id: this.id,
      query: this.rawValues.query as string,
      settings: toJS(this.rawValues.settings),
      triggerMode: this.triggerMode,
      appId: this.appId,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      workspaceId: this.workspaceId,
    };
  }
}
