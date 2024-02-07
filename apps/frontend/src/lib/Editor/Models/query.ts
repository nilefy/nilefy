import { makeObservable, observable, flow, action, autorun, toJS } from 'mobx';
import { Snapshotable } from './interfaces';
import { CompleteQueryI } from '@/api/queries.api';
import { EvaluationManager } from './evaluationManager';
import { DependencyManager } from './dependencyManager';
import { Entity } from './entity';

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
        'editor' | 'dataSource' | 'evaluationManger' | 'dependencyManager'
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
    evaluationManger,
    dependencyManager,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    evaluationManger: EvaluationManager;
    dependencyManager: DependencyManager;
  }) {
    super(id, dependencyManager, evaluationManger, {
      ...query,
      data: undefined,
      queryState: 'idle',
      type: dataSource.dataSource.type,
      status: undefined,
      error: undefined,
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
    if (dto.query) this.rawValues = { ...this.rawValues, ...dto.query };
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
}
