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

test('2. Should be able to drag and drop existing widgets', async ({
  editorPage,
}) => {});

test('3. Should handle collisons when dragging and dropping widgets', async ({
  editorPage,
}) => {});

test('4. Canvas should expand when dragging a widget to the edge of the canvas', async ({
  editorPage,
}) => {});

test('5. Canvas should start with correct size', async ({ editorPage }) => {});

test('6. Canvas should shrink when needed', async ({ editorPage }) => {});
