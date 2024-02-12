import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { BaseControlProps, LayoutMode } from '@/lib/Editor/interface';
import { Label } from '@/components/ui/label';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorHeightMode = observer(function InspectorHeightMode(
  props: Pick<BaseControlProps, 'id' | 'label'>,
) {
  const { id } = useContext(FormControlContext);
  if (!id) throw new Error('i need the widget id');
  const widget = editorStore.currentPage.getWidgetById(id);

  return (
    <div className="flex flex-col space-y-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select
        onValueChange={(newValue) => {
          widget.setLayout(newValue as LayoutMode);
        }}
        value={widget.layoutMode}
        defaultValue={'auto' satisfies LayoutMode}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{props.label}</SelectLabel>
            <SelectItem
              value={'fixed' satisfies LayoutMode}
              key={'fixed' satisfies LayoutMode}
            >
              Fixed
            </SelectItem>
            <SelectItem
              value={'auto' satisfies LayoutMode}
              key={'auto' satisfies LayoutMode}
            >
              Auto
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
});

export default InspectorHeightMode;
