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

import React, { useContext, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { boolean } from 'zod';
import { EDITOR_CONSTANTS } from '@/lib/Editor/constants';
import { Trash2 } from 'lucide-react';
import store from '@/store';
import { FormControlContext } from '..';

function InspectorEventManger(props: {
  eventIndex: number;
  handleOnChange: (newValue: unknown, index: number) => void;
  handleOnDelete: (index: number) => void;
  event: Array;
}) {
  const tree = store((state) => state.tree);
  const [selectedComponent, setSelectedComponent] = useState(
    props.event.selectedComponent,
  );
  const [action, setAction] = useState(props.event.action);
  const [actionValue, setActionValue] = useState<string | boolean>(
    props.event.actionValue,
  );
  const [eventType, SetEventType] = useState(props.event.eventType);
  const [actionType, SetActionType] = useState(props.event.actionType);
  const handleEventChange = () => {
    props.handleOnChange(
      {
        eventType: eventType,
        actionType: actionType,
        selectedComponent: selectedComponent,
        action: action,
        actionValue: actionValue,
      },
      props.eventIndex,
    );
    console.log('1');
  };
  const handleDelete = () => {
    props.handleOnDelete(props.eventIndex);
  };

  return (
    <DropdownMenu>
      <div className="flex w-full justify-between bg-slate-100 p-1">
        <DropdownMenuTrigger className="w-full pl-3 text-left">
          onClick
        </DropdownMenuTrigger>
        <Trash2
          onClick={handleDelete}
          className="mr-2 cursor-pointer text-red-500"
        />
      </div>
      <DropdownMenuContent
        onPointerDownOutside={handleEventChange}
        className="space-y-2"
      >
        <div className="flex items-center justify-evenly">
          <p>Event</p>
          <Select
            value={eventType}
            onValueChange={(e) => {
              SetEventType(e);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="click">onClick</SelectItem>
              <SelectItem value="hover">Hover</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-evenly">
          <p>Action</p>
          <Select
            value={actionType}
            onValueChange={(e) => {
              SetActionType(e);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alert">alert</SelectItem>
              <SelectItem value="controlComponent">
                Control Component
              </SelectItem>
              <SelectItem value="openWebPage">Open Web Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Action Options</DropdownMenuLabel>
        {actionType == 'controlComponent' && (
          <>
            <div className="flex items-center justify-evenly">
              <p>Component</p>
              <Select
                value={selectedComponent}
                onValueChange={(e) => {
                  setSelectedComponent(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Component" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(tree).map(
                    (node) =>
                      node.id != EDITOR_CONSTANTS.ROOT_NODE_ID && (
                        <SelectItem value={node.id} key={node.id}>
                          {node.name}
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-evenly">
              <p>Action</p>
              <Select
                value={action}
                onValueChange={(e) => {
                  setAction(e);
                  setActionValue(true);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Set Text</SelectItem>
                  <SelectItem value="disabled">Disable</SelectItem>
                  <SelectItem value="visibility">Visibility</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        {actionType != 'controlComponent' && (
          <div className="flex items-center justify-evenly">
            {actionType == 'alert' ? 'Text' : 'Url'}{' '}
            <Input
              onChange={(e) => setActionValue(e.target.value)}
              value={actionValue?.toString()}
            />
          </div>
        )}
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default InspectorEventManger;
