import { Widget } from '@/lib/Editor/interface';
import {
  initialProps,
  NilefyContainer,
  NilefyContainerProps,
} from '../Container';
import { FileText } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { useAutoRun } from '@/lib/Editor/hooks';
import { Portal } from '@radix-ui/react-portal';
import { useHotkeys } from 'react-hotkeys-hook';
import { runInAction } from 'mobx';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
export type NilefyModalProps = NilefyContainerProps & {
  onConfirm?: string;
  onClose?: string;
  isOpen: boolean;
};

const NilefyModal = observer(
  (props: Parameters<typeof NilefyContainer>[0] & NilefyModalProps) => {
    const { onPropChange, id } = useContext(WidgetContext);
    const widget = editorStore.currentPage.getWidgetById(id);
    const editorProps = widget.finalValues as NilefyModalProps;
    useHotkeys('esc', () => {
      onPropChange({ key: 'isOpen', value: false });
    });

    useAutoRun(() => {
      if (
        (widget.isTheOnlySelected || widget.childrenHasSelected) &&
        !editorStore.currentPage.modalOpenExists
      ) {
        console.log('open', id);
        return onPropChange({ key: 'isOpen', value: true });
      }
    });

    if (editorStore.isProduction) {
      return (
        <Dialog open={editorProps.isOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50  translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 sm:rounded-lg">
              <NilefyContainer {...props}>{props.children}</NilefyContainer>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      );
    }
    if (!editorProps.isOpen) return null;
    return (
      <>
        <Portal
          container={editorStore.currentPage.rootWidget.scrollableContainer}
          asChild
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              runInAction(() => {
                editorStore.currentPage.clearSelectedNodes();
                onPropChange({ key: 'isOpen', value: false });
              });
            }}
            className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 absolute inset-0 z-50 backdrop-blur-sm"
          ></div>
        </Portal>
        <NilefyContainer
          {...props}
          outerContainerStyle={
            { ...props.outerContainerStyle, zIndex: 100 } as any
          }
        >
          {props.children}
        </NilefyContainer>
      </>
    );
  },
);

export const NilefyModalWidget: Widget<NilefyModalProps> = {
  initialProps: {
    ...initialProps,
    isOpen: false,
  },
  metaProps: new Set(['isOpen']),
  inspectorConfig: [
    {
      sectionName: 'Interactions',
      children: [
        {
          label: 'Open when',
          type: 'inlineCodeInput',
          path: 'isOpen',
          options: {
            placeholder: 'isOpen',
          },
          hidden: () => true,
        },
        {
          label: 'onClose',
          type: 'inlineCodeInput',
          isEvent: true,
          path: 'onClose',
          options: {
            placeholder: 'onClose',
          },
        },
        {
          label: 'onConfirm',
          type: 'inlineCodeInput',
          isEvent: true,
          path: 'onConfirm',
          options: {
            placeholder: 'onConfirm',
          },
        },
      ],
    },
  ],
  component: NilefyModal,
  publicAPI: {
    isOpen: {
      description: 'Is the modal open',
      type: 'static',
      typeSignature: 'boolean',
    },
    open: {
      description: 'Open the modal',
      type: 'function',
    },
    close: {
      description: 'Close the modal',
      type: 'function',
    },
    setOpened: {
      description: 'Set the modal opened or closed',
      type: 'function',
      args: [{ name: 'isOpen', type: 'boolean' }],
    },
    confirm: {
      description: 'Confirm the modal',
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
      layoutMode: 'fixed',
    },
    resizingDirection: 'Both',
    widgetActions: {
      open: {
        type: 'SETTER',
        name: 'open',
        path: 'isOpen',
        value: true,
      },
      close: {
        type: 'SIDE_EFFECT',
        name: 'close',
        fn: (entity) => {
          runInAction(() => {
            entity.setValue('isOpen', false);
            entity.page.clearSelectedNodes();
          });
        },
      },
      setOpened: {
        type: 'SIDE_EFFECT',
        name: 'setOpened',
        fn: (entity, ...args) => {
          const isOpen = args[0];
          if (isOpen) {
            entity.setValue('isOpen', true);
            return;
          }
          entity.setValue('isOpen', false);
          entity.page.clearSelectedNodes();
        },
      },
      confirm: {
        type: 'SIDE_EFFECT',
        name: 'confirm',
        fn: (entity) => {
          entity.handleEvent('onConfirm');
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
          text: 'Confirm',
        },
        col: 8,
        row: 70,
        onAttach: (widget) => {
          const parent = widget.parentId;
          widget.setValue('onClick', `{{${parent}.confirm()}}`);
        },
      },
      {
        type: 'NilefyButton',
        props: {
          text: 'Close',
        },
        col: 6,
        row: 70,
        onAttach: (widget) => {
          const parent = widget.parentId;
          widget.setValue('onClick', `{{${parent}.close()}}`);
        },
      },
    ],
  },
};
