import { makeObservable, observable, action, computed } from 'mobx';
import { PageState, WebloomPage } from './page';

export class EditorState {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  currentPageId: string = '';
  /**
   * application name
   */
  name!: string;
  id!: number;

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
      setCurrentPageId: action,
    });
  }

  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
    id,
  }: {
    id: number;
    name: string;
  } & Partial<{
    pages: WebloomPage[];
    currentPageId: string;
  }>) {
    console.log('init');
    this.id = id;
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

  getPageState(id: string): PageState {
    return this.pages[id].state;
  }

  setCurrentPageId(id: string) {
    this.currentPageId = id;
  }

  /**
   * load page from the backend if its state is PageState.UNLOADED or PageState.ERROR in any other case just change currentPage
   */
  async changePage(id: string) {
    console.log('in changed page');
    const page = this.pages[id];
    if (!page) throw new Error(`app don't know this page`);
    this.currentPageId = id;
    // this.currentPage.state = PageState.LOADING;
    console.log(this.currentPage, this.currentPageId);
    if (
      this.currentPage.state === PageState.UNLOADED ||
      this.currentPage.state === PageState.ERROR
    ) {
      console.log('before await');
      await page.loadTree();
    }
  }

  // TODO: update this function to accept tree as the backend creates root with the page
  addPage(id: string, name: string, handle: string) {
    this.pages[id] = new WebloomPage({
      id,
      name,
      handle,
      widgets: {},
      queries: {},
      appId: this.id,
      pageState: PageState.UNLOADED,
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
