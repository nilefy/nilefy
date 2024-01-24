import { observable } from 'mobx';

export class EntityDependents {
  dependents: Set<string> = new Set();
  constructor(dependents: Set<string>) {
    this.dependents = dependents;
    observable(this, {
      dependents: observable,
    });
  }
  addDependent(id: string) {
    this.dependents.add(id);
  }
  removeDependent(id: string) {
    this.dependents.delete(id);
  }
  clearDependents() {
    this.dependents.clear();
  }
}
