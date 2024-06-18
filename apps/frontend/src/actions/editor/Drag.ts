import { editorStore } from '@/lib/Editor/Models';
import { RemoteTypes, UndoableCommand, UpdateNodesPayload } from '../types';

import { DraggedItem } from '@/lib/Editor/dnd/interface';
import { WebloomGridDimensions } from '@/lib/Editor/interface';
import { WidgetTypes } from '@/pages/Editor/Components';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { runInAction } from 'mobx';
import { getNewEntityName } from '@/lib/Editor/entitiesNameSeed';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

export type AddWidgetPayload = Parameters<
  InstanceType<typeof WebloomPage>['addWidget']
>[0];

class DragAction implements UndoableCommand {
  private oldParentId?: string;
  private parentId: string;
  private isNew: boolean;
  private id: string;
  private undoData!: ReturnType<
    InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
  >;
  private newType!: WidgetTypes;
  private endPosition: WebloomGridDimensions;
  constructor(options: {
    draggedItem: DraggedItem;
    endPosition: WebloomGridDimensions;
    parentId: string;
  }) {
    this.isNew = options.draggedItem.isNew;
    this.parentId = options.parentId;
    this.endPosition = options.endPosition;
    if (!options.draggedItem.isNew) {
      this.oldParentId = editorStore.currentPage.getWidgetById(
        options.draggedItem.id,
      ).parent.id;
      this.id = options.draggedItem.id;
    } else {
      this.id = getNewEntityName(
        options.draggedItem.type,
        editorStore.currentPageId,
      );
      this.newType = options.draggedItem.type;
    }
  }

  execute(): void | RemoteTypes {
    const endDims = this.endPosition;
    if (this.isNew) {
      runInAction(() => {
        editorStore.currentPage.addWidget({
          parentId: this.parentId,
          type: this.newType,
          id: this.id,
        });
        this.undoData = editorStore.currentPage.moveWidgetIntoGrid(
          this.id,
          endDims,
        );
      });
      const addedWidget = editorStore.currentPage.getWidgetById(
        this.id,
      ).snapshot;
      const affectedNodes = Object.keys(this.undoData)
        .filter((test) => test !== this.id)
        .map((k) => editorStore.currentPage.getWidgetById(k).snapshot);

      const blueprintChildren = addedWidget.nodes.map(
        (nodeId) => editorStore.currentPage.getWidgetById(nodeId).snapshot,
      );
      //select the newly added widget
      editorStore.currentPage.setSelectedNodeIds(new Set([this.id]));
      return {
        event: SOCKET_EVENTS_REQUEST.CREATE_NODE,
        data: {
          nodes: [addedWidget, ...blueprintChildren],
          sideEffects: affectedNodes,
        },
      };
    }
    runInAction(() => {
      if (this.oldParentId !== this.parentId) {
        editorStore.currentPage.moveWidget(this.id, this.parentId);
      }
      this.undoData = editorStore.currentPage.moveWidgetIntoGrid(
        this.id,
        this.endPosition,
      );
    });
    const remoteData = [
      editorStore.currentPage.getWidgetById(this.id).snapshot,
      ...Object.keys(this.undoData)
        // sometimes the widget being dragged exist in the undoData sometimes it don't(maybe needs a fix?)
        .filter((test) => test !== this.id)
        .map((k) => editorStore.currentPage.getWidgetById(k).snapshot),
    ];
    return {
      event: SOCKET_EVENTS_REQUEST.UPDATE_NODE,
      data: { updates: remoteData },
    };
  }

  undo(): void | RemoteTypes {
    if (this.isNew) {
      editorStore.currentPage.setSelectedNodeIds((ids) => {
        const newIds = new Set(ids);
        newIds.delete(this.id);
        return newIds;
      });
      const sideEffects: WebloomWidget['snapshot'][] = [];
      runInAction(() => {
        editorStore.currentPage.removeWidget(this.id);
        Object.entries(this.undoData)
          .filter(([key]) => key !== this.id)
          .forEach(([id, coords]) => {
            editorStore.currentPage.getWidgetById(id).setDimensions(coords);
            sideEffects.push(
              editorStore.currentPage.getWidgetById(id).snapshot,
            );
          });
      });
      return {
        event: 'deleteNode',
        data: {
          nodesId: [this.id],
          sideEffects,
        },
      };
    }

    const serverData: UpdateNodesPayload = [];
    runInAction(() => {
      Object.entries(this.undoData).forEach(([id, coords]) => {
        editorStore.currentPage.getWidgetById(id).setDimensions(coords);
        serverData.push(editorStore.currentPage.getWidgetById(id).snapshot);
      });

      if (this.oldParentId !== this.parentId) {
        editorStore.currentPage.moveWidget(this.id, this.oldParentId!);
      }
    });
    serverData.push(editorStore.currentPage.getWidgetById(this.id).snapshot);
    return {
      event: SOCKET_EVENTS_REQUEST.UPDATE_NODE,
      data: { updates: serverData },
    };
  }
}

export default DragAction;
