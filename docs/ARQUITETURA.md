# Arquitetura do modelo de landing

Este documento decide como o modelo é construído. Fatos sobre os projetos de origem estão em `docs/ANALISE.md` (citados como `ANALISE §N`). A execução está em `docs/PLANO-TAREFAS.md`.

## 1. Requisitos e como cada um é atendido

| # | Requisito | Decisão |
|---|---|---|
| 1 | Rodapé "Desenvolvido por RBrecci" linkado a `https://github.com/rbrecci` | O crédito é código fixo em `src/components/Footer.tsx`, fora do arquivo de conteúdo. Cliente não consegue removê-lo sem editar estrutura. Teste unitário e teste e2e verificam o `href` exato |
| 2 | Parallax e interação com modelos 3D | §6 (parallax) e §7 (3D) |
| 3 | Landing modelo com seções de exemplo e dados placeholder | §5 e `client/` preenchido com dados fictícios |
| 4 | Agente e skill do Claude Code | `.claude/skills/landing-cliente/SKILL.md` e `.claude/agents/landing-cliente.md` (tarefas da onda 5) |
| 5 | Customização por cliente trocando dados e tema | §3 e §4: só `client/` e `public/client/` mudam por cliente |

## 2. Stack

Decisão: **Vite 8 + React 19 + TypeScript 5.9 + three/@react-three/fiber/drei + zod 4**, saída estática com pré-renderização do HTML, publicada no GitHub Pages.

Confronto dos dois projetos:

| Critério | Base `GremioLanding` | Base `hitamax-landing` | Veredito |
|---|---|---|---|
| 3D e interação | Tem, com fallback testado (ANALISE §4, §5) | Não tem, e o próprio SPEC rejeita build (`hitamax-landing/SPEC.md:136`) | React é necessário para carregar 3D sob demanda com `Suspense` e limite de erro. Em JS puro isso exigiria reescrever essa lógica sem ganho |
| Conteúdo trocável com segurança | `content.ts` sem validação, texto no JSX (ANALISE §3) | Conteúdo no HTML (ANALISE §3) | Nenhum serve. A solução é um schema com zod, que só funciona bem em TypeScript |
| Peso da página sem 3D | JS principal com 75,16 kB gzip no build que rodei (ANALISE §1) | 441 KiB na primeira carga com 98 de desempenho (`hitamax-landing/SPEC.md:259,263`) | O custo do React é pequeno diante da meta. Meta do modelo: §8 |
| Testes e CI | 9 testes, lint, tipos (ANALISE §1) | nenhum | Manter a base do Gremio |
| SEO e LCP | página vazia até o JS rodar (`GremioLanding/index.html:17`) | HTML estático | Adicionar pré-renderização (§2.1) para igualar o Hitamax |

O que vem de cada um: de `GremioLanding` vêm Vite, React, TypeScript, ESLint, Vitest, o padrão de 3D sob demanda, o menu, a galeria, o deploy. De `hitamax-landing` vêm o contrato "uma fonte de dados, vários usos" (horário), o `srcset`, as fontes locais, os rótulos de conteúdo não confirmado, o formato de critérios com evidência e a meta de Lighthouse.

Não avaliei Astro nem outros geradores estáticos: a comparação pedida era entre os dois projetos, e trocar de ferramenta custaria o código reaproveitável do Gremio. Se surgir um motivo concreto para trocar de gerador, a decisão é revista; hoje não há.

### 2.1 Pré-renderização

Decisão: o build gera o HTML das seções com `react-dom/server` e o cliente faz `hydrateRoot`. O canvas 3D nunca é renderizado no servidor: o servidor entrega o pôster (imagem) e o cliente troca depois de montar. Regra para evitar divergência de hidratação: nenhuma decisão baseada em `matchMedia`, `window` ou WebGL pode ocorrer no primeiro render, só em `useEffect` (o Gremio decide no primeiro render, `GremioLanding/src/App.tsx:38-42`, o que desalinharia com HTML pré-renderizado). Critério de aceite: nenhum erro de hidratação no console em e2e. Ferramenta: `vite build --ssr` para o bundle de servidor e um script Node para escrever o HTML (a flag `--ssr` do `vite build` é documentada na CLI do Vite; a tarefa T50 confere com `npx vite build --help`).

