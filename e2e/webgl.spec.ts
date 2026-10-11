import { expect, test } from '@playwright/test'

test('poster remains visible when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId, ...options) {
      if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
        return null
      }
      return originalGetContext.call(this, contextId, ...options)
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/')

  await expect(page.locator('.model-3d').first()).toBeVisible()
  await expect(page.locator('.model-3d__poster').first()).toBeVisible()
  await expect(page.locator('.model-3d canvas')).toHaveCount(0)
  await expect(page.locator('body')).toBeVisible()
})

test('SwiftShader renders a canvas without gstatic requests', async ({ page }) => {
  const gstaticRequests: string[] = []
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname
    if (host === 'gstatic.com' || host.endsWith('.gstatic.com')) {
      gstaticRequests.push(request.url())
    }
  })

  await page.goto('/')
  await page.locator('.model-3d').first().scrollIntoViewIfNeeded()
  await expect(page.locator('.model-3d canvas').first()).toBeVisible({ timeout: 15_000 })
  expect(gstaticRequests).toEqual([])
})
