import { Popover } from '@/components/ui/popover';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { EntityFormContext, EntityFormControlContext } from '..';
import { useContext } from 'react';

export const ErrorPopover = observer(() => {
  const { focusedPath } = useContext(EntityFormContext);
  const { entityId, path } = useContext(EntityFormControlContext);
  if (focusedPath !== path) return null;
  const errors = editorStore.getEntityById(entityId)!.errors[path];
  if (!errors) return null;

  return (
    <div>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
    </div>
  );
});
