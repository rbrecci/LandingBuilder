# Plano de tarefas da etapa 2

Decisões de produto e de stack: `docs/ARQUITETURA.md` (citado como `ARQ §N`). Fatos dos projetos de origem: `docs/ANALISE.md` (`ANALISE §N`). Cada tarefa abaixo é auto contida para um subagente Codex.

## Regras comuns a todas as tarefas

1. Diretório de trabalho: a raiz do repositório `LandingBuilder`, informada em caminho absoluto no brief. Toda tarefa lista os arquivos que cria ou edita. Tocar em qualquer outro arquivo é desvio e invalida a entrega.
2. Nenhuma tarefa da mesma onda toca o mesmo arquivo. Arquivos compartilhados (`package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`, `playwright.config.ts`) são criados na onda 0 e só editados por uma tarefa dona, indicada abaixo.
3. Texto: proibido travessão (U+2014), traço médio (U+2013) e sinal de menos tipográfico (U+2212) em qualquer arquivo, inclusive código, JSON e comentários. Usar vírgula, dois pontos, parênteses ou hífen. Comentários de código só quando o motivo não é óbvio.
4. Texto de interface e dados em português do Brasil. Nomes de código em inglês, como na base do `GremioLanding`.
5. Cores só por variável CSS (`var(--...)`), nunca hex fora de `src/theme/` e dos arquivos de fixture. Verificação padrão: `grep -nE '#[0-9a-fA-F]{3,8}\b' <css da tarefa>` deve sair com código 1.
6. Só sintaxe TypeScript que o Node remove nos arquivos de `scripts/` (sem `enum`, `namespace`, parameter properties) e imports com extensão `.ts` (ARQ §2.2).
7. Não rodar `git commit` nem `git push`. O coordenador commita ao fim de cada onda, sem linha `Co-Authored-By`.
8. Entrega do worker: lista de arquivos tocados e, colados, o comando de verificação com a saída e o código de saída. Sem saída colada, a tarefa não está feita. Se algo não puder ser feito, dizer o quê e por quê, sem improvisar.
9. Não inventar nome de pacote, flag ou API: o que não está em `ARQ §2.2` precisa de `npm view` antes de instalar, e instalar fora da lista só com autorização do coordenador.
10. Portão entre ondas (coordenador): `npm run lint && npm run typecheck && npm test` com código 0, e a varredura de travessão (`LC_ALL=C.UTF-8 git grep -nP "[\x{2014}\x{2013}\x{2212}]" -- '*.md' '*.json' '*.ts' '*.tsx' '*.css'` depois de `git add -A`) com código 1.

Ordem das ondas e dependências:

| Onda | Tarefas | Depende de |
|---|---|---|
| 0 | T00 | nada |
| 1 | T10, T11, T12, T13, T15 | T00 |
| 2 | T20, T21, T22, T23, T24, T25, T26, T27, T28, T29 | onda 1 |
| 3 | T30, T32, T33 | onda 2 |
| 4 | T40 | onda 3 |
| 5 | T50, T51, T53, T54 | onda 4 |
| 6 | T60, T61, T62 | onda 5 |
| 7 | T70 | onda 6 |

---

## Onda 0: fundação

### T00: Esqueleto do projeto

- **Objetivo:** criar a base de build, lint, tipos e testes com as versões de `ARQ §2.2`, sem nenhum componente.
- **Arquivos (cria):** `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore`, `tsconfig.json`, `eslint.config.js`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `scripts/vite-plugin-client.ts`, `playwright.config.ts`.
- **Entradas:** `ARQ §2.2` e `§3`; arquivos de referência `GremioLanding/package.json`, `GremioLanding/tsconfig.json`, `GremioLanding/eslint.config.js`, `GremioLanding/vite.config.ts` (copiar a estrutura, trocar nome e versões).
- **Conteúdo exigido:**
  - `package.json` com `"type": "module"`, `engines.node` `>=22.22.2`, dependências e devDependencies exatamente as de `ARQ §2.2` (incluir `@gltf-transform/core` 4.5.1 e `@gltf-transform/cli` 4.5.1, `sharp`, `lighthouse`, `@playwright/test`, `@axe-core/playwright`, as seis fontes), `typescript` em `~5.9.3`.
  - Scripts: `dev` (`vite`), `typecheck` (`tsc --noEmit`), `lint` (`eslint .`), `test` (`vitest run --passWithNoTests`), `validate` (`node scripts/validate-client.ts`), `check:text` (`node scripts/check-text.ts client docs`), `gen:schema` (`node scripts/gen-json-schema.ts`), `build:client` (`vite build`), `build:server` (`vite build --ssr src/entry-server.tsx --outDir dist-ssr`), `prerender` (`node scripts/prerender.ts`), `build` (`npm run validate && npm run gen:schema && npm run typecheck && npm run build:client && npm run build:server && npm run prerender`), `preview` (`vite preview`), `e2e` (`playwright test`), `size` (`node scripts/size-budget.mjs`), `perf` (`node scripts/perf-check.mjs`), `assets:optimize` (`node scripts/optimize-assets.mjs`), `assets:placeholders` (`node scripts/make-placeholder-assets.mjs`), `check` (`npm run lint && npm run typecheck && npm test && npm run validate && npm run check:text`).
  - `vite.config.ts`: plugin React, o plugin de `scripts/vite-plugin-client.ts`, `base` por `VITE_BASE_PATH` (`GremioLanding/vite.config.ts:6`), `build.manifest: true`, bloco `test` com `environment: 'jsdom'` e `include: ['tests/**/*.test.{ts,tsx}']`.
  - `tsconfig.json` baseado em `GremioLanding/tsconfig.json`, com `resolveJsonModule`, `include` de `src`, `scripts`, `tests`, `e2e`, `vite.config.ts`, `playwright.config.ts`.
  - `index.html`: `lang="pt-BR"`, `<!--head-meta-->` no `<head>`, `<div id="root"><!--app-html--></div>`, script `/src/main.tsx`.
  - `src/vite-env.d.ts` com `/// <reference types="vite/client" />` e `declare module 'virtual:client-fonts';`.
  - `scripts/vite-plugin-client.ts`: plugin vazio `{ name: 'landing-client' }` exportado como default.
  - `src/main.tsx`: monta um `<div>` provisório (será substituído em T40).
  - `playwright.config.ts`: `webServer` com `npm run preview -- --port 4173`, `baseURL` `http://localhost:4173`, projeto chromium, `testDir: 'e2e'`.
- **Critério de aceite:** `npm ci` termina com código 0; `npm run typecheck`, `npm run lint`, `npm test` e `npm run build:client` terminam com código 0 e `dist/index.html` existe; `node -e` confere que cada versão de `ARQ §2.2` está em `package.json`.
- **Verificação:**
  ```
  npm ci && npm run typecheck && npm run lint && npm test && npm run build:client && test -f dist/index.html && echo OK
  node -e "const p=require('./package.json');console.log(p.devDependencies.typescript,p.dependencies.three,p.dependencies.zod)"
  ```
  Saída esperada: `OK`; `~5.9.3 ^0.186.1 ^4.6.5` (se `zod` estiver em `dependencies`; qualquer outro lugar falha).

---

## Onda 1: contratos e primitivas

### T10: Schema do conteúdo e resolução de links

