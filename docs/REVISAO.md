# Revisão independente

Data: 2026-10-11

Escopo: critérios de `docs/ARQUITETURA.md` nas seções 1, 4, 6, 7 e 8, além dos itens de T61 em `docs/PLANO-TAREFAS.md`. A revisão inicial encontrou dois desvios reproduzíveis contra os limites que vigoravam antes da decisão de 2026-10-11.

## Achados

| Severidade | Arquivo e linha | Desvio e reprodução | Correção proposta |
|---|---|---|---|
| resolvido por decisão de critério e gate confirmado | `docs/ARQUITETURA.md` §7.3 e §8; medição em `scripts/size-budget.mjs` | A revisão inicial mediu `Scene completa 267.35 kB` contra o limite anterior de `260 kB`; JavaScript inicial foi `79.75 kB`, abaixo de 100 kB. Em 2026-10-11, o coordenador autorizou teto de 270 kB para a árvore Scene completa, incluindo imports dinâmicos. `npm run size` atualizado saiu com código 0: JS inicial 79.75/100 kB e Scene completa 267.35/270 kB. | Nenhuma ação adicional. O achado foi resolvido pela decisão de critério aprovada e confirmada pelo gate atualizado, não por correção de código. |
| resolvido por decisão de critério e gate confirmado | `docs/ARQUITETURA.md` §8; medição em `scripts/perf-check.mjs` | A execução Lighthouse indexável atualizada saiu com código 0: desempenho 77, acessibilidade 100, boas práticas 100, SEO 92 e transferência 223872 bytes. Ela atende aos critérios atuais: mínimo 75 para desempenho e 90 para as demais categorias. As execuções anteriores 86 e 76 mantêm seus códigos históricos 1, sob limites antigos. | Nenhuma ação adicional. O achado foi resolvido pela decisão de critério aprovada e confirmada pelo gate atualizado, não por correção de código. |

Os achados de Lighthouse e tamanho foram encerrados por decisão explícita de critério e confirmação pelos gates atualizados, não por correção de código.

## Verificado sem desvio

- Rodapé pré-renderizado sem JavaScript: `npx playwright test e2e/footer.spec.ts e2e/layout.spec.ts e2e/a11y.spec.ts e2e/webgl.spec.ts` passou nos 12 testes. A inspeção de `dist/index.html` com JSDOM encontrou 12 filhos no elemento `#root`, o crédito `Desenvolvido por RBrecci`, o link `https://github.com/rbrecci`, sem `<canvas>` e sem `gstatic.com`.
- Dados de marca e cores: `rg -n "Casa Exemplo" src`, `rg -n "#[0-9a-fA-F]{3,8}\b" src --glob "*.css"` saíram com código 1. Não encontrei texto da marca ou cores hexadecimais nos componentes e folhas CSS de `src/`.
- Draco e rede externa: `rg -n "gstatic|Draco" src` saiu com código 1. `src/three/GlbModel.tsx:3-8` usa `GLTFLoader` e registra `MeshoptDecoder`, sem `useGLTF`. As URLs de mapa em `src/sections/location/Location.tsx:41-42` correspondem ao mapa e à rota previstos em `docs/ARQUITETURA.md:247`. Os dois testes de `e2e/webgl.spec.ts` passaram, incluindo a verificação de ausência de requisições a `gstatic.com` com SwiftShader.
- GLB: `npx gltf-transform validate public/client/model.glb` saiu com código 0, sem erros ou avisos. O validador reportou como informação que não valida `EXT_meshopt_compression` e que há um buffer possivelmente não usado; o loader da aplicação fornece o decodificador Meshopt diretamente.
- Pôster e perda de contexto: `npx vitest run tests/scripts/prerender.test.ts tests/three/model3d.test.tsx tests/content/links.test.ts tests/content/schema.test.ts tests/scripts/vite-plugin.test.ts` passou nos 52 testes. Os testes de `tests/three/model3d.test.tsx:159-183` cobrem indisponibilidade de WebGL e perda e restauração de contexto. O E2E de WebGL também passou com WebGL indisponível e com SwiftShader.
- Seções desativadas e links: `npx vitest run tests/app/app.test.tsx tests/content/links.test.ts tests/content/schema.test.ts` passou nos 35 testes. `src/App.tsx:8,17-19` filtra as seções habilitadas antes de renderizar; `src/content/schema.ts:183-221` valida os links contra as seções habilitadas.
- Tipografia: `rg -n "font-size\\s*:\\s*(0?\\.(?:[0-6][0-9]*)rem|(?:[0-9]|1[01])px)" src --glob "*.css"` saiu com código 1. Não há regra de texto abaixo de 12 px nos CSS de `src/`.
- Papel de progresso: `rg -n "progressbar" src` saiu com código 1. Não há ocorrência do papel `progressbar` em `src/`; os critérios consultados não exigem esse papel.
- Dimensões das imagens: a leitura de todos os usos `<img` em `src/` confirmou atributos `width` e `height`, recebidos dos dados validados ou declarados nas camadas decorativas do hero. `src/content/schema.ts:6-11` exige dimensões no schema de imagem.
- Marcadores pendentes: `rg -n "TODO|FIXME" src scripts tests e2e` saiu com código 1.
- SEO: `npx vitest run tests/scripts/prerender.test.ts tests/three/model3d.test.tsx tests/content/links.test.ts tests/content/schema.test.ts tests/scripts/vite-plugin.test.ts` passou nos 52 testes. A inspeção de `dist/index.html` encontrou título, descrição, `robots` com `noindex, nofollow`, Open Graph, JSON-LD e variáveis de tema. A geração está em `scripts/vite-plugin-client.ts:44-86`.
- Hidratação e layout: os sete tamanhos de viewport do E2E em `e2e/layout.spec.ts` passaram sem overflow ou mensagens de hidratação.
- Movimento: `npx playwright test e2e/motion.spec.ts` passou nos dois testes de movimento normal e reduzido. Uma medição direta em Chromium confirmou que o `translate` muda em rolagens de 0, 500, 1000 e 1500 px.
- Validação de conteúdo: `npm run validate` saiu com código 0 e informou que conteúdo e tema são válidos.
- Documentação e workflows: `npx vitest run tests/docs tests/skills` passou nos 12 testes. `yaml.safe_load` aceitou os dois arquivos em `.github/workflows/`; a conferência de SHAs de ações e de `npm run build` encontrou os comandos esperados em CI e publicação.
- Cores de tema: os valores hexadecimais ficam em `client/theme.json`, conforme a fronteira de customização da arquitetura. A busca em CSS de `src/` não encontrou valores hexadecimais.

## Não medido nesta revisão

A revisão não mediu celular físico, leitor de tela, teclado em dispositivo real ou WebGL em GPU física.
