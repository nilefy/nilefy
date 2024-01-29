import { makeObservable, observable, flow } from 'mobx';
import { RuntimeEvaluable, Snapshotable } from './interfaces';
import { CompeleteQueryI } from '@/api/queries.api';

export class WebloomQuery
  implements
    RuntimeEvaluable,
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomQuery>[0],
        'editor' | 'dataSource'
      >
    >
{
  id: string;
  // TODO: can we move this from here?
  appId: CompeleteQueryI['appId'];
  // TODO: can we move this from here?
  dataSource: CompeleteQueryI['dataSource'];
  // TODO: can we move this from here?
  dataSourceId: CompeleteQueryI['dataSourceId'];
  rawValues: CompeleteQueryI['query'];

  constructor({
    query,
    id,
    // TODO: can we move this from here?
    appId,
    // TODO: can we move this from here?
    dataSource,
    // TODO: can we move this from here?
    dataSourceId,
  }: Omit<CompeleteQueryI, 'createdById' | 'updatedById'>) {
    this.id = id;
    this.appId = appId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.rawValues = query;
    makeObservable(this, {
      rawValues: observable,
      fetchValue: flow,
    });
  }

  // TODO: return evaluated config
  get values() {
    return this.rawValues;
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
    };
  }
}
