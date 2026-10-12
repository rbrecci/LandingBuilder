# Guia de customização

Use este guia ao transformar a demonstração em uma landing de cliente. O modelo recebe texto, opções e tema por JSON. Os componentes e a estrutura são compartilhados entre clientes.

## Fronteira dos arquivos

Para uma nova landing, copie o repositório e personalize:

- `client/content.json`: dados do site, negócio, navegação, seções e rodapé legal.
- `client/theme.json`: cores, fontes, raio, densidade, movimento e luzes do modelo.
- `public/client/`: logo, favicon, imagens, pôsteres e arquivos GLB.
- `docs/ASSETS.md`: origem e autorização dos recursos substituídos.

Não edite `client/content.schema.json` ou `client/theme.schema.json`, pois são gerados por `npm run gen:schema`. Se faltar campo ou comportamento necessário, a mudança deve ser feita no schema e nos componentes comuns em `src/`.

## Conteúdo e regras gerais

`client/content.json` contém `site`, `brand`, `business`, `nav`, `sections` e `footer`. `business` é necessário para os recursos de localização e contato que dependem dele. O campo `$schema` aponta para `./content.schema.json` e pode oferecer autocompletar no editor.

Cada seção tem `type`, `title`, `data` e pode ter `id`, `enabled`, `navLabel`, `tone`, `eyebrow`, `intro`, `placeholder` e `parallax`. A ordem de `sections` é a ordem da página. A seção `hero` precisa ser a primeira e permanecer habilitada. O `id` deve ser único. Links que começam por `#` precisam apontar para uma seção habilitada. O título aceita até 80 caracteres e a introdução até 280.

Use `enabled: false` para ocultar uma seção sem removê-la dos dados. O menu inclui somente seções habilitadas com `navLabel`. Atualize CTAs, menu e links internos quando mudar os IDs ou desligar seções. Os tons aceitos são `dark`, `light`, `brand` e `accent`. O parallax pode ser `off`, `subtle` ou `bold`.

## Tipos de seção e exemplo mínimo

Os exemplos abaixo mostram o formato de `type` e `data`. Acrescente os campos comuns, textos reais autorizados e IDs necessários ao restante do conteúdo. Os limites indicados vêm do schema em `src/content/schema.ts`.

| Tipo | Dados e quantidade |
|---|---|
| `hero` | `headline`, `subheadline`, de 1 a 2 `ctas`, `model`, `layers` opcional de até 3 imagens e `status`. É a primeira seção e não pode ser desligada. |
| `stats` | `items` de 2 a 4, cada um com `value`, `label` e `note` opcional. |
| `about` | `paragraphs` de 1 a 3, `image` com `src`, `alt`, `width` e `height`; `highlight` é opcional. |
| `features` | `items` de 3 a 6, cada um com `title`, `text` e imagem opcional. |
| `showcase3d` | `model`, `caption` e `controls`. |
| `gallery` | `items` de 3 a 8, cada um com imagem, descrição alternativa e `caption`. |
| `offers` | `items` de 2 a 6 com `name`, `price`, `unit` e campos opcionais `tag` e `validUntil`; `note` é obrigatório. |
| `testimonials` | `items` de 2 a 4 com `quote`, `author` e `role` opcional, além de `consentConfirmed`. |
| `faq` | `items` de 3 a 8 com `question` e `answer`. |
| `location` | `showMap`, `mapQuery` e `showHours`. Endereço e horários dependem de `business`. |
| `contact` | `channels`, usando `phone`, `whatsapp`, `email` ou `instagram`, e `closing`. Cada canal exige o dado correspondente em `business`. |

Exemplo de seção de perguntas:

```json
{
  "type": "faq",
  "id": "duvidas",
  "enabled": true,
  "title": "Dúvidas frequentes",
  "data": {
    "items": [
      { "question": "Qual é o horário?", "answer": "Informe o horário confirmado pelo cliente." },
      { "question": "Onde fica?", "answer": "Informe o endereço confirmado pelo cliente." },
      { "question": "Como entrar em contato?", "answer": "Use os canais confirmados pelo cliente." }
    ]
  }
}
```

### Imagens e modelo 3D

Imagens locais usam caminhos iniciados por `/client/`. Informe `alt` não vazio e dimensões positivas `width` e `height`. O script de validação verifica se os arquivos referenciados existem em `public/`.

