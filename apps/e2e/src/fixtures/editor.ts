import { expect, Locator, Page } from '@playwright/test';
import { clearApps } from '../utils';
import { EDITOR_CONSTANTS } from '@webloom/constants';
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
  quickInfoTooltip!: Locator;
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
    this.rootCanvas = this.page.getByTestId(EDITOR_CONSTANTS.ROOT_NODE_ID);
    this.bottomPanel = {
      addNewQuery: this.page.getByRole('button', { name: '+ Add' }),
    };
    this.queryItems = this.page.getByTestId('query-item');
    this.quickInfoTooltip = this.page.locator('.cm-tooltip-hover');
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
  async deleteQuery(id: string) {
    const queryItem = this.getQueryMenuItem(id);
    //todo better selector
    const deleteButton = queryItem.getByRole('button').nth(1);
    await deleteButton.click();
    await expect(queryItem).not.toBeVisible();
  }
  async selectQuery(id: string) {
    const queryItem = this.getQueryMenuItem(id);
    await queryItem.click();
  }
  getQueryMenuItem(id: string) {
    return this.page.locator(`[data-id="${id}"]`);
  }
  async singleSelect(id: string) {
    let isAlreadySelected = false;
    const activeId = await this.rightSidebar.ispectOnePanel
      .getByTestId('selected-widget-id')
      .inputValue();
    if (activeId === id) {
      isAlreadySelected = true;
    }
    if (!isAlreadySelected) (await this.getWidget(id)).click();
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
  async unselectAll() {
    await this.rootCanvas.click();
    await this.page.keyboard.press('Escape');
    await expect(this.rightSidebar.ispectOnePanel).not.toBeVisible();
  }
  async dragAndDropNewWidget(
    widgetName: string,
    x: number = 0,
    y: number = 0,
  ): Promise<string> {
    return this.dragAndDropNewWidgetInto(
      widgetName,
      EDITOR_CONSTANTS.ROOT_NODE_ID,
      x,
      y,
    );
  }

  async dragAndDropNewWidgetInto(
    widgetName: string,
    targetId: string,
    x: number = 0,
    y: number = 0,
  ): Promise<string> {
    await this.rightSidebar.insertButton.click();
    const widget = this.page.getByRole('button', {
      name: widgetName,
      exact: true,
    });
    const target = this.page.getByTestId(targetId);
    await drag(this.page, widget, target, x, y);
    const selectedId =
      this.rightSidebar.ispectOnePanel.getByTestId('selected-widget-id');
    const id = await selectedId.inputValue();
    expect(id).not.toBe(null);
    return id!;
  }

  async dragAndDropExistingWidget(
    widgetId: string,
    targetId: string,
    x: number = 0,
    y: number = 0,
  ) {
    const widget = this.page.getByTestId(widgetId);
    const target = this.page.getByTestId(targetId);
    await drag(this.page, widget, target, x, y);
    const selectedId =
      this.rightSidebar.ispectOnePanel.getByTestId('selected-widget-id');
    const id = await selectedId.inputValue();
    expect(id).toBe(widgetId);
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
