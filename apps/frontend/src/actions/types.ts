import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { BoundingRect } from '@/lib/Editor/interface';
import { WidgetSnapshot } from '@/types';
import { SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

export type ClipboardDataT = {
  action: 'copy' | 'cut';
  selected: {
    id: string;
    boundingRect: BoundingRect;
  }[];
  nodes: Map<string, WidgetSnapshot>;
};

export type UpdateNodesPayload = (Partial<WebloomWidget['snapshot']> & {
  id: WebloomWidget['id'];
})[];

export type RemoteTypes =
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['CREATE_NODE'];
      data: {
        /**
         * operation id
         */
        id?: string;
        nodes: WebloomWidget['snapshot'][];
        sideEffects: UpdateNodesPayload;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['UPDATE_NODE'];
      data: {
        /**
         * operation id
         */
        id?: string;
        updates: UpdateNodesPayload;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['DELETE_NODE'];
      data: {
        /**
         * operation id
         */
        id?: string;
        nodesId: WebloomWidget['id'][];
        sideEffects: UpdateNodesPayload;
      };
    };

export type ActionReturnI = void | RemoteTypes;
export abstract class Command {
  abstract execute(): ActionReturnI;
}

export abstract class UndoableCommand extends Command {
  abstract undo(): ActionReturnI;
}

export function isUndoableCommand(cmd: Command): cmd is UndoableCommand {
  //some duck typing because I'm not actually instancing the classes in the actions but returning them as objects
  return (
    (cmd as UndoableCommand).undo &&
    typeof (cmd as UndoableCommand).undo === 'function'
  );
}
