import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Loader2, MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { ToolTipWrapper } from '../tooltipWrapper';

export const webloomButtonProps = z.object({
  text: z.string(),
  color: z.string(),
  tooltip: z.string().optional(),
  isLoading: z.boolean().default(false),
  isDisabled: z.boolean().default(false),
});

export type WebloomButtonProps = z.infer<typeof webloomButtonProps>;

const WebloomButton = observer(function WebloomButton() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomButtonProps;
  return (
    <ToolTipWrapper text={props.text}>
      <Button
        {...props}
        disabled={props.isLoading || props.isDisabled}
        className={`h-full w-full active:bg-primary/20`}
        style={{ backgroundColor: props.color }}
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

const defaultProps: WebloomButtonProps = {
  text: 'Button',
  color: 'black',
  isLoading: false,
  isDisabled: false,
};

const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomButtonProps),
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
  },
};

export const WebloomButtonWidget: Widget<WebloomButtonProps> = {
  component: WebloomButton,
  config,
  defaultProps,
  schema,
};

export { WebloomButton };
