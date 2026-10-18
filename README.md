# [Desafio Jungle Gaming - NFT Marketplace - Jonny Gabriel Teles](https://github.com/junglegaming/frontend-challenge)

## [Link do repositório GitHub - NFT Marketplace](https://github.com/JonnyTeles/nft-marketplace)

## [Link na Vercel](https://nft-marketplace-43j2evj2j-jonnyteles.vercel.app/)

Marketplace de NFTs desenvolvido em React e TypeScript como parte de um desafio de Frontend. O projeto reúne catálogo, busca, filtros, favoritos, carrinho, checkout, autenticação e gerenciamento da conta, com foco em responsividade, organização do código e integração entre as diferentes partes da aplicação.

A interface segue a identidade visual do layout de referência do Figma, com tema escuro, tons de marrom e detalhes em dourado e laranja.

Toda a aplicação funciona com dados simulados. Não há conexão real com blockchain, extensões de carteira, serviços de pagamento ou sistemas de autenticação externos.

## Tecnologias utilizadas

- **React e TypeScript:** construção da interface e tipagem dos dados.
- **Vite:** servidor de desenvolvimento e ferramenta de build.
- **TanStack Router:** gerenciamento das rotas, parâmetros da URL e navegação.
- **TanStack Query:** gerenciamento das consultas à API, mutations, cache e atualização dos dados.
- **Axios:** cliente HTTP utilizado nas chamadas REST.
- **Tailwind CSS:** estilização e adaptação da interface para diferentes tamanhos de tela.
- **shadcn/ui:** base para os componentes da interface.
- **MSW (Mock Service Worker):** simulação das respostas da API, incluindo erros e condições de rede.
- **Socket.IO Client:** comunicação em tempo real para alterações nos NFTs e atualizações dos pedidos.
- **Playwright:** testes automatizados dos principais fluxos da aplicação.
- **Lighthouse CI:** auditoria de performance, acessibilidade, boas práticas e SEO.

## Requisitos

Antes de executar o projeto, instale:

- Node.js 20.19 ou superior. Recomenda-se utilizar Node.js 22.
- npm 10 ou superior.

Para conferir as versões instaladas:

```bash
node -v
npm -v
```

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação, normalmente `http://localhost:5173`.

Os mocks são ativados por padrão, portanto não é necessário configurar ou iniciar um backend separado para utilizar a demonstração.

Durante a instalação, o script `postinstall` executa a preparação do Service Worker utilizado pelo MSW. Caso seja necessário gerar esse arquivo novamente, execute:

```bash
npm run prepare:mocks
```

## Acesso à demonstração

O projeto disponibiliza duas contas fictícias para testar os fluxos de autenticação.

| E-mail           | Senha      |
| ---------------- | ---------- |
| `jonny@demo.com` | `Demo123!` |
| `john@demo.com`  | `Demo123!` |

Também é possível criar uma conta pela própria aplicação.

As credenciais existem exclusivamente para a demonstração. A autenticação simulada não deve ser utilizada como modelo de segurança para uma aplicação real. O cliente não armazena senhas no armazenamento do navegador, embora a camada de mocks utilize credenciais fictícias para permitir os testes de login.

## Funcionalidades

### Início e catálogo

A página inicial permite explorar os NFTs disponíveis e navegar pelo catálogo. É possível pesquisar itens, combinar filtros, alterar a ordenação e navegar entre páginas.

Os parâmetros de busca ficam registrados na URL, permitindo atualizar a página, compartilhar o endereço e recuperar o estado da navegação pelo histórico do navegador.

### Detalhes do NFT

Cada NFT possui uma página própria com imagem, nome, preço, informações da coleção, edição, disponibilidade e atributos.

Nessa tela, o usuário pode selecionar a quantidade desejada, adicionar o item ao carrinho e gerenciar seus favoritos. A aplicação também permite simular alterações de preço e estoque para demonstrar a atualização em tempo real.

### Carrinho

O carrinho permite adicionar NFTs, alterar quantidades, remover itens e aplicar ou retirar cupons de desconto.

O resumo apresenta subtotal, desconto, taxas de rede e total calculado a partir da cotação simulada. Os itens permanecem salvos após atualizar a página, e o fluxo de autenticação preserva o carrinho do visitante.

### Checkout

O checkout reúne os dados do colecionador, a carteira selecionada, a rede e a revisão do pedido.

Antes da confirmação, a aplicação verifica novamente os valores e a disponibilidade. Se houver uma alteração relevante, o usuário precisa revisar o novo total antes de continuar.

