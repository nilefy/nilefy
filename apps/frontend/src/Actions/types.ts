import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { WidgetSnapshot } from '@/types';

export type ClipboardDataT = {
  action: 'copy' | 'cut';
  selected: {
    id: string;
    boundingRect: {
      top: number;
      left: number;
      width: number;
      height: number;
      bottom: number;
      right: number;
    };
  }[];
  nodes: Map<string, WidgetSnapshot>;
};

export type UpdateNodesPayload = (Partial<WebloomWidget['snapshot']> & {
  id: WebloomWidget['id'];
})[];

export type RemoteTypes =
  | {
      event: 'insert';
      data: {
        nodes: WebloomWidget['snapshot'][];
        sideEffects: UpdateNodesPayload;
      };
    }
  | {
      event: 'update';
      data: UpdateNodesPayload;
    }
  | {
      event: 'delete';
      data: {
        nodesId: WebloomWidget['id'][];
        sideEffects: UpdateNodesPayload;
      };
    };

export abstract class Command {
  abstract execute(): void | RemoteTypes;
}

export abstract class UndoableCommand extends Command {
  abstract undo(): void | RemoteTypes;
}

export function isUndoableCommand(cmd: Command): cmd is UndoableCommand {
  //some duck typing because I'm not actually instancing the classes in the actions but returning them as objects
  return (
    (cmd as UndoableCommand).undo &&
    typeof (cmd as UndoableCommand).undo === 'function'
  );
}
