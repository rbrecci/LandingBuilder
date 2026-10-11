import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [360, 1280]) {
  test(`sem violacoes graves de acessibilidade em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const reveals = page.locator('[data-reveal]')
    await expect.poll(() =>
      reveals.evaluateAll((elements) =>
        elements.length > 0 && elements.every((element) => getComputedStyle(element).opacity === '1'),
      ),
    ).toBe(true)

    const results = await new AxeBuilder({ page }).analyze()
    const seriousViolations = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )

    expect(seriousViolations).toEqual([])
  })
}
