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
      'return new Promise((resolve) => setTimeout(() => resolve(), 300))',
    );
    const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.run()}}`);
    const button = await editorPage.getWidget(buttonId);
    await button.click();
    await expect(textWidget).toHaveText('loading');
    await expect(textWidget).toHaveText('success');
    await editorPage.fillQueryInput(
      id!,
      'query',
      'return new Promise((_, reject) => setTimeout(() => reject(), 300))',
    );
    await button.click();
    await expect(textWidget).toHaveText('loading');
    await wait(100);
    await expect(textWidget).toHaveText('error');
  },
);

test(
  '4. It should be able to infer the return type of the query',
  {
    tag: ['@editor', '@dataSources', '@evaluation', '@autoCompletion'],
  },
  async ({ editorPage }) => {
    const id = await editorPage.addNewJsQuery();
    const toBeHovered = 'verySpecificVariableName';
    await editorPage.fillQueryInput(
      id!,
      'query',
      `return [{${toBeHovered}: "John Doe"}]`,
    );
    const buttonId = await editorPage.dragAndDropNewWidget('Button');
    const textId = await editorPage.dragAndDropNewWidget('Text', 0, 100);
    await editorPage.fillWidgetInput(
      textId,
      'text',
      `{{${id}.data[0].${toBeHovered}}}`,
    );
    await editorPage.fillWidgetInput(buttonId, 'onClick', `{{${id}.run()}}`);
    const button = await editorPage.getWidget(buttonId);
    await button.click();
    await editorPage.singleSelect(textId);
    const toBeHoveredToken =
      editorPage.rightSidebar.ispectOnePanel.getByText(toBeHovered);
    await toBeHoveredToken.click();
    await toBeHoveredToken.hover();
    const hoverTooltip = editorPage.quickInfoTooltip;
    const expected = `(property) ${toBeHovered}: string`;
    await expect(hoverTooltip).toHaveText(expected);
  },
);

test(
  "5. Trigger Mode: It should be able to run on startup if trigger mode is set to 'On App Load'",
  {
    tag: ['@editor', '@dataSources', '@evaluation'],
  },
  async ({ editorPage, page }) => {
    const id = await editorPage.addNewJsQuery();
    await editorPage.fillQueryInput(id!, 'query', 'return [{a: "test"}]');
    const textId = await editorPage.dragAndDropNewWidget('Text');
    await editorPage.fillWidgetInput(textId, 'text', `{{${id}.data[0].a}}`);
    const triggerMode = page.getByLabel('Trigger Mode');
    await triggerMode.click();
    await page.getByLabel('On App Load').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.reload();
    const textWidget = await editorPage.getWidget(textId);
    await expect(textWidget).toHaveText('test');
  },
);

test(
  "6. Trigger Mode: It shouldn't run on startup if trigger mode is set to 'Manual'",
  {
    tag: ['@editor', '@dataSources', '@evaluation'],
  },
  async ({ editorPage, page }) => {
    const id = await editorPage.addNewJsQuery();
    await editorPage.fillQueryInput(id!, 'query', 'return [{a: "test"}]');
    const textId = await editorPage.dragAndDropNewWidget('Text');
    const defaultText = await editorPage.getInputValue(textId, 'text');
    await editorPage.fillWidgetInput(textId, 'text', `{{${id}.data[0].a}}`);
    const triggerMode = page.getByLabel('Trigger Mode');
    await triggerMode.click();
    await page.getByLabel('Manual').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.reload();
    const textWidget = await editorPage.getWidget(textId);
    // wait for first evaluation to finish
    await wait(300);
    await expect(textWidget).toHaveText(defaultText);
  },
);

test(
  '7. Should be able to delete a query',
  {
    tag: ['@editor', '@dataSources'],
  },
  async ({ editorPage, page }) => {
    const id = await editorPage.addNewJsQuery();
    await editorPage.deleteQuery(id!);
    await page.reload();
    const queryItem = editorPage.getQueryMenuItem(id!);
    await expect(queryItem).not.toBeVisible();
  },
);
