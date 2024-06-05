import { expect, test } from '../../../fixtures';

test('1. Should be able to use markdown in text widget', async ({
  page,
  editorPage,
}) => {
  const id = await editorPage.dragAndDropNewWidget('Text');
  await editorPage.fillWidgetInput(id, 'text', '# Hello World');
  const heading = page.getByRole('heading', { name: 'Hello World' });
  await expect(heading).toBeVisible();
  await editorPage.fillWidgetInput(
    id,
    'text',
    '![Dog](https://picsum.photos/id/1025/350/275)',
  );
  const image = page.getByAltText('Dog');
  await expect(image).toBeVisible();
});

test('2. Should be able to use HTML in text widget', async ({
  page,
  editorPage,
}) => {
  const id = await editorPage.dragAndDropNewWidget('Text');
  await editorPage.fillWidgetInput(
    id,
    'text',
    '<h1>Hello World</h1><p>Some paragraph</p><img src="https://picsum.photos/id/1025/350/275" alt="dog" />',
  );
  await editorPage.unselectAll();
  const heading = page.getByRole('heading', { name: 'Hello World' });
  await expect(heading).toBeVisible();
  const paragraph = page.getByText('Some paragraph');
  await expect(paragraph).toBeVisible();
  const image = page.getByAltText('dog');
  await expect(image).toBeVisible();
});
