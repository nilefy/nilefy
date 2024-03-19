import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
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
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
  WidgetProps,
} from '@rjsf/utils';
import { PlusSquare, Trash2 } from 'lucide-react';
import z from 'zod';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ReactNode } from 'react';
import { ArrayFieldItemType } from './arrayFieldItemTemplate';

type EventConfigTypes = 'alert' | 'openLink' | 'runScript';
const eventConfigTypes: EventConfigTypes[] = ['alert', 'openLink'];
const alertMessagesType = ['info', 'alert', 'success', 'failure'] as const;
export const eventConfig = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('alert'),
      message: z.string(),
      messageType: z.enum(alertMessagesType),
    }),
    z.object({
      type: z.literal('openLink'),
      link: z.string().url(),
    }),
    z.object({
      type: z.literal('runScript'),
      script: z.string(),
    }),
  ])
  .default({ type: 'alert', message: 'hi', messageType: 'info' });

export type EventConfig = z.infer<typeof eventConfig>;
export const widgetsEventHandler = z.array(
  z.object({
    /**
     * is type refer to when this eventHandler will be called(onClick/onChange)
     */
    type: z.string(),
    config: eventConfig,
  }),
);

const eventConfigJsonSchema: RJSFSchema = {
  title: 'Config',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['alert', 'openLink', 'runScript'],
      default: 'alert',
    },
  },
  required: ['type'],
  dependencies: {
    type: {
      oneOf: [
        {
          properties: {
            type: {
              enum: ['alert'],
            },
            message: {
              type: 'string',
              default: 'alert',
            },
            messageType: {
              type: 'string',
              enum: alertMessagesType,
              default: alertMessagesType[0],
            },
          },
          required: ['message', 'messageType'],
        },
        {
          properties: {
            type: {
              enum: ['openLink'],
            },
            link: {
              type: 'string',
              format: 'uri',
            },
          },
          required: ['link'],
        },
        {
          properties: {
            type: {
              enum: ['runScript'],
            },
            script: {
              type: 'string',
            },
          },
          required: ['script'],
        },
      ],
    },
  },
};

export const widgetsEventHandlerJsonSchema: RJSFSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      // click, hover, ...
      type: {
        type: 'string',
      },
      config: eventConfigJsonSchema,
    },
    required: ['type', 'config'],
  },
};

export function genEventHandlerUiSchema(
  entityEvents: EventTypes,
  title: string = 'Event Handlers',
): UiSchema {
  return {
    'ui:title': title,
    'ui:options': {
      orderable: false,
    },
    items: {
      'ui:options': {
        'ui:itemType': ArrayFieldItemType.EventHandlerItem,
      },
      type: {
        'ui:widget': 'eventManagerTypeSelect',
        'ui:options': entityEvents,
      },
      config: {
        message: {
          'ui:widget': 'inlineCodeInput',
          'ui:placeholder': 'message',
        },
        link: {
          'ui:widget': 'inlineCodeInput',
          'ui:placeholder': 'URL',
        },
        script: {
          'ui:widget': 'codeInput',
        },
      },
    },
  };
}

export type WidgetsEventHandler = z.infer<typeof widgetsEventHandler>;

type EventHandlerArrayItemProps = {
  /**
   * function item can call to save new changes
   */
  onChangeCallback: (newValue: WidgetsEventHandler[0]) => void;
  /**
   * function item can call to delete themseleves
   */
  onDeleteCallback: () => void;
  event: WidgetsEventHandler[0];
  eventTypes: EventTypes;
};

function EventHandlerArrayItemFormItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">{children}</div>
  );
}

