import { test } from '../../../fixtures';

test('1. It should be able to accept other widgets as children', async ({
  editorPage,
}) => {
  const containerId = await editorPage.dragAndDropNewWidget('Container');
  const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
  await editorPage.dragAndDropExistingWidget(buttonId, containerId);
});

test('2. It should be able to nest other containers', async ({
  editorPage,
}) => {
  const containerId = await editorPage.dragAndDropNewWidget('Container');
  const nestedContainerId = await editorPage.dragAndDropNewWidget(
    'Container',
    0,
    100,
  );
  await editorPage.dragAndDropExistingWidget(nestedContainerId, containerId);
});

test('3. nested containers should be able to accept other widgets as children', async ({
  editorPage,
}) => {
  const containerId = await editorPage.dragAndDropNewWidget('Container');
  const nestedContainerId = await editorPage.dragAndDropNewWidget(
    'Container',
    0,
    100,
  );
  await editorPage.dragAndDropExistingWidget(nestedContainerId, containerId);
  const buttonId = await editorPage.dragAndDropNewWidget('Button', 0, 100);
  await editorPage.dragAndDropExistingWidget(buttonId, nestedContainerId);
});

test('4. Layout: Fixed layout should not change the size of the viewport but change the size of the container', async ({
  editorPage,
}) => {});

test('5. Layout: Auto layout should change the size of the viewport to fit children', async ({
  editorPage,
}) => {});

test("6. Layout: Fixed layout should contain a scrollbar when the children exceed the container's viewpor", async ({
  editorPage,
}) => {});
