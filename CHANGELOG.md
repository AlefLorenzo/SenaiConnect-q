# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2026-11-02

### Added
- ✅ Autenticação real com Supabase Auth
- ✅ Sistema de mensagens em tempo real com Realtime
- ✅ Stories com upload de mídia e expiração de 24h
- ✅ Políticas RLS (Row Level Security) para todas as tabelas
- ✅ Persistência completa no banco de dados PostgreSQL
- ✅ Sincronização entre dispositivos
- ✅ Indicadores de leitura de mensagens (✓ e ✓✓)
- ✅ Sistema de notificações em tempo real
- ✅ Configurações de privacidade e aparência
- ✅ Onboarding para novos usuários
- ✅ Documentação completa (README, MIGRATION_GUIDE)
- ✅ Schema SQL completo com migrations
- ✅ Services organizados por entidade

### Changed
- 🔄 Migrado de localStorage para Supabase
- 🔄 Autenticação simulada substituída por Supabase Auth
- 🔄 Mensagens agora persistem no banco de dados
- 🔄 Stories agora expiram automaticamente após 24h
- 🔄 Configurações agora são persistidas no servidor
- 🔄 Melhorias de performance com índices no banco
- 🔄 Estrutura de código reorganizada em services

### Fixed
- 🐛 Mensagens não sincronizavam entre dispositivos
- 🐛 Stories não expiravam corretamente
- 🐛 Configurações não persistiam após logout
- 🐛 Dados eram perdidos ao limpar cache do navegador
- 🐛 Sem autenticação real (apenas simulada)
- 🐛 Sem validação de permissões no servidor

### Security
- 🔒 Implementado Row Level Security (RLS) em todas as tabelas
- 🔒 Autenticação JWT em todas as requisições
- 🔒 Validação de permissões no servidor
- 🔒 Proteção contra acesso não autorizado a dados privados
- 🔒 Senhas hasheadas com bcrypt (via Supabase Auth)
- 🔒 Chaves anon públicas apenas no frontend

### Database
- 📊 Criadas 11 tabelas principais
- 📊 Implementados índices para performance
- 📊 Criadas políticas RLS para segurança
- 📊 Criadas funções e triggers automáticos
- 📊 Configurado Realtime para mensagens, notificações e stories
- 📊 Criado bucket de Storage para Stories

## [1.1.0] - 2026-11-01

### Added
- Sistema de Stories com visualização em tela cheia
- Persistência via localStorage
- Configurações de notificações, privacidade e aparência
- Exclusão de posts e comentários
- Menu de opções nos posts
- Seção de Stories no perfil

### Fixed
- Responsividade dos avisos
- Timestamps formatados corretamente
- Scroll automático em mensagens
- Marcadores de leitura (✓ e ✓✓)

## [1.0.0] - 2026-10-31

### Added
- 🎉 Primeira versão do SENAI Connect
- Feed de publicações com curtidas e comentários
- Sistema de mensagens (apenas frontend)
- Grupos com entrada/saída
- Notificações (apenas frontend)
- Perfil editável
- Onboarding de 5 etapas
- Layout responsivo
- Acessibilidade básica (ARIA labels)
- Cores institucionais SENAI (#0056D2)

### Known Issues
- Dados não persistiam após recarregar
- Sem autenticação real
- Mensagens não sincronizavam
- Stories não expiravam
- Configurações não persistiam

---

## Legenda

- ✅ **Added**: Novas funcionalidades
- 🔄 **Changed**: Mudanças em funcionalidades existentes
- 🐛 **Fixed**: Correções de bugs
- 🔒 **Security**: Melhorias de segurança
- 📊 **Database**: Mudanças no banco de dados
- ⚠️ **Deprecated**: Funcionalidades que serão removidas
- ❌ **Removed**: Funcionalidades removidas

## Versões Anteriores

### [0.1.0] - 2026-10-30 (Protótipo Inicial)
- Estrutura básica do projeto
- Componentes de UI reutilizáveis
- Layout com sidebar e bottom nav
- Sistema de rotas simples

---

**Mantenedor**: Alef Lorenzo  
**Contato**: alef@sp.senai.br  
**Repositório**: https://github.com/AlefLorenzo/SenaiConnect-q