function EventHandlerArrayItem({
  event,
  onChangeCallback,
  onDeleteCallback,
  eventTypes,
}: EventHandlerArrayItemProps) {
  function ExtraOptions() {
    const eventConfig = event.config;
    switch (eventConfig.type) {
      // case 'controlComponent':
      //   return (
      //     <>
      //       <div className="flex items-center justify-between pt-4">
      //         <p>Component</p>
      //         <Select
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
      //         </Select>
      //       </div>
      //       <div className="flex items-center justify-between">
      //         <p>Action</p>
      //         <Select
      //           value={action}
      //           onValueChange={(e) => {
      //             setAction(e);
      //             setActionValue(true);
      //           }}
      //         >
      //           <SelectTrigger className="w-[180px]">
      //             <SelectValue placeholder="Action" />
      //           </SelectTrigger>
      //           <SelectContent>
      //             {props.config.actionsOn.map((actionValue) => (
      //               <SelectItem
      //                 value={actionValue.value}
      //                 key={actionValue.value}
      //               >
      //                 {actionValue.name}
      //               </SelectItem>
      //             ))}
      //           </SelectContent>
      //         </Select>
      //       </div>
      //
      //       <div className="flex items-center justify-between ">
      //         Text
      //         <Input
      //           onChange={(e) => setActionValue(e.target.value)}
      //           value={actionValue?.toString()}
      //           autoFocus
      //           className="w-2/3"
      //         />
      //       </div>
      //     </>
      //   );
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
          <>
            <EventHandlerArrayItemFormItem>
              <Label>Message</Label>
              {/* TODO: switch to code */}
              <Input
                onChange={(e) =>
                  onChangeCallback({
                    ...event,
                    config: {
                      ...eventConfig,
                      message: e.target.value,
                    },
                  })
                }
                value={eventConfig.message}
                autoFocus
              />
            </EventHandlerArrayItemFormItem>
            <EventHandlerArrayItemFormItem>
              <Label>Message Type</Label>
              <Select
                value={eventConfig.messageType}
                onValueChange={(newType) => {
                  onChangeCallback({
                    ...event,
                    config: {
                      ...eventConfig,
                      // @ts-expect-error conversion between string and narrower type
                      messageType: newType,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue defaultValue={'info'} />
                </SelectTrigger>
                <SelectContent>
                  {alertMessagesType.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </EventHandlerArrayItemFormItem>
          </>
        );
      case 'openLink':
        return (
          <EventHandlerArrayItemFormItem>
            <Label>URL</Label>
            {/*TODO: change to code*/}
            <Input
              value={eventConfig.link}
              onChange={(e) =>
                onChangeCallback({
                  ...event,
                  config: {
                    ...eventConfig,
                    link: e.target.value,
                  },
                })
              }
              autoFocus
            />
          </EventHandlerArrayItemFormItem>
        );
    }
  }

  return (
    <DropdownMenu>
      <div className="flex w-full justify-between">
        <DropdownMenuTrigger className="w-full">
          <p className="flex w-full gap-3">
            {/*TODO: edit span className*/}
            <span className="">{event.type}</span>
            <span className="">{event.config.type}</span>
          </p>
        </DropdownMenuTrigger>
        <Button variant={'destructive'} size="icon">
          <Trash2 onClick={onDeleteCallback} />
        </Button>
      </div>
      <DropdownMenuContent side="left" className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <p>Event</p>
          <Select
            value={event.type}
            onValueChange={(newType) => {
              onChangeCallback({
                ...event,
                type: newType,
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(eventTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between pb-4">
          <p>Action</p>
          <Select
            value={event.config.type}
            onValueChange={(newValue) => {
              onChangeCallback({
                ...event,
                config: {
                  ...event.config,
                  // @ts-expect-error conversion between type string and union
                  type: newValue,
                },
              });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {eventConfigTypes.map((configType) => (
                <SelectItem key={configType} value={configType}>
                  {configType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-center">
          Action Options
        </DropdownMenuLabel>

        <div className="flex h-full w-full flex-col gap-4 pt-4">
          <ExtraOptions />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * what event this widget could handle
 * {
 * value: label
 * }
 */
export type EventTypes = {
  [v: string]: string;
};
type EventHandlerArrayProps = {
  value: WidgetsEventHandler;
  eventTypes: EventTypes;
  onChange: (value: WidgetsEventHandler) => void;
};

function EventHandlerArray({
  value,
  onChange,
  eventTypes,
}: EventHandlerArrayProps) {
  const addItemCallback = () => {
    onChange([
      ...value,
      {
        type: Object.keys(eventTypes)[0],
        config: {
          type: 'alert',
          message: '',
          messageType: 'info',
        },
      },
    ]);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <Button onClick={addItemCallback} size="icon">
        <PlusSquare />
      </Button>
      {value.map((event, index) => {
        return (
          <EventHandlerArrayItem
            key={index}
            event={event}
            eventTypes={eventTypes}
            onDeleteCallback={() => {
              onChange(value.filter((_, i) => i !== index));
            }}
            onChangeCallback={(newValue) => {
              const u = [...value];
              u[index] = newValue;
              onChange(u);
            }}
          />
        );
      })}
    </div>
  );
}

export default function EventHandlerWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const { id, options, label, hideLabel, placeholder, value, onChange } = props;
  // NOTE:
  // options suppose to be the events names and the component expect them to be {value: label}
  // for example button should include event like the following
  // {"ui:options": {
  // click: "Click"
  // }}

  if (Object.keys(options).length === 0)
    throw new Error("don't use eventHandler if you won't handle any events");

  return (
    <EventHandlerArray
      value={value}
      onChange={onChange}
      eventTypes={options as EventTypes}
      key={id}
    />
  );
}

export function EventHandlerTypeSelect<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const { options, value, onChange } = props;
  // NOTE:
  // options suppose to be the events names and the component expect them to be {value: label}
  // for example button should include event like the following
  // {"ui:options": {
  // click: "Click"
  // }}

  if (Object.keys(options).length === 0)
    throw new Error("don't use eventHandler if you won't handle any events");
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Event" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options as EventTypes).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
