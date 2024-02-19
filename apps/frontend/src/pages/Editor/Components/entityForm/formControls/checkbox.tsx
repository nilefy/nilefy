import { Checkbox } from '@/components/ui/checkbox';

import { useContext } from 'react';
import { EntityFormControlContext } from '..';

const InspectorCheckBox = () => {
  const { onChange, value } = useContext(EntityFormControlContext);
  return (
    <div className="flex flex-row gap-2">
      <Checkbox
        checked={!!value}
        onCheckedChange={(checked) => onChange(checked)}
      />
    </div>
  );
};

export default InspectorCheckBox;
