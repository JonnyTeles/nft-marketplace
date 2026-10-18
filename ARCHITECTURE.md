# Decisões de arquitetura

## Camadas

- `src/app/Pages.tsx`: interface do usuário no nível das rotas e fluxos de interação.
- `src/components`: layout reutilizável, cartões de NFT e componentes primitivos de interface no estilo shadcn.
- `src/lib/api.ts`: cliente Axios, cabeçalho de autorização e tratamento comum de erros de comunicação.
- `src/lib/hooks.ts`: consultas/mutações do TanStack Query e invalidação de cache.
- `src/lib/money.ts`: cálculos exatos de ETH com ponto fixo, usando 8 casas decimais e `BigInt`.
- `src/mocks/handlers.ts`: contratos simulados REST e respostas dos cenários. Os componentes e hooks de consulta não contêm dados de respostas simuladas.
- `src/mocks/socket.ts`: simulação do protocolo Socket.IO usando `@mswjs/socket.io-binding` e interceptação de WebSocket pelo MSW.
- `src/mocks/data.ts`: dados de teste compartilhados e persistência no armazenamento do navegador.
- `src/lib/realtime.ts`: ciclo de vida do cliente Socket.IO, isolamento de sessões e sincronização de consultas.

## Política de consultas/cache

- As chaves de consulta do catálogo incluem busca, categoria, ordenação e página, de modo que diferentes estados da URL não compartilhem os mesmos resultados.
- Os detalhes do NFT são identificados por um ID estável do NFT; carrinho, sessão, favoritos, carteiras e pedidos possuem chaves de consulta separadas.
- As consultas utilizam um tempo de validade de 15 segundos, coleta de lixo após cinco minutos, uma tentativa de repetição e revalidação ao recuperar o foco. As mutações não são repetidas automaticamente, pois uma nova tentativa pode duplicar operações de escrita.
- Os favoritos utilizam uma atualização otimista do cache e retornam ao valor anterior em caso de falha.
- Mutações bem-sucedidas de carrinho/perfil/carteira/pedido invalidam as chaves de consulta afetadas. Eventos do Socket invalidam as consultas ativas de catálogo/detalhes/carrinho/orçamento/pedido, seguidas pela sincronização REST ao estabelecer a conexão.
- Uma alteração de sessão limpa o cache do QueryClient e reconecta o Socket com o novo ID de usuário. Os listeners do Socket são removidos antes da desconexão.

## Sessão e isolamento de dados

A API simulada identifica o usuário fictício ativo por meio do `sessionStorage`. As chaves de dados privados incluem o ID do usuário: favoritos, carteiras, pedidos e carrinhos de usuários autenticados. O conteúdo do carrinho de visitantes é mesclado ao carrinho autenticado durante o login/cadastro e, em seguida, removido da chave do visitante. O logout limpa a sessão e o cache de consultas do cliente. Essa infraestrutura serve apenas para testes, não sendo um mecanismo seguro de autenticação.

## Carrinho e checkout

- As quantidades do carrinho são números inteiros e são verificadas em relação à disponibilidade atual dos dados de teste.
- O ETH é representado como strings decimais nos limites da API REST; todos os subtotais, descontos, taxas e totais são calculados com funções auxiliares de ponto fixo usando `BigInt`, e não com operações de soma de ponto flutuante.
- O checkout solicita um orçamento e, em seguida, envia o total esperado ao criar um pedido. Uma alteração no total ou um item indisponível retorna um conflito, exigindo um novo orçamento e outra confirmação explícita.
- `Idempotency-Key` é armazenada no `sessionStorage` durante a tentativa em andamento. A simulação mantém um registro de idempotência contendo uma impressão digital da solicitação e o snapshot imutável do pedido. Uma nova tentativa correspondente recupera o mesmo pedido; uma impressão digital diferente com a mesma chave gera um conflito.
- Pedidos confirmados removem apenas as quantidades compradas. Pedidos recusados ou pendentes mantêm o carrinho. Os dados dos itens e preços do recibo são copiados no momento da criação.

## Contrato de eventos em tempo real

`nft.updated` contém o ID estável do NFT, a versão e o recurso atualizado; o cliente ignora versões anteriores à armazenada em cache e invalida as consultas de catálogo/detalhes/carrinho/orçamento. `order.updated` contém o ID estável do pedido e a versão; o cliente invalida a consulta do pedido. Eventos duplicados ou antigos não fazem o cache de consultas retroceder. Ao reconectar, os recursos ativos são sincronizados com a API REST. A integração Socket.IO do MSW trata apenas os dois eventos específicos do desafio e é documentada como um transporte simulado com funcionalidades limitadas.

## Interface responsiva e acessibilidade

O layout utiliza pontos de interrupção responsivos em CSS e deve ser verificado nas larguras de 390, 768 e 1440 pixels. Os formulários possuem rótulos e validação do navegador, erros assíncronos utilizam `role="alert"`, mensagens de operação utilizam regiões de status, os controles possuem nomes acessíveis, os contornos de foco visível são preservados e as preferências de movimento reduzido desativam animações de brilho e transições. Os blocos de skeleton preservam as dimensões aproximadas do conteúdo carregado.

## Desvios / trabalhos futuros

- O arquivo do Figma deve ser utilizado para uma revisão visual final: o design atual estabelece um sistema visual coerente para um marketplace com tema escuro e artes geradas localmente, mas a correspondência exata em nível de pixel ainda não foi verificada em relação aos frames do Figma neste ambiente.
- A alteração de senha é implementada por meio de `PATCH /api/profile/password`, com validação da senha atual e verificações de comprimento mínimo. Adicione um teste específico do Playwright para esse fluxo.
- A cobertura do Playwright é uma suíte inicial executável para catálogo/histórico, detalhes/carrinho, sucesso no login/checkout, login inválido e NFT inexistente. Amplie-a para cobrir todos os 12 cenários exigidos antes de apresentar o desafio como totalmente validado.
- A configuração do Lighthouse está disponível, mas as pontuações e os relatórios precisam ser gerados em um ambiente local ou de CI após a instalação das dependências.
