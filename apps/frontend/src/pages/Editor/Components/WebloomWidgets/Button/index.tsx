import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '@/components/ui/button';
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
//   color: z.string(),
//   events: widgetsEventHandler,
// });
export type WebloomButtonProps = {
  text: string;
  color: string;
  events: WidgetsEventHandler;
};

const WebloomButton = observer(function WebloomButton() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomButtonProps;
  return (
    <Button
      {...props}
      className={`block h-full w-full active:bg-primary/20`}
      style={{ backgroundColor: props.color }}
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
  color: 'black',
  events: [],
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
      color: {
        type: 'string',
      },
      events: widgetsEventHandlerJsonSchema,
    },
    required: ['events', 'text', 'color'],
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
