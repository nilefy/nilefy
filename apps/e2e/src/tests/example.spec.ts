import { expect, test } from '../fixtures';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nilefy/);
  await expect(
    page.getByText(
      'looks like you do not have any apps try creating one, happy hacking!',
    ),
  ).toBeVisible();
});
