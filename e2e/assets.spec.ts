import { expect, test } from '@playwright/test'

test('imagens, modelo 3D e favicon carregam', async ({ page }) => {
  const errorResponses: string[] = []

  page.on('response', (response) => {
    if (response.status() >= 400) errorResponses.push(response.url())
  })

  await page.goto(process.env.VITE_BASE_PATH ?? '/', { waitUntil: 'networkidle' })

  let reachedBottom = false
  while (!reachedBottom) {
    await page.evaluate(() => {
      window.scrollTo({ top: window.scrollY + 600, behavior: 'instant' })
    })
    await page.waitForTimeout(150)
    reachedBottom = await page.evaluate(
      () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight,
    )
  }

  await page.locator('#produto-3d .model-3d').scrollIntoViewIfNeeded()
  await page.waitForTimeout(2000)

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images
      .filter((image) => (image as HTMLImageElement).naturalWidth === 0)
      .map((image) => (image as HTMLImageElement).src),
  )
  expect(brokenImages, `Imagens sem carregar: ${brokenImages.join(', ')}`).toEqual([])

  const origin = new URL(page.url()).origin
  const sameOriginErrors = errorResponses.filter((url) => new URL(url).origin === origin)
  expect(sameOriginErrors, `Respostas com erro: ${sameOriginErrors.join(', ')}`).toEqual([])

  const faviconHref = await page.locator('link[rel="icon"]').getAttribute('href')
  expect(faviconHref).toBeTruthy()
  const faviconResponse = await page.request.get(new URL(faviconHref!, page.url()).href)
  expect(faviconResponse.status()).toBe(200)
})
