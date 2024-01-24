import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
export type WebloomButtonProps = {
  text: string;
  color: string;
  event: string;
};
const WebloomButton = observer(() => {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .evaluatedProps as WebloomButtonProps;
  return (
    <Button
      {...props}
      className={`active:bg-primary/20 block h-full w-full`}
      style={{ backgroundColor: props.color }}
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

const defaultProps: WebloomButtonProps = {
  text: 'Button',
  color: 'black',
  event: 'onclick',
};
const widgetName = 'WebloomButton';

const inspectorConfig: WidgetInspectorConfig<WebloomButtonProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'text',
        label: 'Text',
        type: 'input',
        options: {
          placeholder: 'Enter text',
          type: 'text',
        },
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'event',
        label: 'Event',
        type: 'event',
        options: {},
      },
    ],
  },
  {
    sectionName: 'Color',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Color',
        type: 'color',
        options: {
          color: '#fff',
        },
      },
    ],
  },
];
export const WebloomButtonWidget: Widget<WebloomButtonProps> = {
  component: WebloomButton,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomButton };
