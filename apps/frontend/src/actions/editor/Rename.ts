import { Command } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';

export class RenameAction implements Command {
  constructor(
    private id: WebloomWidget['id'],
    private newId: WebloomWidget['id'],
  ) {}

  execute() {
    return {
      event: 'rename' as const,
      data: {
        id: this.id,
        newId: this.newId,
      },
    };
  }
}
