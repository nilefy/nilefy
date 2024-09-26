import type { InputHTMLAttributes, ReactNode } from "react";
import z from "zod";
import { JsonSchema7Type } from "zod-to-json-schema";

const EDITOR_CONSTANTS = {
  GRID_CELL_SIDE: 20,
  NUMBER_OF_COLUMNS: 32,
  ROW_HEIGHT: 5,
  ROOT_NODE_ID: "0",
  PREVIEW_NODE_ID: "1",
  GLOBALS_ID: "NilefyGlobals",
  JS_QUERY_BASE_NAME: "jsQuery",
  JS_AUTOCOMPLETE_FILE_NAME: "nilefy-autocomplete",
  WIDGET_CONTAINER_TYPE_NAME: "NilefyContainer",
} as const;

const SOCKET_EVENTS_REQUEST = {
  AUTH: "auth",
  DELETE_NODE: "deleteNode",
  UPDATE_NODE: "updateNode",
  CREATE_NODE: "createNode",
  CREATE_QUERY: "createQuery",
  UPDATE_QUERY: "updateQuery",
  DELETE_QUERY: "deleteQuery",
  CREATE_JS_QUERY: "createJsQuery",
  UPDATE_JS_QUERY: "updateJsQuery",
  DELETE_JS_QUERY: "deleteJsQuery",
  CHANGE_PAGE: "changePage",
} as const;

const SOCKET_EVENTS_RESPONSE = {
  AUTHED: "authed",
  NOT_AUTHED: "notAuthed",
  PAGE_CHANGED: "pageChanged",
} as const;

const dataSourcesTypes: [string, ...string[]] = [
  "database",
  "api",
  "cloud storage",
  "plugin",
];

Object.freeze(EDITOR_CONSTANTS);
Object.freeze(SOCKET_EVENTS_REQUEST);
Object.freeze(SOCKET_EVENTS_RESPONSE);

/////////////// INSPECTOR CONFIG TYPES ////////////////

///////////HIDE FORM CONTROL CONDITIONS
type ComparisonOperations =
  | "EQUALS"
  | "NOT_EQUALS"
  | "LESSER"
  | "GREATER"
  | "IN"
  | "NOT_IN";

type Condition = {
  path: string;
  value: any;
  comparison: ComparisonOperations;
};
interface ConditionObject {
  conditionType: "AND" | "OR";
  conditions: Conditions;
}

type Conditions = Array<Condition> | ConditionObject;

/**
 * please note this type didn't add to the enum the case where the check could be function, why?
 *
 * because condition could be function only on the front so the front is left with the responsiblity to add the types that only could be used on the front code
 */
type IsHidden = boolean | Condition | ConditionObject;
//////////////////////////

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

type BaseControlProps = {
  label: string;
};

type InlineCodeInputProps = {
  placeholder?: string;
};
// each widget props
type InspectorInputProps = Partial<
  Pick<InputProps, "type" | "placeholder" | "max" | "min">
>;

type InspectorStaticSelectProps = {
  items: { label: string; value: string }[];
};
type InspectorDynamicSelectProps = {
  path: string;
  convertToOptions: (value: unknown) => { label: string; value: string }[];
};
type InspectorSelectProps = {
  placeholder?: string;
} & (InspectorStaticSelectProps | InspectorDynamicSelectProps);

type InspectorColorProps = {
  color: string;
};

type InspectorEvents = Record<string, never>;

type InspectorDatePickerProps = {
  date: Date;
};

type ArrayInputProps<T = any> = {
  subform: FormControl[];
  SubFormWrapper?: React.FC<{
    onDelete: () => void;
    children: ReactNode;
    value: T;
  }>;
  FormWrapper?: React.FC<{ children: ReactNode }>;
  newItemDefaultValue: Record<string, unknown>;
  addButtonText?: string;
};

