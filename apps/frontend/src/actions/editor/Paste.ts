import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, UndoableCommand } from '../types';
import { getWidgetsBoundingRect, normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { getNewEntityName } from '@/lib/Editor/entitiesNameSeed';
import { WidgetTypes } from '@/pages/Editor/Components';
import { AddWidgetPayload } from './Drag';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { RemoteTypes } from '../types';
import { WebloomGridDimensions } from '@/lib/Editor/interface';
import { EDITOR_CONSTANTS, SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

export class PasteAction implements UndoableCommand {
  private parent: string;
  private data: ClipboardDataT;
  private mousePos: Point;
  private undoData: ReturnType<
    InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
  > = {};

  constructor({ data, mousePos }: { data: ClipboardDataT; mousePos: Point }) {
    this.data = {
      ...data,
      nodes: new Map(data.nodes),
    };
    this.mousePos = mousePos;
    const hoveredWidget = editorStore.currentPage.getWidgetById(
      editorStore.currentPage.hoveredWidgetId || EDITOR_CONSTANTS.ROOT_NODE_ID,
    );
    this.parent = hoveredWidget.canvasParent.id;
  }

  paste(node: string, parent: string, change?: WebloomGridDimensions) {
    const snapshot = this.data.nodes.get(node)!;

    let id: string = snapshot.id!;
    if (this.data.action === 'copy') {
      id = getNewEntityName(snapshot.type as WidgetTypes);
    }

    snapshot.id = id;
    snapshot.parentId = parent;
    if (change) {
      snapshot.col = change.col;
      snapshot.row = change.row;
      snapshot.columnsCount = change.columnsCount;
      snapshot.rowsCount = change.rowsCount;
    }

    for (const child of this.data.nodes.get(node)!.nodes!) {
      this.paste(child, id);
    }
  }

  execute() {
    const parent = editorStore.currentPage.getWidgetById(this.parent);
    const { x: px, y: py } = parent.pixelDimensions;
    const [gridrow] = parent.gridSize;
    const gridCol = parent.columnWidth;

    const { top, left } = getWidgetsBoundingRect(this.data.selected);
    const dx = this.mousePos.x - left;
    const dy = this.mousePos.y - top;

    for (const widget of this.data.selected) {
      const oldDims = widget.boundingRect;
      const newDims = {
        x: oldDims.left + dx,
        y: oldDims.top + dy,
      };

      const col = normalize(newDims.x - px, gridCol) / gridCol;
      const row = normalize((newDims.y - py) / gridrow, gridrow);
      const columnsCount = normalize(oldDims.width, gridCol) / gridCol;
      const rowsCount = normalize(oldDims.height / gridrow, gridrow);
      this.paste(widget.id, this.parent, { col, row, columnsCount, rowsCount });
    }

    const data: Extract<
      RemoteTypes,
      { event: (typeof SOCKET_EVENTS_REQUEST)['CREATE_NODE'] }
    >['data'] = {
      nodes: [],
      sideEffects: [],
    };
    for (const snapshot of this.data.nodes.values()) {
      const add: AddWidgetPayload = {
        ...snapshot,
        nodes: [],
      };
      editorStore.currentPage.addWidget(add);

      // TODO: handle horizontal expansion in moveWidgetIntoGrid
      const ret = editorStore.currentPage.moveWidgetIntoGrid(add.id!, {});
      const affectedNodes = Object.keys(ret)
        .filter((test) => test !== add.id)
        .map((k) => editorStore.currentPage.getWidgetById(k).snapshot);

      this.undoData = {
        ...this.undoData,
        ...ret,
      };
      data.sideEffects.push(...affectedNodes);
      data.nodes.push(
        editorStore.currentPage.getWidgetById(add.id as string).snapshot,
      );
    }
    return {
      event: SOCKET_EVENTS_REQUEST['CREATE_NODE'],
      data,
    };
  }

  undo() {
    const data = [...this.data.nodes.values()].map((node) => {
      editorStore.currentPage.removeWidget(node.id!);
      return node.id!;
    });
    const sideEffects: Extract<
      RemoteTypes,
      { event: 'deleteNode' }
    >['data']['sideEffects'] = [];
    Object.entries(this.undoData).forEach(([id, coords]) => {
      if (!data.includes(id)) {
        editorStore.currentPage.getWidgetById(id).setDimensions(coords);
        sideEffects.push(editorStore.currentPage.getWidgetById(id).snapshot);
      }
    });
    return {
      event: SOCKET_EVENTS_REQUEST.DELETE_NODE,
      data: {
        nodesId: data,
        sideEffects,
      },
    };
  }
}
