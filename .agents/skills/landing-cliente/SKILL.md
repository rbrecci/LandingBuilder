---
name: landing-cliente
description: Cria ou edita a landing de um cliente no LandingBuilder a partir de um briefing, preenchendo conteúdo, tema e assets e executando as validações antes da entrega. Usar quando o pedido for criar, personalizar ou revisar a landing de um cliente neste projeto.
argument-hint: [nome-do-cliente]
---

# Landing de cliente

## 1. Coletar o briefing

- Ler `client/content.json` e `client/theme.json` para identificar os dados já disponíveis. Confirmar com o solicitante o que falta para `brand` (nome, nome curto, frase e logo), `business` (endereço, telefone, WhatsApp, email, horários, fuso e redes sociais) e `site` (título, descrição, URL, imagem social, favicon e decisão sobre indexação).
- Definir quais seções de `sections` ficam ligadas, desligadas e em qual ordem: `hero`, `stats`, `about`, `features`, `showcase3d`, `gallery`, `offers`, `testimonials`, `faq`, `location` e `contact`. Manter `hero` primeiro e ligado. Confirmar também o CTA de `nav` e o texto legal e os links de `footer`.
- Perguntar pelo tom visual, cores da marca, uma ou duas fontes do catálogo do tema, logo, imagens disponíveis e suas origens. Confirmar se há modelo 3D em GLB ou somente o logo para a medalha, além do pôster obrigatório do modelo.
- Identificar quais textos e imagens são apenas exemplos. Perguntar uma coisa por vez quando a resposta for essencial para prosseguir. Quando o cliente ainda não tiver um dado, marcar a seção correspondente com `placeholder: true` e registrar o ponto em "a confirmar com o cliente". Manter a página sem indexação enquanto o conteúdo de demonstração depender de confirmação.
- Não afirmar fatos do cliente sem fonte. Não inventar endereço, horário, preço, nome de sócio ou avaliações. Usar `testimonials` reais somente com autorização e consentimento confirmados; para exemplos, manter `consentConfirmed: false` e `placeholder: true`.

## 2. Preencher os arquivos do cliente

- Editar somente `client/content.json`, `client/theme.json` e arquivos em `public/client/`. Registrar a origem dos assets em `docs/ASSETS.md` como única exceção documental a essa fronteira; nunca editar `src/` nem `scripts/` para personalizar um cliente. Não editar os schemas gerados.
- Preencher as chaves `site`, `brand`, `business`, `nav`, `sections` e `footer` no conteúdo. Preencher `colors`, `fonts`, `radius`, `density`, `motion` e `three` no tema. Escolher `fonts.display` e `fonts.body` somente entre `barlow-condensed`, `dm-sans`, `outfit`, `space-grotesk`, `inter` e `fraunces`.
- Usar links de menu e CTA que apontem somente para seções habilitadas. Conferir descrições alternativas, largura e altura das imagens. Se o pedido exigir um campo ou comportamento fora do schema, parar a edição e relatar a extensão necessária no modelo.

## 3. Preparar os assets

- Guardar logo, imagens, pôster e eventual GLB em `public/client/`. Registrar em `docs/ASSETS.md` a origem e a autorização de uso de cada arquivo. Nunca usar imagem de terceiros sem autorização registrada.
- Otimizar imagens com `npm run assets:optimize -- public/client`.
- Se houver GLB, comprimir com `npx gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024` e apontar o conteúdo para o arquivo resultante. Se houver apenas logo, configurar o modelo como medalha. Manter pôster nos dois casos.

## 4. Verificar em laço

- Executar `npm run validate`, `npm run check:text`, `npm run build`, `npm run size` e `npm run e2e`. Corrigir os erros dentro da fronteira permitida e repetir os comandos afetados até todos terminarem com código 0. Se a correção exigir `src/` ou `scripts/`, registrar o bloqueio e a extensão necessária.
- Executar `npm run perf` quando houver condições de medir desempenho. Registrar quando essa medição não for feita.

## 5. Entregar o relatório

- Informar quais seções ficaram ligadas e desligadas.
- Listar "a confirmar com o cliente", com cada dado ausente, texto de exemplo, origem ou autorização pendente.
- Mostrar a saída e o código de saída de cada comando executado. Informar explicitamente o que não foi verificado e por quê.

## Regras fixas

- Manter o crédito fixo "Desenvolvido por RBrecci" no rodapé. Não oferecer sua remoção ou alteração.
- Não usar travessão, traço médio ou sinal de menos tipográfico em nenhum texto produzido.
