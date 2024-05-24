import { expect, test } from '../../fixtures';

test('1. Should be able to delete a selected widget when pressing delete key', async ({
  editorPage,
}) => {
  const id = await editorPage.dragAndDropNewWidget('Text');
  const widget = await editorPage.getWidget(id);
  await editorPage.rootCanvas.press('Delete');
  await expect(widget).not.toBeVisible();
});
