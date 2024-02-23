import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button, ButtonProps } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
// import z from 'zod';
// import zodToJsonSchema from 'zod-to-json-schema';
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
// });
export type WebloomButtonProps = {
  text: string;
  events: WidgetsEventHandler;
  variant: ButtonProps['variant'];
};

const WebloomButton = observer(function WebloomButton() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomButtonProps;
  return (
    <Button
      {...props}
      className={`block h-full w-full active:bg-primary/20`}
      onClick={() => editorStore.executeActions(id, 'click')}
    >
      {props.text}
    </Button>
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
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
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
