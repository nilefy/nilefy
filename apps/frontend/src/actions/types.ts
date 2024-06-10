import { createJSquery, updateJSquery } from '@/api/jsQueries.api';
import { addQuery, updateQuery } from '@/api/queries.api';
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
  newId?: WebloomWidget['id'];
})[];

export type RemoteTypes =
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['CREATE_NODE'];
      data: {
        /**
         * operation id
         */
        opId?: string;
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
        opId?: string;
        updates: UpdateNodesPayload;
      };
    }
  | {
      event: 'rename';
      data: UpdateNodesPayload[number];
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['DELETE_NODE'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        nodesId: WebloomWidget['id'][];
        sideEffects: UpdateNodesPayload;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['CREATE_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        query: Parameters<typeof addQuery>[0]['dto'];
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['UPDATE_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        query: Parameters<typeof updateQuery>[0]['dto'];
        queryId: string;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['DELETE_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        queryId: string;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['CREATE_JS_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        query: Parameters<typeof createJSquery>[0]['dto'];
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['UPDATE_JS_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        query: Parameters<typeof updateJSquery>[0]['dto'];
        queryId: string;
      };
    }
  | {
      event: (typeof SOCKET_EVENTS_REQUEST)['DELETE_JS_QUERY'];
      data: {
        /**
         * operation id
         */
        opId?: string;
        queryId: string;
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
