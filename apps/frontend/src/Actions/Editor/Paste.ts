import { editorStore } from '@/lib/Editor/Models';
import {
  ClipboardDataT,
  Command,
  UndoableCommand,
  UpdateNodePayload,
} from '../types';
import { normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { WidgetTypes } from '@/pages/Editor/Components';
import { AddWidgetPayload } from './Drag';
import { commandManager } from '../CommandManager';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { DeleteAction } from './Delete';

type InsertDataT = {
  node: WebloomWidget['snapshot'];
  sideEffects: UpdateNodePayload;
};

export class PasteAction implements UndoableCommand {
  private parent: string;
  private data: ClipboardDataT;
  private top: number;
  private mousePos: Point;

  constructor({
    parent,
    data,
    top,
    mousePos,
  }: {
    parent: string;
    data: ClipboardDataT;
    top: number;
    mousePos: Point;
  }) {
    this.parent = parent;
    this.data = data;
    this.top = top;
    this.mousePos = mousePos;
  }

  paste(node: string, parent: string, change?: { dx: number; dy: number }) {
    const id = getNewWidgetName(this.data.nodes[node].type as WidgetTypes);
    this.data.nodes[node].id = id;
    this.data.nodes[node].parentId = parent;

    if (change) {
      this.data.nodes[node].col += change.dx;
      this.data.nodes[node].row += change.dy;
    }

    for (const child of this.data.nodes[node].nodes!) {
      this.paste(child, id);
    }
  }

  execute() {
    const parent = editorStore.currentPage.getWidgetById(this.parent);
    const [gridrow, gridcol] = parent.gridSize;
    const x = normalize(this.mousePos.x, gridcol) / gridcol;
    const y = normalize((this.mousePos.y - this.top) / gridrow, gridrow);
    const dx = x - this.data.nodes[this.data.selected[0]].col;
    const dy = y - this.data.nodes[this.data.selected[0]].row;

    for (const node of this.data.selected) {
      this.paste(node, this.parent, { dx, dy });
    }

    for (const snapshot of Object.values(this.data.nodes)) {
      const add: AddWidgetPayload = {
        ...snapshot,
        nodes: [],
      };
      editorStore.currentPage.addWidget(add);

      // TODO: side effects

      const data: InsertDataT = {
        node: editorStore.currentPage.getWidgetById(add.id as string).snapshot,
        sideEffects: [],
      };
      commandManager.executeCommand(new InsertAction(data));
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
  constructor(private data: InsertDataT) {}

  execute() {
    return {
      event: 'insert' as const,
      data: this.data,
    };
  }

  undo() {
    editorStore.currentPage.removeWidget(this.data.node.id);

    // TODO: side effects
  }
}
