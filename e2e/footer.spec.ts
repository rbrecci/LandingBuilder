import { expect, test } from '@playwright/test'

test.use({ javaScriptEnabled: false })

test('o credito do rodape esta no HTML sem JavaScript', async ({ page }) => {
  await page.goto('/')

  const credit = page.locator('a[href="https://github.com/rbrecci"]', {
    hasText: 'RBrecci',
  })

  await expect(credit).toHaveCount(1)
  await expect(credit).toBeVisible()
})