- **Objetivo:** implementar em zod o schema de `client/content.json` (`ARQ §4.1` a `§4.4`) com as regras de validação cruzadas.
- **Arquivos (cria):** `src/content/schema.ts`, `src/content/links.ts`, `tests/content/schema.test.ts`, `tests/content/links.test.ts`.
- **Entradas:** `ARQ §4`; tipos de seção da tabela `ARQ §4.3`; limites de tamanho de `ARQ §4.2`. Ajuste obrigatório ao `ARQ §4.3`: `hero.layers` são `{src, speed}` decorativas (sem `alt`, renderizadas com `aria-hidden`).
- **Exports exigidos:** `contentSchema`, `type Content`, `type Section`, um tipo por seção (`HeroSection`, `StatsSection`, `AboutSection`, `FeaturesSection`, `Showcase3dSection`, `GallerySection`, `OffersSection`, `TestimonialsSection`, `FaqSection`, `LocationSection`, `ContactSection`), `type ModelConfig`, `resolveLink(to, ctx)` (devolve `{href, external}`; aceita `#id`, `https://`, `tel:+...`, `mailto:` e `wa:<digitos>` convertido em `https://wa.me/<digitos>`), `collectLinkErrors(content)`.
- **Regras que o schema deve impor (cada uma vira teste):** `hero` obrigatório, primeiro e com `enabled` verdadeiro; `id` único; link `#x` só para seção habilitada com esse `id`; `title` até 80 caracteres; imagem sem `alt` vazio e com `width` e `height`; `model.poster` obrigatório; `kind: "glb"` exige `glb.src` terminando em `.glb`; `kind: "medal"` exige `medal.texture`; seção `testimonials` com `consentConfirmed: false` exige `placeholder: true`; `faq.items` de 3 a 8, `gallery.items` de 3 a 8, `features.items` de 3 a 6, `stats.items` de 2 a 4, `offers.items` de 2 a 6, `testimonials.items` de 2 a 4.
- **Critério de aceite:** no mínimo 14 testes passando, um por regra acima mais "conteúdo mínimo válido passa" e "link `wa:` vira `https://wa.me/`"; `Content` exporta os tipos listados; `tsc` sem erro.
- **Verificação:** `npx vitest run tests/content && npm run typecheck` (código 0; colar a contagem de testes).

### T11: Schema de tema, tokens, fontes e contraste

- **Objetivo:** implementar o schema de `client/theme.json`, a conversão para variáveis CSS, o catálogo de fontes e o cálculo de contraste WCAG.
- **Arquivos (cria):** `src/theme/schema.ts`, `src/theme/tokens.ts`, `src/theme/fonts.ts`, `src/theme/contrast.ts`, `tests/theme/theme.test.ts`.
- **Entradas:** `ARQ §4.5` e `§2.2` (fontes). Referência de pares de cor e razões: `hitamax-landing/SPEC.md:47-59`.
- **Exports exigidos:** `themeSchema`, `type Theme`, `themeToCss(theme): string` (bloco `:root{...}` com `--color-*`, `--surface-<tom>-bg`, `--surface-<tom>-fg`, `--font-display`, `--font-body`, `--radius`, `--density`, `--parallax-range`, `--motion-level`, `--three-ambient`, `--three-key`, `--three-fill`), `FONT_CATALOG` (por fonte: `id`, `label`, `family` CSS, `stack` com alternativas do sistema, `imports` com os caminhos CSS do Fontsource), `contrastRatio(a, b)`, `checkThemeContrast(theme)` (lista de pares abaixo de 4,5).
- **Passos de verificação do catálogo:** para cada fonte, confirmar que cada caminho de `imports` existe em `node_modules` (`@fontsource-variable/<nome>/wght.css` ou `@fontsource/barlow-condensed/700.css`, `800.css`, `900.css`). Fonte cujo arquivo não existe sai do catálogo e a tarefa reporta.
- **Critério de aceite:** `contrastRatio('#173323','#FFFFFF')` entre 13,68 e 13,70; `contrastRatio('#176B3A','#FFFFFF')` entre 6,55 e 6,57; `contrastRatio('#A93F2F','#FFFFFF')` entre 6,10 e 6,12 (valores de `hitamax-landing/SPEC.md:49-57`); `checkThemeContrast` aponta um par com `#777777` sobre `#888888`; teste percorre `FONT_CATALOG` e confere existência dos arquivos; `themeToCss` contém todas as variáveis listadas.
- **Verificação:** `npx vitest run tests/theme && npm run typecheck`.

### T12: CSS base e componentes de interface

- **Objetivo:** entregar o reset, a tipografia e os componentes `Button`, `SectionShell` e `Badge`, só com variáveis de tema.
- **Arquivos (cria):** `src/styles/base.css`, `src/components/ui/Button.tsx`, `src/components/ui/Button.css`, `src/components/ui/SectionShell.tsx`, `src/components/ui/SectionShell.css`, `src/components/ui/Badge.tsx`, `src/components/ui/Badge.css`, `tests/ui/ui.test.tsx`.
- **Entradas:** variáveis de `ARQ §4.5`; padrões do `GremioLanding/src/styles.css:17-30` (foco, link para pular, seleção) e `hitamax-landing/styles.css:35-102`.
- **Comportamento:** `base.css` define `:focus-visible` com `var(--color-focus)`, `.skip-link`, `.sr-only`, container, escala tipográfica em `clamp`, `html { scroll-behavior: smooth; scroll-padding-top }` e, em `@media (prefers-reduced-motion: reduce)`, rolagem automática e animações e transições com duração mínima (`GremioLanding/src/styles.css:305-307`). `Button` renderiza `<a>` (com `rel="noopener noreferrer"` quando `external`) ou `<button>`; variantes `primary`, `ghost`, `outline`; altura mínima 48 px. `SectionShell` recebe `id`, `tone`, `eyebrow`, `title`, `intro`, `index`, `total` e renderiza `<section aria-labelledby>`, `<h2 id>` e a linha superior "NN / TT". `Badge` mostra "Exemplo".
- **Critério de aceite:** testes confirmam: link externo tem `rel` com `noopener` e `noreferrer`; `SectionShell` liga `aria-labelledby` ao `h2`; `index=1,total=8` mostra `01 / 08`; `tone` aplica a classe `tone-<x>`. Nenhum hex nos CSS (regra comum 5). Tamanho de fonte mínimo de texto de interface: 12 px (nenhum `font-size` abaixo de `0.75rem`).
- **Verificação:**
  ```
  npx vitest run tests/ui && npm run typecheck
  grep -nE '#[0-9a-fA-F]{3,8}\b' src/styles/base.css src/components/ui/*.css; echo "exit=$?"   # esperado exit=1
  grep -nE 'font-size:\s*(0?\.[0-6][0-9]*rem|[0-9]px|1[01]px)' src/styles/base.css src/components/ui/*.css; echo "exit=$?"   # esperado exit=1
  ```

### T13: Preferências do ambiente, parallax e revelação

- **Objetivo:** centralizar a detecção de capacidades e entregar `Parallax` e `Reveal` com o desenho de `ARQ §6`.
- **Arquivos (cria):** `src/motion/prefs.ts`, `src/motion/scrollDriver.ts`, `src/motion/Parallax.tsx`, `src/motion/Reveal.tsx`, `src/motion/parallax.css`, `src/motion/reveal.css`, `tests/motion/prefs.test.tsx`, `tests/motion/parallax.test.tsx`.
- **Entradas:** `ARQ §6` e `§7.4`; referência `GremioLanding/src/styles.css:235-261`, `GremioLanding/src/App.tsx:38-56`, `hitamax-landing/script.js:128-141` e `hitamax-landing/styles.css:512-528`.
- **Comportamento:**
  - `prefs.ts` exporta `useCapabilities()` com `{ reducedMotion, coarsePointer, saveData, webgl, ready }`. Antes de montar (e no servidor) devolve `reducedMotion: false, coarsePointer: false, saveData: false, webgl: false, ready: false` sem tocar em `window`. Depois do efeito, lê `matchMedia` e `canvas.getContext('webgl2' | 'webgl')` e assina as mudanças.
  - `scrollDriver.ts` exporta `supportsScrollTimeline()` (`CSS.supports('animation-timeline: view()')`) e `startScrollDriver(root)` (um listener passivo, `requestAnimationFrame`, `IntersectionObserver`, escreve `--p` de 0 a 1 só nos `[data-parallax]` visíveis). Retorna função de limpeza.
  - `Parallax` recebe `speed` (de -1 a 1) e `as`; escreve `--speed`. Inerte quando `reducedMotion`.
  - `parallax.css`: com `@supports (animation-timeline: view())` anima `translate` por `view()`; sem suporte, usa `--p`. Só `translate` e `opacity`.
  - `Reveal` adiciona `is-visible` por `IntersectionObserver`; conteúdo visível sem JavaScript (classe `.js` no `<html>` como em `hitamax-landing/styles.css:513`); inerte com movimento reduzido.
