import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, UndoableCommand, UpdateNodesPayload } from '../types';
import { normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { WidgetTypes } from '@/pages/Editor/Components';
import { AddWidgetPayload } from './Drag';
import { commandManager } from '../CommandManager';
import { DeleteAction } from './Delete';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { RemoteTypes } from '../types';

export class PasteAction implements UndoableCommand {
  private parent: string;
  private data: ClipboardDataT;
  private mousePos: Point;
  private undoData: ReturnType<
    InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
  >;

  constructor({
    parent,
    data,
    mousePos,
  }: {
    parent: string;
    data: ClipboardDataT;
    mousePos: Point;
  }) {
    this.parent = parent;
    this.data = {
      ...data,
      nodes: new Map(data.nodes),
    };
    this.mousePos = mousePos;
  }

  paste(node: string, parent: string, change?: { dx: number; dy: number }) {
    const snapshot = this.data.nodes.get(node)!;
    const id = getNewWidgetName(snapshot.type as WidgetTypes);

    snapshot.id = id;
    snapshot.parentId = parent;

    if (change) {
      snapshot.col = change.dx;
      snapshot.row = change.dy;
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
    const x = normalize(this.mousePos.x - px, gridCol) / gridCol;
    const y = normalize((this.mousePos.y - py) / gridrow, gridrow);

    // TODO: handle multi selection
    for (const node of this.data.selected) {
      this.paste(node, this.parent, { dx: x, dy: y });
    }

    const data: Extract<RemoteTypes, { event: 'insert' }>['data'] = {
      nodes: [],
      sideEffects: [],
    };
    for (const snapshot of this.data.nodes.values()) {
      const add: AddWidgetPayload = {
        ...snapshot,
        nodes: [],
      };
      editorStore.currentPage.addWidget(add);

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
      event: 'insert' as const,
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
      { event: 'delete' }
    >['data']['sideEffects'] = [];
    Object.entries(this.undoData).forEach(([id, coords]) => {
      if (!data.includes(id)) {
        editorStore.currentPage.getWidgetById(id).setDimensions(coords);
        sideEffects.push(editorStore.currentPage.getWidgetById(id).snapshot);
      }
    });
    return {
      event: 'delete' as const,
      data: {
        nodesId: data,
        sideEffects,
      },
    };
  }
}
