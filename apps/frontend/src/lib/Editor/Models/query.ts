import { makeObservable, observable, flow } from 'mobx';
export class WebloomQuery {
  query: string = '';
  id: string = '';
  value: unknown = undefined;
  constructor() {
    makeObservable(this, {
      query: observable,
      value: observable,
      fetchValue: flow,
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
