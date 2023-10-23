import { UndoableCommand, Command } from './types';
function isUndoableCommand(cmd: Command): cmd is UndoableCommand {
  //some duck typing because I'm not actually instancing the classes in the actions but returning them as objects
  return (
    (cmd as UndoableCommand).undo &&
    typeof (cmd as UndoableCommand).undo === 'function'
  );
}
export class CommandManager {
  // history is just a stack
  private commandStack: UndoableCommand[];
  private static instance: CommandManager;
  private constructor() {
    // start with free history
    this.commandStack = [];
  }

  public executeCommand(cmd: Command | null) {
    //this is essentially a no-op
    if (cmd === null) return;
    cmd.execute();
    // if cmd is undoable push it to the stack

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
