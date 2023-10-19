import { Command } from '../types';

type ResizingKeys =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
class ResizeAction {
  private static resizingKey: ResizingKeys;
  private static initialDimensions: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  private static _start(
    key: ResizingKeys,
    dimensions: {
      width: number;
      height: number;
      x: number;
      y: number;
    },
  ) {
    this.resizingKey = key;
    this.initialDimensions = dimensions;
  }
  public static start(
    ...args: Parameters<typeof ResizeAction._start>
  ): Command {
    return {
      execute: () => {
        this._start(...args);
      },
    };
  }
}

export default ResizeAction;
