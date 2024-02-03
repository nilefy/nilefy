import { makeObservable, observable, action, computed } from 'mobx';
import { WebloomPage } from './page';

export type GlobalsT = {
  currentUser: EditorState['currentUser'];
  currentPageName: WebloomPage['name'];
  currentPageHandle: WebloomPage['handle'];
  currentPageHeight: WebloomPage['height'];
  currentPageWidth: WebloomPage['width'];
};

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
  currentUser: string | undefined = '';
  globals: GlobalsT = {
    currentUser: '',
    currentPageName: '',
    currentPageHandle: '',
    currentPageHeight: 0,
    currentPageWidth: 0,
  };

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
      currentUser: observable,
    });
  }
  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
    user,
  }: Partial<{
    name: string;
    pages: WebloomPage[];
    currentPageId: string;
  }> & { user: string | undefined }) {
    this.currentUser = user;
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
    this.globals = {
      currentUser: this.currentUser,
      currentPageName: this.currentPage.name,
      currentPageHandle: this.currentPage.handle,
      currentPageHeight: this.currentPage.height,
      currentPageWidth: this.currentPage.width,
    };
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
