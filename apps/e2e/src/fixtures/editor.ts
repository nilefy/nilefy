import { expect, Locator, Page } from '@playwright/test';
/**
 * @description assumes the user is logged in
 */
export class EditorPage {
  readonly page: Page;
  appId!: string;
  appName!: string;
  rightSidebar: {
    insert: Locator;
    inspect: Locator;
    Page: Locator;
  };
  rootCanvas: Locator;
  constructor(page: Page) {
    this.page = page;
    this.rightSidebar = {
      insert: page.getByRole('tab', { name: 'Insert' }),
      inspect: page.getByRole('tab', { name: 'Inspect' }),
      Page: page.getByRole('tab', { name: 'Page' }),
    };
    //todo add a test id
    this.rootCanvas = page.locator('.overflow-hidden > div > div > .relative');
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
  }
  async dispose() {
    await this.page.goto('/');
    const menu = this.page.locator('ul').getByRole('button');
    await menu.click();
    const deleteButton = this.page.getByRole('menuitem', { name: 'Delete' });
    await deleteButton.click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async dragAndDropWidget(widgetName: string, x: number = 0, y: number = 0) {
    await this.rightSidebar.insert.click();
    const widget = this.page.getByRole('button', {
      name: widgetName,
      exact: true,
    });
    await drag(this.page, widget, this.rootCanvas, x, y);
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
