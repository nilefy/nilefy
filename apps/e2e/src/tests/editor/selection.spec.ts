import { expect, test } from '../../fixtures';

test(
  '1. Inspection sidebar should appear when a widget is selected',
  {
    tag: ['@editor', '@rightSidebar'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.singleSelect(id!);
    await expect(editorPage.rightSidebar.ispectOnePanel).toBeVisible();
  },
);
