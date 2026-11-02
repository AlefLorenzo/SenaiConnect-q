# Guia de Migração: localStorage → Supabase

Este documento explica como o SENAI Connect foi migrado de armazenamento local (localStorage) para uma arquitetura real com Supabase.

## 🎯 Visão Geral

### Antes (localStorage)
- Dados armazenados apenas no navegador
- Cada usuário via apenas seus próprios dados
- Mensagens não sincronizavam entre dispositivos
- Stories não expiravam corretamente
- Sem autenticação real

### Depois (Supabase)
- Dados persistidos no banco de dados PostgreSQL
- Múltiplos usuários podem interagir em tempo real
- Mensagens sincronizadas entre dispositivos
- Stories expiram automaticamente após 24h
- Autenticação segura com JWT

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

```
users (perfis de usuário)
  ↓
posts (publicações)
  ├── likes (curtidas)
  └── comments (comentários)

messages (mensagens privadas)

groups (grupos)
  └── group_members (membros)

stories (stories)
  └── story_views (visualizações)

notifications (notificações)

user_settings (configurações)
```

### Relacionamentos

- **users → posts**: 1:N (um usuário tem muitas publicações)
- **posts → likes**: 1:N (uma publicação tem muitas curtidas)
- **posts → comments**: 1:N (uma publicação tem muitos comentários)
- **users → messages**: N:N (mensagens entre usuários)
- **users → groups**: N:N via group_members
- **users → stories**: 1:N (um usuário tem muitos stories)
- **stories → story_views**: 1:N (um story tem muitas visualizações)

## 🔐 Segurança (RLS)

### Políticas Implementadas

1. **Users**
   - SELECT: Todos podem ver
   - UPDATE: Apenas o próprio usuário
   - INSERT: Apenas o próprio usuário

2. **Posts**
   - SELECT: Todos podem ver
   - INSERT: Apenas o autor
   - UPDATE: Apenas o autor
   - DELETE: Apenas o autor

3. **Messages**
   - SELECT: Apenas remetente e destinatário
   - INSERT: Apenas o remetente
   - UPDATE: Apenas o destinatário (para marcar como lida)
   - DELETE: Apenas o remetente

4. **Stories**
   - SELECT: Apenas stories não expirados
   - INSERT: Apenas o autor
   - DELETE: Apenas o autor

5. **User Settings**
   - SELECT: Apenas o próprio usuário
   - UPDATE: Apenas o próprio usuário

## 🔄 Fluxo de Dados

### Autenticação

```
1. Usuário faz login
2. Supabase Auth valida e retorna JWT
3. JWT é armazenado no localStorage (automático)
4. Todas as requisições ao banco incluem o JWT
5. RLS valida as permissões
```

### Publicar Post

```
1. Usuário clica em "Publicar"
2. Frontend chama postsService.create()
3. Service envia para Supabase com JWT
4. RLS verifica se user_id = auth.uid()
5. Post é inserido no banco
6. Realtime notifica outros usuários (se configurado)
7. Frontend atualiza a UI
```

### Enviar Mensagem

```
1. Usuário digita e envia
2. Frontend chama messagesService.send()
3. Service envia para Supabase com JWT
4. RLS verifica se from_id = auth.uid()
5. Mensagem é inserida no banco
6. Realtime notifica o destinatário
7. Frontend do destinatário atualiza automaticamente
```

### Visualizar Story

```
1. Usuário clica no Story
2. Frontend chama storiesService.addView()
3. Service verifica se já visualizou
4. Se não, insere em story_views
5. RLS verifica se user_id = auth.uid()
6. Contador de visualizações aumenta
```

## 📦 Services

### auth.ts
- `signUp()`: Criar conta
- `signIn()`: Login
- `signOut()`: Logout
- `getCurrentUser()`: Obter usuário atual
- `getUserProfile()`: Obter perfil
- `updateUserProfile()`: Atualizar perfil
- `resetPassword()`: Recuperar senha
- `updatePassword()`: Alterar senha

### posts.ts
- `getAll()`: Listar publicações
- `create()`: Criar publicação
- `delete()`: Excluir publicação
- `toggleLike()`: Curtir/descurtir
- `addComment()`: Adicionar comentário
- `deleteComment()`: Excluir comentário