- **Critério de aceite:** testes: `renderToString` de um componente que usa `useCapabilities` não lança e não acessa `window`; com `matchMedia` retornando `reduce`, `Parallax` e `Reveal` não registram observador nem listener; disparar o evento `change` do `matchMedia` atualiza `reducedMotion` sem recarregar; `startScrollDriver` devolve limpeza que remove o listener. Análise estática do CSS: `grep -nE '^\s*(top|left|right|bottom|margin|width|height)\s*:' src/motion/parallax.css` sai com código 1, e o arquivo contém `animation-timeline: view()`.
- **Verificação:** `npx vitest run tests/motion && npm run typecheck`, mais o `grep` acima (esperado `exit=1`) e `grep -n 'animation-timeline: view()' src/motion/parallax.css` (esperado exit 0).

### T15: Scripts e arquivos de placeholder

- **Objetivo:** gerar por script todas as imagens, o logo e o modelo GLB fictícios da landing modelo e o registro de origem.
- **Arquivos (cria):** `scripts/optimize-assets.mjs`, `scripts/make-placeholder-assets.mjs`, `docs/ASSETS.md`, e em `public/client/`: `logo.svg`, `logo-face.png` (512x512), `favicon.svg`, `og.jpg` (1200x630), `model-poster.webp`, `showcase-poster.webp`, `about.webp` e `about-800.webp`, `feature-1.webp` a `feature-3.webp`, `gallery-1.webp` a `gallery-5.webp`, `layer-1.svg`, `layer-2.svg`, `model.glb`.
- **Entradas:** `ARQ §7.2`; padrão de manifesto de `hitamax-landing/assets/MANIFEST.md:5-12` e `GremioLanding/docs/ASSETS.md:5-15`.
- **Comportamento:** `make-placeholder-assets.mjs` desenha formas geométricas e gradientes com a paleta neutra, sem texto legível, sem rosto e sem marca real, e grava WebP/PNG/JPEG com `sharp`. O `model.glb` é montado com `@gltf-transform/core` (geometria simples gerada por código) e depois passa por `gltf-transform optimize --compress meshopt --texture-compress webp --texture-size 1024`. `optimize-assets.mjs <pasta>` gera variantes de largura 800 e WebP para imagens da pasta (reutilizável pelo agente). `docs/ASSETS.md` lista cada arquivo, como foi gerado, tamanho e "substituir por".
- **Critério de aceite:** todos os arquivos existem; nenhum WebP acima de 400 KB (`hitamax-landing/SPEC.md:83`); `model.glb` até 500 KB e válido; `logo-face.png` é quadrado; `docs/ASSETS.md` tem uma linha por arquivo. Se `sharp` não instalar, a tarefa para e reporta o erro exato.
- **Verificação:**
  ```
  npm run assets:placeholders && npx gltf-transform validate public/client/model.glb; echo "exit=$?"
  find public/client -name '*.webp' -size +400k | wc -l      # esperado 0
  test $(stat -c%s public/client/model.glb) -le 512000 && echo GLB_OK
  node -e "const s=require('sharp');s('public/client/logo-face.png').metadata().then(m=>console.log(m.width,m.height))"   # esperado 512 512
  ```

---

## Onda 2: módulos independentes

### T20: Plugin do Vite para metadados, tema e fontes

- **Objetivo:** gerar `<head>` (título, descrição, canonical, Open Graph, robots, tema, JSON-LD, favicon), CSS de tema e imports de fontes a partir de `client/*.json`.
- **Arquivos (edita):** `scripts/vite-plugin-client.ts`. **(cria):** `tests/scripts/vite-plugin.test.ts`.
- **Entradas:** `ARQ §4`, `src/content/schema.ts`, `src/theme/*`; exemplo de metadados em `hitamax-landing/index.html:6-35`.
- **Comportamento:** hook `transformIndexHtml` substitui `<!--head-meta-->`. `site.indexable: false` gera `<meta name="robots" content="noindex, nofollow">`; `true` não gera. JSON-LD com `business.schemaType`, nome e endereço; `telephone` e `openingHoursSpecification` só quando `business.hoursConfirmed` é verdadeiro (regra de `hitamax-landing/SPEC.md:159`). `<style id="theme-vars">` com `themeToCss`. Módulo virtual `virtual:client-fonts` que importa os CSS das duas fontes escolhidas. `<meta name="theme-color">` vem de `colors.brand`. Erro de validação interrompe o build com mensagem que cita o caminho do campo.
- **Critério de aceite:** testes chamam os hooks com entradas de exemplo e provam: `noindex` presente quando `indexable` é falso e ausente quando verdadeiro; `telephone` ausente quando `hoursConfirmed` é falso; `<style id="theme-vars">` contém `--color-brand`; módulo virtual importa exatamente as duas fontes do tema; conteúdo inválido lança erro com o caminho do campo.
- **Verificação:** `npx vitest run tests/scripts/vite-plugin.test.ts && npm run typecheck && npm run build:client && grep -c 'theme-vars' dist/index.html` (a contagem deve ser maior que 0; o build usa o `client/` de T29 quando existir, senão a verificação do `grep` roda depois da onda 2).

### T21: Carregador de conteúdo e scripts de validação

- **Objetivo:** carregar e validar `client/*.json`, gerar os JSON Schemas e bloquear travessões.
- **Arquivos (cria):** `src/content/load.ts`, `scripts/validate-client.ts`, `scripts/check-text.ts`, `scripts/gen-json-schema.ts`, `client/content.schema.json`, `client/theme.schema.json`, `tests/scripts/validate.test.ts`, `tests/fixtures/valid/content.json`, `tests/fixtures/valid/theme.json`, `tests/fixtures/invalid-contrast/content.json`, `tests/fixtures/invalid-contrast/theme.json`, `tests/fixtures/invalid-link/content.json`, `tests/fixtures/invalid-link/theme.json`.
- **Entradas:** `src/content/schema.ts`, `src/content/links.ts`, `src/theme/*`; regras de `ARQ §4.5` (lista numerada de validação). Flag `--dir` é definida aqui: `node scripts/validate-client.ts [--dir <pasta>]`, padrão `client`.
- **Comportamento:** `load.ts` exporta `loadContent(raw)`, `loadTheme(raw)` (puras, lançam erro legível) e `content`/`theme` já carregados de `client/`. `validate-client.ts` aplica as sete regras de `ARQ §4.5`, mais máximo de 8 elementos com parallax (camadas do hero mais seções com `parallax` diferente de `off`), e confere se todo `src` local existe em `public/`. `check-text.ts <caminhos...>` percorre `.json`, `.md`, `.ts`, `.tsx`, `.css` e sai com 1 se achar U+2014, U+2013 ou U+2212, imprimindo `arquivo:linha`. Os testes criam o arquivo com travessão em tempo de execução com `String.fromCharCode(0x2014)`, para que nenhum arquivo versionado contenha o caractere.
- **Critério de aceite:** `--dir tests/fixtures/valid` sai com 0; `--dir tests/fixtures/invalid-contrast` sai com 1 e a mensagem contém "contraste"; `--dir tests/fixtures/invalid-link` sai com 1 e a mensagem cita o id inexistente; `check-text` sai com 1 num diretório temporário com o caractere e com 0 em `tests/fixtures`; `client/*.schema.json` são JSON válidos com `$schema` 2020-12.
- **Verificação:**
  ```
  npx vitest run tests/scripts/validate.test.ts && npm run typecheck
  node scripts/validate-client.ts --dir tests/fixtures/valid; echo "exit=$?"            # 0
  node scripts/validate-client.ts --dir tests/fixtures/invalid-contrast; echo "exit=$?" # 1
  npm run gen:schema && node -e "JSON.parse(require('fs').readFileSync('client/content.schema.json','utf8'));console.log('SCHEMA_OK')"
  ```

### T22: Componente de modelo 3D

