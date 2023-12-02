import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';
import React from 'react';
import store from '../../../../../store/index';

function EventManagerButton() {
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const events = store.getState().getProps(selectedId).events;
  const handleClick = () => {
    if (events && Array.isArray(events)) {
      console.log('onClick');
      store
        .getState()
        .setProp(selectedId, 'events', [
          ...events,
          ['click', 'alert', selectedId, 'Hello World!'],
        ]);
    }
    //store.getState().setProp(selectedId, 'events', ['bla']);
    console.log(store.getState().getProps(selectedId));
  };
  return (
    <Button onClick={handleClick} className="mt-2 w-full">
      <PlusSquare className="mr-2" />
      New Event Handler
    </Button>
  );
}

export default EventManagerButton;
