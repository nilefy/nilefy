import { Button } from '@/components/ui/button';
import store from '@/store';
import { PlusSquare } from 'lucide-react';
import React, { useContext } from 'react';
import InspectorEventItem from './events';
import { FormControlContext } from '..';
import { nanoid } from 'nanoid';
import { WebloomWidgets } from '@/pages/Editor/Components';

function EventManager(props) {
  console.log(props);
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const selectedNode = store.getState().tree[selectedId];
  const eventsConfig = WebloomWidgets[selectedNode.type].eventsConfig;
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
          <InspectorEventItem
            key={index + selectedId}
            eventIndex={index}
            handleOnChange={handleOnChange}
            handleOnDelete={handleDelete}
            event={event}
            config={eventsConfig}
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

export default EventManager;
