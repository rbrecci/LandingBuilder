import { test, expect } from '@playwright/test'

test('vitrine 3D equilibrada em desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const section = page.locator('#produto-3d')
  await section.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)

  const layout = await section.evaluate((element) => {
    const container = element.querySelector('.container')
    const model = element.querySelector('.model-3d')
    const info = element.querySelector<HTMLElement>('.showcase3d__info')

    if (!container || !model || !info) return null

    const containerRect = container.getBoundingClientRect()
    const modelRect = model.getBoundingClientRect()
    const infoRect = info.getBoundingClientRect()

    return {
      containerWidth: containerRect.width,
      modelWidth: modelRect.width,
      modelHeight: modelRect.height,
      modelLeft: modelRect.left,
      modelCenterY: modelRect.top + modelRect.height / 2,
      infoRight: infoRect.right,
      infoCenterY: infoRect.top + infoRect.height / 2,
      infoText: info.innerText.trim(),
      containerLeft: containerRect.left,
      containerRight: containerRect.right,
    }
  })

  expect(layout).not.toBeNull()
  if (!layout) return

  expect(layout.modelWidth / layout.modelHeight).toBeGreaterThanOrEqual(1.55)
  expect(layout.modelWidth / layout.modelHeight).toBeLessThanOrEqual(1.65)
  expect(layout.modelWidth).toBeGreaterThanOrEqual(layout.containerWidth * 0.55)
  expect(layout.modelLeft - layout.containerLeft).toBeLessThanOrEqual(2)
  expect(layout.containerRight - layout.infoRight).toBeLessThanOrEqual(2)
  expect(layout.infoRight - layout.modelLeft).toBeGreaterThanOrEqual(layout.containerWidth * 0.95)
  expect(layout.infoText).not.toBe('')
  expect(Math.abs(layout.infoCenterY - layout.modelCenterY)).toBeLessThanOrEqual(40)
  await expect(section.locator('.section-shell__intro')).not.toContainText('Gire')
})

test('vitrine 3D cabe no mobile sem overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const section = page.locator('#produto-3d')
  await section.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)

  const dimensions = await section.evaluate((element) => {
    const container = element.querySelector('.container')
    const model = element.querySelector('.model-3d')

    if (!container || !model) return null

    return {
      containerWidth: container.getBoundingClientRect().width,
      modelWidth: model.getBoundingClientRect().width,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })

  expect(dimensions).not.toBeNull()
  if (!dimensions) return

  expect(dimensions.modelWidth).toBeGreaterThanOrEqual(dimensions.containerWidth * 0.95)
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  await expect(section.locator('.section-shell__intro')).not.toContainText('Gire')
})