O modelo pode ser uma medalha com textura PNG ou WebP quadrada, ou um GLB. Ambos exigem `poster` com caminho, texto alternativo e dimensões, além de `alt` do objeto. Exemplo de configuração GLB:

```json
{
  "kind": "glb",
  "glb": { "src": "/client/model.glb", "scale": 1, "rotation": [0, 0, 0] },
  "poster": { "src": "/client/model-poster.webp", "alt": "Vista do produto", "width": 1440, "height": 900 },
  "alt": "Modelo tridimensional do produto",
  "interaction": "both",
  "mobile": "scroll",
  "maxTiltDeg": 18
}
```

Para preparar um GLB, use glTF 2.0 e a compressão Meshopt. O modelo não usa Draco. Este comando cria o arquivo otimizado:

```sh
npx gltf-transform optimize produto.glb public/client/model.glb --compress meshopt --texture-compress webp --texture-size 1024
```

Configure o modelo `kind` como `glb` e confira que `src` termina em `.glb`. O pôster continua necessário porque é exibido antes do canvas 3D.

### Tema

Edite `client/theme.json`. `colors` define papel, texto, marca, destaque, foco e os pares de fundo e texto de cada tom. `fonts.display` e `fonts.body` aceitam `barlow-condensed`, `dm-sans`, `outfit`, `space-grotesk`, `inter` ou `fraunces`. `radius` aceita `none`, `sm`, `md` ou `lg`; `density` aceita `compact`, `regular` ou `airy`. `motion.level` aceita `off`, `subtle` ou `bold`, com `parallaxRangePx` de 0 a 80. `three` define as cores `ambient`, `key` e `fill`. A validação rejeita pares de texto e fundo com contraste abaixo de 4,5.

## Dados fictícios, consentimento e crédito

Não invente endereço, horário, preço, depoimento ou dado da empresa. Marque conteúdo de exemplo com `placeholder: true` e mantenha `site.indexable` como `false` até os dados serem confirmados. Depoimentos exigem autorização: sem consentimento, use `consentConfirmed: false` e `placeholder: true`.

O rodapé sempre mostra **Desenvolvido por RBrecci** com link para `https://github.com/rbrecci`. Esse crédito é fixo na aplicação, não é configurável por `footer` e não pode ser removido durante a customização.

## Fluxo de trabalho e validação

1. Confirme com o cliente marca, textos, contatos, endereço, horários, links, imagens e autorização de uso.
2. Edite os dois arquivos JSON e substitua os recursos em `public/client/`.
3. Registre a origem e autorização dos recursos em `docs/ASSETS.md`.
4. Rode `npm run validate`, `npm run check:text` e `npm run build`.
5. Rode `npm run size`, `npm run e2e` e, quando houver ambiente compatível, `npm run perf`.

O script de placeholders, `npm run assets:placeholders`, substitui os recursos demonstrativos em `public/client/`. Use-o apenas quando quiser restaurar a arte fictícia do modelo. Para otimizar imagens do cliente sem substituir os originais, use `npm run assets:optimize -- public/client`.

No Claude Code, a skill é chamada com `/landing-cliente nome-do-cliente`. As instruções do agente estão em `.claude/agents/landing-cliente.md`. O agente deve respeitar a mesma fronteira de arquivos e relatar o que não foi verificado.

## Publicação e limites

O GitHub Actions publica no GitHub Pages em push para `main` ou por disparo manual. Configure a fonte Pages como GitHub Actions. Em repositórios de projeto, o workflow usa o nome do repositório como caminho base; `VITE_BASE_PATH` pode sobrescrever esse valor.

O critério aprovado em 2026-10-11 é até 100 kB gzip para o JavaScript inicial, até 270 kB gzip para o grafo completo de `Scene`, desempenho Lighthouse de pelo menos 75, acessibilidade e boas práticas de pelo menos 90, e SEO de pelo menos 90 quando o site for indexável. O tamanho de `Scene` soma imports estáticos e dinâmicos alcançáveis. A medição Lighthouse é feita por `npm run perf` e depende de Chrome disponível. Consulte `docs/EVIDENCIAS.md` para os resultados verificados.

A validação manual do modelo base em celular, com teclado e leitor de tela, e a publicação pelo GitHub Actions foram confirmadas em 2026-10-11. A automação não substitui uma nova conferência depois de personalizar a landing para um cliente. Consulte `docs/EVIDENCIAS.md` para o estado atual.
