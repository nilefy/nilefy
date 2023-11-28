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
import React, { useState } from 'react';
import { ROOT_NODE_ID } from '@/lib/Editor/constants';
import { InspectorInput } from './input';
import { Input } from '@/components/ui/input';

function InspectorEventManger() {
  const tree = store((state) => state.tree);
  const [selectedComponent, setSelectedComponent] = useState('');
  console.log(tree);
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
              <SelectItem value="controlComponent">Control Component</SelectItem>
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
        <DropdownMenuItem><p>Action</p><Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setText">Set Text</SelectItem>
            </SelectContent>
          </Select></DropdownMenuItem>
        <DropdownMenuItem>Text <Input /></DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default InspectorEventManger;
