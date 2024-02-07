import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, UndoableCommand } from '../types';
import { normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { WidgetTypes } from '@/pages/Editor/Components';
import { AddWidgetPayload } from './Drag';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { RemoteTypes } from '../types';

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

    let parent = editorStore.currentPage.rootWidget.id;
    for (const id of editorStore.currentPage.selectedNodeIds) {
      const { x, y, width, height } =
        editorStore.currentPage.getWidgetById(id).pixelDimensions;
      if (
        mousePos.x > x &&
        mousePos.x < x + width &&
        mousePos.y > y &&
        mousePos.y < y + height
      ) {
        parent = id;
        break;
      }
    }
    this.parent = parent;
  }

  paste(node: string, parent: string, change?: { x: number; y: number }) {
    const snapshot = this.data.nodes.get(node)!;

    let id = snapshot.id!;
    if (this.data.action === 'copy') {
      id = getNewWidgetName(snapshot.type as WidgetTypes);
    }

    snapshot.id = id;
    snapshot.parentId = parent;

    if (change) {
      snapshot.col = change.x;
      snapshot.row = change.y;
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

    let dy = 0;
    for (const node of this.data.selected) {
      this.paste(node, this.parent, { x, y: y + dy });
      dy += this.data.nodes.get(node)!.rowsCount! + 1;
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
