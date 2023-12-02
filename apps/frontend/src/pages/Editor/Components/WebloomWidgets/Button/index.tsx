import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import store from '@/store';
import { Loader2 } from 'lucide-react';
export type WebloomButtonProps = {
  text: string;
  color: string;
  events: Array<Array<string>>;
  loading: boolean;
  visibility: boolean;
  disabled: boolean;
};
const WebloomButton = (props: WebloomButtonProps) => {
  const handleClick = () => {
    {
      Array.isArray(props.events) &&
        props.events.map((event) => {
          if (event[0] == 'click') {
            switch (event[1]) {
              case 'alert':
                alert(event[4]);
                console.log('success');
                break;
              case 'controlComponent':
                store.getState().setProp(event[2], event[3], event[4]);
                break;
              case 'openWebPage':
                window.open(event[4], '_blank');
                break;
            }
          }
        });
    }
  };
  const handleHover = () => {
    {
      Array.isArray(props.events) &&
        props.events.map((event) => {
          if (event[0] == 'hover') {
            switch (event[1]) {
              case 'alert':
                alert(event[4]);
                console.log('success');
                break;
              case 'controlComponent':
                store.getState().setProp(event[2], event[3], event[4]);
                break;
            }
          }
        });
    }
  };
  return (
    <Button
      {...props}
      className={`active:bg-primary/20 h-full w-full ${
        props.visibility ? 'hidden' : 'block'
      }`}
      style={{ backgroundColor: props.color }}
      disabled={props.disabled}
      onClick={handleClick}
      onMouseOver={handleHover}
    >
      {props.loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <p>{props.text}</p>
      )}
    </Button>
  );
};
const config: WidgetConfig = {
  name: 'Button',
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomButtonProps = {
  text: 'Button',
  color: 'black',
  events: [],
  loading: false,
  visibility: false,
  disabled: false,
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
      // events.map((event) => ({
      //   id: `${widgetName}-text`,
      //   key: 'events',
      //   label: 'EventManagerButton',
      //   type: 'EventManagerButton',
      //   options: {},
      // })),
      {
        id: `${widgetName}-text`,
        key: 'events',
        label: 'EventManagerButton',
        type: 'EventManagerButton',
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
