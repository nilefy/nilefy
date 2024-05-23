import { expect, test } from '../../../fixtures';

test(
  '1. Should be able to evaluate javascript expressions',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.fillInput(id!, 'text', `{{'Hello World'}}`);
    const widget = await editorPage.getWidget(id!);
    await expect(widget).toHaveText('Hello World');
  },
);
