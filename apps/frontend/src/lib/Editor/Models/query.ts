import {
  makeObservable,
  observable,
  flow,
  action,
  computed,
  autorun,
  toJS,
} from 'mobx';
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
  // add any data you want to expose
  public rawValues: QueryRawValues;
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];
  // TODO: i don't like this place but EvaluationManager is tigtly coupled with `rawValues`, maybe update this in the next refactor hhh
  /**
   * un-evaluated config
   * @NOTE: use `unEvaluatedConfig` to render the config form.
   * @NOTE: send the server `values` or `evaluatedConfig`: values === evaluatedConfig
   * @NOTE: rawValues used to expose public props to the editor context
   */
  unEvaluatedConfig: CompleteQueryI['query'];

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
    this.unEvaluatedConfig = query;
    // setup public values
    this.rawValues = {
      data: undefined,
      isLoading: false,
      type: dataSource.dataSource.type,
      status: undefined,
      error: undefined,
    };
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    makeObservable(this, {
      rawValues: observable,
      values: computed.struct,
      evaluatedConfig: computed,
      fetchValue: flow,
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setIsLoading: action,
    });
  }

  /**
   * query public data
   * @NOTE: use `unEvaluatedConfig` to render the config form.
   * @NOTE: send the server `values` or `evaluatedConfig`: values === evaluatedConfig
   * @NOTE: rawValues used to expose public props to the editor context
   */
  get values() {
    return this.rawValues;
  }

  /**
   * evaluated config
   * @NOTE: use `unEvaluatedConfig` to render the config form.
   * @NOTE: send the server `values` or `evaluatedConfig`: values === evaluatedConfig
   * @NOTE: rawValues used to expose public props to the editor context
   */
  get evaluatedConfig(): EvaluatedRunTimeProps {
    const evaluatedProps: EvaluatedRunTimeProps = {};
    for (const key in this.unEvaluatedConfig) {
      const path = this.id + '.' + key;
      const evaluatedValue = get(this.evaluationManger.evaluatedForest, path);
      if (evaluatedValue !== undefined) {
        evaluatedProps[key] = evaluatedValue;
      }
    }
    return {
      ...this.unEvaluatedConfig,
      ...evaluatedProps,
    };
  }

  /**
   * wrapper around `updataQuery`
   */
  setIsLoading(state: boolean) {
    this.rawValues.isLoading = state;
  }

  // TODO: make it handle id update
  updateQuery(
    dto: Omit<
      Partial<CompleteQueryI & { rawValues: Partial<QueryRawValues> }>,
      'id'
    >,
  ) {
    if (dto.query) this.unEvaluatedConfig = dto.query;
    if (dto.updatedAt) this.updatedAt = dto.updatedAt;
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
