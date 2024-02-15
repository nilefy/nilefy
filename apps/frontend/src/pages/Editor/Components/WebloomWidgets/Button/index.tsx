import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

// export type ButtonVariants =
//   | 'secondary'
//   | 'ghost'
//   | 'link'
//   | 'default'
//   | 'destructive'
//   | 'outline'
//   | null
//   | undefined;
export type WebloomButtonProps = {
  text: string;
  color: string;
  textColor: string;
  event: string;
  // variant: ButtonVariants;
  borderRadius: string;
  fontSize: string;
  textAlignment: string;
  boxShadow: string;
};
const WebloomButton = observer(() => {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .values as WebloomButtonProps;
  console.log(props.color);
  return (
    <Button
      // {...props}
      // variant={props.variant as ButtonVariants}
      className={`active:bg-primary/20 block
       h-full
       w-full 
      ${props.fontSize} 
      ${props.textAlignment} 
      ${props.boxShadow} 
      ${props.borderRadius}`}
      style={{
        backgroundColor: props.color,
        color: props.textColor,
      }}
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
  textColor: 'white',
  event: 'onclick',
  // variant: 'default',
  borderRadius: 'rounded-md',
  fontSize: 'text-sm',
  textAlignment: 'text-center',
  boxShadow: 'shadow-md',
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
        id: `${widgetName}-text`,
        key: 'event',
        label: 'Event',
        type: 'event',
        options: {},
      },
    ],
  },
  {
    sectionName: 'Style',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Background Color',
        type: 'color',
        options: {
          color: '#fff',
        },
      },
      {
        id: `${widgetName}-borderRadius`,
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'select',
        options: {
          items: [
            {
              label: 'None',
              value: 'rounded-none',
            },
            {
              label: 'Small',
              value: 'rounded-sm',
            },
            {
              label: 'Medium',
              value: 'rounded-md',
            },
            {
              label: 'Large',
              value: 'rounded-lg',
            },
            {
              label: 'Full',
              value: 'rounded-full',
            },
          ],
        },
      },
      {
        id: `${widgetName}-textColor`,
        key: 'textColor',
        label: 'Text Color',
        type: 'color',
        options: {
          color: '#000',
        },
      },
      {
        id: `${widgetName}-fontSize`,
        key: 'fontSize',
        label: 'Font Size',
        type: 'select',
        options: {
          items: [
            {
              label: 'Small',
              value: 'text-sm',
            },
            {
              label: 'Medium',
              value: 'text-base',
            },
            {
              label: 'Large',
              value: 'text-lg',
            },
          ],
        },
      },
      {
        id: `${widgetName}-textAlignment`,
        key: 'textAlignment',
        label: 'Text Alignment',
        type: 'select',
        options: {
          items: [
            {
              label: 'Left',
              value: 'text-left',
            },
            {
              label: 'Center',
              value: 'text-center',
            },
            {
              label: 'Right',
              value: 'text-right',
            },
          ],
        },
      },
      {
        id: `${widgetName}-boxShadow`,
        key: 'boxShadow',
        label: 'Box Shadow',
        type: 'select',
        options: {
          items: [
            {
              label: 'None',
              value: 'shadow-none',
            },
            {
              label: 'Small',
              value: 'shadow-sm',
            },
            {
              label: 'Medium',
              value: 'shadow-md',
            },
            {
              label: 'Large',
              value: 'shadow-lg',
            },
          ],
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
