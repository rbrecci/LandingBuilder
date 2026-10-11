# Análise dos projetos de origem

Escopo: `GremioLanding` (React + Vite + TypeScript, 3D) e `hitamax-landing` (HTML, CSS e JS puros). Todos os dois repositórios foram lidos por inteiro (código, estilos, testes, workflow, SPEC, docs e pesquisa). Convenção de citação: `repo/arquivo:linha`. Quando algo vem de comando que eu mesmo rodei, a citação aponta o comando. O que é opinião minha está marcado como "avaliação".

## 1. Stack

| Item | GremioLanding | hitamax-landing |
|---|---|---|
| Linguagem e UI | React 19, TypeScript 5.9 (`GremioLanding/package.json:19,36`) | HTML, CSS e JS puros, sem build (`hitamax-landing/SPEC.md:134`) |
| Build | Vite 8 e `@vitejs/plugin-react` (`GremioLanding/package.json:31,38`, `GremioLanding/vite.config.ts:4-7`) | nenhum. Arquivos servidos como estão (`hitamax-landing/SPEC.md:134`) |
| 3D | `three` 0.186, `@react-three/fiber` 9, `@react-three/drei` 10 (`GremioLanding/package.json:17,18,21`) | não tem |
| Testes | Vitest 5 e Testing Library, 9 testes (`GremioLanding/src/App.test.tsx:51-180`) | nenhum arquivo de teste versionado. `script.js` exporta funções para teste em Node (`hitamax-landing/script.js:144-146`), mas `git ls-files` não lista teste nem `package.json` |
| Lint e tipos | ESLint 10 flat config com `typescript-eslint` e `react-hooks` (`GremioLanding/eslint.config.js:6-16`), `tsc --noEmit` (`GremioLanding/package.json:8`) | nenhum |
| Fontes | pacotes Fontsource importados em JS (`GremioLanding/src/main.tsx:3-6`) | `woff2` próprios em `assets/fonts/` com `preload` (`hitamax-landing/index.html:17-18`, `hitamax-landing/styles.css:2-13`) |
| Deploy | GitHub Pages por Actions, Node 24, ações fixadas por SHA, base path calculada (`GremioLanding/.github/workflows/deploy.yml:25-44`) | GitHub Pages direto da `main` (`hitamax-landing/SPEC.md:141`) |

Verificação própria (cópia de `GremioLanding` em diretório temporário, `npm ci`, `npm test`, `npm run build`, Node 22.22.0): 9 de 9 testes passaram; o build gerou `Crest3D-*.js` com 916,42 kB (gzip 243,41 kB), `index-*.js` com 243,66 kB (gzip 75,16 kB) e `index-*.css` com 29,00 kB (gzip 6,66 kB). Isso bate com o registrado em `GremioLanding/docs/REVIEW.md:31` (916,44 kB e 243,42 kB). `npm ci` emitiu avisos EBADENGINE porque o Node local era 22.22.0 e algumas dependências pedem 22.22.2 ou superior (a mesma exigência está em `GremioLanding/docs/README.md:11`).

## 2. Estrutura de pastas

`GremioLanding`: `src/App.tsx` (319 linhas, todas as seções num componente só), `src/components/Crest3D.tsx` e `.css`, `src/data/content.ts` (63 linhas), `src/styles.css` (307 linhas), `public/` (escudo e 4 imagens), `docs/` (`DESIGN.md`, `ASSETS.md`, `CONTENT_PENDING.md`, `REVIEW.md`, `PROMPT.md`, `README.md`) e o workflow (`GremioLanding/docs/README.md:59-67`).

`hitamax-landing`: `index.html` (270 linhas), `styles.css` (576), `script.js` (146), `assets/` (WebP em 2 larguras, fontes, favicon, `MANIFEST.md`), `research/` (2 arquivos) e `SPEC.md` (269 linhas).

Avaliação: a estrutura do Hitamax é a mais simples de entender, a do Gremio é a que escala para componentes. Nenhuma das duas separa "o que muda por cliente" numa pasta própria.

## 3. Como o conteúdo é modelado