### messages.ts
- `getConversations()`: Listar conversas
- `getMessages()`: Obter mensagens de uma conversa
- `send()`: Enviar mensagem
- `markAsRead()`: Marcar como lida
- `markConversationAsRead()`: Marcar conversa como lida
- `delete()`: Excluir mensagem
- `subscribeToMessages()`: Realtime para novas mensagens

### stories.ts
- `getActive()`: Listar stories ativos (não expirados)
- `create()`: Criar story
- `addView()`: Registrar visualização
- `delete()`: Excluir story
- `uploadMedia()`: Upload de imagem/vídeo

### settings.ts
- `get()`: Obter configurações
- `upsert()`: Criar/atualizar configurações

### notifications (em settings.ts)
- `getAll()`: Listar notificações
- `markAsRead()`: Marcar como lida
- `markAllAsRead()`: Marcar todas como lidas
- `create()`: Criar notificação

## 🚀 Como Usar

### Exemplo: Criar um Post

```typescript
import { postsService } from './lib/services/posts';
import { useAuth } from './store';

function CreatePost() {
  const { user } = useAuth();

  const handleCreate = async (content: string) => {
    try {
      const post = await postsService.create(user.id, content);
      console.log('Post criado:', post);
    } catch (error) {
      console.error('Erro ao criar post:', error);
    }
  };

  return <button onClick={() => handleCreate('Olá mundo!')}>Publicar</button>;
}
```

### Exemplo: Enviar Mensagem

```typescript
import { messagesService } from './lib/services/messages';

async function sendMessage(fromId: string, toId: string, content: string) {
  try {
    const message = await messagesService.send(fromId, toId, content);
    console.log('Mensagem enviada:', message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}
```

### Exemplo: Realtime para Mensagens

```typescript
import { messagesService } from './lib/services/messages';
import { useEffect } from 'react';

function MessagesListener({ userId }: { userId: string }) {
  useEffect(() => {
    const subscription = messagesService.subscribeToMessages(
      userId,
      (payload) => {
        console.log('Nova mensagem recebida:', payload.new);
        // Atualizar UI
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  return null;
}
```

## 🧪 Testando

### Teste 1: Autenticação

```typescript
import { authService } from './lib/services/auth';

// Sign up
const { user } = await authService.signUp('test@senai.br', '123456', 'Test User');

// Sign in
const { user: loggedInUser } = await authService.signIn('test@senai.br', '123456');

// Sign out
await authService.signOut();
```

### Teste 2: CRUD de Posts

```typescript
import { postsService } from './lib/services/posts';

// Create
const post = await postsService.create(userId, 'Hello World');

// Read
const posts = await postsService.getAll();

// Like
await postsService.toggleLike(post.id, userId);

// Comment
await postsService.addComment(post.id, userId, 'Great post!');

// Delete
await postsService.delete(post.id, userId);
```

### Teste 3: Mensagens

```typescript
import { messagesService } from './lib/services/messages';

// Send
await messagesService.send(user1Id, user2Id, 'Hello!');

// Get conversations
const conversations = await messagesService.getConversations(user1Id);

// Get messages
const messages = await messagesService.getMessages(user1Id, user2Id);

// Mark as read
await messagesService.markConversationAsRead(user2Id, user1Id);
```

## ⚠️ Limitações e Considerações

### 1. Storage
- Limite do plano gratuito: 1GB
- Limite de upload: 50MB por arquivo
- Recomendação: Comprimir imagens antes do upload

### 2. Realtime
- Limite do plano gratuito: 200 conexões simultâneas
- Recomendação: Desinscrever quando não estiver na página

### 3. Banco de Dados
- Limite do plano gratuito: 500MB
- Recomendação: Limpar stories expirados regularmente

### 4. Auth
- Limite do plano gratuito: 50.000 MAUs (Monthly Active Users)
- Recomendação: Implementar cache de perfil

## 🔧 Manutenção

### Limpar Stories Expirados

Execute diariamente via pg_cron ou manualmente:

```sql
SELECT cleanup_expired_stories();
```

### Backup

O Supabase faz backup automático diariamente (plano gratuito: 7 dias).

Para backup manual:
1. Vá em **Database** → **Backups**
2. Clique em **Download backup**

### Monitoramento

1. Vá em **Logs** para ver requisições
2. Vá em **Metrics** para ver uso de recursos
3. Configure alertas para limites críticos

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização**: Novembro 2026