O pagamento pode ser confirmado, recusado ou mantido como pendente, permitindo testar diferentes resultados sem realizar transações reais.

### Confirmação do pedido

A página de confirmação apresenta os itens comprados, os valores, as taxas e a identificação simulada da transação.

O recibo preserva os dados registrados no momento da criação do pedido. Dessa forma, mudanças posteriores no catálogo não alteram os valores exibidos em uma compra anterior.

Pedidos pendentes podem ser recuperados após atualizar a página ou restabelecer a conexão. A criação de pedidos utiliza uma chave de idempotência para evitar compras duplicadas em tentativas repetidas.

### Conta do colecionador

A aplicação disponibiliza cadastro, login, logout, perfil, edição de dados, avatar, alteração de senha e gerenciamento de carteiras.

As funcionalidades privadas exigem autenticação simulada. A sessão pode ser recuperada após atualizar a página, e os dados privados devem ser isolados entre usuários.

## Rotas da aplicação

| Rota                     | Descrição                                             |
| ------------------------ | ----------------------------------------------------- |
| `/`                      | Página inicial, catálogo, busca, filtros e ordenação. |
| `/nft/:nftId`            | Detalhes de um NFT, favoritos e adição ao carrinho.   |
| `/cart`                  | Carrinho, quantidades, cupons e resumo dos valores.   |
| `/checkout`              | Dados do colecionador, carteira, revisão e pagamento. |
| `/confirmation/:orderId` | Situação do pedido e recibo.                          |
| `/login`                 | Login e validação das credenciais.                    |
| `/register`              | Cadastro e validação dos dados.                       |
| `/profile`               | Perfil, avatar e configurações da conta.              |
| `/wallets`               | Cadastro, edição e seleção da carteira principal.     |
| `/favorites`             | Lista de NFTs favoritados.                            |

## Como funcionam os mocks

O MSW intercepta as chamadas HTTP da aplicação e responde com dados fictícios, reproduzindo o comportamento de um backend REST.

A camada de mocks concentra os handlers e os dados utilizados pelos diferentes recursos:

- `src/mocks/handlers.ts`: endpoints REST e suas respostas.
- `src/mocks/data.ts`: dados de demonstração e recursos compartilhados.

Os mocks mantêm os dados relacionados entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos. Isso permite testar os fluxos completos sem depender de serviços externos.

A simulação também contempla respostas vazias, lentidão, falhas de conexão, erros HTTP, sessões expiradas, cupons inválidos, alterações de preço e indisponibilidade de itens.

Os mocks podem ser desativados por configuração. Para utilizar uma API externa, defina `VITE_MOCKS=false` e configure `VITE_API_URL` com o endereço correspondente. Nesse caso, o backend externo precisa implementar os contratos esperados pela aplicação.

Para configurar um servidor Socket.IO externo, utilize `VITE_SOCKET_URL`. Sem essa variável, a aplicação utiliza a integração simulada com MSW no endereço atual.

## Cenários para testar manualmente

### Cupons de desconto

No carrinho, utilize o cupom `FORMA10` para aplicar 10% de desconto. Outros códigos retornam um erro de validação.

### Resultado do pagamento

No checkout, escolha uma das opções de simulação:

- Confirmar pagamento.
- Recusar pagamento.
- Deixar o pedido pendente.

Esses cenários permitem verificar como a interface reage a diferentes resultados. Um pedido recusado não deve ser tratado como compra concluída, e os itens correspondentes permanecem no carrinho.

## API e regras de negócio

Os contratos REST utilizados pela aplicação abrangem os seguintes recursos:

- Sessão e conta: cadastro, login, consulta de sessão, logout e expiração.
- NFTs: listagem, busca, filtros, ordenação, paginação e detalhes.
- Favoritos: consulta, inclusão e remoção.
- Carrinho: consulta, inclusão, alteração de quantidade e remoção.
- Cotação: validação de cupom, disponibilidade, descontos, taxas e total.
- Pedidos: criação idempotente, consulta de estado e recibo.
- Perfil: consulta, atualização de dados, avatar e senha.
- Carteiras: consulta, cadastro, edição e seleção da principal.

## Comandos disponíveis