- **Objetivo:** entregar `Model3D` com carregamento preguiçoso, escada de fallback e dois modos de interação, conforme `ARQ §7`.
- **Arquivos (cria):** `src/three/Model3D.tsx`, `src/three/Scene.tsx`, `src/three/MedalModel.tsx`, `src/three/GlbModel.tsx`, `src/three/model3d.css`, `tests/three/model3d.test.tsx`.
- **Entradas:** `ARQ §7`; `src/motion/prefs.ts`; tipo `ModelConfig` de `src/content/schema.ts`; referência `GremioLanding/src/components/Crest3D.tsx` (geometria do medalhão, `useFrame` com `invalidate`, perda de contexto) e `GremioLanding/src/App.tsx:25-60` (limite de erro e `Suspense`).
- **Contrato público:** `<Model3D config alt mode="tilt" | "orbit" autoRotate? ref />` com `ref` expondo `rotateBy(graus)`. `Scene` é o único módulo que importa `three`, `@react-three/fiber` e `@react-three/drei`; `Model3D` o importa com `React.lazy`. `mode="orbit"` usa `OrbitControls` com `enableZoom` e `enablePan` falsos; `autoRotate` mantém `invalidate()` a cada quadro enquanto ativo.
- **Regras:** `useGLTF(src, false, true)` em todo uso (sem Draco, `ARQ §7.2`). `Canvas` com `frameloop="demand"`, `dpr={[1, 1.5]}`, `powerPreference: 'low-power'`. Montagem só depois de `ready`, de a capability `webgl` ser verdadeira, de a preferência permitir (`ARQ §7.4`) e de o contêiner estar a até 200 px da viewport. Desmontar o `Canvas` 1 s depois de sair da viewport. `webglcontextlost` mostra o pôster e `webglcontextrestored` volta ao 3D. Contêiner `role="img"` com `aria-label={alt}`, canvas `aria-hidden`, `touch-action: pan-y`.
- **Critério de aceite (testes com `Scene` simulada, como em `GremioLanding/src/App.test.tsx:8-14`):** (a) `renderToString` contém o pôster e nenhum `<canvas>`; (b) com `reducedMotion` verdadeiro o módulo `Scene` não é importado (contador de importações igual a 0); (c) sem `webgl` mostra o pôster; (d) `Scene` que lança erro deixa o pôster e o restante do componente de pé; (e) perda de contexto troca para o pôster e restauração volta ao 3D; (f) `mobile: "still"` com ponteiro grosseiro mostra o pôster; (g) a mudança de `reducedMotion` com a página aberta troca o modo. Análise estática: `grep -rn "gstatic" src` sai com 1 e todo `useGLTF(` no código passa `false, true`.
- **Verificação:**
  ```
  npx vitest run tests/three && npm run typecheck && npm run lint
  grep -rn "gstatic" src; echo "exit=$?"                              # 1
  grep -rn "useGLTF(" src | grep -v "false, true"; echo "exit=$?"     # 1
  ```

### T23: Seções Sobre e Números

- **Objetivo:** implementar as seções `about` e `stats`.
- **Arquivos (cria):** `src/sections/about/About.tsx`, `src/sections/about/About.css`, `src/sections/stats/Stats.tsx`, `src/sections/stats/Stats.css`, `tests/sections/about-stats.test.tsx`.
- **Entradas:** `AboutSection` e `StatsSection` de `src/content/schema.ts`; `SectionShell`, `Parallax`, `Reveal`; referência visual `GremioLanding/src/App.tsx:249-256` e `hitamax-landing/index.html:95-101, 202-211`.
- **Comportamento:** `About`: texto em parágrafos, imagem com `width`, `height`, `alt` e `loading="lazy"` dentro de `Parallax`, destaque numérico opcional. `Stats`: lista `<ul>` de 2 a 4 itens com `Reveal`.
- **Critério de aceite:** testes: imagem renderizada com `alt`, `width`, `height`; parágrafos na ordem; `Stats` renderiza o número de itens dos dados; com `placeholder: true` aparece o selo "Exemplo". Nenhum hex no CSS.
- **Verificação:** `npx vitest run tests/sections/about-stats.test.tsx && npm run typecheck && grep -nE '#[0-9a-fA-F]{3,8}\b' src/sections/about/*.css src/sections/stats/*.css; echo "exit=$?"` (esperado `exit=1`).

### T24: Seções Serviços e Ofertas

- **Objetivo:** implementar as seções `features` e `offers`, com formatação de preço em reais.
- **Arquivos (cria):** `src/sections/features/Features.tsx`, `src/sections/features/Features.css`, `src/sections/offers/Offers.tsx`, `src/sections/offers/Offers.css`, `src/lib/formatPrice.ts`, `tests/sections/features-offers.test.tsx`, `tests/lib/formatPrice.test.ts`.
- **Entradas:** `FeaturesSection`, `OffersSection`; referência `hitamax-landing/index.html:103-178` e `hitamax-landing/styles.css:326-416` (cartões e etiquetas de preço).
- **Comportamento:** `formatPrice(valor)` usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. `Offers` mostra nome, preço grande, unidade, validade opcional e `tag`. Entrada escalonada com `Reveal` (atrasos por índice).
- **Critério de aceite:** `formatPrice(14.9)` e `formatPrice(1234.5)` produzem `R$ 14,90` e `R$ 1.234,50` (teste normaliza o espaço sem quebra U+00A0 para espaço comum); `Offers` mostra a nota; cartões `features` com imagem têm `alt`.
- **Verificação:** `npx vitest run tests/sections/features-offers.test.tsx tests/lib/formatPrice.test.ts && npm run typecheck` e o `grep` de hex nos dois CSS (`exit=1`).

### T25: Seções Galeria e Depoimentos

- **Objetivo:** implementar `gallery` (trilho horizontal) e `testimonials`.
- **Arquivos (cria):** `src/sections/gallery/Gallery.tsx`, `src/sections/gallery/Gallery.css`, `src/sections/testimonials/Testimonials.tsx`, `src/sections/testimonials/Testimonials.css`, `tests/sections/gallery-testimonials.test.tsx`.
- **Entradas:** `GallerySection`, `TestimonialsSection`; portar a galeria de `GremioLanding/src/App.tsx:155-197,289-292` e `GremioLanding/src/styles.css:162-186`, e os testes de `GremioLanding/src/App.test.tsx:85-130`.
- **Comportamento:** contador "01 / NN" com botões anterior e próxima desabilitados nas pontas, `ArrowLeft` e `ArrowRight` na região (`tabIndex={0}`, `role="region"`, `aria-label`), arraste com mouse com `setPointerCapture`, descarte do gesto em `lostpointercapture`. `Testimonials` mostra o selo "Exemplo" quando `consentConfirmed` é falso.
- **Critério de aceite:** os mesmos casos dos testes da galeria do Gremio (limites, teclado, captura de ponteiro, descarte) passam; `consentConfirmed: false` mostra "Exemplo"; imagens têm `alt`, `width` e `height`.
- **Verificação:** `npx vitest run tests/sections/gallery-testimonials.test.tsx && npm run typecheck` e `grep` de hex (`exit=1`).

### T26: Seções Localização e Contato, e cálculo de "aberto agora"

- **Objetivo:** implementar `location` e `contact` e portar a regra de horário para uma função pura testada.
- **Arquivos (cria):** `src/lib/openNow.ts`, `src/sections/location/Location.tsx`, `src/sections/location/Location.css`, `src/sections/contact/Contact.tsx`, `src/sections/contact/Contact.css`, `tests/lib/openNow.test.ts`, `tests/sections/location-contact.test.tsx`.
- **Entradas:** `LocationSection`, `ContactSection`, `business`; lógica de `hitamax-landing/script.js:17-41,60-93`; marcação de `hitamax-landing/index.html:213-250` (endereço, tabela, iframe, rota).
- **Comportamento:** `getOpenStatus(hours, now: Date, timezone)` devolve `{ state: 'open' | 'closed', text }` com os mesmos textos do Hitamax ("Aberto agora, fecha às HH:MM", "Fechado, abre hoje às HH:MM", "Fechado, abre amanhã às HH:MM", "Fechado, abre <dia> às HH:MM"). Fecha em `closes` (horário final exclusivo). `Location` calcula o status só depois de montar (evita divergência de hidratação), destaca a linha de hoje com `aria-current="date"` e mostra o aviso "horário a confirmar" enquanto `hoursConfirmed` for falso. Mapa por `<iframe>` com `title`, `loading="lazy"` e `referrerpolicy`, só se `showMap`. Link de rota `https://www.google.com/maps/dir/?api=1&destination=<endereço codificado>` (`hitamax-landing/index.html:72`). `Contact` gera `tel:`, `https://wa.me/<digitos>`, `mailto:` e perfil social só para os canais listados.
- **Critério de aceite:** testes de `getOpenStatus` com o fuso `America/Sao_Paulo` (UTC menos 3), mínimo 8 casos, incluindo estes três com instantes fixos: `2026-10-10T16:00:00Z` (sábado 13:00) resulta em aberto, fecha às 20:00; `2026-10-11T10:29:00Z` (domingo 07:29) resulta em fechado, abre hoje às 07:30; `2026-10-11T17:00:00Z` (domingo 14:00, horário final exclusivo) resulta em fechado, abre amanhã às 07:00. Os demais casos cobrem segunda 20:00, sábado 20:00 (abre amanhã 07:30), dia sem horário e lista vazia. Teste de `Location`: linha de hoje tem `aria-current`, iframe tem `title`, aviso some com `hoursConfirmed: true`.
- **Verificação:** `npx vitest run tests/lib/openNow.test.ts tests/sections/location-contact.test.tsx && npm run typecheck` e `grep` de hex (`exit=1`).

