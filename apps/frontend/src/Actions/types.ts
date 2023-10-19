export abstract class Command {
  abstract execute(): void;
}

export abstract class UndoableCommand extends Command {
  abstract undo(): void;
}
