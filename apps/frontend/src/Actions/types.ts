import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { WidgetSnapshot } from '@/types';

export type ClipboardDataT = {
  action: 'copy' | 'cut';
  selected: string[];
  nodes: Record<string, WidgetSnapshot>;
};

export type UpdateNodePayload = (Partial<WebloomWidget['snapshot']> & {
  id: WebloomWidget['id'];
})[];

type RemoteTypes =
  | {
      event: 'insert';
      data: {
        node: WebloomWidget['snapshot'];
        sideEffects: UpdateNodePayload;
      };
    }
  | {
      event: 'update';
      data: UpdateNodePayload;
    }
  | {
      event: 'delete';
      data: WebloomWidget['id'][];
    };

export abstract class Command {
  abstract execute(): void | RemoteTypes;
}

export abstract class UndoableCommand extends Command {
  abstract undo(): void;
}

export function isUndoableCommand(cmd: Command): cmd is UndoableCommand {
  //some duck typing because I'm not actually instancing the classes in the actions but returning them as objects
  return (
    (cmd as UndoableCommand).undo &&
    typeof (cmd as UndoableCommand).undo === 'function'
  );
}