### 2.2 Versões fixadas e confirmação no registro npm

Consultas feitas com `npm view <pacote> version time.modified license` em 11/10/2026 (Node 22.22.0, npm 10.9.4). Todos os pacotes abaixo existem.

| Pacote | Versão | Última publicação | Licença | Uso e observação |
|---|---|---|---|---|
| `vite` | 8.3.4 | 08/10/2026 | MIT | build. Exige Node `^20.19.0 \|\| >=22.12.0` |
| `@vitejs/plugin-react` | 6.1.2 | 05/10/2026 | MIT | peer `vite ^8.0.0` |
| `react`, `react-dom` | 19.3.0 | 08/10/2026 | MIT | `@react-three/fiber` aceita React `>=19 <19.4` |
| `typescript` | **5.9.3** (a versão `latest` é 7.0.2) | 10/10/2026 (7.0.2) | Apache-2.0 | **Fixar `~5.9.3`**: `typescript-eslint@8.71.1` declara peer `typescript >=4.8.4 <6.1.0`, então 7.0.2 quebraria o lint. Versão 5.9.3 existe (`npm view typescript@5.9.3 version`) |
| `three` | 0.186.1 | 24/09/2026 | MIT | 3D |
| `@types/three` | 0.186.0 | 04/10/2026 | MIT | casa com `three` |
| `@react-three/fiber` | 9.8.1 | 10/10/2026 | MIT | renderer React |
| `@react-three/drei` | 10.7.9 | 25/09/2026 | MIT | `useGLTF`, `useTexture`. Peer `@react-three/fiber ^9.0.0` |
| `zod` | 4.6.5 | 02/10/2026 | MIT | schema. Testei `z.toJSONSchema` na versão 4.6.5: existe e gera JSON Schema 2020-12 |
| `vitest` | 5.0.3 | 30/09/2026 | MIT | peer `vite ^6.4 \|\| ^7 \|\| ^8`. Exige Node `^22.12.0 \|\| ^24.0.0 \|\| >=26` |
| `jsdom` | 30.1.2 | 04/10/2026 | MIT | ambiente de teste |
| `@testing-library/react` | 16.3.3 | 27/08/2026 | MIT | com `@testing-library/dom` 10.4.2 |
| `@playwright/test` | 1.64.0 | 10/10/2026 | Apache-2.0 | e2e. Chromium já existe em `/opt/pw-browsers` neste ambiente |
| `@axe-core/playwright` | 4.13.0 | 09/10/2026 | MPL-2.0 | checagem automática de acessibilidade |
| `lighthouse` | 13.5.0 | 10/10/2026 | Apache-2.0 | medição. Instalei em diretório temporário e confirmei as flags `--only-categories`, `--output`, `--output-path`, `--form-factor`, `--chrome-flags`, `--preset` |
| `@gltf-transform/core` | 4.5.1 | 28/09/2026 | MIT | API para gerar o GLB placeholder por código (T15) |
| `@gltf-transform/cli` | 4.5.1 | 28/09/2026 | MIT | binário `gltf-transform`. Confirmei `optimize --compress meshopt\|draco\|quantize`, `--texture-compress`, `--texture-size`, `--simplify` |
| `sharp` | 0.35.5 | 27/09/2026 | Apache-2.0 | gera WebP e PNG de placeholder. Binário nativo: se a instalação falhar no ambiente do worker, T15 reporta e não improvisa |
| `eslint` | 10.12.0 | 02/10/2026 | MIT | com `@eslint/js` 10.0.1, `typescript-eslint` 8.71.1, `eslint-plugin-react-hooks` 7.1.1, `globals` 17.13.0 |
| `@fontsource-variable/dm-sans`, `/outfit`, `/space-grotesk`, `/inter`, `/fraunces` | 5.3.0 cada | 19/07/2026 | OFL-1.1 | fontes locais variáveis |
| `@fontsource/barlow-condensed` | 5.3.0 | 19/07/2026 | OFL-1.1 | fonte estática (pesos 700, 800, 900) usada no Gremio |

