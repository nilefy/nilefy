import { makeObservable, observable, flow, action, autorun, toJS } from 'mobx';
import { Snapshotable } from './interfaces';
import { CompleteQueryI, runQuery as runQueryApi } from '@/api/queries.api';
import { EvaluationManager } from './evaluationManager';
import { DependencyManager } from './dependencyManager';
import { Entity } from './entity';
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

export class WebloomQuery
  extends Entity
  implements
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomQuery>[0],
        | 'editor'
        | 'dataSource'
        | 'evaluationManger'
        | 'dependencyManager'
        | 'queryClient'
      >
    >
{
  appId: CompleteQueryI['appId'];
  dataSource: CompleteQueryI['dataSource'];
  dataSourceId: CompleteQueryI['dataSourceId'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];
  static queryClient: QueryClient;
  runQuery: MobxMutation<
    Awaited<ReturnType<typeof runQueryApi>>,
    FetchXError,
    Parameters<typeof runQueryApi>[0],
    void
  >;

  constructor({
    query,
    id,
    appId,
    dataSource,
    dataSourceId,
    createdAt,
    updatedAt,
    evaluationManger,
    dependencyManager,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    evaluationManger: EvaluationManager;
    dependencyManager: DependencyManager;
  }) {
    super({
      id,
      dependencyManager,
      evaluationManger,
      rawValues: {
        config: query,
        data: undefined,
        queryState: 'idle',
        type: dataSource.dataSource.type,
        status: undefined,
        error: undefined,
      },
      schema: {
        dataSchema: dataSource.dataSource.queryConfig.schema,
        uiSchema: dataSource.dataSource.queryConfig.uiSchema,
      },
      nestedPathPrefix: 'config',
    });
    this.appId = appId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.runQuery = new MobxMutation(WebloomQuery.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof runQueryApi>[0]) => {
        return runQueryApi(vars);
      },
      onMutate: () => {
        this.setQueryState('loading');
      },
      onError: (error) => {
        this.setQueryState('error');
        this.updateQuery({
          rawValues: {
            error: error.message,
            status: error.statusCode,
          },
        });
      },
      onSuccess: (data) => {
        console.log('DEBUGPRINT[1]: query.ts:108: data=', data);
        this.updateQuery({
          rawValues: {
            data: data.data,
            error: data.error,
            status: data.status,
          },
        });
        console.log('DEBUGPRINT[1]: query.ts:121: data=', data);
        this.setQueryState('success');
        console.log(
          'DEBUGPRINT[1]: query.ts:121: data=',
          data,
          toJS(this.rawValues),
          toJS(this.finalValues),
        );
      },
    }));
    makeObservable(this, {
      fetchValue: flow,
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setQueryState: action,
    });
    autorun(() => console.log('rawvalues', toJS(this.rawValues)));
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
      query: this.rawValues,
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