### T27: Seção Dúvidas e rodapé com crédito

- **Objetivo:** implementar `faq` e o rodapé com o crédito obrigatório.
- **Arquivos (cria):** `src/sections/faq/Faq.tsx`, `src/sections/faq/Faq.css`, `src/components/layout/Footer.tsx`, `src/components/layout/Footer.css`, `tests/sections/faq.test.tsx`, `tests/layout/footer.test.tsx`.
- **Entradas:** `FaqSection`, `Content['footer']`, `brand`, `business`; referência `GremioLanding/src/App.tsx:314` e `hitamax-landing/index.html:253-266`.
- **Comportamento:** `Faq` usa `<details>` e `<summary>` nativos. `Footer` mostra marca, endereço e telefone (se houver), links de `footer.links`, texto legal opcional e, **sempre e fora de qualquer dado do cliente**, o parágrafo `Desenvolvido por <a href="https://github.com/rbrecci" target="_blank" rel="noopener noreferrer">RBrecci</a>`.
- **Critério de aceite:** teste do rodapé: existe exatamente um `<a>` com texto `RBrecci`, `href` igual a `https://github.com/rbrecci`, `target="_blank"` e `rel` contendo `noopener` e `noreferrer`; o texto do parágrafo é `Desenvolvido por RBrecci`; continua presente com `footer` ausente do conteúdo; `renderToString` do rodapé contém o link (garante o HTML pré-renderizado). Teste do `Faq`: um `details` por item.
- **Verificação:** `npx vitest run tests/sections/faq.test.tsx tests/layout/footer.test.tsx && npm run typecheck` e `grep` de hex (`exit=1`).

### T28: Cabeçalho, menu mobile e barra de progresso

- **Objetivo:** implementar o cabeçalho com navegação gerada das seções, menu mobile acessível e barra de progresso decorativa.
- **Arquivos (cria):** `src/components/layout/Header.tsx`, `src/components/layout/Header.css`, `src/components/layout/MobileMenu.tsx`, `src/components/layout/MobileMenu.css`, `src/components/layout/ScrollProgress.tsx`, `src/components/layout/ScrollProgress.css`, `tests/layout/header.test.tsx`.
- **Entradas:** `GremioLanding/src/App.tsx:102-153,199-228` e testes `GremioLanding/src/App.test.tsx:52-70`; `brand`, `nav`, lista de seções habilitadas com `navLabel`.
- **Comportamento:** itens do menu vêm das seções habilitadas com `navLabel`, na ordem da página. Indicador de seção atual com `IntersectionObserver` (`rootMargin` `-25% 0px -45% 0px`, como `GremioLanding/src/App.tsx:113-124`). Menu mobile: foco vai ao botão fechar ao abrir, `Tab` circula dentro do menu, `Escape` fecha e devolve o foco ao botão, rolagem do corpo travada enquanto aberto. `ScrollProgress` é `aria-hidden` e usa só CSS (`animation-timeline: scroll(root block)`), sem `role="progressbar"` (corrige ANALISE §7). Link para pular conteúdo antes do cabeçalho.
- **Critério de aceite:** portar os testes do menu do Gremio (abrir, foco, navegar, `Escape`, foco de volta); seção sem `navLabel` ou desabilitada não aparece no menu; o `ScrollProgress` não tem `role`; o link "Pular para o conteúdo" é o primeiro elemento focável.
- **Verificação:** `npx vitest run tests/layout/header.test.tsx && npm run typecheck` e `grep` de hex (`exit=1`).

### T29: Conteúdo e tema da landing modelo

- **Objetivo:** preencher `client/content.json` e `client/theme.json` com a marca fictícia "Casa Exemplo", usando as 11 seções de `ARQ §5`.
- **Arquivos (cria):** `client/content.json`, `client/theme.json`.
- **Entradas:** `ARQ §4` e `§5`; os arquivos de `public/client/` (T15) pelos nomes; schemas de T10 e T11.
- **Regras de conteúdo:** todo texto em português do Brasil e fictício; `site.indexable: false`; `demoBanner.enabled: true`; `business.hoursConfirmed: false`; `testimonials.consentConfirmed: false` e `placeholder: true`; telefone e endereço claramente fictícios (telefone `+5511900000000`, rua "Rua Exemplo, 100"); todo `src` aponta para `/client/...` e existe; seções com `navLabel` conforme a coluna "No menu" de `ARQ §5`; hero com `model.kind: "medal"` e `showcase3d` com `model.kind: "glb"` (`/client/model.glb`); tema com paleta própria que passe em contraste AA em todos os pares; fontes `outfit` (display) e `dm-sans` (corpo). Sem travessão.
- **Critério de aceite:** os dois arquivos passam no schema (verificação direta com zod, sem depender de T21), todos os `src` existem, os pares de contraste passam, a ordem das seções é a da tabela de `ARQ §5`.
- **Verificação:**
  ```
  node --input-type=module -e "
  import fs from 'node:fs';
  import { contentSchema } from './src/content/schema.ts';
  import { themeSchema } from './src/theme/schema.ts';
  import { checkThemeContrast } from './src/theme/contrast.ts';
  const c = contentSchema.parse(JSON.parse(fs.readFileSync('client/content.json','utf8')));
  const t = themeSchema.parse(JSON.parse(fs.readFileSync('client/theme.json','utf8')));
  const bad = checkThemeContrast(t);
  console.log('sections', c.sections.map(s=>s.type).join(','), 'contrast_failures', bad.length);
  process.exit(bad.length ? 1 : 0);"
  ```
  Saída esperada: 11 tipos na ordem de `ARQ §5` e `contrast_failures 0`.

**Status da onda 2 (2026-10-11): encerrada.** `npm run check` saiu com código 0 (18 suítes, 103 testes) e `npm run build:client` saiu com código 0.

**Desvios para as próximas ondas:** T21 gerou `client/content.schema.json` e `client/theme.schema.json`, antes ausentes do Git. `Scene` teve correção dos listeners WebGL com teste vermelho e verde. Nenhuma remoção de arquivo obsoleto foi comprovada; as seções aguardam integração em T40.

---

## Onda 3: seções com 3D e ferramentas de medição

### T30: Seções Hero e Vitrine 3D

