import {
  UndoableCommand,
  Command,
  isUndoableCommand,
  ActionReturnI,
} from './types';
import { WebloomWebSocket } from './ws';
import log from 'loglevel';
import { nanoid } from 'nanoid';

export class CommandManager {
  // history is just a stack
  private commandStack: UndoableCommand[];
  private static instance: CommandManager;
  // because we only connect to ws in editor room
  private socket: WebloomWebSocket | null = null;

  private constructor() {
    // start with free history
    this.commandStack = [];
  }

  public connectToEditor(appId: number, pageId: number) {
    if (this.socket !== null) return;
    this.socket = new WebloomWebSocket(appId, pageId);
  }

  /**
   *Note: The process of closing the connection begins with a closing handshake, and the close() method does not discard previously-sent messages before starting that closing handshake; even if the user agent is still busy sending those messages, the handshake will only start after the messages are sent.
   */
  public disconnectFromConnectedEditor() {
    if (this.socket === null) return;
    if (this.socket.socketState !== 1) return;
    log.info('closing connection');
    this.socket.closeConnection();
    this.socket = null;
  }

  private handleActionReturn(ret: ActionReturnI) {
    if (ret && this.socket !== null && this.socket.getState() === 'connected') {
      const r = {
        ...ret,
        data: {
          ...ret.data,
          id: nanoid(),
        },
      };
      log.info('method returned value i will send to remote', r);
      this.socket.sendMessage(JSON.stringify(r));
    }
  }

  public executeCommand(cmd: Command | null) {
    //this is essentially a no-op
    if (cmd === null) return;
    const ret = cmd.execute();
    this.handleActionReturn(ret);
    if (cmd instanceof UndoableCommand || isUndoableCommand(cmd)) {
      this.commandStack.push(cmd as UndoableCommand);
    }
  }

  public undoCommand() {
    const cmd = this.commandStack.pop();

    // empty stack
    if (cmd === undefined) {
      return;
    }
    const ret = cmd.undo();
    this.handleActionReturn(ret);
  }

  public static getInstance() {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }
}

// export global command manager to the app => GUI supposed to use this object
export const commandManager = CommandManager.getInstance();
