import { test, expect } from '@playwright/test'

for (const width of [390, 768, 1440]) {
  test(`alinha contador e rodape ao container em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const counts = page.locator('.section-shell__count')
    for (let index = 0; index < await counts.count(); index += 1) {
      const difference = await counts.nth(index).evaluate((count) => {
        const section = count.closest('.section-shell')
        const container = section?.querySelector('.container')
        if (!container) throw new Error('Container da secao nao encontrado')

        return Math.abs(
          count.getBoundingClientRect().right - container.getBoundingClientRect().right,
        )
      })

      expect(difference).toBeLessThanOrEqual(1)
    }

    const firstSectionContainer = page.locator('.section-shell').first().locator('.container')
    const referenceEdges = await firstSectionContainer.evaluate((container) => {
      const rect = container.getBoundingClientRect()
      return { left: rect.left, right: rect.right }
    })

    for (const selector of ['.site-footer__main', '.site-footer__bottom']) {
      const edges = await page.locator(selector).evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return { left: rect.left, right: rect.right }
      })

      expect(Math.abs(edges.left - referenceEdges.left)).toBeLessThanOrEqual(1)
      expect(Math.abs(edges.right - referenceEdges.right)).toBeLessThanOrEqual(1)
    }

    const contactLines = await page.locator('.site-footer__contact').innerText()
    const standaloneCountryLines = contactLines
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line === 'BR' || line === 'Brasil')
    expect(standaloneCountryLines).toEqual([])

    const addressLines = await page.locator('.site-footer__contact span').innerText()
    expect(addressLines.split('\n').at(-1)).toContain('SP')

    if (width === 1440) {
      const links = page.locator('.site-footer__links a')
      const firstBottom = await links.nth(0).evaluate((link) => link.getBoundingClientRect().bottom)
      const secondTop = await links.nth(1).evaluate((link) => link.getBoundingClientRect().top)
      expect(secondTop - firstBottom).toBeLessThanOrEqual(24)
    }
  })
}
