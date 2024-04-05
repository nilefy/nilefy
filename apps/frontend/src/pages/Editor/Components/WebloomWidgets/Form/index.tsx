import { Widget } from '@/lib/Editor/interface';
import {
  defaultProps,
  inspectorConfig,
  WebloomContainer,
  WebloomContainerProps,
} from '../Container';
import { FileText } from 'lucide-react';
import { editorStore } from '@/lib/Editor/Models';
import { isPlainObject } from 'lodash';
const isEmptyValue = (value: unknown) => {
  if (Array.isArray(value) && value.length === 0) return true;
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (isPlainObject(value) && Object.keys(value).length === 0) return true;
  return !!value;
};
export const WebloomFormWidget: Widget<WebloomContainerProps> = {
  defaultProps,
  inspectorConfig,
  component: WebloomContainer,

  config: {
    icon: <FileText />,
    isCanvas: true,
    name: 'Form',
    layoutConfig: {
      colsCount: 10,
      rowsCount: 80,
      minColumns: 1,
      minRows: 4,
      layoutMode: 'fixed',
    },
    resizingDirection: 'Both',
    widgetActions: {
      reset: {
        type: 'SIDE_EFFECT',
        name: 'reset',
        fn: (entity) => {
          for (const node of entity.nodes) {
            const widget = editorStore.currentPage.getWidgetById(node);
            for (const actionName in widget.actionsConfig) {
              const action = widget.actionsConfig[actionName];
              if (
                action.type === 'SETTER' &&
                'value' in action &&
                isEmptyValue(action.value)
              ) {
                widget.remoteExecuteAction(actionName);
              }
            }
          }
        },
      },
    },
  },
  blueprint: {
    children: [
      {
        type: 'WebloomText',
        props: {
          text: 'Form',
        },
        row: 5,
        col: 0.5,
        columnsCount: 6,
        rowsCount: 10,
      },
      {
        type: 'WebloomButton',
        props: {
          text: 'Submit',
        },
        col: 8,
        row: 70,
        onAttach: (widget) => {
          const parent = widget.parentId;
          widget.setValue('onClick', `{{${parent}.submit()}}`);
        },
      },
      {
        type: 'WebloomButton',
        props: {
          text: 'Reset',
        },
        col: 6,
        row: 70,
        onAttach: (widget) => {
          const parent = widget.parentId;
          widget.setValue('onClick', `{{${parent}.reset()}}`);
        },
      },
    ],
  },
};
