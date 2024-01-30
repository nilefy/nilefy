import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';

export class Entity {
  constructor(
    public id: string,
    public dependencyManager: DependencyManager,
    public evaluationManger: EvaluationManager,
  ) {}

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
}