| Comando                 | Finalidade                                                 |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Inicia o servidor de desenvolvimento com mocks.            |
| `npm run build`         | Executa a verificação de tipos e gera o build de produção. |
| `npm run preview`       | Executa uma prévia do build gerado.                        |
| `npm run typecheck`     | Verifica os tipos TypeScript.                              |
| `npm run lint`          | Executa o ESLint.                                          |
| `npm run test:e2e`      | Executa os testes E2E do Playwright para desktop e mobile. |
| `npm run test:e2e:ui`   | Abre a interface de execução dos testes do Playwright.     |
| `npm run audit`         | Executa a auditoria configurada com Lighthouse CI.         |
| `npm run prepare:mocks` | Gera novamente o Service Worker do MSW.                    |
| `npm run format` | Formata automaticamente os arquivos do projeto conforme as regras do Prettier. |

Alguns comandos podem exigir instalações adicionais, como os navegadores do Playwright e as ferramentas configuradas para a auditoria Lighthouse.

Para instalar os navegadores necessários ao Playwright, caso ainda não estejam disponíveis, execute:

```bash
npx playwright install chromium
```

## Testes e qualidade

Os testes automatizados utilizam o Playwright para verificar os fluxos da interface com os dados simulados.

A cobertura prevista inclui navegação pelo catálogo, filtros, paginação, autenticação, favoritos, carrinho, cupons, checkout, pedidos, edição de perfil e carteiras. Também são importantes os testes de alterações em tempo real, falhas de rede, recuperação de pedidos e navegação por teclado.

Para executar a suíte:

```bash
npm run test:e2e
```

A auditoria Lighthouse avalia as páginas de início e detalhe do NFT em cenários desktop e mobile. Os resultados devem ser gerados após executar os comandos correspondentes em um ambiente instalado.

Não se deve considerar uma suíte aprovada nem informar pontuações de Lighthouse sem executar as verificações e conferir os relatórios produzidos.

## Build e deploy

A aplicação utiliza Vite e pode ser publicada em plataformas como Vercel, Netlify ou Cloudflare Pages.

As configurações básicas são:

- **Comando de build:** `npm run build`
- **Diretório de publicação:** `dist`

Antes de publicar, gere o build e confira se a aplicação funciona corretamente:

```bash
npm run build
npm run preview
```

O arquivo `public/mockServiceWorker.js` precisa estar presente nos assets publicados para que os mocks funcionem no ambiente de demonstração.

Também é necessário configurar o fallback para `index.html`, permitindo abrir diretamente qualquer rota e atualizar a página sem receber um erro de recurso inexistente.

A versão publicada deve manter os mocks, os fluxos de compra simulada e as atualizações em tempo real funcionando.

## Estrutura e decisões de arquitetura

A aplicação separa a interface, as chamadas HTTP, o estado remoto e a camada de simulação para evitar que as regras de negócio fiquem espalhadas pelos componentes.

O TanStack Router controla a navegação, enquanto o TanStack Query mantém os dados remotos em cache e coordena as atualizações após mutations e eventos. O Axios centraliza as chamadas REST, e o MSW simula o backend na camada de rede.

O Socket.IO Client recebe os eventos de atualização e permite refletir mudanças nos recursos ativos. A aplicação também precisa considerar eventos duplicados ou antigos, liberar listeners ao encerrar uma assinatura e reconciliar os dados com a API após uma reconexão.

Mais detalhes sobre os contratos, o estado do carrinho, a sessão, a estratégia de cache e as limitações da simulação estão descritos no arquivo `ARCHITECTURE.md`.

## Limitações conhecidas

Este projeto foi desenvolvido para demonstrar fluxos de frontend e integração com APIs simuladas. Não é um marketplace pronto para processar compras reais.

- A autenticação é fictícia e não substitui um sistema seguro de sessão.
- As carteiras e redes são simuladas; nenhuma transação é enviada à blockchain.
- O pagamento não utiliza um gateway real.
- A integração entre Socket.IO e MSW cobre os eventos necessários para o desafio, mas não substitui um servidor Socket.IO completo com salas, autenticação e broadcast em produção.
- O comportamento e a cobertura dos testes devem ser confirmados executando os comandos do projeto.
- As pontuações de performance e acessibilidade dependem da execução das auditorias no ambiente de publicação.

## Objetivo do projeto

O objetivo é demonstrar a construção de uma aplicação frontend completa, com interface responsiva, tipagem consistente, estado remoto organizado, simulação de APIs, comunicação em tempo real e tratamento de situações de erro.

A implementação busca manter as regras de negócio separadas da interface e tornar os principais fluxos reproduzíveis, facilitando a manutenção, os testes e a evolução do projeto.
