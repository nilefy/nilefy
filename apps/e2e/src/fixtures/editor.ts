import { expect, Locator, Page } from '@playwright/test';
import { clearApps } from '../utils';
/**
 * @description assumes the user is logged in
 */
export class EditorPage {
  readonly page: Page;
  appId!: string;
  appName!: string;
  rightSidebar!: {
    insertButton: Locator;
    inspectButton: Locator;
    PageButton: Locator;
    ispectOnePanel: Locator;
  };
  bottomPanel!: {
    addNewQuery: Locator;
  };
  queryItems!: Locator;
  rootCanvas!: Locator;
  constructor(page: Page) {
    this.page = page;
  }
  async boot() {
    await this.page.goto(`/`);
    const createButton = this.page
      .getByRole('button', {
        name: 'create new app',
      })
      .first();
    await createButton.click();
    const appNameInput = this.page.getByLabel('Name');
    this.appName = 'My App';
    appNameInput.fill(this.appName);
    await this.page
      .getByRole('button', {
        name: 'Create App',
      })
      .click();

    const editButton = this.page.getByRole('link', { name: 'Edit' });
    await editButton.click();
    const newAppInEditor = this.page.getByText(this.appName);
    await expect(newAppInEditor).toBeVisible();
    this.rightSidebar = {
      insertButton: this.page.getByRole('tab', { name: 'Insert' }),
      inspectButton: this.page.getByRole('tab', { name: 'Inspect' }),
      PageButton: this.page.getByRole('tab', { name: 'Page' }),
      ispectOnePanel: this.page.getByTestId('one-item-inspection-panel'),
    };
    this.rootCanvas = this.page.getByTestId('0');
    this.bottomPanel = {
      addNewQuery: this.page.getByRole('button', { name: '+ Add' }),
    };
    this.queryItems = this.page.getByTestId('query-item');
  }
  async dispose(index: number) {
    const username = `user${index}`;
    console.log('disposing', username);
    clearApps(username);
  }

  async addNewJsQuery() {
    await this.bottomPanel.addNewQuery.click();
    await this.page.getByRole('menuitem', { name: 'JS Query' }).click();
    const queryItem = this.queryItems.last();
    await expect(queryItem).toBeVisible();
    return queryItem.getAttribute('data-id');
  }
  async selectQuery(id: string) {
    const queryItem = this.page.locator(`[data-id="${id}"]`);
    await queryItem.click();
  }
  async singleSelect(id: string) {
    (await this.getWidget(id)).click();
    await expect(this.rightSidebar.ispectOnePanel).toBeVisible();
  }
  async getInputValue(id: string, field: string) {
    await this.singleSelect(id);
    const input = this.rightSidebar.ispectOnePanel
      .locator(`#${id}-${field}`)
      .getByRole('textbox');
    return await input.innerText();
  }
  async fillWidgetInput(id: string, field: string, value: string) {
    await this.singleSelect(id);
    const input = this.rightSidebar.ispectOnePanel
      .locator(`#${id}-${field}`)
      .getByRole('textbox');
    await input.fill(value);
  }
  async fillQueryInput(id: string, field: string, value: string) {
    await this.selectQuery(id);
    const input = this.page.locator(`#${id}-${field}`).getByRole('textbox');
    await input.fill(value);
  }
  async getWidget(id: string) {
    const widget = this.page.getByTestId(id);
    return widget;
  }
  unselectAll() {
    this.page.getByTestId('0').click();
  }
  async dragAndDropNewWidget(
    widgetName: string,
    x: number = 0,
    y: number = 0,
  ): Promise<string> {
    await this.rightSidebar.insertButton.click();
    const widget = this.page.getByRole('button', {
      name: widgetName,
      exact: true,
    });
    await drag(this.page, widget, this.rootCanvas, x, y);
    const id = await this.rootCanvas
      .locator('[data-id]')
      .last()
      .getAttribute('data-id');
    expect(id).not.toBe(null);
    return id!;
  }
}
const drag = async (
  page: Page,
  draggable: Locator,
  droppable: Locator,
  x = 0,
  y = 0,
) => {
  const box = (await droppable.boundingBox())!;
  await draggable.hover();

  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + x, box.y + box.height / 2 + y, {
    steps: 5,
  });
  await page.mouse.up();
};
