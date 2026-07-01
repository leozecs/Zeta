# Zeta

Zeta é uma plataforma para transformar uma conversa sobre o negócio em produto digital pronto para uso: site, CRM e sistema web personalizado.

O objetivo é que o cliente chegue com uma ideia, dores reais ou um processo bagunçado, e o Zeta converta isso em briefing, escopo, produto e operação digital.

## Stack oficial

- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Lucide Icons
- Next.js API Routes / Server Actions
- Supabase
- OpenAI API
- Vercel

## Produtos

- **Zeta Site**: presença digital, landing pages, páginas institucionais e páginas de venda.
- **Zeta CRM**: organização comercial, leads, clientes, oportunidades e rotina de vendas.
- **Zeta OS**: sistema web personalizado para operação, atendimento, agenda e processos internos.
- **Tudo junto**: site, CRM e sistema operacional digital em uma entrega única.

## Como o Zeta vai funcionar

1. O cliente entra no site.
2. Escolhe um produto individual ou o pacote completo.
3. Cria uma conta ou entra com uma conta existente.
4. Responde perguntas sobre empresa, objetivo, processo e urgência.
5. O Zeta usa IA para organizar o contexto em briefing, escopo e plano de entrega.
6. O projeto vira uma sequência de volumes, cada um com entrega clara, validação e próximo passo.

## Volumes de entrega

### Volume 1: Fundação comercial

Objetivo: deixar a experiência pública pronta para captar interesse e explicar o produto.

Entregas:

- Landing inicial do Zeta.
- Página de produtos e preços.
- Login/cadastro visual.
- Favicon e identidade visual mínima.
- README e documentação base.
- Deploy na Vercel.

### Volume 2: Cadastro, autenticação e workspace

Objetivo: transformar o cadastro visual em fluxo real.

Entregas:

- Supabase Auth.
- Tabelas de perfis, empresas e memberships.
- Tela de criação de conta.
- Tela de login.
- Proteção de rotas.
- Workspace inicial do usuário.
- Server Actions para cadastro e sessão.

### Volume 3: Briefing inteligente

Objetivo: fazer o Zeta entender o negócio antes de sugerir qualquer entrega.

Entregas:

- Formulário guiado de briefing.
- Armazenamento de respostas no Supabase.
- Integração com OpenAI API.
- Geração de resumo estratégico.
- Geração de escopo inicial.
- Histórico de briefings por empresa.

### Volume 4: Produtos e pedidos

Objetivo: conectar escolha de plano/produto com uma solicitação real.

Entregas:

- Pedido de projeto.
- Seleção de produto: Site, CRM, OS ou Tudo junto.
- Status do pedido.
- Volumes vinculados ao pedido.
- Tela para acompanhar evolução.
- Base para pagamento e aprovação manual.

### Volume 5: Zeta Site

Objetivo: entregar presença digital com estrutura comercial.

Entregas:

- Wizard de conteúdo.
- Estrutura de landing/page.
- Copy inicial com IA.
- Componentes visuais com Tailwind e shadcn/ui.
- Prévia do site.
- Checklist de publicação.

### Volume 6: Zeta CRM

Objetivo: organizar vendas e relacionamento.

Entregas:

- Cadastro de clientes e leads.
- Pipeline simples.
- Etapas comerciais configuráveis.
- Anotações e histórico.
- Dashboard básico.
- Sugestões de próximos passos com IA.

### Volume 7: Zeta OS

Objetivo: transformar processo interno em sistema web.

Entregas:

- Mapeamento de processo.
- Entidades customizadas.
- Telas operacionais.
- Permissões básicas.
- Relatórios iniciais.
- Automação de tarefas recorrentes.

### Volume 8: Operação, escala e produto real

Objetivo: preparar o Zeta para operar como SaaS.

Entregas:

- Admin interno.
- Observabilidade.
- Auditoria de ações importantes.
- Templates reutilizáveis.
- Melhorias de performance.
- Fluxo de deploy contínuo na Vercel.

## Rotas atuais

- `/`: apresentação do Zeta.
- `/produtos`: produtos, mensal/anual e pacote completo.
- `/criar`: briefing guiado que continua o fluxo iniciado em produtos.
- `/pagamento`: checkout preparado para gerar cobrança Pix pelo Asaas.
- `/entrar?modo=criar`: abre a tela no formulário de criação.
- `/entrar?modo=login`: abre a tela no formulário de login.

## Integração Asaas

A integração foi preparada para rodar server-side em `/api/asaas/checkout`.

Variáveis necessárias:

```bash
ASAAS_ENVIRONMENT=sandbox
ASAAS_ACCESS_TOKEN=
```

Notas:

- Teste primeiro em Sandbox.
- A API do Asaas usa o header `access_token`, não `Authorization: Bearer`.
- A rota cria cliente, gera cobrança Pix e busca QR Code dinâmico.
- Sem `ASAAS_ACCESS_TOKEN`, a tela informa que a configuração ainda está pendente.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy

O projeto está conectado à Vercel pelo GitHub. Todo push na branch `main` deve gerar um novo deploy automático.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