### GremioLanding

- Existe `src/data/content.ts` com quatro exports: `club`, `navigation`, `gallery`, `demoUpdates` (`GremioLanding/src/data/content.ts:1,11,23,50`). Os valores têm `as const`, mas não há schema nem validação em tempo de execução.
- A maior parte do texto não está nesse arquivo. Está escrita dentro do JSX: título e texto da história (`GremioLanding/src/App.tsx:252`), texto da arena (`:260`), lista de módulos do futebol (`:272-274`), links da comunidade (`:298`), vagas de parceiros (`:303`), contato (`:309-310`) e rodapé (`:314`).
- A navegação do cabeçalho filtra por ids escritos à mão (`GremioLanding/src/App.tsx:209`), então a lista `navigation` não controla sozinha o que aparece.
- A numeração das seções é digitada (`"01 / 08"` em `GremioLanding/src/App.tsx:250,259,269,280,287,296,302,308`). Desligar uma seção deixaria a contagem errada.
- Os atalhos da comunidade apontam para `#contato`, `#futebol` e `#parceiros` (`GremioLanding/src/App.tsx:298`). Se uma seção for removida, o link fica quebrado sem aviso.
- O nome do cliente está em rótulos de acessibilidade (`GremioLanding/src/App.tsx:15,204,237`) e no `aria-label` do 3D (`GremioLanding/src/components/Crest3D.tsx:175`), e no HTML estático (`GremioLanding/index.html:8,11,14`), que não passa pelo React.

### hitamax-landing

- Não há arquivo de dados. O conteúdo vive no HTML (`hitamax-landing/index.html:65-250`).
- O horário é a exceção bem resolvida: a tabela do HTML é a fonte única, com `data-dia`, `data-abre` e `data-fecha`, e o script lê a tabela (`hitamax-landing/SPEC.md:114`, `hitamax-landing/script.js:60-75`). Isso é um bom padrão de "um dado, dois usos".
- Existe um contrato de ids e atributos entre HTML e JS, documentado (`hitamax-landing/SPEC.md:178`).
- Há uma constante de estado do conteúdo, `HORARIO_CONFIRMADO` (`hitamax-landing/script.js:3`), que liga e desliga o aviso "a confirmar" (`hitamax-landing/script.js:48`).
- Dados do cliente também estão no JSON-LD (`hitamax-landing/index.html:21-35`), nos metadados (`:6-15`), no `tel:` (`:73`) e no rodapé com CNPJ (`:262`).

## 4. Como o 3D e os efeitos funcionam

### 3D (só no GremioLanding)

- Não usa arquivo de modelo. O "medalhão" é montado com primitivas (cilindro, círculo, torus) mais uma textura PNG do escudo (`GremioLanding/src/components/Crest3D.tsx:59-78`). Não há GLB, Draco ou Meshopt no repositório.
- O módulo é carregado sob demanda com `React.lazy` (`GremioLanding/src/App.tsx:6`) e fica dentro de `Suspense` e de um limite de erro (`:25-35,60`).
- Renderização sob demanda: `frameloop="demand"`, `dpr={[1, 1.75]}`, `powerPreference: 'low-power'` (`GremioLanding/src/components/Crest3D.tsx:180-185`). O `useFrame` só chama `invalidate()` enquanto o objeto ainda não chegou ao alvo (`:49-56`).
- Interação: ponteiro inclina o objeto até 0,16 e 0,31 rad (`:152-161`), rolagem desloca e gira (`:117-129,39-42`), hover aumenta a escala 4,5% (`:41`). O amortecimento é exponencial e limita o delta (`:38`).
- O fallback é uma imagem 2D do escudo (`:193-195`), usada quando: movimento reduzido, ponteiro `coarse`, sem WebGL (`:99-102`), perda de contexto (`:143-148`) ou erro de renderização (`GremioLanding/src/App.tsx:25-35`).

### Parallax e revelações