// config panel types
type FormControlOptions = {
  input: InspectorInputProps;
  select: InspectorSelectProps;
  color: InspectorColorProps;
  event: InspectorEvents;
  sqlEditor: {
    placeholder?: string;
  };
  list: undefined;
  checkbox: undefined;
  inlineCodeInput: InlineCodeInputProps;
  chartDatasets: undefined;
  datePicker: InspectorDatePickerProps;
  array: ArrayInputProps;
  keyValue: undefined;
  codeInput: undefined;
};

type MappedTypeToArray<T> = T extends { [K in keyof T]: infer U } ? U[] : never;
type EntityInspectorConfig<
  TProps extends Record<string, unknown> = Record<string, unknown>,
  ExtendIsHidden = IsHidden,
> = {
  sectionName: string;
  hidden?: ExtendIsHidden;
  deps?: TProps[];
  children: MappedTypeToArray<{
    [key in keyof TProps]: {
      [key2 in InspectorFormControlsTypes]: FormControl<
        key2,
        TProps,
        key,
        ExtendIsHidden
      >;
    }[InspectorFormControlsTypes];
  }>;
}[];

type FormControl<
  FormControlType extends
    InspectorFormControlsTypes = InspectorFormControlsTypes,
  TProps extends Record<string, unknown> = Record<string, unknown>,
  Key extends keyof TProps = keyof TProps,
  /**
   * exists for the frontend to be able to add more types on the IsHidden Interface Like function
   */
  ExtendIsHidden = IsHidden,
> = {
  type: FormControlType;
  isEvent?: boolean;
  path: Key;
  /**
   * Code can be evaluated without a binding
   */
  isCode?: boolean;
  hidden?: ExtendIsHidden;
  validation?: JsonSchema7Type;
} & BaseControlProps &
  ConditionalOptionalFormControlOptions<FormControlOptions[FormControlType]>;

type ConditionalOptionalFormControlOptions<T> = T extends undefined
  ? object
  : {
      options: T;
    };

type InspectorFormControlsTypes = keyof FormControlOptions;

////////////// INSPECTOR CONFIG TYPES ///////////
//
type InvitationTokenPayload = {
  type: "invite";
  userId: number;
  email: string;
  workspaceId: number;
  workspaceName: string;
};

/**
 * PLEASE NOTE: backend implementation MUST NOT depend on `userStatus` value it's just helper for the front to know what values should be sent in which case, backend should depends on database
 */
const invitationCallbackReq = z.discriminatedUnion("userStatus", [
  // sending password means user accept invite
  z.object({
    userStatus: z.literal("newUser"),
    password: z.string().min(6),
    token: z.string(),
  }),
  z.object({
    userStatus: z.literal("existingUser"),
    status: z.enum(["acceptted", "declined"]),
    token: z.string(),
  }),
]);

/**
 * PLEASE NOTE: backend implementation MUST NOT depend on `userStatus` value it's just helper for the front to know what values should be sent in which case, backend should depends on database
 */
type InvitationCallbackReq = z.infer<typeof invitationCallbackReq>;

// those constatns are used to describe the relaying party for webauthn(the relaying party is the server going to recieve the credentails in our case it's our server!)

/**
 * Human-readable title for your website
 */
const rpName = "Nilefy";
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const rpID = "localhost";
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const origin = `http://localhost:5173`;

export type {
  BaseControlProps,
  InspectorInputProps,
  InspectorSelectProps,
  EntityInspectorConfig,
  InspectorFormControlsTypes,
  InlineCodeInputProps,
  InspectorColorProps,
  Condition,
  ConditionObject,
  Conditions,
  IsHidden,
  FormControl,
  ConditionalOptionalFormControlOptions,
  ArrayInputProps,
  InvitationTokenPayload,
  InvitationCallbackReq,
};

export {
  EDITOR_CONSTANTS,
  SOCKET_EVENTS_REQUEST,
  SOCKET_EVENTS_RESPONSE,
  dataSourcesTypes,
  invitationCallbackReq,
  rpName,
  origin,
  rpID,
};
