import { expect, test } from '../fixtures';

test(
  '1. Should be able to drag and drop widgets from the sidebar',
  {
    tag: ['@dnd', '@editor'],
  },
  async ({ editorPage }) => {
    await editorPage.dragAndDropWidget('Text');
    const widget = editorPage.rootCanvas.getByText('Text', { exact: true });
    expect(widget).toBeVisible();
  },
);