- Parallax é CSS puro com timeline de rolagem: `animation-timeline: view()` sob `@supports`, só com largura mínima de 769 px e `prefers-reduced-motion: no-preference` (`GremioLanding/src/styles.css:235-261`). Só dois elementos usam: a imagem da arena e o ano 1974 (`:237-249`).
- A barra de progresso usa `animation-timeline: scroll(root block)` (`GremioLanding/src/styles.css:39-46`) com alternativa em JS (`GremioLanding/src/App.tsx:63-90`).
- O título do hero entra por `@keyframes` (`GremioLanding/src/styles.css:97-98,232`).
- Reduced motion: regra global que zera durações (`GremioLanding/src/styles.css:305-307`) e `scrollIntoView` instantâneo (`GremioLanding/src/App.tsx:159`).
- No Hitamax, a única animação é a entrada por rolagem: `IntersectionObserver` adiciona `.is-visible` (`hitamax-landing/script.js:128-141`), com `.js` no `<html>` para não esconder conteúdo sem JavaScript (`hitamax-landing/script.js:6`, `hitamax-landing/styles.css:512-518`) e desligada sob movimento reduzido (`hitamax-landing/script.js:129`, `hitamax-landing/styles.css:526-528`). Não há parallax nem 3D.

## 5. O que é reaproveitável

| Peça | Origem | Motivo |
|---|---|---|
| Padrão de 3D sob demanda: `frameloop="demand"`, `invalidate()` só quando há movimento, `dpr` limitado, lazy import | `GremioLanding/src/components/Crest3D.tsx:180-185,49-56`, `GremioLanding/src/App.tsx:6` | reduz custo de GPU em repouso |
| Escada de fallback: erro de renderização, WebGL ausente, contexto perdido, movimento reduzido | `GremioLanding/src/App.tsx:25-35`, `GremioLanding/src/components/Crest3D.tsx:81-88,143-148` | coberta por testes (`GremioLanding/src/App.test.tsx:133-166`) |
| Parallax por timeline de rolagem em CSS, com `@supports` e `prefers-reduced-motion` | `GremioLanding/src/styles.css:235-261` | roda no compositor, sem JS por quadro |
| Menu mobile com trava de foco, Escape e retorno de foco | `GremioLanding/src/App.tsx:126-153` | acessibilidade já testada (`GremioLanding/src/App.test.tsx:52-70`) |
| Galeria horizontal com scroll-snap, teclado e arraste | `GremioLanding/src/App.tsx:155-197,289`, `GremioLanding/src/styles.css:169-175` | pronta para virar seção |
| Indicador de seção atual com `IntersectionObserver` | `GremioLanding/src/App.tsx:113-124` | pode ser gerado a partir da lista de seções |
| Workflow de deploy com base path automática | `GremioLanding/.github/workflows/deploy.yml:33-44` | serve para qualquer repositório de cliente |
| Tokens de cor em `:root` | `GremioLanding/src/styles.css:8-16`, `hitamax-landing/styles.css:16-33` | ponto de partida para o tema |
| "Aberto agora" calculado no fuso `America/Sao_Paulo` a partir da tabela | `hitamax-landing/script.js:17-41,60-93` | recurso valioso para comércio local; vira função pura testável |
| Imagens em duas larguras com `srcset`, `width`/`height` e `preload` do hero | `hitamax-landing/index.html:19,83-88,110` | reduz peso e salto de layout |
| Fontes próprias com `font-display: swap` | `hitamax-landing/styles.css:2-13` | tirou o CSS do Google Fonts do caminho crítico (`hitamax-landing/SPEC.md:65`) |
| Sistema de rótulos para conteúdo não confirmado (exemplo, a confirmar) | `hitamax-landing/SPEC.md:16`, `GremioLanding/docs/ASSETS.md:3` | útil para o fluxo de briefing do agente |
| Registro de origem e licença dos recursos | `GremioLanding/docs/ASSETS.md:5-15`, `hitamax-landing/assets/MANIFEST.md:5-12` | vira checklist por cliente |
| Disciplina de evidência: critérios de aceite com saída colada | `hitamax-landing/SPEC.md:215-228` | formato dos critérios do plano |

