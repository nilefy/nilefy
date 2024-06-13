import { Entity } from '@/lib/Editor/Models/entity';
import { ActionReturnI, RemoteTypes, UndoableCommand } from '../types';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { WebloomJSQuery } from '@/lib/Editor/Models/jsQuery';
import { WebloomQuery } from '@/lib/Editor/Models/query';
import { UpdateQuery } from './updateQuery';
import { forEach, merge } from 'lodash';
import { ChangePropAction } from './changeProps';
import { isValidIdentifier } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { entitiyNameExists } from '@/lib/Editor/entitiesNameSeed';

export class RenameAction implements UndoableCommand {
  constructor(
    private id: Entity['id'],
    private newId: Entity['id'],
  ) {}

  execute(): ActionReturnI {
    if (this.id === this.newId) return;
    if (!isValidIdentifier(this.newId)) {
      toast({
        title: 'Error',
        description: `Failed to rename ${this.id} to ${this.newId}, because ${this.newId} is not a valid identifier name.`,
        variant: 'destructive',
      });
      return;
    }
    const entity = editorStore.getEntityById(this.id);
    if (entitiyNameExists(this.newId, editorStore.currentPageId)) {
      toast({
        title: 'Error',
        description: `Failed to rename ${entity?.entityType} ${this.id} to ${this.newId}, because ${this.newId} already exists.`,
        variant: 'destructive',
      });
      return;
    }
    if (!entity) return;
    const entityType = entity.entityType;
    const dependents = entity.connections.dependents;
    const ret: ActionReturnI = [];
    editorStore.renameEntity(this.id, this.newId);
    switch (entityType) {
      case 'widget':
        ret.push({
          event: 'updateNode',
          data: {
            updates: [
              {
                ...(entity as WebloomWidget).snapshot,
                id: this.id,
                newId: this.newId,
              },
              ...(entity as WebloomWidget).nodes.map((id) => {
                return editorStore.currentPage.getWidgetById(id).snapshot;
              }),
            ],
          },
        });
        break;
      case 'jsQuery':
        {
          const snapshot = (entity as WebloomJSQuery).snapshot;
          ret.push({
            event: 'updateJsQuery',
            data: {
              queryId: this.id,
              query: {
                id: this.newId,
                query: snapshot.query,
                settings: snapshot.settings,
                triggerMode: snapshot.triggerMode,
              },
            },
          });
        }
        break;
      case 'query': {
        const snapshot = (entity as WebloomQuery).snapshot;
        ret.push({
          event: 'updateQuery',
          data: {
            queryId: this.id,
            query: {
              id: this.newId,
              dataSourceId: snapshot.dataSourceId,
              query: snapshot.query,
              triggerMode: snapshot.triggerMode,
            },
          },
        });
        break;
      }
    }
    const sideEffects = editorStore.getRefactoredDependentPaths(
      this.id,
      this.newId,
      dependents,
    );
    forEach(
      merge({}, sideEffects['jsQuery'], sideEffects['query']),
      (item, key) => {
        const jsQuery = editorStore.getQueryById(key) as WebloomJSQuery;
        item.forEach((effect) => {
          jsQuery.setValue(effect.path, effect.value, false);
        });
        const localRet = new UpdateQuery(key).execute();
        ret.push(localRet as RemoteTypes);
      },
    );
    forEach(sideEffects['widget'], (item, key) => {
      const widget = editorStore.currentPage.getWidgetById(key);
      item.forEach((effect) => {
        widget.setValue(effect.path, effect.value, false);
      });
      ret.push(new ChangePropAction(widget.id).execute() as RemoteTypes);
    });
    return ret;
  }
  undo(): ActionReturnI {
    return new RenameAction(this.newId, this.id).execute();
  }
}
