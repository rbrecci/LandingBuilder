import { expect, test } from '@playwright/test'

const widths = [390, 1440]

for (const width of widths) {
  test(`badges mantem tamanho e contraste em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const badges = page.locator('.badge')
    const count = await badges.count()

    expect(count).toBeGreaterThan(0)

    for (let index = 0; index < count; index += 1) {
      const badge = badges.nth(index)
      await badge.scrollIntoViewIfNeeded()

      const measurements = await badge.evaluate((element) => {
        const section = element.closest('.section-shell')
        const style = getComputedStyle(element)

        return {
          width: element.getBoundingClientRect().width,
          background: style.backgroundColor,
          sectionBackground: section ? getComputedStyle(section).backgroundColor : null,
        }
      })

      expect(measurements.width).toBeLessThanOrEqual(220)
      expect(measurements.background).not.toBe('rgba(0, 0, 0, 0)')
      if (measurements.sectionBackground !== null) {
        expect(measurements.background).not.toBe(measurements.sectionBackground)
      }
    }
  })
}
