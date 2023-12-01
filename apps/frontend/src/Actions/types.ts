import { WebloomNode } from '@/lib/Editor/interface';

type RemoteTypes =
  | {
      event: 'insert';
      data: WebloomNode;
    }
  | {
      event: 'update';
      data: (Partial<WebloomNode> & { id: WebloomNode['id'] })[];
    }
  | {
      event: 'delete';
      data: WebloomNode['id'][];
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
