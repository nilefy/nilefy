import { computed, makeObservable, observable } from 'mobx';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { EvaluatedRunTimeValues, RuntimeEvaluable } from './interfaces';
import { get } from 'lodash';

export class Entity implements RuntimeEvaluable {
  constructor(
    public id: string,
    public dependencyManager: DependencyManager,
    public evaluationManger: EvaluationManager,
    public rawValues: Record<string, unknown>,
  ) {
    this.rawValues = rawValues;
    makeObservable(this, {
      id: observable,
      dependencyManager: observable,
      evaluationManger: observable,
      rawValues: observable,
      values: computed.struct,
    });
  }
  setPropIsCode(key: string, isCode: boolean) {
    this.evaluationManger.setRawValueIsCode(this.id, key, isCode);
  }

  addDependencies(relations: Array<DependencyRelation>) {
    this.dependencyManager.addDependenciesForEntity(relations, this.id);
  }

  clearDependents() {
    this.dependencyManager.removeRelationshipsForEntity(this.id);
  }

  cleanup() {
    this.clearDependents();
  }

  get values() {
    const evaluatedValues: EvaluatedRunTimeValues = {};
    for (const key in this.rawValues) {
      const path = this.id + '.' + key;
      const evaluatedValue = get(this.evaluationManger.evaluatedForest, path);
      if (evaluatedValue !== undefined) {
        evaluatedValues[key] = evaluatedValue;
      }
    }
    console.warn(
      'DEBUGPRINT[18]: entity.ts:40: evaluatedValues=',
      evaluatedValues,
    );
    return {
      ...this.rawValues,
      ...evaluatedValues,
    };
  }
}
