import { expect, test } from '../../../fixtures';
import { wait } from '../../../utils';

test(
  '1. It should be able to return a value to be used by other entities',
  {
    tag: ['@editor', '@dataSources', '@evaluation'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.addNewJsQuery();
    const text = 'Hello, world!';
    await editorPage.fillQueryInput(id!, 'query', `return "${text}"`);
    const buttonId = await editorPage.dragAndDropNewWidget('Button');
    const textId = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const textWidget = await editorPage.getWidget(textId);
    const defaultText = await editorPage.getInputValue(textId, 'text');
    await editorPage.fillWidgetInput(textId, 'text', `{{${id}.data}}`);
    //no data yet
    await expect(textWidget).toHaveText(defaultText);
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.run()}}`);
    const button = await editorPage.getWidget(buttonId);
    await button.click();
    //data should be there
    await expect(textWidget).toHaveText(text);
  },
);

test(
  '2. It should be able to clear the data',
  {
    tag: ['@editor', '@dataSources', '@evaluation'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.addNewJsQuery();
    const text = 'Hello, world!';
    await editorPage.fillQueryInput(id!, 'query', `return "${text}"`);
    const buttonId = await editorPage.dragAndDropNewWidget('Button');
    const textId = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const textWidget = await editorPage.getWidget(textId);
    const defaultText = await editorPage.getInputValue(textId, 'text');
    await editorPage.fillWidgetInput(textId, 'text', `{{${id}.data}}`);
    //no data yet
    await expect(textWidget).toHaveText(defaultText);
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.run()}}`);
    const button = await editorPage.getWidget(buttonId);
    await button.click();
    //data should be there
    await expect(textWidget).toHaveText(text);
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.reset()}}`);
    await button.click();
    //no data again
    await expect(textWidget).toHaveText(defaultText);
  },
);

test(
  '3. Query state should be updated to loading when running, and to success on success and to failure on failure',
  {
    tag: ['@editor', '@dataSources', '@evaluation'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.addNewJsQuery();
    const textId = await editorPage.dragAndDropNewWidget('Text');
    const textWidget = await editorPage.getWidget(textId);
    await editorPage.fillWidgetInput(textId, 'text', `{{${id}.queryState}}`);
    await expect(textWidget).toHaveText('idle');
    await editorPage.fillQueryInput(
      id!,
      'query',
      'return new Promise((resolve) => setTimeout(() => resolve(), 50))',
    );
    const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.run()}}`);
    const button = await editorPage.getWidget(buttonId);
    await button.click();
    await expect(textWidget).toHaveText('loading');
    await wait(100);
    await expect(textWidget).toHaveText('success');
    await editorPage.fillQueryInput(
      id!,
      'query',
      'return new Promise((_, reject) => setTimeout(() => reject(), 50))',
    );
    await button.click();
    await expect(textWidget).toHaveText('loading');
    await wait(100);
    await expect(textWidget).toHaveText('error');
  },
);