Métricas do Hitamax que servem de referência: Lighthouse mobile com desempenho 98, acessibilidade 100, boas práticas 100 (`hitamax-landing/SPEC.md:259-261`), 441 KiB na primeira carga (`:263`). São medições do próprio projeto, não repeti.

## 6. O que é específico demais do cliente

- `Crest3D` inteiro: textura, proporções do recorte (`repeat 0.886`, `offset 0.057`), cores dos materiais e das luzes (`GremioLanding/src/components/Crest3D.tsx:22-29,63,71,75,189-190`) e `aria-label` (`:175`).
- Todo o texto de `App.tsx` e o `club` do `content.ts` (`GremioLanding/src/data/content.ts:1-9`).
- Seções "Futebol", "Em campo", "Faça parte" e "Parceiros" são do domínio de clube esportivo (`GremioLanding/src/App.tsx:268-305`).
- Avisos de "proposta independente" e "dados demonstrativos" (`GremioLanding/src/App.tsx:233,252,283,304`).
- Paleta de azul e dourado, inclusive cores soltas fora dos tokens: `#101c27` (`GremioLanding/src/styles.css:150`), `#0a2c4b` (`:208`), `#164b6c` (`:131,146`).
- Hitamax: departamentos de mercado, etiquetas de preço, tabela de horários com dias, mapa, CNPJ, telefone, JSON-LD `GroceryStore` e `og:image` com URL absoluta do projeto (`hitamax-landing/index.html:14-15,21-35,103-250,262`).
- Hitamax: nomes de classe e de tokens em português (`--verde`, `--creme`) amarram o CSS à paleta (`hitamax-landing/styles.css:17-23`).

## 7. Fraquezas

### Acessibilidade

- Gremio tem boa base: link para pular conteúdo (`GremioLanding/src/App.tsx:201`), `aria-current` (`:210`), foco visível (`GremioLanding/src/styles.css:25`), trava de foco no menu (`GremioLanding/src/App.tsx:132-145`). Hitamax tem link para pular (`hitamax-landing/index.html:38`), foco visível (`hitamax-landing/styles.css:70-74`), `aria-expanded` no menu (`hitamax-landing/script.js:108`) e `aria-current="date"` na tabela (`hitamax-landing/script.js:81`).
- Texto muito pequeno e com baixa opacidade no Gremio: fontes de 9 a 11 px e `opacity: .55` na linha superior das seções (`GremioLanding/src/styles.css:55,83,91`). Avaliação: provável falha de contraste AA nesses trechos. Não medi.
- A barra de progresso é um `role="progressbar"` sempre visível (`GremioLanding/src/App.tsx:86`). Avaliação: ruído para leitor de tela, e não foi testada com um (`GremioLanding/docs/REVIEW.md:37`).
- Nenhum dos dois foi testado com leitor de tela ou teclado completo em ambiente real. O próprio `REVIEW.md` registra isso (`GremioLanding/docs/REVIEW.md:9,37-39`).
- Menu do Hitamax sem trava de foco (`hitamax-landing/script.js:103-126`). Para um menu em dropdown é aceitável; para tela cheia não seria.

### Performance

- O chunk 3D do Gremio é grande: 916,42 kB, 243,41 kB com gzip (build que rodei). A revisão do projeto admite que não há medição de fluidez (`GremioLanding/docs/REVIEW.md:31-33`).
- Imagens do Gremio sem `srcset` e sem `width`/`height` nas `<img>` de conteúdo (`GremioLanding/src/App.tsx:262,276,290`), com 216 a 368 KB cada (`du -sh GremioLanding/public/*`). Risco de salto de layout (avaliação). O Hitamax resolveu isso (`hitamax-landing/index.html:83-88,110`).
- O build do Gremio emite fontes `woff` e `woff2` (listagem do build que rodei), embora só `woff2` seja necessário em navegadores atuais (avaliação).
- A página do Gremio é renderizada só no cliente: o `index.html` tem `<div id="root">` vazio (`GremioLanding/index.html:17`). Sem pré-renderização, o LCP depende do JavaScript (avaliação, não medi).
- `Crest3D` lê `getBoundingClientRect()` a cada evento de rolagem (`GremioLanding/src/components/Crest3D.tsx:117-129`). É passivo e barato, mas é leitura de layout em caminho quente (avaliação).

