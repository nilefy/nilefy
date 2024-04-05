import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

import { ToolTipWrapper } from '../tooltipWrapper';
import clsx from 'clsx';
import { autorun } from 'mobx';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

export type WebloomTextAreaProps = {
  labelText: string;
  labelPosition: 'left' | 'top';
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: string;
  defaultValue?: string;
  caption?: string;
  tooltip?: string;
  maxLength?: number;
  minLength?: number;
  onTextChange?: string;
  onFocus?: string;
  onBlur?: string;
};

const WebloomTextArea = observer(function WebloomTextArea() {
  const { onPropChange, id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomTextAreaProps;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // for defaultValue, i don't think we can use radix-ui's select.defaultValue directly because the component is controlled
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
      <div
        className={clsx('flex h-full w-full gap-4 p-1', {
          'flex-col': props.labelPosition === 'top',
          'items-center': props.labelPosition === 'left',
        })}
      >
        <Label htmlFor={id}>{props.labelText}</Label>
        <Textarea
          id={id}
          className="h-full w-full resize-none"
          ref={textAreaRef}
          placeholder={props.placeholder}
          value={props.value ?? ''}
          disabled={props.disabled}
          autoFocus={props.autoFocus}
          maxLength={props.maxLength}
          minLength={props.minLength}
          onChange={(e) => {
            onPropChange({
              key: 'value',
              value: e.target.value,
            });
            widget.handleEvent('onTextChanged');
          }}
          onFocus={() => widget.handleEvent('onFocus')}
          onBlur={() => widget.handleEvent('onBlur')}
        />
        <p className="text-muted-foreground text-sm">{props.caption}</p>
      </div>
    </ToolTipWrapper>
  );
});

const config: WidgetConfig = {
  name: 'textarea',
  icon: <TextCursorInput />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 10,
    minColumns: 2,
    minRows: 4,
  },
  resizingDirection: 'Both',
  widgetActions: {
    setValue: {
      type: 'SETTER',
      path: 'value',
      name: 'setValue',
    },
    setDisabled: {
      type: 'SETTER',
      path: 'disabled',
      name: 'setDisabled',
    },
    clearValue: {
      type: 'SETTER',
      path: 'value',
      value: '',
      name: 'clearValue',
    },
  },
};

const initialProps: WebloomTextAreaProps = {
  placeholder: 'Enter text',
  labelText: 'Label',
  labelPosition: 'top',
  disabled: false,
};
const inspectorConfig: EntityInspectorConfig<WebloomTextAreaProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'labelText',
        type: 'inlineCodeInput',
        options: {
          label: 'Label',
        },
        validation: zodToJsonSchema(z.string().default('Label')),
      },
      {
        label: 'Label Position',
        path: 'labelPosition',
        type: 'inlineCodeInput',
        options: {
          label: 'Label Position',
        },
        validation: zodToJsonSchema(z.enum(['left', 'top']).default('left')),
      },
      {
        label: 'Tooltip',
        path: 'tooltip',
        type: 'inlineCodeInput',
        options: {
          label: 'Tooltip',
        },
        validation: zodToJsonSchema(z.string().default('')),
      },
      {
        label: 'Placeholder',
        path: 'placeholder',
        type: 'inlineCodeInput',
        options: {
          label: 'Placeholder',
        },
        validation: zodToJsonSchema(z.string().default('')),
      },
      {
        label: 'Default Value',
        path: 'defaultValue',
        type: 'inlineCodeInput',
        options: {
          label: 'Default Value',
        },
        validation: zodToJsonSchema(z.string().optional().default('')),
      },
      {
        label: 'Disabled',
        path: 'disabled',
        type: 'inlineCodeInput',
        options: {
          label: 'Disabled',
        },
        validation: zodToJsonSchema(z.boolean().default(false)),
      },
      {
        label: 'Caption',
        path: 'caption',
        type: 'inlineCodeInput',
        options: {
          label: 'Caption',
        },
        validation: zodToJsonSchema(z.string().default('')),
      },
      {
        label: 'Max Length',
        path: 'maxLength',
        type: 'inlineCodeInput',
        options: {
          label: 'Max Length',
        },
        validation: zodToJsonSchema(z.number().default(400)),
      },
      {
        label: 'Min Length',
        path: 'minLength',
        type: 'inlineCodeInput',
        options: {
          label: 'Min Length',
        },
        validation: zodToJsonSchema(z.number().default(0)),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onTextChange',
        label: 'onTextChange',
        type: 'inlineCodeInput',
        options: {
          label: 'onTextChange',
        },
      },
      {
        path: 'onFocus',
        label: 'onFocus',
        type: 'inlineCodeInput',
        options: {
          label: 'onFocus',
        },
      },
      {
        path: 'onBlur',
        label: 'onBlur',
        type: 'inlineCodeInput',
        options: {
          label: 'onBlur',
        },
      },
    ],
  },
];
const WebloomTextAreaWidget: Widget<WebloomTextAreaProps> = {
  component: WebloomTextArea,
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['value']),
};

export { WebloomTextAreaWidget };