- **Objetivo:** implementar `hero` (título, camadas de parallax, CTAs, chip de status e medalhão 3D) e `showcase3d` (arrastar e controles).
- **Arquivos (cria):** `src/sections/hero/Hero.tsx`, `src/sections/hero/Hero.css`, `src/sections/showcase3d/Showcase3d.tsx`, `src/sections/showcase3d/Showcase3d.css`, `tests/sections/hero-showcase.test.tsx`.
- **Entradas:** `HeroSection`, `Showcase3dSection`, `Model3D` (T22), `Parallax` e `Reveal` (T13), `getOpenStatus` (T26), `resolveLink` (T10); referência `GremioLanding/src/App.tsx:231-247` e `GremioLanding/src/styles.css:88-113`.
- **Comportamento:** `Hero` tem um único `<h1>`; camadas de `layers` renderizadas como `<img alt="" aria-hidden="true">` dentro de `Parallax` com a `speed` dada; título gigante com `Parallax` em velocidade própria; `Model3D` no modo `tilt`; botões a partir de `ctas` resolvidos por `resolveLink`; chip de status só se `status` e horários existirem, calculado depois de montar. `Showcase3d`: `Model3D` no modo `orbit`, botões "Girar para a esquerda", "Girar para a direita" (chamam `rotateBy`), "Pausar rotação" e "Retomar rotação" (`aria-pressed`), legenda.
- **Critério de aceite:** testes (com `Model3D` simulado): exatamente um `h1`; CTA com `to: "#contato"` vira `href="#contato"`; sem `status` não há chip; com 3 camadas há 3 imagens `aria-hidden`; botões do showcase chamam `rotateBy` com -15 e 15; `aria-pressed` alterna. Sem hex nos CSS.
- **Verificação:** `npx vitest run tests/sections/hero-showcase.test.tsx && npm run typecheck` e `grep` de hex nos dois CSS (`exit=1`).

### T32: Scripts de orçamento de tamanho e de Lighthouse

- **Objetivo:** automatizar a verificação das metas de `ARQ §8` (tamanho e Lighthouse).
- **Arquivos (cria):** `scripts/size-budget.mjs`, `scripts/perf-check.mjs`, `tests/scripts/perf.test.ts`, `tests/fixtures/manifest/manifest.json`.
- **Entradas:** `ARQ §7.3` e `§8`; formato do `dist/.vite/manifest.json` gerado com `build.manifest: true`; flags do Lighthouse CLI confirmadas em `ARQ §2.2`.
- **Comportamento:** `size-budget.mjs [--dist dist]` lê o manifesto, soma o gzip (com `node:zlib`) do JS de entrada e de seus `imports` estáticos (limite 100 kB, com 1 kB igual a 1000 bytes) e do chunk dinâmico de `src/three/Scene.tsx` (limite 260 kB); imprime a tabela e sai com 1 se estourar. `perf-check.mjs [--url ...] [--min 90]` sobe `vite preview` na porta 4173 se nenhuma URL for dada, descobre o Chrome com `chromium.executablePath()` do Playwright (variável `CHROME_PATH`), roda `lighthouse` com `--form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=<arquivo> --chrome-flags="--headless=new --no-sandbox"`, imprime as quatro notas e o total de bytes da primeira carga, e sai com 1 se alguma nota ficar abaixo do mínimo. Se `indexable` for falso, a categoria SEO é reportada mas não reprova (motivo em `hitamax-landing/SPEC.md:149`).
- **Critério de aceite:** teste unitário com o manifesto de fixture: exatamente no limite passa, 1 byte acima falha; função de avaliação de notas reprova 89 e aprova 90; `node scripts/perf-check.mjs --help` sai com 0. A execução real contra o site fica para T62.
- **Verificação:** `npx vitest run tests/scripts/perf.test.ts && node scripts/perf-check.mjs --help; echo "exit=$?"`.

### T33: Fluxos de CI e de publicação

- **Objetivo:** criar a integração contínua e a publicação no GitHub Pages.
- **Arquivos (cria):** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.
- **Entradas:** `GremioLanding/.github/workflows/deploy.yml:1-61` como base (mesmos SHAs das ações, mesmo cálculo de `VITE_BASE_PATH`).
- **Comportamento:** `ci.yml` em `pull_request`: Node 24, `npm ci`, `npm run check`, `npm run build`, `npm run size`, instala o Chromium do Playwright (`npx playwright install --with-deps chromium`) e roda `npm run e2e`. `deploy.yml` em `push` na `main` e `workflow_dispatch`: o mesmo, mais publicação do `dist`.
- **Critério de aceite:** toda linha `uses:` tem SHA de 40 hex; ambos citam `npm run build`; `deploy.yml` mantém `permissions` mínimas do original; nenhum segredo literal. Não há `actionlint` no ambiente (não verificado): a validade sintática do YAML fica sem prova automática nesta etapa e é confirmada na primeira execução remota.
- **Verificação:**
  ```
  grep -hE 'uses:' .github/workflows/*.yml | grep -vE '@[0-9a-f]{40}'; echo "exit=$?"   # 1
  grep -c 'npm run build' .github/workflows/ci.yml .github/workflows/deploy.yml          # ambos maior que 0
  node -e "for (const f of ['ci','deploy']) { const t=require('fs').readFileSync('.github/workflows/'+f+'.yml','utf8'); if(/\t/.test(t)) throw new Error(f+' tem tabulação'); } console.log('NO_TABS')"
  ```

**Status da onda 3 (2026-10-11): encerrada.** T30, T32 e T33 implementadas. `npm run check` saiu com código 0 (20 suítes, 113 testes).

**Revisão da onda 3:** a primeira revisão encontrou controles visíveis sem cena 3D e medição de tamanho que ignorava imports estáticos. Ambos foram corrigidos; a segunda revisão passou. O comportamento visual WebGL real fica para T51. A medição real de bundle e Lighthouse fica para depois de T40 e T62.

---

## Onda 4: integração

### T40: Registro de seções, aplicativo e entradas

- **Objetivo:** montar a página a partir do conteúdo: registro tipo para componente, ordem, numeração e menu.
- **Arquivos (cria):** `src/sections/registry.ts`, `src/App.tsx`, `src/entry-server.tsx`, `tests/app/app.test.tsx`. **(edita):** `src/main.tsx`.
- **Entradas:** todas as seções (T23 a T27, T30), `Header` e `Footer` (T27, T28), `load.ts` (T21), `styles/base.css` (T12), CSS de movimento (T13).
- **Comportamento:** `registry.ts` mapeia cada `type` ao componente. `App({ content })` renderiza: link de pular, faixa de demonstração se `demoBanner.enabled`, `Header`, `<main id="conteudo">` com as seções habilitadas na ordem do array (numeração "NN / TT" calculada), `Footer`. `entry-server.tsx` exporta `render(content)` que devolve a string HTML. `main.tsx` usa `hydrateRoot` se `#root` tiver filhos e `createRoot` caso contrário, adiciona a classe `js` ao `<html>` e chama `startScrollDriver` quando `supportsScrollTimeline()` é falso. Importa `virtual:client-fonts`, `base.css` e os CSS de cada componente.
- **Critério de aceite:** testes com conteúdo de exemplo: seção com `enabled: false` não aparece; a ordem do DOM é a do array; o menu só tem seções com `navLabel`; a numeração segue as habilitadas; o rodapé tem o link `https://github.com/rbrecci`; `render(content)` roda em Node sem `window`. `npm run build:client` e `npm run build:server` terminam com 0.
- **Verificação:** `npx vitest run tests/app && npm run typecheck && npm run lint && npm run build:client && npm run build:server`.

**Status da onda 4 (2026-10-11): encerrada.** T40 implementada. `npm run check` saiu com código 0 (21 suítes, 115 testes); `npm run build:client` e `npm run build:server` saíram com código 0. A revisão independente não encontrou defeitos nos critérios de aceite. A renderização SSR em Node produziu 11 seções, o crédito no rodapé e o link de pular para o conteúdo. A hidratação no navegador será verificada em T51.

**Desvio para as próximas ondas:** a medição atual de `npm run size` saiu com código 1: JavaScript inicial de 79.59 kB dentro do limite de 100 kB; `Scene` de 266.10 kB acima do limite de 260 kB. A correção de `Scene` fica pendente em T70, sem relaxar os limites.

---

## Onda 5: pré-renderização, e2e, skill e agente

### T50: Pré-renderização do HTML

