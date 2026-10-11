import { expect, test } from '@playwright/test'

test('reduced motion keeps the poster and parallax still after scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const layers = page.locator('.parallax')
  await expect(layers.first()).toBeAttached()
  await expect(page.locator('[data-parallax]')).toHaveCount(0)
  await expect(page.locator('.model-3d canvas')).toHaveCount(0)
  await expect(page.locator('.model-3d__poster').first()).toBeVisible()

  const before = await layers.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).translate),
  )
  await page.evaluate(() => window.scrollTo(0, 1000))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(1000)
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))

  const after = await layers.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).translate),
  )
  expect(after).toEqual(before)
  await expect(page.locator('.model-3d canvas')).toHaveCount(0)
})

test('normal motion changes parallax translate after scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')

  const layers = page.locator('[data-parallax]')
  await expect(layers.first()).toBeAttached()
  const before = await layers.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).translate),
  )
  await page.evaluate(() => window.scrollTo(0, 1000))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(1000)
  await expect.poll(async () => {
    const after = await layers.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).translate),
    )
    return after.some((value, index) => value !== before[index])
  }).toBe(true)
})
