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
import * as Dialog from '@radix-ui/react-dialog';
import { editorStore } from '@/lib/Editor/Models';
import { useAutoRun } from '@/lib/Editor/hooks';
import { Portal } from '@radix-ui/react-portal';

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
    useAutoRun(() => {
      if (widget.isTheOnlySelected || widget.childrenHasSelected) {
        return onPropChange({ key: 'isOpen', value: true });
      }
      onPropChange({ key: 'isOpen', value: false });
    });

    if (editorStore.isProduction) {
      return (
        <Dialog.Root open={editorProps.isOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content asChild>
              <NilefyContainer {...props}>{props.children}</NilefyContainer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      );
    }
    if (!editorProps.isOpen) return null;
    return (
      <>
        <Portal
          container={editorStore.currentPage.rootWidget.dom?.parentElement}
          asChild
        >
          <div
            onClick={() => {
              onPropChange({ key: 'isOpen', value: false });
            }}
            className="absolute left-0 top-0 z-50 h-full w-full bg-[rgba(0,0,0,0.5)] text-center text-white"
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
    name: 'Modal',
    layoutConfig: {
      colsCount: 10,
      rowsCount: 80,
      minColumns: 1,
      minRows: 4,
      layoutMode: 'fixed',
    },
    resizingDirection: 'Both',
    widgetActions: {},
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
