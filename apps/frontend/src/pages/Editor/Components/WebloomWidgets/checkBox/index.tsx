import { Checkbox } from '@/components/ui/checkbox';
import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

export type WebloomCheckBoxProps = {
  label: string;
  value: boolean;
  disabled: boolean;
};

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
            // editorStore.executeActions<typeof webloomCheckBoxEvents>(
            //   id,
            //   'onCheckChange',
            // );
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
  disabled: false,
};

const inspectorConfig: EntityInspectorConfig<WebloomCheckBoxProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'label',
        type: 'inlineCodeInput',
        options: {
          label: 'Label',
        },
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
    ],
  },
];

export const WebloomCheckBoxWidget: Widget<WebloomCheckBoxProps> = {
  component: WebloomCheckBox,
  config,
  defaultProps,
  inspectorConfig,
  metaProps: new Set(['value']),
};

export { WebloomCheckBox };
