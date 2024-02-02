import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, UndoableCommand } from '../types';
import { normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { WidgetTypes } from '@/pages/Editor/Components';
import { AddWidgetPayload } from './Drag';

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

  execute() {
    const parent = editorStore.currentPage.getWidgetById(this.parent);
    const [gridrow, gridcol] = parent.gridSize;
    const x = normalize(Math.max(2, this.mousePos.x) / gridcol, gridcol);
    const y = normalize((this.mousePos.y - this.top) / gridrow, gridrow);
    const dx = x - this.data.nodes[0].col;
    const dy = y - this.data.nodes[0].row;

    for (const node of this.data.nodes) {
      const id = getNewWidgetName(node.type as WidgetTypes);
      const newNode: AddWidgetPayload = {
        ...node,
        id: id,
        parentId: this.parent,
        col: node.col + dx,
        row: node.row + dy,
      };
      editorStore.currentPage.addWidget(newNode);

      // TODO: side effects

      return {
        event: 'insert' as const,
        data: {
          node: editorStore.currentPage.getWidgetById(id).snapshot,
          sideEffects: [],
        },
      };
    }
  }

  undo() {}
}
