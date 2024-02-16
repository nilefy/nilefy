import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Type } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
export type WebloomTextProps = {
  text: string;
  textColor: string;
  textAlignment: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  fontSize: string;
  boxShadow: string;
};
const WebloomText = observer(() => {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .values as WebloomTextProps;
  return (
    <div
      style={{
        backgroundColor: props.backgroundColor,
        borderColor: props.borderColor,
        borderWidth: +props.borderWidth,
      }}
      className={`h-full w-full  ${props.fontSize} ${props.borderRadius} ${props.boxShadow}`}
    >
      <span
        style={{
          color: props.textColor,
        }}
        className={`flex h-full w-full items-center ${props.textAlignment} break-all`}
      >
        {props.text}
      </span>
    </div>
  );
});
const config: WidgetConfig = {
  name: 'Text',
  icon: <Type />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomTextProps = {
  text: 'Text',
  textColor: '#000',
  textAlignment: 'text-center',
  backgroundColor: '',
  borderColor: '#000',
  borderWidth: 'border',
  borderRadius: 'rounded-none',
  fontSize: 'text-base',
  boxShadow: 'shadow-none',
};
const widgetName = 'WebloomText';

const inspectorConfig: WidgetInspectorConfig<WebloomTextProps> = [
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
    sectionName: 'Style',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'textColor',
        label: 'Color',
        type: 'color',
        options: {
          color: '#000',
        },
      },
      {
        id: `${widgetName}-color`,
        key: 'backgroundColor',
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
              value: 'justify-start',
            },
            {
              label: 'Center',
              value: 'justify-center',
            },
            {
              label: 'Right',
              value: 'justify-end',
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
      {
        id: `${widgetName}-borderColor`,
        key: 'borderColor',
        label: 'Border Color',
        type: 'color',
        options: {
          color: '#000',
        },
      },
      {
        id: `${widgetName}-borderWidth`,
        key: 'borderWidth',
        label: 'Border Width',
        type: 'input',
        options: {
          placeholder: 'Enter border width in pixels',
        },
      },
    ],
  },
];
export const WebloomTextWidget: Widget<WebloomTextProps> = {
  component: WebloomText,
  config,
  defaultProps,
  inspectorConfig,
};
