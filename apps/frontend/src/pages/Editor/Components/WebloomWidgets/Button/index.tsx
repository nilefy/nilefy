import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
export type WebloomButtonProps = {
  text: string;
  color: string;
  onClick: string;
};
const WebloomButton = observer(() => {
  const { id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomButtonProps;
  return (
    <Button
      {...props}
      onClick={() => {
        widget.handleEvent('onClick');
      }}
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
  onClick: '',
};

const inspectorConfig: EntityInspectorConfig<WebloomButtonProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'text',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
          label: 'Text',
        },
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
          label: 'onClick',
        },
      },
    ],
  },
  {
    sectionName: 'Color',
    children: [
      {
        path: 'color',
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
