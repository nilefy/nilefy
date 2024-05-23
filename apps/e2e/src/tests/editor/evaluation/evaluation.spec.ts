import { expect, test } from '../../../fixtures';

test(
  '1. Should be able to evaluate basic javascript expressions',
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

test(
  '2. Should be able to resolve bindings between 2 widgets',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const id1 = await editorPage.dragAndDropNewWidget('Text');
    const id2 = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const shared = 'Hello';
    await editorPage.fillInput(id1!, 'text', shared);
    await editorPage.fillInput(id2!, 'text', `{{${id1}.text}}`);
    const widget2 = await editorPage.getWidget(id2!);
    await expect(widget2).toHaveText(shared);
  },
);

test(
  '3. Should be able to resolve chained dependencies',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const id1 = await editorPage.dragAndDropNewWidget('Text');
    const id2 = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const id3 = await editorPage.dragAndDropNewWidget('Text', 0, 200);
    const shared = 'Hello';
    await editorPage.fillInput(id1!, 'text', shared);
    await editorPage.fillInput(id2!, 'text', `{{${id1}.text}}`);
    await editorPage.fillInput(id3!, 'text', `{{${id2}.text}}`);
    const widget3 = await editorPage.getWidget(id3!);
    await expect(widget3).toHaveText(shared);
  },
);

test(
  '4. Should be able to handle cyclic dependencies',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const id1 = await editorPage.dragAndDropNewWidget('Text');
    const id2 = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const text = await editorPage.getInputValue(id1!, 'text');
    await editorPage.fillInput(id1!, 'text', `{{${id2}.text}}`);
    await editorPage.fillInput(id2!, 'text', `{{${id1}.text}}`);
    const widget1 = await editorPage.getWidget(id1!);
    const widget2 = await editorPage.getWidget(id2!);
    // the current behavior is to show default value when there is a cyclic dependency
    await expect(widget1).toHaveText(text);
    await expect(widget2).toHaveText(text);
  },
);