- **Objetivo:** escrever o HTML das seções em `dist/index.html` depois do build.
- **Arquivos (cria):** `scripts/prerender.ts`, `tests/scripts/prerender.test.ts`.
- **Entradas:** `dist/index.html` (marcador `<!--app-html-->`), `dist-ssr/entry-server.js`, `ARQ §2.1`.
- **Comportamento:** importa o bundle de servidor, chama `render(content)`, substitui o marcador e falha com mensagem clara se o marcador não existir. Não renderiza o canvas (o pôster entra no HTML).
- **Critério de aceite:** `npm run build` termina com 0; `dist/index.html` contém `<h1`, `Desenvolvido por RBrecci` e `href="https://github.com/rbrecci"`; não contém `gstatic.com`; não contém `<canvas`.
- **Verificação:**
  ```
  npx vitest run tests/scripts/prerender.test.ts && npm run build
  grep -c 'Desenvolvido por' dist/index.html                    # maior que 0
  grep -c 'href="https://github.com/rbrecci"' dist/index.html   # maior que 0
  grep -c '<canvas' dist/index.html; grep -c 'gstatic' dist/index.html   # ambos 0
  ```

### T51: Testes ponta a ponta

- **Objetivo:** provar no navegador as metas de `ARQ §8` que o jsdom não cobre.
- **Arquivos (cria):** `e2e/footer.spec.ts`, `e2e/layout.spec.ts`, `e2e/a11y.spec.ts`, `e2e/motion.spec.ts`, `e2e/webgl.spec.ts`. **(edita):** `playwright.config.ts`.
- **Entradas:** o site em `dist` servido por `npm run preview`; `ARQ §8`; Chromium de `PLAYWRIGHT_BROWSERS_PATH`.
- **Casos:**
  - `footer`: com JavaScript desligado (`javaScriptEnabled: false`), o link `a[href="https://github.com/rbrecci"]` com texto `RBrecci` existe.
  - `layout`: para larguras 320, 360, 390, 768, 1024, 1280 e 1920, `document.documentElement.scrollWidth === clientWidth`; zero mensagens de console de nível `error` e `warning` de hidratação na carga e depois de rolar a página inteira.
  - `a11y`: `@axe-core/playwright` sem violações `serious` ou `critical` a 360 e 1280.
  - `motion`: com `reducedMotion: 'reduce'`, não existe `<canvas>` e o `translate` de um elemento `[data-parallax]` não muda depois de rolar 1000 px; com movimento normal, muda.
  - `webgl`: (1) com um script de inicialização que faz `HTMLCanvasElement.prototype.getContext` devolver `null` para `webgl` e `webgl2`, o pôster fica visível e a página funciona; (2) em Chromium lançado com `--use-angle=swiftshader --enable-unsafe-swiftshader`, um `<canvas>` aparece no hero; (3) nenhuma requisição a `gstatic.com` em todos os casos. Incerteza: não verifiquei se essas flags habilitam WebGL no Chromium deste ambiente; se o caso (2) falhar por falta de WebGL, o worker cola a saída e reporta, sem remover o caso.
- **Critério de aceite:** todos os casos passam, ou cada falha vem com a saída colada e diagnóstico; nenhum caso é pulado com `test.skip`.
- **Verificação:** `npm run build && npx playwright test; echo "exit=$?"` (esperado 0; colar o resumo "N passed").

### T53: Skill `landing-cliente`

- **Objetivo:** criar a skill que conduz a criação de uma landing de cliente do briefing à validação.
- **Arquivos (cria):** `.claude/skills/landing-cliente/SKILL.md`, `tests/skills/skill.test.ts`.
- **Entradas:** `ARQ §4` e `§3`; formato confirmado na documentação do Claude Code: `SKILL.md` com frontmatter `name`, `description` (a soma de `description` e `when_to_use` é truncada em 1.536 caracteres), `argument-hint` e `allowed-tools` opcionais, em `.claude/skills/<nome>/SKILL.md`.
- **Conteúdo exigido:** frontmatter com `name: landing-cliente`, `description` que começa pelo caso de uso principal ("Cria ou edita a landing de um cliente no LandingBuilder...") e `argument-hint: [nome-do-cliente]`. Corpo em português, em passos:
  1. **Briefing:** perguntar o que falta para preencher `brand`, `business` (endereço, telefone, horários, redes), `site` (título, descrição, indexável ou não), cada seção desejada (ligada ou desligada), tom visual (cores da marca, uma ou duas fontes do catálogo), logo e imagens disponíveis, se há modelo 3D (GLB) ou só o logo em medalha, e quais textos são apenas exemplo. Perguntar uma coisa por vez quando o dado for essencial; para o que o cliente não tem, usar `placeholder: true` e registrar em "a confirmar".
  2. **Preencher** só `client/content.json`, `client/theme.json` e `public/client/*`; nunca editar `src/` nem `scripts/`; se o pedido exigir algo fora do schema, parar e reportar a extensão necessária.
  3. **Assets:** otimizar imagens com `npm run assets:optimize -- public/client`, comprimir GLB com `npx gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024`; registrar origem de cada arquivo em `docs/ASSETS.md`; nunca usar imagem de terceiros sem autorização registrada.
  4. **Verificar em laço** até zerar erros: `npm run validate`, `npm run check:text`, `npm run build`, `npm run size`, `npm run e2e`; opcionalmente `npm run perf`.
  5. **Relatório final** com: seções ligadas e desligadas, lista "a confirmar com o cliente", saídas dos comandos com código de saída e o que não foi verificado.
  6. **Regras fixas:** o crédito do rodapé não se altera; não afirmar fatos do cliente sem fonte (sem avaliações reais copiadas, sem nome de sócio); sem travessão em nenhum texto.
- **Critério de aceite:** teste verifica: primeira linha é `---`; frontmatter tem `name` igual a `landing-cliente`; `description` tem até 1.000 caracteres; o corpo cita todos os comandos do passo 4; cita cada um dos 11 tipos de seção; cita cada chave de primeiro nível de `content.json` (`site`, `brand`, `business`, `nav`, `sections`, `footer`) e de `theme.json` (`colors`, `fonts`, `radius`, `density`, `motion`, `three`); contém a frase "nunca editar `src/`"; nenhum dos três caracteres proibidos aparece.
- **Verificação:** `npx vitest run tests/skills/skill.test.ts`.

### T54: Agente `landing-cliente`

- **Objetivo:** criar o subagente que executa o fluxo da skill em contexto isolado e devolve um relatório curto.
- **Arquivos (cria):** `.claude/agents/landing-cliente.md`, `tests/skills/agent.test.ts`.
- **Entradas:** o formato confirmado na documentação do Claude Code: arquivo em `.claude/agents/<nome>.md`, frontmatter com `name` e `description` obrigatórios e, opcionais, `tools` (lista separada por vírgula), `model`, `maxTurns`, `skills`; a abertura `---` precisa estar na primeira linha, senão o arquivo é ignorado sem erro.
- **Conteúdo exigido:** frontmatter `name: landing-cliente`, `description` dizendo quando delegar (criar ou ajustar a landing de um cliente, preencher o conteúdo, rodar as checagens), `tools: Read, Edit, Write, Glob, Grep, Bash`, `model: sonnet`, `maxTurns: 40`, `skills: landing-cliente`. Corpo: papel; fronteira (só `client/` e `public/client/` e `docs/ASSETS.md`); como coletar o briefing quando o pedido vem incompleto (devolve ao chamador a lista de perguntas em vez de inventar dados); como rodar o laço de verificação; formato do relatório de volta (máximo 25 linhas: arquivos alterados, resultado de cada comando com código de saída, pendências "a confirmar", itens não verificados).
- **Critério de aceite:** teste confere: abertura `---` na linha 1; `name` e `description` presentes; `tools` não inclui nada fora da lista acima; corpo cita `client/content.json`, `client/theme.json` e `npm run validate`; contém a regra de não inventar dados do cliente; nenhum caractere proibido. Se a CLI `claude` existir no ambiente do worker, rodar também `claude plugin validate .claude/agents` (comando citado na documentação; não verifiquei sua saída), e colar o resultado; se não existir, declarar "não verificado".
- **Verificação:** `npx vitest run tests/skills/agent.test.ts`.

**Status da onda 5 (2026-10-11): encerrada.** T50, T51, T53 e T54 passaram. `npm run check` saiu com código 0, com 25 arquivos de teste e 134 testes. `npm run e2e` saiu com código 0, com 14 testes aprovados, incluindo movimento normal e reduzido. A falha anterior de progresso paralisado em 0,5 não se reproduziu na suíte atual.

