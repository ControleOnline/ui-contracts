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

## Regras de seguranca
- A minuta ou contrato exibido no mobile deve vir de conteudo controlado pelo backend do produto. Se o payload vier como base64 ou `data:application/pdf`, o front pode renderizar. Se vier como URL externa, a regra segura e falhar fechado ate existir allowlist explicita e evidencia de que o carregamento preserva autorizacao, trilha e origem confiavel.
- A selecao de pessoas e assinantes deve continuar usando o identificador canonico retornado na listagem autorizada (`@id`). Trocas para campos alternativos, ids crus ou formatos diferentes exigem evidencia explicita de contrato de API e validacao equivalente no fluxo de gravacao.
