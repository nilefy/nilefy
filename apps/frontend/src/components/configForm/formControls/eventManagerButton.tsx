import { Button } from '@/components/ui/button';
import store from '@/store';
import { PlusSquare } from 'lucide-react';
import React, { useContext } from 'react';
import InspectorEventManger from './events';
import { FormControlContext } from '..';
import { nanoid } from 'nanoid';

function EventManagerButton(props) {
  console.log(props);
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const events = props.value;
  const { onChange } = useContext(FormControlContext);
  const handleClick = () => {
    if (events && Array.isArray(events)) {
      onChange([
        ...events,
        {
          eventType: 'click',
          actionType: 'alert',
          selectedComponent: null,
          action: null,
          actionValue: 'Hello World!',
        },
      ]);
    }
  };

  const handleOnChange = (newValue: unknown, index: number) => {
    const updatedEvents = [...events];
    updatedEvents[index] = newValue;
    onChange(updatedEvents);
  };
  const handleDelete = (index: number) => {
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);
    onChange(updatedEvents);
  };
  return (
    <>
      {events?.map((event, index) => {
        // console.log(index + selectedId);
        return (
          <InspectorEventManger
            key={index + selectedId}
            eventIndex={index}
            handleOnChange={handleOnChange}
            handleOnDelete={handleDelete}
            event={event}
          />
        );
      })}
      <Button onClick={handleClick} className="mt-2 w-full">
        <PlusSquare className="mr-2" />
        New Event Handler
      </Button>
    </>
  );
}

export default EventManagerButton;
