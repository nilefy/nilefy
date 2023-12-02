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
import { ROOT_NODE_ID } from '@/lib/Editor/constants';
import { Trash2 } from 'lucide-react';

function InspectorEventManger(props: {
  onChange: (newValue: unknown) => void;
  onDelete: () => void;
}) {
  const tree = store((state) => state.tree);
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const [selectedComponent, setSelectedComponent] = useState('');
  const [action, setAction] = useState('');
  const [actionValue, setActionValue] = useState<string | boolean>();
  const [eventType, SetEventType] = useState('click');
  const [actionType, SetActionType] = useState('alert');
  const handleEventChange = () => {
    props.onChange([
      eventType,
      actionType,
      selectedComponent,
      action,
      actionValue,
    ]);
    console.log('1');
  };
  const handleDelete = () => {
    props.onDelete();
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
                      node.id != ROOT_NODE_ID && (
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
