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
  readonly workspaceId: string;
  constructor(page: Page) {
    this.page = page;
    this.workspaceId = 'test';
    this.rightSidebar = {
      insert: page.getByRole('button', { name: 'Insert' }),
      inspect: page.getByRole('button', { name: 'Inspect' }),
      Page: page.getByRole('button', { name: 'Page' }),
    };
    this.rootCanvas = page.locator("[data-testid='0']");
  }
  async boot() {
    await this.page.goto(`/${this.workspaceId}`);
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

    const editButton = this.page.getByRole('button', { name: 'Edit' });
    await editButton.click();
    const newAppInEditor = this.page.getByText(this.appName);
    await expect(newAppInEditor).toBeVisible();
  }
  async dispose() {
    await this.page.goto('/');
    const menu = this.page.getByRole('button', {
      expanded: false,
    });
    await menu.click();
    const deleteButton = this.page.getByRole('button', { name: 'Delete' });
    await deleteButton.click();
  }

  async dragAndDropWidget(widgetName: string, x: number = 0, y: number = 0) {
    await this.rightSidebar.insert.click();
    const widget = this.page.getByRole('button', { name: widgetName });
    await widget.dragTo(this.rootCanvas, {
      targetPosition: { x, y },
    });
  }
}
