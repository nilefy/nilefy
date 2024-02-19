import { Checkbox } from '@/components/ui/checkbox';

import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorCheckBox = () => {
  const { onChange, value } = useContext(FormControlContext);
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
