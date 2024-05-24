import { expect, test } from '../../../fixtures';

test(
  '1. Should be able to evaluate basic javascript expressions',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.fillWidgetInput(id!, 'text', `{{'Hello World'}}`);
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
    await editorPage.fillWidgetInput(id1!, 'text', shared);
    await editorPage.fillWidgetInput(id2!, 'text', `{{${id1}.text}}`);
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
    await editorPage.fillWidgetInput(id1!, 'text', shared);
    await editorPage.fillWidgetInput(id2!, 'text', `{{${id1}.text}}`);
    await editorPage.fillWidgetInput(id3!, 'text', `{{${id2}.text}}`);
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
    await editorPage.fillWidgetInput(id1!, 'text', `{{${id2}.text}}`);
    await editorPage.fillWidgetInput(id2!, 'text', `{{${id1}.text}}`);
    const widget1 = await editorPage.getWidget(id1!);
    const widget2 = await editorPage.getWidget(id2!);
    // the current behavior is to show default value when there is a cyclic dependency
    await expect(widget1).toHaveText(text);
    await expect(widget2).toHaveText(text);
  },
);

test(
  "5. Setters should be able to update the value of a widget's property",
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const textId = await editorPage.dragAndDropNewWidget('Text');
    const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
    const newText = 'Hello World';
    await editorPage.fillWidgetInput(
      buttonId!,
      'onClick',
      `{{${textId}.setText("${newText}")}}`,
    );
    const button = await editorPage.getWidget(buttonId!);
    await button.click();
    const textWidget = await editorPage.getWidget(textId!);
    await expect(textWidget).toHaveText(newText);
  },
);

test(
  '6. Set values should reflect to other widgets that depend on it',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const textId1 = await editorPage.dragAndDropNewWidget('Text');
    const textId2 = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 200);
    const newText = 'Hello World';
    await editorPage.fillWidgetInput(
      buttonId!,
      'onClick',
      `{{${textId1}.setText("${newText}")}}`,
    );
    await editorPage.fillWidgetInput(textId2!, 'text', `{{${textId1}.text}}`);
    const button = await editorPage.getWidget(buttonId!);
    await button.click();
    const textWidget = await editorPage.getWidget(textId2!);
    await expect(textWidget).toHaveText(newText);
  },
);

test(
  '7. Set value should be ignored if the widget property has changed',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const textId = await editorPage.dragAndDropNewWidget('Text');
    const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
    const setText = 'Hello World';
    await editorPage.fillWidgetInput(
      buttonId!,
      'onClick',
      `{{${textId}.setText("${setText}")}}`,
    );
    const button = await editorPage.getWidget(buttonId!);
    await button.click();
    const newText = 'I am new text';
    await editorPage.fillWidgetInput(textId!, 'text', newText);
    const textWidget = await editorPage.getWidget(textId!);
    await expect(textWidget).toHaveText(newText);
  },
);

test(
  '8. Should re-evaluate the expression if binding resolves to undefined after it resolved to a value before',
  {
    tag: ['@evaluation', '@editor'],
  },
  async ({ editorPage }) => {
    const textId1 = await editorPage.dragAndDropNewWidget('Text');
    const textId2 = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    const defaultText = await editorPage.getInputValue(textId1!, 'text');
    const newText = 'Hello World';
    await editorPage.fillWidgetInput(textId2!, 'text', `{{${textId1}.text}}`);
    await editorPage.fillWidgetInput(textId1!, 'text', newText);
    const textWidget = await editorPage.getWidget(textId2!);
    await expect(textWidget).toHaveText(newText);
    await editorPage.fillWidgetInput(textId1!, 'text', '{{undefined}}');
    await expect(textWidget).toHaveText(defaultText);
  },
);
