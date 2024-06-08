import { Widget } from '@/lib/Editor/interface';
import {
  initialProps as containerInitialProps,
  inspectorConfig,
  WebloomContainer,
  WebloomContainerProps,
} from '../Container';
import { FileText } from 'lucide-react';
import { editorStore } from '@/lib/Editor/Models';
import { isPlainObject, set } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useAutoRun } from '@/lib/Editor/hooks';
import { useContext, useEffect, useState } from 'react';
import { WidgetContext } from '../..';
import { autorun, toJS } from 'mobx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog-custom';
import { Button } from '@/components/ui/button';

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

export type WebloomModalProps = WebloomContainerProps & {
  onSubmit?: string;
  isOpen?: boolean;
};

const WebloomModal = observer(
  (props: Parameters<typeof WebloomContainer>[0] & WebloomModalProps) => {
    const { id, onPropChange } = useContext(WidgetContext);
    const widget = editorStore.currentPage.getWidgetById(id);
    const [open, setOpen] = useState(true);
    const [width, setWidth] = useState(0);

    useEffect(() => {
      setOpen(widget.childrenHasSelected || widget.isSelected);
      setWidth(editorStore.currentPage.rootWidget.boundingRect.width);
    }, [widget.isSelected, widget.childrenHasSelected]);

    // Close the dialog when clicked outside
    const handleClose = () => {
      setOpen(false);
    };
    useEffect(
      () =>
        autorun(() => {
          onPropChange({ value: false, key: 'isVisibile' });
          onPropChange({
            value: { width: '96px' },
            key: 'innerContainerStyle',
          });
        }),
      [onPropChange, props],
    );
    // const {left, right, top} =
    //   editorStore.currentPage.rootWidget.gridBoundingRect;
    console.log(width, "width")
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay className={`w-[${width}px]`}>
          <DialogContent
            onPointerDownOutside={handleClose}
            className={`h-fit w-fit p-0`}
          >
            <WebloomContainer {...props}>{props.children}</WebloomContainer>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    );
  },
);
const initialProps: WebloomModalProps = {
  ...containerInitialProps,
  isOpen: false,
};
export const WebloomModalWidget: Widget<WebloomModalProps> = {
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
  component: WebloomModal,
  publicAPI: {
    data: {
      description: 'Data of the Modal',
      type: 'dynamic',
    },
    reset: {
      description: 'Reset the Modal',
      type: 'function',
    },
    submit: {
      description: 'Submit the Modal',
      type: 'function',
    },
  },
  config: {
    icon: FileText,
    isCanvas: true,
    name: 'Modal',
    layoutConfig: {
      colsCount: 10,
      rowsCount: 80,
      minColumns: 1,
      minRows: 4,
      layoutMode: 'auto',
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
          entity.remoteExecuteAction('reset');
        },
      },
      open: {
        type: 'SETTER',
        name: 'open',
        path: 'isOpen',
      },
    },
  },
  blueprint: {
    children: [
      {
        type: 'WebloomText',
        props: {
          text: 'Modal',
        },
        row: 5,
        col: 2,
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
