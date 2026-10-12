# LandingBuilder

Modelo de site estático para criar landing pages de clientes a partir de conteúdo e tema em JSON. O exemplo que vem no repositório é uma demonstração fictícia. Consulte [docs/CUSTOMIZACAO.md](docs/CUSTOMIZACAO.md) antes de substituir os dados.

O projeto usa Node 24, npm, Vite, React e TypeScript. O HTML é pré-renderizado no build e publicado como arquivos estáticos.

## Instalação

Instale o Node 24 e clone ou copie este repositório para uma pasta de trabalho. Na raiz do projeto, rode:

```sh
npm ci
npm run dev
```

O Vite mostra o endereço local no terminal. Para criar e validar o site, consulte a lista de comandos abaixo. `npm run build` valida os arquivos do cliente, gera os schemas, verifica tipos, constrói as versões de navegador e servidor e pré-renderiza `dist/index.html`.

## Personalizar para um cliente

1. Copie o repositório para a pasta ou repositório do novo cliente.
2. Edite `client/content.json` e `client/theme.json`.
3. Troque os recursos em `public/client/` e registre origem e autorização em `docs/ASSETS.md`.
4. Rode `npm run validate`, `npm run check:text` e `npm run build`.
5. Rode `npm run size` e `npm run e2e` antes de publicar.

Os dados e recursos de cada cliente ficam em `client/` e `public/client/`. Mudanças no schema ou no comportamento do modelo pertencem ao código comum em `src/`, não a um ajuste exclusivo para um cliente.

## Comandos disponíveis

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite. |
| `npm run typecheck` | Verifica tipos com TypeScript. |
| `npm run lint` | Executa ESLint no projeto. |
| `npm run test` | Executa os testes Vitest uma vez. |
| `npm run validate` | Valida conteúdo, tema, links, contraste e arquivos locais. |
| `npm run check:text` | Procura os caracteres de pontuação proibidos em `client/` e `docs/`. |
| `npm run gen:schema` | Gera `client/content.schema.json` e `client/theme.schema.json`. |
| `npm run build:client` | Gera os arquivos de navegador em `dist/`. |
| `npm run build:server` | Gera o bundle SSR em `dist-ssr/`. |
| `npm run prerender` | Grava o HTML pré-renderizado em `dist/index.html`. Requer os builds de cliente e servidor. |
| `npm run build` | Roda validação, geração de schemas, typecheck, builds e pré-renderização. |
| `npm run preview` | Serve o conteúdo de `dist/` localmente. Requer build anterior. |
| `npm run e2e` | Executa os testes Playwright no Chromium. Requer build e Chromium instalado com `npx playwright install chromium`. |
| `npm run size` | Compara JavaScript inicial e o grafo completo de `Scene`, incluindo imports dinâmicos alcançáveis, com os limites gzip do projeto. Código diferente de zero indica estouro ou erro de medição. |
| `npm run perf` | Mede a versão mobile com Lighthouse. Requer build e Chrome disponível. Aceita `--url URL` e `--min N`; sem URL inicia preview na porta 4173. O critério de aceitação é desempenho 75, acessibilidade e boas práticas 90, e SEO 90 quando o site é indexável. |
| `npm run assets:optimize -- public/client` | Gera variantes WebP para imagens da pasta indicada. |
| `npm run assets:placeholders` | Regenera as imagens e o modelo demonstrativos em `public/client/`, substituindo esses recursos. |
| `npm run check` | Executa lint, typecheck, testes, validação de conteúdo e verificação de texto. |

## Skill e agente

No Claude Code, a skill pode ser chamada como `/landing-cliente nome-do-cliente`. O agente correspondente está em `.claude/agents/landing-cliente.md`. Ambos seguem a fronteira de customização descrita em [docs/CUSTOMIZACAO.md](docs/CUSTOMIZACAO.md).

## Publicação

O fluxo `.github/workflows/deploy.yml` publica no GitHub Pages quando há push para `main` ou disparo manual. O workflow calcula `VITE_BASE_PATH` para projetos de usuário e de repositório, ou aceita a variável de repositório `VITE_BASE_PATH`. Ele roda `npm run check`, `npm run build`, `npm run size` e `npm run e2e` antes de publicar. Para publicar, configure Pages para usar GitHub Actions nas configurações do repositório.

O rodapé contém o crédito fixo **Desenvolvido por RBrecci**, com link para [github.com/rbrecci](https://github.com/rbrecci). Esse crédito não é um campo de conteúdo e não pode ser removido por configuração.

## Licença

Todos os direitos reservados, conforme o arquivo `LICENSE`. O repositório é público para consulta e demonstração, e o uso comercial por cliente depende de autorização do titular. A marca fictícia "Casa Exemplo" da landing modelo é mantida como exemplo e é trocada por cliente em `client/content.json`.

## Limitações conhecidas

- `client/` contém dados fictícios da Casa Exemplo. Não publique esses textos como informações reais de um cliente.
- Os limites aprovados em 2026-10-11 são desempenho Lighthouse 75, acessibilidade e boas práticas 90, SEO 90 quando indexável, e 270 kB gzip para o grafo completo de `Scene`, incluindo imports dinâmicos alcançáveis. O JavaScript inicial continua limitado a 100 kB gzip. Consulte `docs/ARQUITETURA.md` e `docs/EVIDENCIAS.md` para os resultados verificados.
- A validação manual do modelo base em celular, com leitor de tela e teclado, e a publicação pelo GitHub Actions foram confirmadas em 2026-10-11. Repita as verificações relevantes depois de personalizar uma landing para um cliente.
- A configuração dos workflows é documentada em `.github/workflows/ci.yml` e `.github/workflows/deploy.yml`. A execução remota depende do GitHub Actions do repositório.
