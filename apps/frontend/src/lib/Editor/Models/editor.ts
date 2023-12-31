import { makeObservable, observable, action, computed } from 'mobx';
import { Page } from './page';

export class EditorState {
  pages: Record<string, Page> = {};
  currentPageId: string = '';
  width: number = 0;
  height: number = 0;
  constructor() {
    makeObservable(this, {
      pages: observable,
      currentPageId: observable,
      width: observable,
      height: observable,
      currentPage: computed,
      changePage: action,
      addPage: action,
      removePage: action,
      setEditorDimensions: action,
    });
  }
  get currentPage() {
    return this.pages[this.currentPageId];
  }
  changePage(id: string) {
    if (!this.pages[id]) {
      this.addPage(id);
      this.currentPageId = id;
    } else {
      this.currentPageId = id;
    }
  }
  addPage(id: string) {
    this.pages[id] = new Page({ id, widgets: {}, queries: {} });
  }
  removePage(id: string) {
    delete this.pages[id];
  }
  setEditorDimensions(
    dims: Partial<{
      width: number;
      height: number;
    }>,
  ) {
    this.width = dims.width || this.width;
    this.height = dims.height || this.height;
  }

  snapshot() {
    return {
      pages: Object.values(this.pages).map((page) => page.snapshot),
      currentPageId: this.currentPageId,
      width: this.width,
      height: this.height,
    };
  }
}
