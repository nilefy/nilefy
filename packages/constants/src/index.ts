const EDITOR_CONSTANTS = {
  GRID_CELL_SIDE: 20,
  NUMBER_OF_COLUMNS: 32,
  ROW_HEIGHT: 5,
  ROOT_NODE_ID: "0",
  PREVIEW_NODE_ID: "1",
  GLOBALS_ID: "WebloomGlobals",
  JS_QUERY_BASE_NAME: "jsQuery",
  JS_AUTOCOMPLETE_FILE_NAME: "webloom-autocomplete",
  WIDGET_CONTAINER_TYPE_NAME: "WebloomContainer",
} as const;
const SOCKET_EVENTS = {
  DELETE_NODE: "deleteNode",
  UPDATE_NODE: "updateNode",
  CREATE_NODE: "createNode",
  NOT_AUTHED: "notAuthed",
} as const;
const dataSourcesTypes = [
  "database",
  "api",
  "cloud storage",
  "plugin",
] as const;
Object.freeze(EDITOR_CONSTANTS);
Object.freeze(SOCKET_EVENTS);
export { EDITOR_CONSTANTS, SOCKET_EVENTS, dataSourcesTypes };
