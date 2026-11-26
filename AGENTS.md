## Ponto de entrada

- A documentação funcional e de regras deste modulo vive na wiki do proprio repositório e na wiki principal do app.
- Regras transversais de qualidade, modularizacao e limites de componente vivem em `https://github.com/ControleOnline/agents-mcp/blob/master/skills/shared/code-quality.md`.
- Quando houver detalhe especifico de implementacao, prefira comentar no codigo em ingles perto da regra.
- Este arquivo deve ficar curto e servir apenas como ponte para as fontes oficiais.

## Contract creation feedback (issue #48)

- After the main contract `save` succeeds, failures in linked order creation or product inheritance must surface as **warnings**, not as total failure.
- User-visible messages for this flow go through `buildCreateContractFeedback` + `global.t?.t('contract', 'message', key)` when available.
