import { test } from '../fixtures';

test(
  '1. Should be able to drag and drop widgets from the sidebar',
  {
    tag: ['@dnd', '@editor'],
  },
  async ({ editorPage }) => {
    await editorPage.dragAndDropWidget('Text');
    await editorPage.dragAndDropWidget('Button');
    await editorPage.dragAndDropWidget('Image');
  },
);
