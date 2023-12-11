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
import { Event, eventConfig } from '@/lib/Editor/interface';
import { api } from '@/api';
import { useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';

function InspectorEventItem(props: {
  eventIndex: number;
  handleOnChange: (newValue: Event, index: number) => void;
  handleOnDelete: (index: number) => void;
  event: Event;
  config: eventConfig;
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
  const { workspaceId, appId } = useParams();
  // const {
  //   isPending: queryPending,
  //   data: queryData,
  //   refetch: refetchQueries,
  // } = api.queries.index.useQuery(
  //   +(workspaceId as string),
  //   1,
  //   +(appId as string),
  // );
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
  function ExtraOptions() {
    switch (actionType) {
      case 'controlComponent':
        return (
          <>
            <div className="flex items-center justify-between pt-4">
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
            <div className="flex items-center justify-between">
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
                  {props.config.actionsOn.map((actionValue) => (
                    <SelectItem
                      value={actionValue.value}
                      key={actionValue.value}
                    >
                      {actionValue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between ">
              Text
              <Input
                onChange={(e) => setActionValue(e.target.value)}
                value={actionValue?.toString()}
                autoFocus
                className="w-2/3"
              />
            </div>
          </>
        );
      // case 'runQuery':
      // return <div><Select
      //           value={selectedComponent}
      //           onValueChange={(e) => {
      //             setSelectedComponent(e);
      //           }}
      //         >
      //           <SelectTrigger className="w-[180px]">
      //             <SelectValue placeholder="Component" />
      //           </SelectTrigger>
      //           <SelectContent>
      //             {Object.values(tree).map(
      //               (node) =>
      //                 node.id != EDITOR_CONSTANTS.ROOT_NODE_ID && (
      //                   <SelectItem value={node.id} key={node.id}>
      //                     {node.name}
      //                   </SelectItem>
      //                 ),
      //             )}
      //           </SelectContent>
      //         </Select></div>
      case 'alert':
        return (
          <div className="flex items-center justify-between pt-4">
            Text
            <Input
              onChange={(e) => setActionValue(e.target.value)}
              value={actionValue?.toString()}
              autoFocus //to solve losing focus //adding key didn't work
              className="w-2/3"
            />
          </div>
        );
      case 'openWebPage':
        return (
          <div className="flex items-center justify-between pt-4">
            URL
            <Input
              onChange={(e) => setActionValue(e.target.value)}
              value={actionValue?.toString()}
              autoFocus
              className="w-2/3"
            />
          </div>
        );
    }
  }

  return (
    <DropdownMenu>
      <div className="flex w-full justify-between bg-slate-100 p-1">
        <DropdownMenuTrigger className="w-full pl-3 text-left">
          {eventType}
        </DropdownMenuTrigger>
        <Trash2
          onClick={handleDelete}
          className="mr-2 cursor-pointer text-red-500"
        />
      </div>
      <DropdownMenuContent
        onPointerDownOutside={handleEventChange}
        className="space-y-4 p-4"
      >
        <div className="flex items-center justify-between">
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
              {props.config.events.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between pb-4">
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
              {props.config.actions.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="absolute left-16 top-28 my-3 text-center">
          Action Options
        </DropdownMenuLabel>
        <ExtraOptions />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default InspectorEventItem;
