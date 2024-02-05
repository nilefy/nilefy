import { makeObservable, observable, action, computed } from 'mobx';
import { WebloomPage } from './page';

export class EditorState {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  currentPageId: string = '';
  /**
   * application name
   */
  name: string = 'New Application';

  constructor() {
    makeObservable(this, {
      pages: observable,
      currentPageId: observable,
      name: observable,
      currentPage: computed,
      changePage: action,
      addPage: action,
      removePage: action,
      init: action,
    });
  }
  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
  }: Partial<{
    name: string;
    pages: WebloomPage[];
    currentPageId: string;
  }>) {
    this.name = name;
    pages.forEach((page) => {
      this.pages[page.id] = page;
    });
    this.currentPageId = currentPageId;
    // NOTE: backend should create page by default
    if (pages.length === 0) {
      this.addPage('page1', 'page1', 'page1');
      this.currentPageId = 'page1';
    }
    if (!this.currentPageId) {
      this.currentPageId = Object.keys(this.pages)[0];
    }
  }
  get currentPage() {
    return this.pages[this.currentPageId];
  }

  changePage(id: string, name: string, handle: string) {
    if (!this.pages[id]) {
      this.addPage(id, name, handle);
      this.currentPageId = id;
    } else {
      this.currentPageId = id;
    }
  }
  addPage(id: string, name: string, handle: string) {
    this.pages[id] = new WebloomPage({
      id,
      name,
      handle,
      widgets: {},
      queries: {},
    });
  }
  removePage(id: string) {
    delete this.pages[id];
  }

  snapshot() {
    return {
      pages: Object.values(this.pages).map((page) => page.snapshot),
      currentPageId: this.currentPageId,
    };
  }
}
