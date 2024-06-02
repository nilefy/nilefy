import { expect, test } from '../../fixtures';

test('1. Should be able to delete a selected widget when pressing delete key', async ({
  editorPage,
}) => {
  const id = await editorPage.dragAndDropNewWidget('Text');
  const widget = await editorPage.getWidget(id);
  await editorPage.rootCanvas.press('Delete');
  await expect(widget).not.toBeVisible();
});

test('2. Should be able to delete multiple selected widgets when pressing delete key', async ({
  editorPage,
}) => {});

test('3. Should be able to delete a multiple selected widgets when clicking the delete button in the rightside bar', async ({
  editorPage,
}) => {});

test('4. Should be able to delete a widget from the left sidebar', async ({
  editorPage,
}) => {});