### `prefers-reduced-motion`

- Gremio cobre CSS, 3D e rolagem suave (`GremioLanding/src/styles.css:305-307`, `GremioLanding/src/App.tsx:38-42,159`, `GremioLanding/src/components/Crest3D.tsx:99-102`). A detecção está duplicada em dois lugares (`GremioLanding/src/App.tsx:38-56` e `GremioLanding/src/components/Crest3D.tsx:99-112`), o que convida a divergência.
- Hitamax cobre revelações e rolagem suave (`hitamax-landing/script.js:129`, `hitamax-landing/styles.css:41-43,526-528`).
- A mudança dinâmica da preferência não tem teste (`GremioLanding/docs/REVIEW.md:37`).

### Fallback sem WebGL

- Existe e funciona por detecção (`GremioLanding/src/components/Crest3D.tsx:81-88`), por erro (`GremioLanding/src/App.tsx:25-35`) e por perda de contexto (`GremioLanding/src/components/Crest3D.tsx:143-148`). Falhas: depois da perda de contexto não há tentativa de recuperar (`webglFailed` fica `true`, `:95,102`); e perda real de contexto e falha real de textura nunca foram reproduzidas em navegador (`GremioLanding/docs/REVIEW.md:15`). Os testes trocam o módulo 3D por um mock (`GremioLanding/src/App.test.tsx:8-14`), então o renderizador real não tem teste automatizado.
- Decisão que afeta o requisito de "efeito chamativo": ponteiro `coarse` desliga o 3D por completo (`GremioLanding/src/App.tsx:41`, `GremioLanding/src/components/Crest3D.tsx:102`). Em celular, a maioria do público do bairro (`hitamax-landing/SPEC.md:96`), o 3D nunca aparece.
- Leitura de movimento do ponteiro com `touch-action: pan-y` (`GremioLanding/src/components/Crest3D.css:11`) preserva a rolagem vertical; isso é correto.

### Outras

- Parallax só em 2 elementos e só em tela larga (`GremioLanding/src/styles.css:235-261`); Hitamax sem parallax. Para o requisito de efeitos chamativos, falta camada e variedade.
- Suporte a `animation-timeline` varia por navegador. Não consegui verificar a tabela de compatibilidade neste ambiente: tratar como incerto e prever alternativa em JS (ver `ARQUITETURA.md`).
- Crédito do desenvolvedor: o Gremio linka o LinkedIn (`GremioLanding/src/App.tsx:314`, `GremioLanding/docs/README.md:73`), não o GitHub. O Hitamax diz "criada por Saker" sem link (`hitamax-landing/index.html:263`). Nenhum cumpre o requisito de "Desenvolvido por RBrecci" apontando para `https://github.com/rbrecci`.
- `noindex, nofollow` fixo nos dois (`GremioLanding/index.html:7`, `hitamax-landing/index.html:8`) e sem `og:image` no Gremio (`GremioLanding/index.html:9-12`). O Hitamax documenta que o `noindex` derruba o SEO para 63 (`hitamax-landing/SPEC.md:149`).
- Metadados do `index.html` do Gremio não dependem do conteúdo (`GremioLanding/index.html:8-14`).
- Mistura de CSS desktop-first no Gremio (`GremioLanding/src/styles.css:263,270,295`) e mobile-first no Hitamax (`hitamax-landing/styles.css:531,539`).
- `README` e `REVIEW` do Gremio dependem de Node 22.22.2 ou superior (`GremioLanding/docs/README.md:11`); no ambiente que usei (22.22.0) a instalação avisa.

## 8. O que não foi verificado nesta análise

- Nenhum navegador foi aberto: não medi Lighthouse, fluidez do 3D, contraste real ou comportamento em celular.
- Compatibilidade de `animation-timeline` nos navegadores-alvo.
- Números de Lighthouse e de peso do Hitamax vêm do `SPEC.md`, não os reproduzi.
