import { editorStore } from '@/lib/Editor/Models';
import { ActionReturnI, Command } from '../types';
import { WebloomJSQuery } from '@/lib/Editor/Models/jsQuery';
import { WebloomQuery } from '@/lib/Editor/Models/query';

export class UpdateQuery implements Command {
  constructor(private queryId: string) {}
  execute(): ActionReturnI {
    const query = editorStore.getQueryById(this.queryId);
    if (query.entityType === 'jsQuery') {
      const queryData = (query as WebloomJSQuery).snapshot;
      return {
        event: 'updateJsQuery',
        data: {
          query: {
            query: queryData.query,
            settings: queryData.settings,
            triggerMode: queryData.triggerMode,
          },
          queryId: this.queryId,
        },
      };
    } else {
      const queryData = (query as WebloomQuery).snapshot;
      return {
        event: 'updateQuery',
        data: {
          query: {
            query: queryData.query,
            dataSourceId: queryData.dataSourceId,

            triggerMode: queryData.triggerMode,
          },
          queryId: this.queryId,
        },
      };
    }
  }
}
