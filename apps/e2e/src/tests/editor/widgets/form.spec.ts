import { expect, test } from '../../../fixtures';

test('1. Should contain a submit button and a reset button', async ({
  editorPage,
}) => {
  const formId = await editorPage.dragAndDropNewWidget('Form');
  const formWidget = await editorPage.getWidget(formId);
  const submitButton = formWidget.getByRole('button', { name: 'Submit' });
  const resetButton = formWidget.getByRole('button', { name: 'Reset' });
  await expect(submitButton).toBeVisible();
  await expect(resetButton).toBeVisible();
});

test("2. Should hold the form's state", async ({ editorPage, page }) => {
  const formId = await editorPage.dragAndDropNewWidget('Form');
  const inputId = await editorPage.dragAndDropNewWidgetInto('Input', formId);
  const inputWidget = await editorPage.getWidget(inputId);
  const inputField = inputWidget.getByRole('textbox');
  const inputText = 'Hello World';
  await inputField.fill(inputText);
  const selectId = await editorPage.dragAndDropNewWidgetInto('Select', formId);
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];
  await editorPage.fillWidgetInput(
    selectId,
    'options',
    `{{${JSON.stringify(options)}}}`,
  );

  const textId = await editorPage.dragAndDropNewWidget('Text');
  const textWidget = await editorPage.getWidget(textId);
  await editorPage.fillWidgetInput(
    textId,
    'text',
    `{{${formId}.data.${inputId}.value}}`,
  );
  await expect(textWidget).toHaveText(inputText);
  const select = (await editorPage.getWidget(selectId)).getByRole('combobox');
  await select.click();
  const item = page.getByText('Option 2');
  await item.click();
  await editorPage.fillWidgetInput(
    textId,
    'text',
    `{{${formId}.data.${selectId}.value}}`,
  );
  await expect(textWidget).toHaveText(options[1]!.value);
});
