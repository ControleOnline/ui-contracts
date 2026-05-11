## Escopo
- Modulo de contratos.
- Cobre listagem, detalhes, criacao e relacionamento de contratos com pessoas.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.

## Quando usar
- Prompts sobre contratos, detalhes de contrato, listagem de contratos e fluxo comercial ligado a contratos.

## Regras
- No fluxo de criacao de contrato, o erro total so deve acontecer quando o save principal do contrato falhar. Se o contrato foi salvo e um passo complementar posterior falhar, como pedido vinculado ou heranca de produtos, o usuario deve ver confirmacao de criacao do contrato e um aviso separado sobre a etapa complementar.
- Essa separacao de mensagens nao autoriza mascarar falha do save principal nem pular validacoes de negocio obrigatorias. Ela existe para evitar duplicidade de contratos quando apenas uma etapa posterior falha.
