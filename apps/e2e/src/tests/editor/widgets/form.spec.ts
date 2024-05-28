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

test('3. Should be able to reset the form', async ({ editorPage }) => {
  const formId = await editorPage.dragAndDropNewWidget('Form');
  const form = await editorPage.getWidget(formId);
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
  const select = (await editorPage.getWidget(selectId)).getByRole('combobox');
  const defaultComboBoxText = await select.textContent();
  await editorPage.rightSidebar.insertButton.click();
  await select.click();
  const item = editorPage.page.getByText('Option 2');
  await item.click();
  const resetButton = form.getByRole('button', { name: 'Reset' });
  await resetButton.click();
  await expect(inputField).toHaveText('');
  await expect(select).toHaveText(defaultComboBoxText!);
});

test('4. Should be able to submit the form and do something with the data', async ({
  editorPage,
}) => {
  const formId = await editorPage.dragAndDropNewWidget('Form', -100, -100);
  const form = await editorPage.getWidget(formId);
  const textId1 = await editorPage.dragAndDropNewWidget('Text', 200, 200);
  const textId2 = await editorPage.dragAndDropNewWidget('Text', 200, 200);

  const inputId = await editorPage.dragAndDropNewWidgetInto(
    'Input',
    formId,
    100,
    100,
  );
  const inputWidget = await editorPage.getWidget(inputId);
  const inputField = inputWidget.getByRole('textbox');
  const inputText = 'Hello World';
  await inputField.fill(inputText);
  const selectId = await editorPage.dragAndDropNewWidgetInto(
    'Select',
    formId,
    100,
    100,
  );
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];
  await editorPage.fillWidgetInput(
    selectId,
    'options',
    `{{${JSON.stringify(options)}}}`,
  );

  await editorPage.fillWidgetInput(
    formId,
    'onSubmit',
    `{{${textId1}.setText(${formId}.data.${inputId}.value);${textId2}.setText(${formId}.data.${selectId}.value);}}`,
  );
  const select = (await editorPage.getWidget(selectId)).getByRole('combobox');
  await select.click();
  const item = editorPage.page.getByText('Option 2');
  await item.click();
  const submitButton = form.getByRole('button', { name: 'Submit' });
  await submitButton.click();
  const textWidget1 = await editorPage.getWidget(textId1);
  const textWidget2 = await editorPage.getWidget(textId2);
  await expect(textWidget1).toHaveText(inputText);
  await expect(textWidget2).toHaveText(options[1]!.value);
});
