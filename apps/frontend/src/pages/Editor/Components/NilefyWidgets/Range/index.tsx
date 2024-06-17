import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { SquareMousePointer } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Slider } from '@/components/ui/slider';
import { ToolTipWrapper } from '../tooltipWrapper';
import {
  StringSchema,
  NumberSchema,
  BooleanSchema,
} from '@/lib/Editor/validations';
import { autorun } from 'mobx';

export type NilefyRangeProps = {
  value?: number;
  label: string;
  min: number;
  max: number;
  stepSize: number;
  defaultValue: number;
  onChange: string;
  tooltip: string;
  isDisabled: boolean;
};

const NilefyRange = observer(function NilefyRange() {
  const { id, onPropChange } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyRangeProps;

  // for defaultValue, i don't think we can use radix-ui's slider.defaultValue directly because the component is controlled
  // so the meaning of default value what the value will start with
  useEffect(
    () =>
      autorun(() => {
        onPropChange({
          key: 'value',
          value: props.defaultValue,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ToolTipWrapper text={props.tooltip}>
      <Slider
        value={[props.value ?? props.min]}
        max={props.max}
        min={props.min}
        step={props.stepSize}
        disabled={props.isDisabled}
        onValueChange={(e) => {
          onPropChange({
            key: 'value',
            value: e[0],
          });
          widget.handleEvent('onChange');
        }}
      />
    </ToolTipWrapper>
  );
});
const config: WidgetConfig = {
  name: 'Number Slider',
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
    setDisabled: {
      type: 'SETTER',
      path: 'isDisabled',
      name: 'setDisabled',
    },
    setValue: {
      type: 'SETTER',
      path: 'value',
      name: 'setValue',
    },
  },
};

const initialProps: NilefyRangeProps = {
  isDisabled: false,
  tooltip: '',
  defaultValue: 0,
  label: 'label',
  max: 100,
  min: 0,
  stepSize: 1,
  onChange: '',
};

const inspectorConfig: EntityInspectorConfig<NilefyRangeProps> = [
  {
    sectionName: 'General',
    children: [
      {
        path: 'label',
        label: 'Text',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter text',
        },
        validation: StringSchema(initialProps['label']),
      },
      {
        path: 'max',
        label: 'Max',
        type: 'inlineCodeInput',
        options: {},
        validation: NumberSchema(initialProps['max']),
      },
      {
        path: 'min',
        label: 'Min',
        type: 'inlineCodeInput',
        options: {},
        validation: NumberSchema(initialProps['min']),
      },
      {
        path: 'stepSize',
        label: 'Step Size',
        type: 'inlineCodeInput',
        options: {},
        validation: NumberSchema(initialProps.stepSize),
      },
      {
        path: 'defaultValue',
        label: 'Default Value',
        type: 'inlineCodeInput',
        options: {},
        validation: NumberSchema(initialProps.defaultValue),
      },
      {
        path: 'tooltip',
        label: 'Tooltip',
        type: 'inlineCodeInput',
        options: {},
        validation: StringSchema(initialProps.tooltip),
      },
      {
        path: 'isDisabled',
        label: 'Disabled',
        type: 'inlineCodeInput',
        options: {},
        validation: BooleanSchema(initialProps.isDisabled),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onChange',
        label: 'onChange',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onChange',
        },
        isEvent: true,
      },
    ],
  },
];

export const NilefyRangeWidget: Widget<NilefyRangeProps> = {
  component: NilefyRange,
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['value']),
  publicAPI: {
    value: {
      description: 'Input widget',
      type: 'static',
      typeSignature: 'number',
    },
    setValue: {
      description: 'Set input value',
      type: 'function',
      args: [
        {
          name: 'value',
          type: 'number',
        },
      ],
    },
    setDisabled: {
      description: 'control disabled state',
      type: 'function',
      args: [
        {
          name: 'value',
          type: 'boolean',
        },
      ],
    },
  },
};

export { NilefyRange };
