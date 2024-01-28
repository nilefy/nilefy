import { makeObservable, observable, flow } from 'mobx';
import { RuntimeEvaluable, Snapshotable } from './interfaces';
import { WebloomPage } from './page';

export class WebloomQuery
  implements
    RuntimeEvaluable,
    Snapshotable<
      Omit<ConstructorParameters<typeof WebloomQuery>[0], 'page'> & {
        pageId: string;
      }
    >
{
  id: string = '';
  page: WebloomPage;
  rawValues = {
    query: '',
  };

  constructor({
    query,
    id,
    page,
  }: {
    query: string;
    id: string;
    page: WebloomPage;
  }) {
    this.rawValues.query = query;
    this.id = id;
    this.page = page;
    makeObservable(this, {
      rawValues: observable,
      fetchValue: flow,
    });
  }
  get values() {
    return this.rawValues;
  }

  fetchValue() {
    // this.value = {};
  }
  get snapshot() {
    return {
      query: this.rawValues.query,
      id: this.id,
      pageId: this.page.id,
    };
  }
}
