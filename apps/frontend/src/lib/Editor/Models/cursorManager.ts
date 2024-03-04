import { computed, makeObservable, reaction } from 'mobx';
import { WebloomPage } from './page';

export class CursorManager {
  private page: WebloomPage;
  private disposables: Array<() => void> = [];
  constructor(page: WebloomPage) {
    this.page = page;
    makeObservable(this, {
      cursorStyle: computed,
    });
    // make a new style tag and append it to the body
    const style = document.createElement('style');
    document.head.appendChild(style);
    this.disposables.push(
      () => style.remove(),
      reaction(
        () => this.cursorStyle,
        () => {
          if (this.cursorStyle === 'auto')
            return (style.innerHTML = 'cursor: auto !important;');
          style.innerHTML = `body * { cursor: ${this.cursorStyle} !important; }`;
        },
      ),
    );
  }
  get cursorStyle() {
    if (this.page.isDragging) return 'grabbing';
    return 'auto';
  }
  dispose() {
    this.disposables.forEach((fn) => fn());
  }
}
