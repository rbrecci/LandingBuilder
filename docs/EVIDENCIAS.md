# Evidências de validação

Registro das verificações da T62 e da decisão de critérios de 2026-10-11. Os resultados antigos mantêm seus códigos de saída originais; a reclassificação abaixo usa os critérios autorizados mais recentes. Os gates atuais passaram e T70 está concluída.

## Ambiente

| Item | Resultado |
|---|---|
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Chromium do Playwright | revisão 1248 |

## Critérios aprovados e resultados conhecidos

| Métrica | Critério aprovado em 2026-10-11 | Valor observado | Classificação atual |
|---|---|---|---|
| Lighthouse mobile: desempenho | mínimo 75 | 77 na execução indexável atualizada | APROVADO, `npm run perf` saiu com código 0 |
| Lighthouse mobile: acessibilidade | mínimo 90 | 100 na execução indexável atualizada | APROVADO, `npm run perf` saiu com código 0 |
| Lighthouse mobile: boas práticas | mínimo 90 | 100 na execução indexável atualizada | APROVADO, `npm run perf` saiu com código 0 |
| Lighthouse mobile: SEO | mínimo 90 quando `site.indexable: true`; caso contrário, informativo | 92 na execução indexável atualizada | APROVADO, `npm run perf` saiu com código 0 |
| Primeira carga sem 3D | até 600000 bytes transferidos | 223872 bytes na execução indexável atualizada | APROVADO, `npm run perf` saiu com código 0 |
| JavaScript inicial gzip | até 100 kB | `npm run size` exit 0: 79.75 kB | APROVADO |
| Grafo completo de Scene gzip | até 270 kB, incluindo imports estáticos e dinâmicos alcançáveis | `npm run size` exit 0: 267.35 kB | APROVADO |
| Rolagem horizontal de 320 a 1920 px | nenhuma | `npm run e2e` passou 14 testes, cobrindo sete larguras | APROVADO na suíte registrada |
| Erros de console em carga e rolagem | zero | `npm run e2e` passou 14 testes | APROVADO na suíte registrada |
| Violações axe serious ou critical | zero | `npm run e2e` passou 14 testes, com axe em dois viewports | APROVADO na suíte registrada |
| Crédito no HTML pré-renderizado | link com `href="https://github.com/rbrecci"` e texto "Desenvolvido por RBrecci" | `npm run e2e` passou 14 testes, incluindo rodapé | APROVADO na suíte registrada |

O valor Scene de 267.35 kB representa a soma de toda a árvore Scene, inclusive imports dinâmicos. A reclassificação usa o novo teto de 270 kB, sem esconder bytes em chunks. O build reportou entrada Scene de 243.68 kB, OrbitControls de 4.78 kB e GlbModel de 20.99 kB.

## Execuções e códigos observados

| Comando | Exit code observado | Resultado |
|---|---:|---|
| `npm run check` | 0 | Verificações concluídas; 134 testes em 25 arquivos passaram. |
| `npm run build` | 0 | Build concluído. JS inicial 80.51 kB gzip; entrada Scene 243.68 kB; OrbitControls 4.78 kB; GlbModel 20.99 kB. |
| `npm run e2e` | 0 | 14 testes passaram. Cobertura de rodapé, larguras responsivas, axe em dois viewports, parallax com movimento normal e reduzido, ausência de WebGL e WebGL com SwiftShader. |
| `npm run perf` atualizado, com cópia temporária indexável | 0 | Desempenho 77, acessibilidade 100, boas práticas 100, SEO 92 e transferência 223872 bytes. Atende aos critérios atuais. |
| `npm run size` atualizado, teto Scene 270 kB | 0 | JS inicial 79.75/100 kB gzip; Scene completa 267.35/270 kB gzip. |
| `npm run size` sob o limite anterior de 260 kB | 1 | JavaScript inicial 79.75 kB, abaixo de 100 kB. Scene completa 267.35 kB, acima do limite então configurado de 260 kB. Esta saída histórica foi substituída pela execução atualizada com exit code 0 e teto de 270 kB. |
| `npm run perf` com cópia temporária indexável, sob os limites anteriores | 1 | Medição anterior: desempenho 86, acessibilidade 100, boas práticas 100, SEO 92 e transferência sem 3D de 223893 bytes. Outra medição indexável válida marcou desempenho 76, acessibilidade 100, boas práticas 100, SEO 92 e transferência 223872 bytes. Os dois exit codes 1 pertencem aos limites anteriores. A execução atualizada passou com código 0 e desempenho 77. |
| `npm run perf` direto, sem cópia indexável e sob o mínimo configurado de 85 | 1 | Desempenho 81, acessibilidade 100, boas práticas 100, SEO 58 informativo por site não indexável e transferência sem 3D de 223893 bytes. Esta execução não confirma T70. |

## Saídas anteriores preservadas

As saídas seguintes pertencem à configuração anterior e ficam aqui como histórico. A decisão autorizada em 2026-10-11 mudou o critério para desempenho Lighthouse mínimo 75, acessibilidade e boas práticas mínimo 90, SEO mínimo 90 quando indexável, e Scene até 270 kB gzip.

```text
npm run size, limite anterior
Recurso       Gzip (kB)  Limite (kB)  Resultado
JS inicial        79.75          100  OK
Scene completa   267.35          260  ACIMA
exit code: 1
```

```text
npm run perf, limite anterior, cópia indexável
Lighthouse mobile:
performance: 86.0
accessibility: 100.0
best-practices: 100.0
seo: 92.0
Primeira carga sem chunk 3D: 223893 bytes (limite 600000)
exit code: 1
```

Uma medição inicial ainda anterior de `npm run perf` marcou desempenho 70, acessibilidade 100, boas práticas 100, SEO 92 e transferência 249699 bytes, com exit code 1 sob o limite então aplicado.

O diagnóstico Lighthouse standalone mais recente saiu com exit code 0 e registrou desempenho 85, FCP 1.8 s, LCP 2.2 s, Speed Index 1.8 s, TBT 500 ms, CLS 0, TTI 3.2 s, avaliação de JavaScript na thread principal de 1010.65 ms, scripting inicial de 992.86 ms e economia estimada de JavaScript de 36 KiB. Um diagnóstico standalone anterior registrou score 76. Esses diagnósticos não substituem `npm run perf`.

## Não medido

- Aparelho móvel físico.
- Leitor de tela em dispositivo físico.
- Teclado em dispositivo físico.
- GPU real de aparelho móvel.

Os resultados de Lighthouse e e2e foram obtidos em navegador automatizado. A medição válida mais recente foi executada com `site.indexable: true` antes do build e mantido até o fim do `npm run perf`, que saiu com código 0. `npm run size` atualizado também saiu com código 0. T70 e a onda 7 estão concluídas.
