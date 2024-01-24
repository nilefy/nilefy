import { makeObservable, observable, flow } from 'mobx';
import { Dependable } from './interfaces';
import { EntityDependents } from './entityDependents';
export class WebloomQuery implements Dependable {
  query: string = '';
  id: string = '';
  value: unknown = undefined;
  dependents: EntityDependents;
  constructor() {
    this.dependents = new EntityDependents(new Set());
    makeObservable(this, {
      query: observable,
      value: observable,
      fetchValue: flow,
      dependents: observable,
    });
  }
  fetchValue() {
    this.value = {};
  }
  get snapshot() {
    return {
      query: this.query,
      id: this.id,
      value: this.value,
    };
  }
}
