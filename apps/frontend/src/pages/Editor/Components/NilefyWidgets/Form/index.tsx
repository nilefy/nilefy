import { Widget } from '@/lib/Editor/interface';
import {
  initialProps,
  inspectorConfig,
  NilefyContainer,
  NilefyContainerProps,
} from '../Container';
import { FileText } from 'lucide-react';
import { editorStore } from '@/lib/Editor/Models';
import { isPlainObject, set } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useAutoRun } from '@/lib/Editor/hooks';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { toJS } from 'mobx';

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

export type NilefyFormProps = NilefyContainerProps & {
  onSubmit?: string;
};

const NilefyForm = observer((props: Parameters<typeof NilefyContainer>[0]) => {
  const { id } = useContext(WidgetContext);
  // This works fine but I think a more versatile way would to be able to access the children in the code like so {{form.children}}
  // and from that we can just delegate that to a derived value like so {{(function(){computedDataFromChildren(from.children)})()}} in the initialProps
  useAutoRun(() => {
    const widget = editorStore.currentPage.getWidgetById(id);
    const data: Record<string, unknown> = {};
    for (const descendantId of widget.descendants) {
      const descendant = editorStore.currentPage.getWidgetById(descendantId);
      if (descendant.finalValues.value) {
        set(data, [descendantId, 'value'], toJS(descendant.finalValues.value));
      }
    }
    widget.setValue('data', data);
  });
  return <NilefyContainer {...props}>{props.children}</NilefyContainer>;
});

export const NilefyFormWidget: Widget<NilefyFormProps> = {
  initialProps,
  inspectorConfig: [
    ...inspectorConfig,
    {
      sectionName: 'Interactions',
      children: [
        {
          label: 'onSubmit',
          type: 'inlineCodeInput',
          isEvent: true,
          path: 'onSubmit',
          options: {
            placeholder: 'onSubmit',
          },
        },
      ],
    },
  ],
  component: NilefyForm,
  publicAPI: {
    data: {
      description: 'Data of the form',
      type: 'dynamic',
    },
    reset: {
      description: 'Reset the form',
      type: 'function',
    },
    submit: {
      description: 'Submit the form',
      type: 'function',
    },
  },
  config: {
    icon: FileText,
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
                // We need a better way to differentiate between input widgets and other widgets
                action.path === 'value' &&
                'value' in action &&
                isEmptyValue(action.value)
              ) {
                widget.remoteExecuteAction(actionName);
              }
            }
          }
        },
      },
      submit: {
        type: 'SIDE_EFFECT',
        name: 'submit',
        fn: (entity) => {
          entity.handleEvent('onSubmit');
        },
      },
    },
  },
  blueprint: {
    children: [
      {
        type: 'NilefyText',
        props: {
          text: 'Form',
        },
        row: 5,
        col: 0.5,
        columnsCount: 6,
        rowsCount: 10,
      },
      {
        type: 'NilefyButton',
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
        type: 'NilefyButton',
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
