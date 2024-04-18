import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { Command } from '../types';
import { commandManager } from '../CommandManager';
import { WidgetSelection } from './selection';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomQuery } from '@/lib/Editor/Models/query';

export class RemoteSelectEntity implements Command {
  constructor(private id: string) {}
  execute() {
    const entity = editorStore.getEntityById(this.id);
    if (entity instanceof WebloomWidget) {
      commandManager.executeCommand(WidgetSelection.remoteSelect(this.id));
      entity.dom?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (entity instanceof WebloomQuery) {
      editorStore.setSelectedQueryId(this.id);
    }
  }
}
