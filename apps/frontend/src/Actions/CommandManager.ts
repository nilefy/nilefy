import { UndoableCommand, Command, isUndoableCommand } from './types';
import { WebloomWebSocket } from './ws';

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
    this.socket = new WebloomWebSocket(appId, pageId);
  }

  /**
   *Note: The process of closing the connection begins with a closing handshake, and the close() method does not discard previously-sent messages before starting that closing handshake; even if the user agent is still busy sending those messages, the handshake will only start after the messages are sent.
   */
  public disconnectFromConnectedEditor() {
    if (this.socket !== null) {
      this.socket.closeConnection();
      this.socket = null;
    }
  }

  public executeCommand(cmd: Command | null) {
    //this is essentially a no-op
    if (cmd === null) return;
    const ret = cmd.execute();
    if (ret && this.socket !== null && this.socket.getState() === 'connected') {
      console.log('method returned value i will send to remote', ret);
      this.socket.socket.send(JSON.stringify(ret));
    }
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
    cmd.undo();
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
