
const EDITOR_CONSTANTS = {
  GRID_CELL_SIDE: 20,
  NUMBER_OF_COLUMNS: 32,
  ROW_HEIGHT: 5,
  ROOT_NODE_ID: '0',
  PREVIEW_NODE_ID: '1',
} as const;
const SOCKET_EVENTS = {
  DELETE_NODE: 'deleteNode',
  UPDATE_NODE: 'updateNode',
  CREATE_NODE: 'createNode',
  NOT_AUTHED: 'notAuthed',  
} as const;
Object.freeze(EDITOR_CONSTANTS);
Object.freeze(SOCKET_EVENTS);
export{
  EDITOR_CONSTANTS,
  SOCKET_EVENTS,
}