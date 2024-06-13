import { editorStore } from '@/lib/Editor/Models';
import { ActionReturnI, RemoteTypes, UndoableCommand } from '../types';
import { GlobalDataSourceI, WsDataSourceI } from '@/api/dataSources.api';
import { nanoid } from 'nanoid';

export class CreateQuery implements UndoableCommand {
  constructor(
    private payload:
      | (Extract<RemoteTypes, { event: 'createQuery' }> & {
          data: {
            baseDataSource: GlobalDataSourceI;
            dataSource: Pick<WsDataSourceI, 'id' | 'name'>;
          };
        })
      | Extract<RemoteTypes, { event: 'createJsQuery' }>,
  ) {
    this.payload = payload;
  }
  execute(): ActionReturnI {
    const { event, data } = this.payload;
    if (event === 'createQuery') {
      editorStore.addQuery({
        baseDataSource: data.baseDataSource,
        createdAt: new Date(),
        updatedAt: null,
        id: data.query.id,
        query: data.query.query,
        triggerMode: data.query.triggerMode!,
        dataSource: data.dataSource,
        dataSourceId: data.query.dataSourceId,
      });
      return this.payload;
    } else {
      editorStore.addJSQuery({
        appId: editorStore.appId,
        createdAt: new Date(),
        id: data.query.id,
        query: data.query.query,
        triggerMode: data.query.triggerMode!,
        updatedAt: null,
        settings: data.query.settings,
      });
      return this.payload;
    }
  }
  undo(): ActionReturnI {
    editorStore.removeQuery(this.payload.data.query.id);
    if (this.payload.event === 'createQuery') {
      return {
        event: 'deleteQuery',
        data: {
          queryId: this.payload.data.query.id,
          opId: nanoid(),
        },
      };
    }
    return {
      event: 'deleteJsQuery',
      data: {
        queryId: this.payload.data.query.id,
        opId: nanoid(),
      },
    };
  }
}
