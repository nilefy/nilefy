import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import store from '../../../../../store/index';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { boolean } from 'zod';

function InspectorEventManger() {
  const tree = store((state) => state.tree);
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const [selectedComponent, setSelectedComponent] = useState('');
  const [text, setText] = useState('');
  const [action, setAction] = useState('');
  const [actionValue, setActionValue] = useState(false);
  //const [controlledID, setControlledId] = useState('');
  console.log(tree);
  useEffect(() => {
    const handleEventChange = () => {
      function createFunction() {
        return function () {
          store.getState().setProp(selectedComponent, action, actionValue);
        };
      }
      const fun = createFunction();
      const events = store.getState().getProps(selectedId).event;
      console.log(events);
      if (events && Array.isArray(events)) {
        console.log('onClick');
        store.getState().setProp(selectedId, 'event', [...events, fun]);
      }
      console.log(store.getState().getNode(selectedId), 'bla');
    };
    handleEventChange();
  }, [action, selectedComponent, text, actionValue, selectedId]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>onClick</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <p>Event</p>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onClick">onClick</SelectItem>
              <SelectItem value="hover">Hover</SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p>Action</p>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="controlComponent">
                Control Component
              </SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Action Options</DropdownMenuLabel>
        <DropdownMenuItem>
          <p>Component</p>
          <Select
            value={selectedComponent}
            onValueChange={(e) => {
              setSelectedComponent(e);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(tree).map((node) => (
                <SelectItem value={node.id} key={node.id}>
                  {node.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p>Action</p>
          <Select
            value={action}
            onValueChange={(e) => {
              setAction(e);
              e != 'text' && setActionValue(true);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Set Text</SelectItem>
              <SelectItem value="disabled">Disable</SelectItem>
              <SelectItem value="visibility">Visibility</SelectItem>
              <SelectItem value="loading">Loading</SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        {action == 'text' && (
          <DropdownMenuItem>
            Text <Input onChange={(e) => setText(e.target.value)} />
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default InspectorEventManger;
