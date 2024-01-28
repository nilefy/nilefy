import { makeObservable, observable, action, computed } from 'mobx';
import { WebloomPage } from './page';

export class EditorState {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  currentPageId: string = '';

  constructor() {
    makeObservable(this, {
      pages: observable,
      currentPageId: observable,

      currentPage: computed,
      changePage: action,
      addPage: action,
      removePage: action,
      init: action,
    });
  }
  init({
    pages: pages = [],
    currentPageId = '',
  }: Partial<{
    pages: WebloomPage[];
    currentPageId: string;
  }>) {
    console.log('init');
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

  changePage(id: string) {
    if (!this.pages[id]) {
      this.addPage(id);
      this.currentPageId = id;
    } else {
      this.currentPageId = id;
    }
  }
  addPage(id: string) {
    this.pages[id] = new WebloomPage({ id, widgets: {}, queries: {} });
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
