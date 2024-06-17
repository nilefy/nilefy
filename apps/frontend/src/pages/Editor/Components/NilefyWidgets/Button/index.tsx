import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { Loader2, SquareMousePointer } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

import { ToolTipWrapper } from '../tooltipWrapper';
import { BooleanSchema, StringSchema } from '@/lib/Editor/validations';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

export type NilefyButtonProps = {
  text: string;
  onClick: string;
  tooltip: string;
  isLoading: boolean;
  isDisabled: boolean;
  variant: ButtonProps['variant'];
};

const NilefyButton = observer(function NilefyButton() {
  const { id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyButtonProps;
  return (
    <ToolTipWrapper text={props.tooltip}>
      <Button
        variant={props.variant}
        onClick={() => {
          widget.handleEvent('onClick');
        }}
        disabled={props.isLoading || props.isDisabled}
        className={`active:bg-primary/20 block h-full w-full`}
      >
        {props.isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {props.text}
      </Button>
    </ToolTipWrapper>
  );
});
const config: WidgetConfig = {
  name: 'Button',
  icon: SquareMousePointer,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 7,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
  widgetActions: {
    setText: {
      name: 'setText',
      path: 'text',
      type: 'SETTER',
    },
    setDisabled: {
      name: 'setDisabled',
      path: 'isDisabled',
      type: 'SETTER',
    },
    setIsLoading: {
      name: 'setIsLoading',
      path: 'isLoading',
      type: 'SETTER',
    },
  },
};

const initialProps: NilefyButtonProps = {
  text: 'Button',
  onClick: '',
  variant: 'default',
  isLoading: false,
  isDisabled: false,
  tooltip: '',
};

const inspectorConfig: EntityInspectorConfig<NilefyButtonProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'text',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
        },
        validation: StringSchema('Click me'),
      },
      {
        path: 'tooltip',
        label: 'Tooltip',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
        },
        validation: StringSchema('Click me'),
      },
      {
        path: 'isLoading',
        label: 'Is Loading',
        type: 'inlineCodeInput',
        options: {},
        validation: BooleanSchema(false),
      },
      {
        path: 'isDisabled',
        label: 'Is Disabled',
        type: 'inlineCodeInput',
        options: {},
        validation: BooleanSchema(false),
      },
      {
        path: 'variant',
        label: 'Varient',
        type: 'select',
        options: {
          items: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'destructive',
              value: 'destructive',
            },
            {
              label: 'outline',
              value: 'outline',
            },
            {
              label: 'secondary',
              value: 'secondary',
            },
            {
              label: 'ghost',
              value: 'ghost',
            },
            {
              label: 'link',
              value: 'link',
            },
          ],
        },
        validation: zodToJsonSchema(
          z
            .enum([
              'default',
              'destructive',
              'outline',
              'secondary',
              'ghost',
              'link',
            ])
            .default('default'),
        ),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onClick',
        label: 'onClick',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onClick',
        },
        isEvent: true,
      },
    ],
  },
];

export const NilefyButtonWidget: Widget<NilefyButtonProps> = {
  component: NilefyButton,
  config,
  initialProps,
  inspectorConfig,
  publicAPI: {
    setText: {
      type: 'function',
      args: [
        {
          name: 'text',
          type: 'string',
        },
      ],
    },
    setDisabled: {
      type: 'function',
      args: [
        {
          name: 'disabled',
          type: 'boolen',
        },
      ],
    },
    setIsLoading: {
      type: 'function',
      args: [
        {
          name: 'loading',
          type: 'boolen',
        },
      ],
    },
  },
};

export { NilefyButton };
