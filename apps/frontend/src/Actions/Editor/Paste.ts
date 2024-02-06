import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, UndoableCommand, UpdateNodePayload } from '../types';
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
    this.data = data;
    this.mousePos = mousePos;
  }

  paste(node: string, parent: string, change?: { dx: number; dy: number }) {
    const id = getNewWidgetName(this.data.nodes[node].type as WidgetTypes);
    this.data.nodes[node].id = id;
    this.data.nodes[node].parentId = parent;

    if (change) {
      this.data.nodes[node].col = change.dx;
      this.data.nodes[node].row = change.dy;
    }

    for (const child of this.data.nodes[node].nodes!) {
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

    for (const snapshot of Object.values(this.data.nodes)) {
      const add: AddWidgetPayload = {
        ...snapshot,
        nodes: [],
      };
      editorStore.currentPage.addWidget(add);

      const undoData: ReturnType<
        InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
      > = editorStore.currentPage.moveWidgetIntoGrid(add.id!, {});
      const affectedNodes: UpdateNodePayload = Object.keys(undoData)
        .filter((test) => test !== add.id)
        .map((k) => editorStore.currentPage.getWidgetById(k).snapshot);

      const data: Extract<RemoteTypes, { event: 'insert' }>['data'] = {
        node: editorStore.currentPage.getWidgetById(add.id as string).snapshot,
        sideEffects: affectedNodes,
      };
      commandManager.executeCommand(new InsertAction(data, undoData));
    }
  }

  undo() {
    const data = Object.values(this.data.nodes).map((node) => node.id!);
    commandManager.executeCommand(new DeleteAction(data));

    let count = data.length + 1;
    while (count--) {
      commandManager.undoCommand();
    }
  }
}

export class InsertAction implements UndoableCommand {
  constructor(
    private data: Extract<RemoteTypes, { event: 'insert' }>['data'],
    private undoData: ReturnType<
      InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
    >,
  ) {}

  execute() {
    return {
      event: 'insert' as const,
      data: this.data,
    };
  }

  undo() {
    editorStore.currentPage.removeWidget(this.data.node.id);
    Object.entries(this.undoData).forEach(([id, coords]) => {
      if (id !== this.data.node.id) {
        editorStore.currentPage.getWidgetById(id).setDimensions(coords);
      }
    });
  }
}
