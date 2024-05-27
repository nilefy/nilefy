import { expect, test } from '../../../fixtures';

test('1. Should be able to dynamically change the options of the select widget', async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  const selectOptionsBinding = `{{${JSON.stringify(selectOptions)}}}`;
  await editorPage.fillWidgetInput(selectId, 'options', selectOptionsBinding);

  const item1 = page.getByLabel(selectOptions[0]!.label);
  const item2 = page.getByLabel(selectOptions[1]!.label);
  await expect(item1).toBeVisible();
  await expect(item2).toBeVisible();
});

test('2. Should be able to select an option from the select widget', async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  const selectOptionsBinding = `{{${JSON.stringify(selectOptions)}}}`;
  await editorPage.fillWidgetInput(selectId, 'options', selectOptionsBinding);
  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');

  const item1 = page.getByLabel(selectOptions[0]!.label);
  await item1.click();
  await expect(comboBox).toHaveText(selectOptions[0]!.label);
});

test('3. Selected option value can be used in a binding', async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  const selectOptionsBinding = `{{${JSON.stringify(selectOptions)}}}`;
  await editorPage.fillWidgetInput(selectId, 'options', selectOptionsBinding);

  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');

  const item1 = page.getByLabel(selectOptions[0]!.label);
  await item1.click();
  await expect(comboBox).toHaveText(selectOptions[0]!.label);
  const textId = await editorPage.dragAndDropNewWidget('Text');
  await editorPage.fillWidgetInput(textId, 'text', `{{${selectId}.value}}`);
  const textWidget = await editorPage.getWidget(textId);
  await expect(textWidget).toHaveText(selectOptions[0]!.value);
});

test('4. selected option can be cleared through an action', async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');
  const defaultComboBoxText = await comboBox.textContent();
  const selectOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  const selectOptionsBinding = `{{${JSON.stringify(selectOptions)}}}`;
  await editorPage.fillWidgetInput(selectId, 'options', selectOptionsBinding);

  const item1 = page.getByLabel(selectOptions[0]!.label);
  await item1.click();
  await expect(comboBox).toHaveText(selectOptions[0]!.label);
  const buttonId = await editorPage.dragAndDropNewWidget('Button');
  await editorPage.fillWidgetInput(
    buttonId,
    'onClick',
    `{{${selectId}.clearValue()}}`,
  );
  const buttonWidget = await editorPage.getWidget(buttonId);
  await buttonWidget.click();
  await expect(comboBox).toHaveText(defaultComboBoxText!);
});

test("5. Should be able to set the 'disabled' property of the select widget", async ({
  editorPage,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');
  await expect(comboBox).not.toBeDisabled();
  const buttonId = await editorPage.dragAndDropNewWidget('Button');
  await editorPage.fillWidgetInput(
    buttonId,
    'onClick',
    `{{${selectId}.setDisabled(true)}}`,
  );
  const buttonWidget = await editorPage.getWidget(buttonId);
  await buttonWidget.click();
  await expect(comboBox).toBeDisabled();
  await editorPage.fillWidgetInput(
    buttonId,
    'onClick',
    `{{${selectId}.setDisabled(false)}}`,
  );
  await buttonWidget.click();
  await expect(comboBox).not.toBeDisabled();
});

test('6. Should be able to set the value of the select widget through an action', async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  const selectOptionsBinding = `{{${JSON.stringify(selectOptions)}}}`;
  await editorPage.fillWidgetInput(selectId, 'options', selectOptionsBinding);

  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');

  const item1 = page.getByLabel(selectOptions[0]!.label);
  await item1.click();
  await expect(comboBox).toHaveText(selectOptions[0]!.label);

  const buttonId = await editorPage.dragAndDropNewWidget('Button');
  await editorPage.fillWidgetInput(
    buttonId,
    'onClick',
    `{{${selectId}.setValue('${selectOptions[1]!.value}')}}`,
  );
  const buttonWidget = await editorPage.getWidget(buttonId);
  await buttonWidget.click();
  await expect(comboBox).toHaveText(selectOptions[1]!.label);
});

test("7. Should be able to set widget's options through an action", async ({
  editorPage,
  page,
}) => {
  const selectId = await editorPage.dragAndDropNewWidget('Select');
  const selectWidget = await editorPage.getWidget(selectId);
  const comboBox = selectWidget.getByRole('combobox');
  const buttonId = await editorPage.dragAndDropNewWidget('Button');
  const newOptions = [
    { label: 'very specific piece of text 1', value: 'test1' },
    { label: 'very specific piece of text 2', value: 'test2' },
  ];
  await editorPage.fillWidgetInput(
    buttonId,
    'onClick',
    `{{${selectId}.setOptions(${JSON.stringify(newOptions)})}}`,
  );
  const buttonWidget = await editorPage.getWidget(buttonId);
  await buttonWidget.click();
  await comboBox.click();
  await expect(page.getByLabel(newOptions[0]!.label)).toBeVisible();
  await expect(page.getByLabel(newOptions[1]!.label)).toBeVisible();
});
