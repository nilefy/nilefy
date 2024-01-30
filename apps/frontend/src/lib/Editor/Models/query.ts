import { makeObservable, observable, flow, action } from 'mobx';
import {
  EvaluatedRunTimeProps,
  RuntimeEvaluable,
  Snapshotable,
} from './interfaces';
import { CompleteQueryI } from '@/api/queries.api';
import { get } from 'lodash';
import { EvaluationManager } from './evaluationManager';
import { DependencyManager } from './dependencyManager';
import { Entity } from './entity';

export class WebloomQuery
  extends Entity
  implements
    RuntimeEvaluable,
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomQuery>[0],
        'editor' | 'dataSource' | 'evaluationManger' | 'dependencyManager'
      >
    >
{
  // TODO: can we move this from here?
  appId: CompleteQueryI['appId'];
  // TODO: can we move this from here?
  dataSource: CompleteQueryI['dataSource'];
  // TODO: can we move this from here?
  dataSourceId: CompleteQueryI['dataSourceId'];
  /**
   * raw config
   * use rawValues to show the form, send the server `values`(evaluated config)
   */
  public rawValues: CompleteQueryI['query'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];

  constructor({
    query,
    id,
    // TODO: can we move this from here?
    appId,
    // TODO: can we move this from here?
    dataSource,
    // TODO: can we move this from here?
    dataSourceId,
    createdAt,
    updatedAt,
    evaluationManger,
    dependencyManager,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    evaluationManger: EvaluationManager;
    dependencyManager: DependencyManager;
  }) {
    super(id, dependencyManager, evaluationManger);
    this.appId = appId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.rawValues = query;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    makeObservable(this, {
      rawValues: observable,
      fetchValue: flow,
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
    });
  }

  // TODO: return evaluated config
  /**
   * evaluated config
   * use rawValues to show the form, send the server `values`(evaluated config)
   */
  get values() {
    return this.rawValues;
  }

  get evaluatedConfig(): EvaluatedRunTimeProps {
    const evaluatedProps: EvaluatedRunTimeProps = {};
    for (const key in this.rawValues) {
      const path = this.id + '.' + key;
      const evaluatedValue = get(this.evaluationManger.evaluatedForest, path);
      if (evaluatedValue !== undefined) {
        evaluatedProps[key] = evaluatedValue;
      }
    }
    return {
      ...this.rawValues,
      ...evaluatedProps,
    };
  }

  updateQuery(dto: Omit<Partial<CompleteQueryI>, 'id'>) {
    if (dto.query) this.rawValues = dto.query;
    if (dto.updatedAt) this.updatedAt = dto.updatedAt;
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
