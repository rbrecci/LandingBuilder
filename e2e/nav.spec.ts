import { test, expect } from '@playwright/test'

test('mantém ativo o item da seção alinhada à linha de referência', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const navLinks = page.locator('nav[aria-label="Navegação principal"] a')
  const count = await navLinks.count()

  for (let index = 0; index < count; index += 1) {
    const link = navLinks.nth(index)
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^#/)
    const id = href!.slice(1)

    await page.evaluate((sectionId) => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' })
    }, id)
    // a rolagem suave termina em cerca de 1 s; com menos espera o defeito antigo passava despercebido
    await page.waitForTimeout(1200)

    const activeLinks = page.locator('nav[aria-label="Navegação principal"] a[aria-current="location"]')
    await expect(activeLinks).toHaveCount(1)
    await expect(activeLinks).toHaveAttribute('href', href!)
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(400)

  const activeLinks = page.locator('nav[aria-label="Navegação principal"] a[aria-current="location"]')
  await expect(activeLinks).toHaveCount(1)
  await expect(activeLinks).toHaveText('Contato')
})
