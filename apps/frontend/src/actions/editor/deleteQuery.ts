import { editorStore } from '@/lib/Editor/Models';
import { ActionReturnI, UndoableCommand } from '../types';
import { WebloomQuery } from '@/lib/Editor/Models/query';
import { WebloomJSQuery } from '@/lib/Editor/Models/jsQuery';
import { nanoid } from 'nanoid';

export class DeleteQuery implements UndoableCommand {
  private isJsQuery!: boolean;
  private snapshot!:
    | InstanceType<typeof WebloomQuery>['snapshot']
    | InstanceType<typeof WebloomJSQuery>['snapshot'];
  constructor(private queryId: string) {}

  execute(): ActionReturnI {
    const query = editorStore.getEntityById(this.queryId) as
      | WebloomQuery
      | WebloomJSQuery;
    if (!query) return;
    const isJsQuery = query.entityType === 'jsQuery';
    this.isJsQuery = isJsQuery;
    this.snapshot = query.snapshot;
    editorStore.removeQuery(this.queryId);
    if (isJsQuery) {
      return {
        event: 'deleteJsQuery',
        data: {
          queryId: this.queryId,
          opId: nanoid(),
        },
      };
    }
    return {
      event: 'deleteQuery',
      data: {
        queryId: this.queryId,
        opId: nanoid(),
      },
    };
  }
  undo(): ActionReturnI {
    const tempSnapshot = this.snapshot as InstanceType<
      typeof WebloomJSQuery
    >['snapshot'];

    if (this.isJsQuery) {
      editorStore.addJSQuery(tempSnapshot);
      return {
        event: 'createJsQuery',
        data: {
          opId: nanoid(),
          query: {
            id: tempSnapshot.id,
            query: tempSnapshot.query,
            triggerMode: tempSnapshot.triggerMode,
            settings: tempSnapshot.settings,
          },
        },
      };
    } else {
      const tempSnapshot = this.snapshot as InstanceType<
        typeof WebloomQuery
      >['snapshot'];
      editorStore.addQuery(tempSnapshot);
      return {
        event: 'createQuery',
        data: {
          opId: nanoid(),
          query: {
            id: tempSnapshot.id,
            query: tempSnapshot.query,
            // todo handle dangling queries type
            dataSourceId: tempSnapshot.dataSourceId as number,
            triggerMode: tempSnapshot.triggerMode,
          },
        },
      };
    }
  }
}
