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

test(
  "2. Bug: Selection after insertion doesn't activate the inspector tab in the rightsidebar #390",
  {
    tag: ['@editor', '@rightSidebar'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.singleSelect(id!);
    const id1 = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.singleSelect(id1!);
    await expect(editorPage.rightSidebar.ispectOnePanel).toBeVisible();
  },
);
