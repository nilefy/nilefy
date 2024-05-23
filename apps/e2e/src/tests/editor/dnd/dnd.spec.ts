import { expect, test } from '../../../fixtures';

test(
  '1. Should be able to drag and drop widgets from the sidebar',
  {
    tag: ['@dnd', '@editor'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.dragAndDropNewWidget('Text');
    const widget = await editorPage.getWidget(id!);
    await expect(widget).toBeVisible();
  },
);