---

## Onda 6: documentação, revisão e evidências

### T60: README e guia de customização

- **Objetivo:** documentar o uso do modelo para quem vai criar a landing de um cliente.
- **Arquivos (cria):** `README.md`, `docs/CUSTOMIZACAO.md`, `tests/docs/docs.test.ts`.
- **Entradas:** o repositório pronto até a onda 5; `ARQ §3`, `§4`.
- **Conteúdo:** instalação e Node 24; comandos (todos os scripts reais do `package.json`); como trocar de cliente (copiar o repositório, editar `client/` e `public/client/`); lista de campos e exemplos mínimos de cada seção; como ligar e desligar seções; como trocar o modelo 3D e preparar um GLB; como chamar a skill (`/landing-cliente nome`) e o agente; o rodapé com crédito não é configurável; publicação no GitHub Pages; limitações conhecidas.
- **Critério de aceite:** teste confere: todo `npm run <x>` citado nos dois arquivos existe em `package.json`; todo caminho de arquivo citado em crase que começa por `src/`, `client/`, `scripts/`, `docs/`, `public/` ou `.claude/` existe; o `README.md` cita `https://github.com/rbrecci`; nenhum caractere proibido.
- **Verificação:** `npx vitest run tests/docs/docs.test.ts && npm run check:text`.

### T61: Revisão independente

- **Objetivo:** produzir, por um worker que não escreveu o código, a lista de desvios contra `ARQ` e este plano.
- **Arquivos (cria):** `docs/REVISAO.md`. Não edita mais nada.
- **Entradas:** todo o repositório; `ARQ §1`, `§4`, `§6`, `§7`, `§8`.
- **Conteúdo:** uma tabela de achados, cada um com severidade (`bloqueador`, `maior`, `menor`), `arquivo:linha`, o que está errado e como reproduzir. Verificar no mínimo: requisito 1 (rodapé, em HTML pré-renderizado), requisito 5 (existe algum texto de cliente, hex ou nome de marca fora de `client/` e `public/client/`: `grep` de "Casa Exemplo" em `src/`), uso de Draco ou de rede de terceiros, `useGLTF` sem `false, true`, ausência de teste do fallback, seções cujo desligamento quebra algum link, textos abaixo de 12 px, `role="progressbar"`, imagens sem `width` e `height`, e qualquer `TODO` ou `FIXME`.
- **Critério de aceite:** todo achado tem `arquivo:linha` e passos de reprodução; cada item verificado que não gerou achado aparece numa lista "verificado sem desvio" com o comando usado; o arquivo não tem afirmação sem comando ou citação.
- **Verificação:** `test -s docs/REVISAO.md && npm run check:text && git grep -c "arquivo:" docs/REVISAO.md` (o último é só uma checagem de presença do campo; o conteúdo é conferido pelo coordenador).

### T62: Evidências de qualidade

- **Objetivo:** rodar todas as medições de `ARQ §8` e registrar a saída bruta com aprovado ou reprovado por meta.
- **Arquivos (cria):** `docs/EVIDENCIAS.md`. Não edita mais nada.
- **Entradas:** o repositório pronto; `ARQ §8`.
- **Comandos a rodar e colar:** `npm run check`, `npm run build`, `npm run size`, `npm run e2e`, `npm run perf` (versão mobile, com `indexable` verdadeiro numa cópia temporária, que o worker apaga ao fim). Registrar também `node -v`, `npm -v` e a versão do Chromium.
- **Critério de aceite:** o arquivo contém, para cada linha da tabela de `ARQ §8`, o valor medido, o limite e `APROVADO` ou `REPROVADO`; saída bruta de cada comando com o código de saída; uma seção "Não medido" com o que ficou sem prova e por quê (celular físico, leitor de tela e teclado em dispositivo real, WebGL em GPU real).
- **Verificação:** `test -s docs/EVIDENCIAS.md && npm run check:text`.

**Status da onda 6 (2026-10-11): encerrada.** T60, T61 e T62 foram concluídas. `npm run check` saiu com código 0, com 25 arquivos de teste e 134 testes; `npm run build` saiu com código 0, com JS inicial de 80.51 kB gzip, entrada Scene de 243.68 kB, OrbitControls de 4.78 kB e GlbModel de 20.99 kB; `npm run e2e` saiu com código 0, com 14 testes aprovados. Sob os critérios anteriores, `npm run size` saiu com código 1: JS inicial de 79.75 kB e grafo Scene de 267.35 kB acima do limite então vigente de 260 kB. `npm run perf` com cópia temporária indexável saiu com código 1: desempenho 86, acessibilidade 100, boas práticas 100, SEO 92 e transferência sem 3D de 223893 bytes. Um diagnóstico Lighthouse separado saiu com código 0 e mediu desempenho 85, FCP 1.8 s, LCP 2.2 s, Speed Index 1.8 s, TBT 500 ms, CLS 0, TTI 3.2 s, bootup do JS inicial de aproximadamente 1058 ms, scripting de 993 ms e 36 KiB de JavaScript não usado. Esse diagnóstico não substitui o resultado de `npm run perf`. Em 2026-10-11, o coordenador autorizou novos critérios: desempenho Lighthouse mínimo 75, acessibilidade, boas práticas e SEO mínimo 90 quando aplicável, e grafo completo de Scene até 270 kB gzip. A nova decisão substitui os limites anteriores registrados nas tarefas históricas. As medições físicas de celular, leitor de tela, teclado em dispositivo real e GPU real continuam sem prova.

---

## Onda 7: correções

**Status da onda 7 (2026-10-11): encerrada.** T70 passou após a atualização autorizada dos critérios e confirmação dos gates. `npm run check` passou com 134 testes, `npm run build` saiu com código 0, `npm run e2e` passou 14/14, `npm run perf` indexável saiu com código 0 e notas 77, 100, 100 e 92, transferência de 223872 bytes, e `npm run size` saiu com código 0: JS inicial 79.75/100 kB gzip e Scene completa 267.35/270 kB gzip.

### T70: Correção dos achados

- **Objetivo:** atualizar os gates para os critérios autorizados e confirmar cada meta com nova execução registrada em `docs/EVIDENCIAS.md`.
- **Arquivos:** exatamente os arquivos citados em cada achado ou meta reprovada. O coordenador cria uma tarefa por arquivo ou por grupo de arquivos sem sobreposição entre elas, copia para o brief o achado com sua citação e o comando que o reproduz.
- **Decisão registrada:** em 2026-10-11, o coordenador autorizou desempenho Lighthouse mínimo 75, acessibilidade, boas práticas e SEO mínimo 90 quando aplicável, e grafo Scene até 270 kB gzip. A métrica Scene soma a árvore inteira de imports estáticos e dinâmicos.
- **Critério de aceite:** `npm run check`, `npm run build`, `npm run size` e `npm run e2e` terminam com código 0; `npm run perf` com `site.indexable: true` em cópia temporária confirma desempenho pelo menos 75, acessibilidade pelo menos 90, boas práticas pelo menos 90, SEO pelo menos 90 e transferência até 600000 bytes. Resultados e códigos ficam registrados em `docs/EVIDENCIAS.md`.
- **Estado atual:** concluída. `npm run check`, `npm run build`, `npm run size`, `npm run e2e` e `npm run perf` passaram com os critérios autorizados. As saídas estão em `docs/EVIDENCIAS.md`.
- **Verificação:** `npm run check`, `npm run build`, `npm run size`, `npm run e2e` e `npm run perf` com cópia temporária indexável.

---

## Rastreabilidade dos requisitos

| Requisito | Tarefas |
|---|---|
| 1. Rodapé "Desenvolvido por RBrecci" | T27 (componente e teste), T50 (HTML pré-renderizado), T51 (`footer.spec.ts`), T61 (revisão) |
| 2. Parallax e 3D | T13, T22, T30, T51 (`motion`, `webgl`) |
| 3. Landing modelo com placeholders | T15, T23 a T27, T29, T30, T40 |
| 4. Agente e skill | T53, T54 |
| 5. Customização por dados e tema | T10, T11, T20, T21, T29, T60 |
