import { makeObservable, observable, flow, action, autorun, toJS } from 'mobx';
import { Snapshotable } from './interfaces';
import { CompleteQueryI } from '@/api/queries.api';

import { Entity } from './entity';
import { WorkerBroker } from './workerBroker';

type QueryRawValues = {
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
        | keyof ConstructorParameters<typeof Entity>[0]
      >
    >
{
  appId: CompleteQueryI['appId'];
  dataSource: CompleteQueryI['dataSource'];
  dataSourceId: CompleteQueryI['dataSourceId'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];

  constructor({
    query,
    id,
    appId,
    dataSource,
    dataSourceId,
    createdAt,
    updatedAt,
    workerBroker,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    workerBroker: WorkerBroker;
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
      nestedPathPrefix: 'config',
      entityType: 'query',
    });

    this.appId = appId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    makeObservable(this, {
      fetchValue: flow,
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
    if (dto.rawValues)
      this.rawValues = {
        ...this.rawValues,
        ...dto.rawValues,
      };
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
