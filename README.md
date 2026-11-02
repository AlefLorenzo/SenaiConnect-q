# SENAI Connect - Rede Social Acadêmica

Rede social acadêmica desenvolvida para conectar alunos, professores e a comunidade SENAI.

## 🚀 Funcionalidades

- ✅ **Autenticação real** com Supabase Auth
- ✅ **Feed de publicações** com curtidas e comentários
- ✅ **Mensagens em tempo real** com indicadores de leitura
- ✅ **Stories** com expiração de 24 horas
- ✅ **Grupos** com gerenciamento de membros
- ✅ **Notificações** push em tempo real
- ✅ **Configurações** de privacidade e aparência
- ✅ **Onboarding** para novos usuários
- ✅ **Responsivo** para mobile e desktop
- ✅ **Acessível** com ARIA labels e navegação por teclado

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no [Supabase](https://supabase.com)
- Git

## 🔧 Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e c uma conta
2. Clique em "New Project"
3. Preencha os dados:
   - **Name**: `senai-connect`
   - **Database Password**: (guarde esta senha)
   - **Region**: escolha a mais próxima (ex: `South America (São Paulo)`)
4. Aguarde a criação do projeto (2-3 minutos)

### 2. Configurar o banco de dados

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Cole no editor e clique em **Run**
4. Aguarde a execução (deve aparecer "Success. No rows returned")

### 3. Configurar Storage para Stories

1. Vá em **Storage** no menu lateral
2. Clique em **New Bucket**
3. Nome: `stories`
4. Marque **Public bucket**
5. Clique em **Create bucket**

### 4. Configurar Realtime

1. Vá em **Database** → **Replication**
2. Ative as tabelas:
   - `messages`
   - `notifications`
   - `stories`

### 5. Obter credenciais

1. Vá em **Project Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (começa com `eyJ...`)

### 6. Configurar variáveis de ambiente

1. Na raiz do projeto, crie um arquivo `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Substitua pelos valores copiados do passo anterior

## 🏃 Executando o projeto

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`

### Preview da build

```bash
npm run preview
```

## 🧪 Testando a aplicação

### Criar usuários de teste

1. Abra a aplicação em duas abas/janelas diferentes (ou dois navegadores)
2. Em cada uma, crie uma conta diferente:
   - Usuário 1: `aluno1@senai.br` / senha: `123456`
   - Usuário 2: `aluno2@senai.br` / senha: `123456`
3. Confirme os e-mails (verifique a caixa de entrada ou use o Supabase para confirmar manualmente)

### Testar mensagens

1. Faça login com o Usuário 1 em uma aba
2. Faça login com o Usuário 2 em outra aba
3. Envie uma mensagem de um para o outro
4. Verifique que a mensagem aparece em tempo real

### Testar Stories

1. Faça login com um usuário
2. Clique em "Novo Story"
3. Envie uma imagem
4. Verifique que aparece no feed de Stories
5. Faça login com outro usuário e visualize o Story
6. Verifique que o contador de visualizações aumenta

## 📁 Estrutura do projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com navegação
│   ├── Onboarding.tsx  # Onboarding para novos usuários
│   └── UI.tsx          # Componentes de UI (Button, Input, Modal, etc)
├── pages/              # Páginas da aplicação
│   ├── AuthPage.tsx    # Login e cadastro
│   ├── FeedPage.tsx    # Feed de publicações
│   ├── MessagesPage.tsx # Mensagens privadas
│   ├── GroupsPage.tsx  # Grupos
│   ├── ProfilePage.tsx # Perfil do usuário
│   └── OtherPages.tsx  # Stories, Configurações, Avisos, etc
├── lib/                # Serviços e utilitários
│   ├── supabase.ts     # Cliente Supabase
│   └── services/       # Services para cada entidade
│       ├── auth.ts
│       ├── posts.ts
│       ├── messages.ts
│       ├── stories.ts
│       └── settings.ts
├── store.tsx           # Contextos e estado global
├── App.tsx             # Componente raiz
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## 🔒 Segurança

### Políticas RLS (Row Level Security)

Todas as tabelas possuem políticas RLS configuradas:

- **Usuários**: Podem ver todos os perfis, mas apenas editar o próprio
- **Posts**: Qualquer um pode ver, apenas o autor pode editar/excluir
- **Mensagens**: Apenas remetente e destinatário podem ver
- **Stories**: Apenas stories não expirados são visíveis
- **Configurações**: Apenas o próprio usuário pode acessar

### Boas práticas implementadas

- ✅ Senhas hasheadas com bcrypt (via Supabase Auth)
- ✅ Tokens JWT em todas as requisições ao banco
- ✅ Validação no servidor (RLS)
- ✅ Chaves anon públicas apenas no frontend
- ✅ CORS configurado corretamente
- ✅ HTTPS obrigatório em produção

## 🌐 Deploy

### Vercel (recomendado)

1. Conecte seu repositório GitHub ao [Vercel](https://vercel.com)
2. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao [Netlify](https://netlify.com)
2. Adicione as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

### Supabase (frontend)

1. Vá em **Settings** → **Hosting**
2. Siga as instruções para deploy

## 🐛 Troubleshooting

### Erro: "Supabase credentials not found"

- Verifique se o arquivo `.env.local` existe na raiz
- Confirme que as variáveis estão corretas
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"

- Execute novamente o SQL de migration
- Verifique se está conectado ao projeto correto

### Mensagens não aparecem em tempo real

- Verifique se o Realtime está ativado para a tabela `messages`
- Confirme que as políticas RLS estão corretas
- Verifique o console do navegador para erros

### Stories não expiram

- O Supabase não executa cleanup automático por padrão
- Configure um pg_cron job ou execute manualmente:
  ```sql
  SELECT cleanup_expired_stories();
  ```

## 📝 Próximos passos

- [ ] Implementar upload de imagens nos posts
- [ ] Adicionar busca de usuários
- [ ] Implementar sistema de seguidores
- [ ] Adicionar reações às mensagens (emoji)
- [ ] Implementar chamadas de vídeo/áudio
- [ ] Adicionar sistema de hashtags
- [ ] Implementar compartilhamento de arquivos
- [ ] Adicionar modo escuro

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte do currículo do SENAI e está sob licença educacional.

## 👥 Autores

- **Alef Lorenzo** - Desenvolvimento inicial
- Comunidade SENAI

## 🙏 Agradecimentos

- SENAI pela oportunidade de desenvolvimento
- Supabase pela plataforma backend
- Comunidade React e TypeScript

---

**Status do projeto**: ✅ Funcional e pronto para uso em produção

**Última atualização**: Novembro 2026
