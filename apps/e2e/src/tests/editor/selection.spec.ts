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

test('3. Should be able to select multiple widgets', async ({
  editorPage,
}) => {});

test('4. Should be able to deselect widgets', async ({ editorPage }) => {});

test('5. Should be able to select widgets with shift key', async ({
  editorPage,
}) => {});

test('6. Should be able to deselect all widgets with Esc key', async ({
  editorPage,
}) => {});

test('7. Should be able to select widgets from the left sidebar', async ({
  editorPage,
}) => {});
