import { makeObservable, observable, action, computed } from 'mobx';
import { Page } from './page';
import { EDITOR_CONSTANTS } from '@webloom/constants';

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
      adjustDimensions: action,
    });
  }
  init({
    pages: pages = [],
    currentPageId = '',
  }: Partial<{
    pages: Page[];
    currentPageId: string;
  }>) {
    pages.forEach((page) => {
      this.pages[page.id] = page;
    });
    this.currentPageId = currentPageId;
    if (pages.length === 0) {
      this.addPage('page1');
      this.currentPageId = 'page1';
    }
    if (!this.currentPageId) {
      this.currentPageId = Object.keys(this.pages)[0];
    }
  }
  get currentPage() {
    return this.pages[this.currentPageId];
  }

  adjustDimensions() {
    const currentPage = this.currentPage;
    if (!currentPage) return;
    const dims =
      currentPage.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID].pixelDimensions;
    this.width = dims.width;
    this.height = dims.height;
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