Rejeitados, com motivo:

| Pacote | Existe? | Decisão |
|---|---|---|
| `gsap` 3.15.0 | sim | **Não usar.** Licença é "Standard 'no charge' license" (https://gsap.com/standard-license), não MIT. Restrições de uso comercial não verificadas por mim, e o modelo será revendido por cliente |
| `lenis` 1.3.26 | sim | **Não usar.** Sequestra a rolagem nativa, piora acessibilidade e conflita com `scroll-snap` da galeria. Parallax não precisa dele |
| `motion` 14.1.0 | sim (depende de `framer-motion` 14.1.0) | **Não usar.** CSS mais um observador pequeno bastam. Menos 1 dependência |
| `@lhci/cli` 0.15.1 | sim | **Não usar.** Última publicação em 25/06/2025, mais de 15 meses sem atualização. Usar `lighthouse` direto |
| `draco3d` 1.5.7 | sim | **Não usar.** Última publicação em 17/01/2024. Ver §7: o modelo usa Meshopt |
| `meshoptimizer` 1.3.0 | sim | Não é dependência direta. O `gltf-transform` já traz a compressão, e o decoder vem embutido (§7) |

Observações de engine: `jsdom@30` puxa `w3c-xmlserializer` que pede Node `^22.22.2 || ^24.15.0 || >=26` (aviso `EBADENGINE` visto no `npm ci`). Decisão: `.nvmrc` com `24`, `engines.node` `>=22.22.2`, CI em Node 24 como o Gremio (`GremioLanding/.github/workflows/deploy.yml:29`).

Scripts em TypeScript (`scripts/*.ts`) rodam direto com `node arquivo.ts`: testei no Node 22.22.0 e funcionou para anotações de tipo simples. Regra para esses scripts: só sintaxe que o Node remove (sem `enum`, sem `namespace`, sem parameter properties), imports relativos com extensão `.ts`. O Gremio já tem `allowImportingTsExtensions` (`GremioLanding/tsconfig.json:12`). Não adiciona `tsx`.

## 3. Estrutura do repositório

```
LandingBuilder/
  client/                       <- ÚNICO lugar que muda por cliente (dados e tema)
    content.json                  textos, seções, links, modelo 3D
    theme.json                    tokens de tema
    content.schema.json           gerado, não editar
    theme.schema.json             gerado, não editar
  public/
    client/                     <- imagens, logo, GLB, og.jpg do cliente (no modelo, são placeholders gerados por script, T15)
  src/
    content/   schema.ts  links.ts  load.ts
    theme/     schema.ts  tokens.ts  fonts.ts  contrast.ts
    motion/    prefs.ts  Parallax.tsx  Reveal.tsx  scrollDriver.ts  *.css
    three/     Model3D.tsx  Scene.tsx  MedalModel.tsx  GlbModel.tsx  *.css
    components/ ui/  layout/ (Header, MobileMenu, Footer)
    sections/  registry.ts  <tipo>/<Tipo>.tsx  <Tipo>.css
    lib/       openNow.ts
    styles/    base.css
    App.tsx  main.tsx  entry-server.tsx
  scripts/    validate-client.ts  check-text.ts  gen-json-schema.ts
              vite-plugin-client.ts  prerender.ts
              optimize-assets.mjs  make-placeholder-assets.mjs  perf-check.mjs
  tests/  e2e/
  .claude/skills/landing-cliente/SKILL.md
  .claude/agents/landing-cliente.md
  .github/workflows/ci.yml  deploy.yml
  docs/
```

Regra de fronteira: trocar de cliente é editar `client/*.json` e `public/client/*`. Se o cliente precisar de algo que o schema não permite, a decisão é estender o schema e o componente no modelo, não editar um componente para um cliente só.

## 4. Formato do arquivo de conteúdo

Dois arquivos JSON validados por zod. JSON em vez de TypeScript: dá para o agente editar sem risco de quebrar sintaxe, e o `$schema` dá autocompletar em editores. O schema gera `client/*.schema.json` com `z.toJSONSchema`.

### 4.1 `client/content.json`

```jsonc
{
  "$schema": "./content.schema.json",
  "schemaVersion": 1,
  "site": {
    "lang": "pt-BR",
    "title": "string, 10 a 70 caracteres",
    "description": "string, 50 a 160 caracteres",
    "url": "https://... (opcional, base de og:url e canonical)",
    "indexable": false,                 // false gera noindex, nofollow (padrão do modelo)
    "ogImage": "/client/og.jpg",
    "favicon": "/client/favicon.svg",
    "demoBanner": { "enabled": true, "text": "string" }   // faixa de demonstração (hitamax-landing/SPEC.md:100)
  },
  "brand": {
    "name": "string", "shortName": "string", "tagline": "string",
    "logo": { "src": "/client/logo.svg", "alt": "string", "width": 120, "height": 40 }
  },
  "business": {                          // opcional, necessário se houver seção location, contact ou JSON-LD
    "schemaType": "LocalBusiness | Restaurant | Store | SportsClub | Organization",
    "address": { "street": "", "district": "", "city": "", "region": "SP", "postalCode": "", "country": "BR" },
    "phone": "+5511999999999",           // E.164
    "whatsapp": "5511999999999",         // opcional, só dígitos
    "email": "opcional",
    "social": [ { "network": "instagram", "url": "https://..." } ],
    "timezone": "America/Sao_Paulo",
    "hours": [ { "day": 0, "opens": "07:30", "closes": "14:00" } ],   // day 0 a 6, domingo = 0
    "hoursConfirmed": false              // equivale a HORARIO_CONFIRMADO (hitamax-landing/script.js:3)
  },
  "nav": { "cta": { "label": "string", "to": "#contact" } },           // itens do menu vêm das seções com navLabel
  "sections": [ /* ver 4.3, a ordem do array é a ordem na página */ ],
  "footer": { "legal": "string opcional", "links": [ { "label": "", "to": "" } ] }
}
```

O crédito "Desenvolvido por RBrecci" não está no schema de propósito.

### 4.2 Campos comuns de seção

```
type:       um dos tipos da tabela 4.3
enabled:    boolean (padrão true). hero não aceita false
id:         slug opcional, padrão = type. Único na página. Alvo de âncora
navLabel:   opcional. Se existe, a seção entra no menu e no indicador de seção atual
tone:       "dark" | "light" | "brand" | "accent"  (superfícies do tema, §4.5)
eyebrow:    opcional (rótulo pequeno acima do título)
title:      obrigatório, até 80 caracteres
intro:      opcional, até 280 caracteres
placeholder: boolean (padrão false). Se true, a seção mostra o selo "Exemplo" (hitamax-landing/SPEC.md:16)
parallax:   opcional, "off" | "subtle" | "bold"  (substitui o nível global do tema nesta seção)
```

Numeração tipo "01 / 08" é calculada a partir das seções habilitadas, nunca digitada (corrige `GremioLanding/src/App.tsx:250`).

### 4.3 Tipos de seção (ligáveis e desligáveis)

| `type` | Pode desligar | Dados específicos (`data`) |
|---|---|---|
| `hero` | não | `headline` (até 60), `subheadline` (até 160), `ctas` (1 a 2 `{label,to,variant}`), `model` (§4.4), `layers` (0 a 3 `{src,speed}`, imagens decorativas de parallax, renderizadas com `aria-hidden`), `status` (booleano para o chip "aberto agora", exige `business.hours`) |
| `stats` | sim | `items` (2 a 4 `{value,label,note?}`) |
| `about` | sim | `paragraphs` (1 a 3 strings), `image` `{src,alt,width,height}`, `highlight` `{value,label}` opcional |
| `features` | sim | `items` (3 a 6 `{title,text,image?}`) |
| `showcase3d` | sim | `model` (§4.4), `caption`, `controls` (booleano; mostra botões de girar e pausar) |
| `gallery` | sim | `items` (3 a 8 `{src,alt,caption,width,height}`) |
| `offers` | sim | `items` (2 a 6 `{name,price,unit,tag?,validUntil?}`), `note` |
| `testimonials` | sim | `items` (2 a 4 `{quote,author,role?}`), `consentConfirmed` (booleano; se `false` o selo "Exemplo" é obrigatório, ver `hitamax-landing/SPEC.md:41`) |
| `faq` | sim | `items` (3 a 8 `{question,answer}`) |
| `location` | sim | `showMap` (booleano), `mapQuery` (string), `showHours` (booleano). Usa `business.address` e `business.hours` |
| `contact` | sim | `channels` (lista de `"phone" | "whatsapp" | "email" | "instagram"`), `closing` (frase final). Usa `business` |

### 4.4 Modelo 3D

```
model: {
  kind: "medal" | "glb",
  medal: { texture: "/client/logo-face.png", thickness: 0.16 },     // quando kind = medal
  glb:   { src: "/client/model.glb", scale: 1, rotation: [0,0,0] }, // quando kind = glb
  poster: { src: "/client/model-poster.webp", alt: "string", width: 800, height: 800 },   // obrigatório
  alt: "descrição do objeto para leitor de tela",
  interaction: "both" | "pointer" | "scroll" | "none",   // padrão both
  mobile: "scroll" | "still",                            // padrão still (§7.3)
  maxTiltDeg: 18                                         // 0 a 35
}
```

### 4.5 `client/theme.json`

```
colors: {
  paper, ink,                       // fundo e texto padrão
  brand, brandContrast,             // cor principal e texto sobre ela
  accent, accentContrast,           // destaque e texto sobre ele
  focus,                            // anel de foco
  surfaces: {                       // pares usados por section.tone
    dark:   { bg, fg },
    light:  { bg, fg },
    brand:  { bg, fg },
    accent: { bg, fg }
  }
}
fonts:   { display: FontId, body: FontId }       // FontId vem do catálogo curado abaixo
radius:  "none" | "sm" | "md" | "lg"
density: "compact" | "regular" | "airy"
motion:  { level: "off" | "subtle" | "bold", parallaxRangePx: 0 a 80 }
three:   { ambient, key, fill }                  // cores das luzes e do metal do modelo
```

Catálogo curado de fontes (todas confirmadas no npm, §2.2): `barlow-condensed`, `dm-sans`, `outfit`, `space-grotesk`, `inter`, `fraunces`. Motivo da lista fechada: todas as fontes são servidas localmente, como no Hitamax (`hitamax-landing/styles.css:2-13`), sem requisição a terceiro.

Tokens viram variáveis CSS (`--color-ink`, `--surface-dark-bg`, `--font-display`, `--parallax-range`, ...) injetadas por um `<style>` no `<head>` em tempo de build, para não haver troca de cor visível ao carregar. Os componentes só usam variáveis, nunca hex: isso corrige as cores soltas do Gremio (ANALISE §6).

Regras de validação (script `npm run validate`, também no build):

1. Schema zod passa nos dois arquivos.
2. Contraste WCAG AA (razão mínima 4,5) para cada par `surfaces.*.fg/bg`, `brand/brandContrast`, `accent/accentContrast` e `ink/paper`. O Hitamax calculou pares à mão (`hitamax-landing/SPEC.md:47-59`); aqui é automático.
3. Todo `to` do tipo `#id` aponta para um `id` de seção habilitada (corrige o risco de `GremioLanding/src/App.tsx:298`).
4. `id` único; `hero` presente e primeiro.
5. Todo `src` local existe em `public/`. Imagem tem `alt` não vazio e `width` e `height`.
6. Seções `location`, `contact` e `hero.status` exigem os campos de `business` de que dependem.
7. `check:text`: nenhum travessão (U+2014), traço médio (U+2013) ou sinal de menos tipográfico (U+2212) em `client/*.json` e `docs/*.md`. É uma regra de estilo do dono dos projetos (`hitamax-landing/SPEC.md:226`).

## 5. Seções de exemplo da landing modelo

Marca fictícia "Casa Exemplo" (café e padaria de bairro), com tudo marcado como exemplo. Escolha deliberada de um negócio local: usa todas as seções, inclusive oferta e horário.

| Ordem | `type` | `id` | No menu | Efeito principal |
|---|---|---|---|---|
| 1 | `hero` | `inicio` | sim | título grande, medalhão 3D com ponteiro e rolagem, 3 camadas de parallax |
| 2 | `stats` | `numeros` | não | revelação por rolagem |
| 3 | `about` | `sobre` | sim | imagem com parallax e destaque numérico |
| 4 | `features` | `servicos` | sim | cartões com revelação escalonada |
| 5 | `showcase3d` | `produto-3d` | sim | segundo modelo, arrastar para girar, botões girar e pausar |
| 6 | `gallery` | `galeria` | sim | trilho horizontal com scroll-snap e teclado (de `GremioLanding/src/App.tsx:155-197`) |
| 7 | `offers` | `ofertas` | sim | etiquetas de preço (de `hitamax-landing/styles.css:374-414`) |
| 8 | `testimonials` | `depoimentos` | não | com `consentConfirmed: false` |
| 9 | `faq` | `duvidas` | não | `<details>` nativo |
| 10 | `location` | `onde` | sim | endereço, tabela de horários, "aberto agora", mapa |
| 11 | `contact` | `contato` | sim | canais e frase final |
| fixo | cabeçalho e rodapé | | | rodapé com crédito RBrecci |

Mapa: iframe do Google Maps por consulta de endereço, sem chave, como no Hitamax (`hitamax-landing/index.html:246`), com `loading="lazy"`, só se `showMap` for verdadeiro. Decisão: carregar direto, sem botão de consentimento, porque o link "Abrir rota" cobre a falha do iframe (`hitamax-landing/SPEC.md:117`) e o Hitamax não usa cookie nem rastreio próprio.

## 6. Estratégia de parallax

Princípio: animar só `translate` e `opacity` (não causam layout), nunca por JavaScript a cada quadro quando o navegador faz isso no compositor.

1. **Primário: CSS com timeline de rolagem.** `animation-timeline: view()` dentro de `@supports (animation-timeline: view())`, como em `GremioLanding/src/styles.css:235-261`. Cada elemento recebe `--speed` (de -1 a 1) e a amplitude vem de `--parallax-range` (tema). Keyframes usam `translate`.
2. **Alternativa: observador + variável CSS.** Onde `CSS.supports('animation-timeline: view()')` é falso, `scrollDriver.ts` usa um único listener de rolagem passivo, `requestAnimationFrame` e `IntersectionObserver` para atualizar `--p` (0 a 1) só dos elementos visíveis. O CSS lê `--p` e calcula o mesmo `translate`. Isso cobre navegadores sem a timeline sem Lenis. Não consegui verificar neste ambiente quais navegadores têm `animation-timeline`; o desenho torna isso irrelevante.
3. **Componente `<Parallax speed>`** e atributo equivalente nas imagens de camada do hero. Máximo de 8 elementos com parallax por página (validado em `npm run validate`).
4. **Níveis** (`motion.level`): `off` desliga tudo; `subtle` usa amplitude 50% do `parallaxRangePx`; `bold` usa 100%. Em tela estreita (menos de 769 px) a amplitude cai pela metade e fica ligada. O Gremio desliga abaixo de 769 px (`GremioLanding/src/styles.css:235`), mas o público é majoritariamente mobile (`hitamax-landing/SPEC.md:96`) e o requisito pede efeito chamativo.
5. **Movimento reduzido:** com `prefers-reduced-motion: reduce`, nenhum parallax, nenhuma revelação, rolagem sem suavização (padrão de `GremioLanding/src/styles.css:305-307` e `hitamax-landing/styles.css:526-528`).
6. **Revelação por rolagem** (`<Reveal>`): `IntersectionObserver` com classe `.is-visible`, com a salvaguarda `.js` do Hitamax para o conteúdo aparecer sem JavaScript (`hitamax-landing/styles.css:512-518`). Com pré-renderização, o HTML já vem completo e a classe só é aplicada depois da hidratação.
7. **Hero com camadas:** fundo (grade e brilho), título gigante, modelo 3D, primeiro plano. Velocidades -0,15, 0, 0,25, 0,4 (decisão inicial, ajustável em `content.json`).

## 7. Estratégia de 3D

### 7.1 Biblioteca

`three` + `@react-three/fiber` + `@react-three/drei`, as mesmas do Gremio, versões da §2.2. Alternativas como `<model-viewer>` não foram avaliadas: não há ganho em trocar o que já foi validado nos testes do Gremio.

### 7.2 Formato do modelo

- Dois tipos: `medal` (cilindro e textura do logo, versão genérica do `Medal` de `GremioLanding/src/components/Crest3D.tsx:18-79`) e `glb` (glTF 2.0 binário). O modelo placeholder do template usa `medal` com um logo fictício e `glb` gerado por script, para não depender de arte externa.
- GLB deve passar por `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024`. Orçamento: GLB até 500 KB e textura até 1024 px.
- **Sem Draco.** Confirmei no código instalado que `useGLTF` do drei usa Draco por padrão e busca o decodificador em `https://www.gstatic.com/draco/versioned/decoders/1.5.5/` (`@react-three/drei@10.7.9`, `core/Gltf.js:8-11`). Isso seria requisição a terceiro em runtime e o modelo evita (§5, política do Hitamax em `hitamax-landing/SPEC.md:65`). Chamar sempre `useGLTF(src, false, true)`: assinatura `(path, useDraco?, useMeshopt?, extendLoader?)` em `core/Gltf.d.ts:9`, e o decodificador Meshopt vem embutido no `three-stdlib` (`libs/MeshoptDecoder.js:5-6,132`, o WebAssembly está em strings dentro do arquivo, sem `fetch`). Aceite: nenhuma requisição a `gstatic.com` em e2e.

### 7.3 Carregamento e orçamento

1. O pôster (imagem WebP) é o LCP e vem no HTML pré-renderizado. O canvas nunca bloqueia pintura.
2. `React.lazy(() => import('./Scene'))` com `Suspense` (padrão de `GremioLanding/src/App.tsx:6`). O import só dispara quando o contêiner entra a 200 px da viewport (`IntersectionObserver`) e depois de `requestIdleCallback` (com `setTimeout` de 1 s se não existir).
3. `frameloop="demand"`, `dpr={[1, 1.5]}`, `powerPreference: 'low-power'`, `invalidate()` só enquanto há movimento (`GremioLanding/src/components/Crest3D.tsx:49-56,180-185`).
4. Fora da tela: o `Canvas` é desmontado ao sair da viewport por mais de 1 s, e remontado ao voltar. Libera GPU em páginas com dois modelos.
5. Orçamento: JS inicial até 100 kB gzip; grafo completo do Scene, somando todos os imports estáticos e dinâmicos alcançáveis, até 270 kB gzip; GLB até 500 KB. A definição inclui módulos carregados sob demanda e não permite ocultar bytes repartindo-os em chunks.
6. **Celular:** diferente do Gremio (3D desligado em `pointer: coarse`, ANALISE §7), `mobile: "scroll"` mantém 3D ativo, reagindo só à rolagem, sem tratar ponteiro, com `dpr` máximo 1,5. `mobile: "still"` mantém só o pôster. O padrão operacional do modelo agora é `still` nas duas entradas de modelo, contingência aplicada depois das medições Lighthouse.

### 7.4 Escada de fallback (única, centralizada)

Um módulo `src/motion/prefs.ts` expõe `useCapabilities()` (movimento reduzido, ponteiro grosseiro, `saveData`, WebGL). Substitui a detecção duplicada do Gremio (ANALISE §7). Ordem de decisão em `Model3D`:

1. Primeiro render (servidor e cliente): pôster.
2. Depois de montar, se `prefers-reduced-motion: reduce`, `navigator.connection.saveData === true` ou `interaction: "none"` com `mobile: "still"`: pôster.
3. Sem WebGL (`webgl2` e `webgl` falham): pôster.
4. Erro de carregamento do GLB ou da textura, ou exceção de render: limite de erro mostra o pôster.
5. `webglcontextlost`: pôster, e `webglcontextrestored` volta ao 3D (o Gremio não restaura, ANALISE §7).
6. A mudança da preferência de movimento com a página aberta atualiza o estado (teste dedicado, que o Gremio não tem).

Acessibilidade do 3D: o contêiner tem `role="img"` e `aria-label` vindo de `model.alt`; o canvas é `aria-hidden`. A seção `showcase3d` oferece botões "Girar", "Pausar" e setas do teclado para quem não usa ponteiro. `touch-action: pan-y` para não bloquear a rolagem (`GremioLanding/src/components/Crest3D.css:11`). `OrbitControls` com zoom e pan desligados para não prender a rolagem.

## 8. Metas verificáveis do modelo

| Métrica | Meta | Como medir |
|---|---|---|
| Lighthouse mobile: desempenho | 75 ou mais | `npm run perf` (lighthouse CLI com `--form-factor=mobile`) |
| Lighthouse mobile: acessibilidade e boas práticas | cada uma 90 ou mais | `npm run perf` (lighthouse CLI com `--form-factor=mobile`) |
| Lighthouse mobile: SEO | 90 ou mais quando `site.indexable: true`; caso contrário, é informativo | `npm run perf` (lighthouse CLI com `--form-factor=mobile`) |
| Peso da primeira carga sem o chunk 3D | até 600 KB transferidos (mesma meta do `hitamax-landing/SPEC.md:150`) | `npm run perf`, soma das respostas |
| JS inicial | até 100 kB gzip | `npm run size` |
| Grafo completo do Scene | até 270 kB gzip, somando imports estáticos e dinâmicos alcançáveis | `npm run size` |
| Rolagem horizontal | nenhuma de 320 a 1920 px | e2e |
| Erros de console | zero em carga e rolagem | e2e |
| Violações axe de severidade serious ou critical | zero | e2e com `@axe-core/playwright` |
| Crédito do rodapé | link com `href="https://github.com/rbrecci"` e texto "Desenvolvido por RBrecci" | e2e no HTML pré-renderizado, sem JavaScript |

Calibragem: em 2026-10-11, o coordenador autorizou revisar as metas após as medições. O mínimo Lighthouse passou a 75 para desempenho; acessibilidade, boas práticas e SEO continuam em 90, com SEO avaliado quando o site está indexável. O grafo completo do Scene passou a 270 kB gzip. Os valores preservam um gate verificável sem alterar a definição de soma do grafo. O estado das medições fica registrado em `docs/EVIDENCIAS.md`.

## 9. Riscos e decisões registradas

| Risco | Decisão |
|---|---|
| Hidratação divergente por decisão de ambiente no primeiro render | regra §2.1 e teste e2e de console |
| `sharp` não instalar no sandbox dos workers | T15 é a única que usa; reporta falha, não substitui por outra lib |
| Fontes do catálogo sem `wght.css` esperado | T11 confere o arquivo em `node_modules` antes de listar a fonte |
| Cliente trocar logo por imagem fora de proporção no medalhão | `medal.texture` aceita só PNG ou WebP quadrado; validado por dimensões |
| Depoimentos e avaliações reais | não reproduzir sem autorização (`hitamax-landing/SPEC.md:41`); campo `consentConfirmed` |
| Dados pessoais e CNPJ no rodapé | o schema não tem campo para nome de sócio; `footer.legal` é texto livre revisado pelo agente |
