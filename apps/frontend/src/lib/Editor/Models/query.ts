import { makeObservable, observable, action, toJS } from 'mobx';
import { Snapshotable } from './interfaces';
import { CompleteQueryI, runQuery as runQueryApi } from '@/api/queries.api';
import { Entity } from './entity';
import { WorkerBroker } from './workerBroker';

import { QueryClient } from '@tanstack/query-core';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';

export type QueryRawValues = {
  isLoading: boolean;
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
  status?: number;
  /**
   * if the plugin returned error will be here
   */
  error?: string;
};

const QueryActions = {
  runQuery: {
    type: 'SIDE_EFFECT',
    name: 'runQuery',
    fn: (entity: WebloomQuery) => {
      entity.runQuery.mutate();
    },
  },
};

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
  dataSource: CompleteQueryI['dataSource'];
  dataSourceId: CompleteQueryI['dataSourceId'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];
  workspaceId: number;
  private readonly queryClient: QueryClient;
  runQuery: MobxMutation<
    Awaited<ReturnType<typeof runQueryApi>>,
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
        data: undefined,
        queryState: 'idle',
        type: dataSource.dataSource.type,
        status: undefined,
        error: undefined,
      },
      workerBroker,
      publicAPI: new Set(['data', 'queryState']),
      entityType: 'query',
      inspectorConfig: dataSource.dataSource.queryConfig.formConfig as any,
      // @ts-expect-error TODO: fix this
      entityActionConfig: QueryActions,
    });
    this.queryClient = queryClient;
    this.runQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: () => {
        return runQueryApi({
          appId,
          workspaceId,
          queryId: id,
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
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    
    makeObservable(this, {
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setQueryState: action,
    });
  }

  setQueryState(state: 'idle' | 'loading' | 'success' | 'error') {
    this.rawValues.queryState = state;
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
      this.rawValues.status = dto.rawValues.status;
    }
  }

  // TODO: call server to get actual data
  fetchValue() {
    // this.value = {};
  }

  get snapshot() {
    return {
      id: this.id,
      dataSourceId: this.dataSourceId,
      query: this.rawValues.config as Record<string, unknown>,
      appId: this.appId,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
    };
  }

  get config() {
    return this.finalValues.config;
  }

  get rawConfig() {
    return this.rawValues.config;
  }
}
