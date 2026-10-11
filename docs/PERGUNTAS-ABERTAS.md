# Perguntas abertas

Só entram aqui decisões que dependem de preferência do dono do projeto e que não consegui fechar com os dados disponíveis. O restante foi decidido e justificado em `docs/ARQUITETURA.md`.

1. **Nome público e domínio do modelo.** O repositório se chama `LandingBuilder` e a marca fictícia da landing modelo é "Casa Exemplo" (`ARQUITETURA §5`). Se quiser outro nome para a marca de exemplo, é só trocar `client/content.json` na tarefa T29. Não bloqueia nenhuma tarefa. Padrão adotado se não houver resposta: "Casa Exemplo".
2. **Licença do próprio modelo.** O modelo será reutilizado por cliente, e o repositório não tem arquivo de licença. A escolha (proprietária, MIT ou outra) é do dono e não afeta o código. Padrão adotado: nenhum arquivo `LICENSE` é criado nesta etapa.
3. **Publicar a landing modelo no GitHub Pages.** O fluxo `deploy.yml` (T33) publica a cada push na `main`, e a página modelo leva `noindex`. Ligar o Pages no repositório é uma decisão do dono (mesmo critério do `hitamax-landing/SPEC.md:193`). Padrão adotado: o fluxo é criado, mas o Pages não é ativado por nós.
