import { expect, test } from '@playwright/test'

const widths = [320, 360, 390, 768, 1024, 1280, 1920]
const hydrationMessage = /hydration|hydrate|server.rendered|did not match|text content does not match/i

for (const width of widths) {
  test(`sem overflow ou erro de hidratacao em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })

    const hydrationProblems: string[] = []
    page.on('console', (message) => {
      if (
        (message.type() === 'error' || message.type() === 'warning') &&
        hydrationMessage.test(message.text())
      ) {
        hydrationProblems.push(`${message.type()}: ${message.text()}`)
      }
    })

    await page.goto('/')

    const assertNoOverflow = async () => {
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
    }

    await assertNoOverflow()

    let reachedBottom = false
    for (let step = 0; step < 100; step += 1) {
      await page.evaluate(() => {
        window.scrollTo({ top: window.scrollY + window.innerHeight, behavior: 'instant' })
      })
      await page.waitForTimeout(50)
      await assertNoOverflow()

      reachedBottom = await page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight,
      )
      if (reachedBottom) break
    }

    expect(reachedBottom).toBe(true)
    expect(hydrationProblems).toEqual([])
  })
}
