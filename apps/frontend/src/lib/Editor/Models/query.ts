import { makeObservable, observable, action, toJS, computed } from 'mobx';
import { Snapshotable } from './interface';
import {
  CompleteQueryI,
  runQuery as runQueryApi,
  updateQuery,
} from '@/api/queries.api';
import { Entity } from './entity';
import { WorkerBroker } from './workerBroker';

import { QueryClient } from '@tanstack/query-core';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';
import { EntityInspectorConfig } from '../interface';
import { concat } from 'lodash';

export type QueryRawValues = {
  /**
   * @description data returned from the query
   * @NOTE: start with undefined
   */
  data: unknown;
  /**
   * dataSource type
   */
  type: string;
  /**
   * statusCode of the query call to the other backend, or 505 if ourserver faced error
   */
  statusCode?: number;
  /**
   * if the plugin returned error will be here
   */
  error?: string;
  config: CompleteQueryI['query'];
  queryState: 'idle' | 'loading' | 'success' | 'error';
};

const QueryActions = {
  run: {
    type: 'SIDE_EFFECT',
    name: 'run',
    fn: async (entity: WebloomQuery) => {
      await entity.run();
    },
  },
  reset: {
    type: 'SIDE_EFFECT',
    name: 'reset',
    fn: (entity: WebloomQuery) => {
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

export class WebloomQuery
  extends Entity
  implements
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomQuery>[0],
        | 'dataSource'
        | keyof ConstructorParameters<typeof Entity>[0]
        | 'queryClient'
        | 'workspaceId'
      >
    >
{
  appId: CompleteQueryI['appId'];
  workspaceId: number;
  dataSource: CompleteQueryI['dataSource'];
  dataSourceId: CompleteQueryI['dataSourceId'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];
  private readonly queryClient: QueryClient;
  queryRunner: MobxMutation<
    Awaited<ReturnType<typeof runQueryApi>>,
    FetchXError,
    void,
    void
  >;
  updateQueryMutator: MobxMutation<
    Awaited<ReturnType<typeof updateQuery>>,
    FetchXError,
    void,
    void
  >;
  constructor({
    query,
    id,
    appId,
    workspaceId,
    dataSource,
    dataSourceId,
    triggerMode,
    createdAt,
    updatedAt,
    workerBroker,
    queryClient,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    workerBroker: WorkerBroker;
    queryClient: QueryClient;
    workspaceId: number;
  }) {
    super({
      id,
      rawValues: {
        config: query,
        triggerMode: triggerMode ?? 'manually',
        data: undefined,
        queryState: 'idle',
        type: dataSource.dataSource.type,
        statusCode: undefined,
        error: undefined,
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
      },
      entityType: 'query',
      inspectorConfig: concat(
        [],
        dataSource.dataSource.queryConfig.formConfig as any,
        defaultQueryInspectorConfig,
      ),
      // @ts-expect-error TODO: fix this
      entityActionConfig: QueryActions,
    });
    this.queryClient = queryClient;
    this.updateQueryMutator = new MobxMutation(this.queryClient, () => ({
      mutationFn: () => {
        return updateQuery({
          appId,
          workspaceId,
          queryId: this.id,
          dto: {
            dataSourceId: this.dataSourceId,
            query: toJS(this.rawConfig) as Record<string, unknown>,
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
        return runQueryApi({
          appId,
          workspaceId,
          queryId: this.id,
          body: {
            evaluatedConfig: toJS(this.config) as Record<string, unknown>,
          },
        });
      },
      onMutate: () => {
        this.setValue('queryState', 'loading');
      },
      onError: (error) => {
        this.setValue('queryState', 'error');
        this.setValue('error', error.message);
        this.setValue('status', 505);
      },
      onSuccess: (data) => {
        this.setValue('data', data.data);
        this.setValue('status', data.status);
        this.setValue('error', data.error);
        this.setValue('queryState', 'success');
      },
    }));
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.workspaceId = workspaceId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    makeObservable(this, {
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setQueryState: action,
      reset: action.bound,
      triggerMode: computed,
      setDataSource: action,
      dataSourceId: observable,
      appId: observable,
    });
    // todo: schedule after first evaluation
    // if (this.triggerMode === 'onAppLoad') {
    //   this.queryRunner.mutate();
    // }
  }
  get triggerMode() {
    return this.rawValues.triggerMode as 'onAppLoad' | 'manually';
  }
  setQueryState(state: 'idle' | 'loading' | 'success' | 'error') {
    this.rawValues.queryState = state;
  }
  setDataSource(dataSourceId: string) {
    this.dataSourceId = +dataSourceId;
  }
  // TODO: make it handle id update
  updateQuery(
    dto: Omit<
      Partial<CompleteQueryI & { rawValues: Partial<QueryRawValues> }>,
      'id'
    >,
  ) {
    if (dto.query) this.rawValues.config = dto.query;
    if (dto.updatedAt) this.updatedAt = dto.updatedAt;
    if (dto.dataSource) this.dataSource = dto.dataSource;
    if (dto.dataSourceId) this.dataSourceId = dto.dataSourceId;
    if (dto.rawValues) {
      this.rawValues.data = dto.rawValues.data;
      this.rawValues.error = dto.rawValues.error;
      this.rawValues.statusCode = dto.rawValues.statusCode;
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
    this.rawValues.data = undefined;
    this.rawValues.queryState = 'idle';
    this.rawValues.statusCode = undefined;
    this.rawValues.error = undefined;
  }

  get snapshot() {
    return {
      id: this.id,
      dataSourceId: this.dataSourceId,
      query: this.rawValues.config as Record<string, unknown>,
      appId: this.appId,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      triggerMode: this.triggerMode,
      workspaceId: this.workspaceId,
    };
  }

  get config() {
    return this.finalValues.config;
  }

  get rawConfig() {
    return this.rawValues.config;
  }
}
