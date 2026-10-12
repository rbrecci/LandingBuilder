# Evidências de validação

Data: 2026-10-11. Medido sobre o commit `8eab90f` mais as melhorias finais (setup de testes, teste de sincronia, licença e limpeza dos docs), que não alteram `src/` nem o bundle.

## Ambiente

| Item | Valor medido |
|---|---|
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Playwright | 1.64.0, Chromium revisão 1248 |

## Metas

| Meta | Limite | Valor medido | Resultado |
|---|---:|---:|---|
| Lighthouse mobile, desempenho | mínimo 75 | 87 | APROVADO |
| Lighthouse mobile, acessibilidade | mínimo 90 | 100 | APROVADO |
| Lighthouse mobile, boas práticas | mínimo 90 | 100 | APROVADO |
| Lighthouse mobile, SEO | mínimo 90 quando `site.indexable: true`, informativo caso contrário | 58, com `indexable: false` | INFORMATIVO |
| Bytes da primeira carga sem 3D | até 600000 | 224145 bytes | APROVADO |
| JavaScript inicial gzip | até 100 kB | 79.92 kB | APROVADO |
| Grafo completo de Scene gzip | até 270 kB | 267.35 kB | APROVADO |
| Rolagem horizontal de 320 a 1920 px | nenhuma | nenhuma, sete larguras testadas | APROVADO |
| Erros de console em carga e rolagem | zero | zero erros e zero exceções de página em 390 e 1440 px; um aviso `THREE.Clock` obsoleto, vindo do `@react-three/fiber` com o three 0.186 | APROVADO |
| Violações axe serious ou critical | zero | zero, em dois viewports | APROVADO |
| Crédito no HTML pré-renderizado | "Desenvolvido por RBrecci" | presente no HTML sem JavaScript | APROVADO |
| Imagens e modelo 3D com base de deploy, sem resposta 4xx | nenhuma resposta 4xx | zero respostas com erro na suíte e2e | APROVADO |

## Comandos executados

| Comando | Código de saída | Resumo |
|---|---:|---|
| `npm run check` | 0 | Lint, tipos, validação e texto passaram; 154 testes em 27 arquivos. |
| `npm run build` | 0 | Build do cliente e servidor e pré-renderização concluídos. |
| `npm run size` | 0 | JS inicial 79.92/100 kB; Scene 267.35/270 kB gzip. |
| `npm run e2e` | 0 | 23 testes passaram. |
| `$env:VITE_BASE_PATH='/LandingBuilder/'; npm run build` | 0 | Build concluído com base de deploy. |
| `$env:VITE_BASE_PATH='/LandingBuilder/'; npm run e2e` | 0 | 23 testes passaram com base de deploy. |
| `npm run build` sem variável de base | 0 | Build final normal concluído. |
| `npm run perf` | 0 | Notas 87, 100, 100 e 58 informativo; primeira carga 224145 bytes. |
| `node scripts/check-text.ts client docs` | 0 | Nenhuma ocorrência proibida em `client` e `docs`. |
| `node scripts/check-text.ts src tests e2e` | 0 | Nenhuma ocorrência proibida em `src`, `tests` e `e2e`. |

## Não medido

- Celular físico.
- Leitor de tela.
- Teclado em dispositivo real.
- GPU real.
- 3D animado e botões de girar avaliados por uma pessoa.
- SEO com `site.indexable: true`.
- Vigilância contínua de erros de console: a medição acima foi feita uma vez, por script avulso. A suíte e2e automatizada só vigia mensagens de hidratação, então um erro de console novo não reprova o CI.
