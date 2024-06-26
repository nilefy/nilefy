import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { acquireAccount, createWorkspaceAndApp } from '../utils';
import { EditorPage } from './editor';
//todo env var
const baseURL = 'http://localhost:4173';
export * from '@playwright/test';

export type WebloomFixtures = {
  editorPage: EditorPage;
};
// eslint-disable-next-line
export const test = baseTest.extend<WebloomFixtures, {
    workerStorageState: string;
  }
>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }
      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });
      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      const account = await acquireAccount(id);
      // Perform authentication steps. Replace these actions with your own.
      await page.goto(baseURL + '/signin');
      await page.getByLabel('Email').fill(account.email);
      await page.getByLabel('Password').fill(account.password);
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByLabel('Email')).not.toBeVisible();
      // End of authentication steps.
      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    const user = `user${test.info().parallelIndex}`;
    const { workspace, app } = await createWorkspaceAndApp(user);
    try {
      await editorPage.boot(workspace, app);
      await use(editorPage);
    } finally {
      await editorPage.dispose(test.info().parallelIndex);
    }
  },
});
