import { getToken } from '@/lib/token.localstorage';
import { UndoableCommand, Command, isUndoableCommand } from './types';
import { Socket } from 'dgram';

export class CommandManager {
  // history is just a stack
  private commandStack: UndoableCommand[];
  private static instance: CommandManager;
  private static socket: WebSocket;
  private constructor() {
    // start with free history
    this.commandStack = [];
    // TODO: don't connect to ws unless you're in editor
    CommandManager.socket = new WebSocket(
      'ws://localhost:3000?access_token=' + getToken(),
    );
    CommandManager.socket.onopen = function () {
      console.log('Connected');
      CommandManager.socket.send(
        JSON.stringify({
          event: 'auth',
          data: {
            access_token: getToken(),
          },
        }),
      );
      CommandManager.socket.onmessage = function (data) {
        console.log(data);
      };
    };
    CommandManager.socket.onerror = function (ev) {
      console.log('error', ev);
    };

    CommandManager.socket.onclose = function () {
      console.log('connection closed');
    };
  }

  public executeCommand(cmd: Command | null) {
    //this is essentially a no-op
    if (cmd === null) return;
    const ret = cmd.execute();
    if (ret) {
      console.log('method returned value i will send to remote');
      console.dir(ret);
      CommandManager.socket.send(JSON.stringify(ret));
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
