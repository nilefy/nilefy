import { nanoid } from 'nanoid';
import { Command } from '../types';

export class ChangePage implements Command {
  constructor(private pageId: number) {}
  execute() {
    return {
      event: 'changePage',
      data: {
        opId: nanoid(),
        pageId: this.pageId,
      },
    } as const;
  }
}
