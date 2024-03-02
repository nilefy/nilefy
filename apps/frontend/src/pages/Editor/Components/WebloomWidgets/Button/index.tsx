import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Loader2, MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button, ButtonProps } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
// import z from 'zod';
// import zodToJsonSchema from 'zod-to-json-schema';
import { ToolTipWrapper } from '../tooltipWrapper';
import {
  EventTypes,
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  // widgetsEventHandler,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';

// export const webloomButtonProps = z.object({
//   text: z.string(),
//   events: widgetsEventHandler,
//   tooltip: z.string().optional(),
//   isLoading: z.boolean().default(false),
//   isDisabled: z.boolean().default(false),
// });

export type WebloomButtonProps = {
  text: string;
  events: WidgetsEventHandler;
  tooltip: string;
  isLoading: boolean;
  isDisabled: boolean;
  variant: ButtonProps['variant'];
};

const WebloomButton = observer(function WebloomButton() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomButtonProps;
  return (
    <ToolTipWrapper text={props.tooltip}>
      <Button
        {...props}
        disabled={props.isLoading || props.isDisabled}
        className={`h-full w-full active:bg-primary/20`}
        onClick={() => editorStore.executeActions(id, 'click')}
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
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 7,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const webloomButtonEvents: EventTypes = {
  click: 'Click',
  hover: 'Hover',
};

const defaultProps: WebloomButtonProps = {
  text: 'Button',
  events: [],
  variant: 'default',
  isLoading: false,
  isDisabled: false,
  tooltip: '',
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
      tooltip: { type: 'string', default: '' },
      isLoading: { type: 'boolean', default: false },
      isDisabled: { type: 'boolean', default: false },
      variant: {
        type: 'string',
        enum: [
          'default',
          'destructive',
          'outline',
          'secondary',
          'ghost',
          'link',
        ],
        default: defaultProps.variant,
      },
      events: widgetsEventHandlerJsonSchema,
    },
    required: ['events', 'text'],
  },
  uiSchema: {
    text: {
      'ui:label': 'Text',
      'ui:widget': 'inlineCodeInput',
      'ui:placeholder': 'Enter text',
    },
    color: {
      'ui:widget': 'colorPicker',
    },
    isLoading: {
      'ui:widget': 'inlineCodeInput',
      'ui:placeholder': '{{false}}',
    },
    isDisabled: {
      'ui:widget': 'inlineCodeInput',
      'ui:placeholder': '{{false}}',
    },
    tooltip: {
      'ui:widget': 'inlineCodeInput',
    },
    events: genEventHandlerUiSchema(webloomButtonEvents),
  },
};

export const WebloomButtonWidget: Widget<WebloomButtonProps> = {
  component: WebloomButton,
  config,
  defaultProps,
  schema,
  setters: {
    setText: {
      path: 'text',
      type: 'string',
    },
  },
};

export { WebloomButton };
