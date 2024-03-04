import { Checkbox } from '@/components/ui/checkbox';
import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import {
  EventTypes,
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';

export type WebloomCheckBoxProps = {
  label: string;
  value: boolean;
  events: WidgetsEventHandler;
  disabled: boolean;
};

const webloomCheckBoxEvents = {
  onCheckChange: 'onCheckChange',
} as const;

const WebloomCheckBox = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomCheckBoxProps;
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        <Checkbox
          disabled={props.disabled}
          checked={props.value}
          onCheckedChange={(e) => {
            onPropChange({
              key: 'value',
              value: e,
            });
            // execute user defined eventhandlers
            editorStore.executeActions<typeof webloomCheckBoxEvents>(
              id,
              'onCheckChange',
            );
          }}
        />
        <Label>{props.label}</Label>
      </div>
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Check Box',
  icon: <CheckSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomCheckBoxProps = {
  label: 'Label',
  value: false,
  events: [],
  disabled: false,
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        default: defaultProps.label,
      },
      value: {
        type: 'boolean',
      },
      disabled: {
        type: 'boolean',
      },
      events: widgetsEventHandlerJsonSchema,
    },
    required: ['label', 'events'],
  },
  uiSchema: {
    value: { 'ui:widget': 'hidden' },
    label: {
      'ui:widget': 'inlineCodeInput',
      'ui:title': 'Label',
      'ui:placeholder': 'Enter label',
    },
    disabled: {
      'ui:widget': 'inlineCodeInput',
    },
    events: genEventHandlerUiSchema(webloomCheckBoxEvents),
  },
};

export const WebloomCheckBoxWidget: Widget<WebloomCheckBoxProps> = {
  component: WebloomCheckBox,
  config,
  defaultProps,
  schema,
  setters: {
    setValue: {
      path: 'value',
      type: 'boolean',
    },
    setDisabled: {
      path: 'disabled',
      type: 'boolean',
    },
  },
};

export { WebloomCheckBox };
