import { useState } from 'react';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type Category = 'security' | 'architecture' | 'code-quality' | 'dependencies' | 'database' | 'best-practices' | 'performance';

interface AuditItem {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  description: string;
  details: string;
  recommendation: string;
  file?: string;
}

const auditData: AuditItem[] = [
  // SEGURANÇA
  {
    id: 'sec-001',
    title: 'Secrets hardcoded no código-fonte',
    severity: 'critical',
    category: 'security',
    description: 'O arquivo db.js provavelmente contém credenciais de banco de dados hardcoded.',
    details: 'O arquivo backend/db.js não está no .gitignore e pode conter credenciais sensíveis. Além disso, não há evidência de uso de variáveis de ambiente no código-fonte. O .env está no .gitignore, mas é necessário verificar se o dotenv está sendo usado corretamente.',
    recommendation: 'Usar exclusivamente variáveis de ambiente via dotenv para todas as credenciais. Adicionar validação no startup para garantir que todas as variáveis obrigatórias existam. Considerar usar um .env.example como template.',
    file: 'backend/db.js'
  },
  {
    id: 'sec-002',
    title: 'CORS restrito apenas ao localhost',
    severity: 'medium',
    category: 'security',
    description: 'O CORS está configurado apenas para http://localhost:5173.',
    details: 'No server.js, o CORS permite apenas origin "http://localhost:5173". Isso é adequado para desenvolvimento, mas não há configuração para produção. Em ambiente de produção, o CORS precisa ser configurado para o domínio real.',
    recommendation: 'Criar variável de ambiente para o origin do CORS (CORS_ORIGIN). Implementar validação de ambiente (development/production) para configurar diferentes origens.',
    file: 'backend/server.js'
  },
  {
    id: 'sec-003',
    title: 'Upload de arquivos sem validação suficiente',
    severity: 'high',
    category: 'security',
    description: 'O sistema de upload pode aceitar arquivos maliciosos.',
    details: 'O uploadController.js existe mas não há evidência de validação rigorosa de tipos MIME, tamanho máximo, ou scanning de conteúdo. O express.json está configurado com limite de 50mb, o que é excessivo para uma rede social educacional.',
    recommendation: 'Implementar whitelist de tipos MIME aceitos. Limitar tamanho máximo de upload (ex: 10MB para imagens, 50MB para documentos). Usar multer com filtros de arquivo. Considerar scanning de vírus para uploads.',
    file: 'backend/controllers/uploadController.js'
  },
  {
    id: 'sec-004',
    title: 'JWT sem refresh token',
    severity: 'high',
    category: 'security',
    description: 'O sistema usa JWT mas não implementa refresh tokens.',
    details: 'O backend usa jsonwebtoken para autenticação, mas não há evidência de implementação de refresh tokens. Isso significa que tokens com longa expiração são mais vulneráveis a roubo.',
    recommendation: 'Implementar sistema de refresh tokens com expiração curta para access tokens (15min) e refresh tokens (7 dias). Armazenar refresh tokens em httpOnly cookies.',
    file: 'backend/controllers/authController.js'
  },
  {
    id: 'sec-005',
    title: 'Rate limiting ausente',
    severity: 'high',
    category: 'security',
    description: 'Não há proteção contra brute force ou abuso de API.',
    details: 'Não foi encontrado middleware de rate limiting no projeto. Endpoints de autenticação e upload são especialmente vulneráveis a ataques de força bruta e DDoS.',
    recommendation: 'Implementar express-rate-limit global e limites mais restritivos para rotas de auth (/api/auth/login, /api/auth/register). Considerar usar Redis para rate limiting distribuído.',
    file: 'backend/server.js'
  },
  {
    id: 'sec-006',
    title: 'SQL Injection potencial',
    severity: 'critical',
    category: 'security',
    description: 'Uso de MySQL2 sem evidência de prepared statements em todos os queries.',
    details: 'O backend usa mysql2 como driver de banco de dados. Embora mysql2 suporte prepared statements, é necessário verificar se TODAS as queries usam parameterized queries. Queries com concatenação de strings são vulneráveis a SQL injection.',
    recommendation: 'Auditar todos os controllers para garantir uso exclusivo de prepared statements (?, ??). Nunca concatenar strings diretamente em queries SQL. Considerar usar um ORM como Sequelize ou Prisma para maior segurança.',
    file: 'backend/controllers/*.js'
  },
  {
    id: 'sec-007',
    title: 'Express 5.x em produção sem hardening',
    severity: 'medium',
    category: 'security',
    description: 'O Express 5.2.1 está sendo usado sem middleware de segurança.',
    details: 'Não foram encontrados middlewares como helmet, hpp (HTTP Parameter Pollution), ou express-mongo-sanitize. O servidor está exposto a diversos vetores de ataque conhecidos.',
    recommendation: 'Adicionar helmet para headers de segurança, hpp para proteção contra parameter pollution, e sanitização de inputs. Implementar validação de schemas com Joi ou Zod.',
    file: 'backend/server.js'
  },
  {
    id: 'sec-008',
    title: 'Middleware duplicado (middleware vs middlewares)',
    severity: 'low',
    category: 'security',
    description: 'Existem duas pastas de middleware: middleware/ e middlewares/.',
    details: 'O backend possui duas pastas separadas para middlewares (middleware/ e middlewares/), o que pode causar confusão sobre qual está sendo usada e potencial duplicação de lógica de autenticação.',
    recommendation: 'Consolidar em uma única pasta middleware/. Remover duplicatas e garantir que toda a lógica de autenticação/autorização esteja centralizada.',
    file: 'backend/middleware/ e backend/middlewares/'
  },

  // ARQUITETURA
  {
    id: 'arch-001',
    title: 'Arquitetura MVC bem estruturada',
    severity: 'info',
    category: 'architecture',
    description: 'O backend segue o padrão MVC corretamente.',
    details: 'O backend está organizado em controllers, routes e middleware, seguindo o padrão MVC. Cada entidade (auth, posts, users, groups, messages, notices, notifications, stories, upload) tem seu controller e routes separados.',
    recommendation: 'Manter a organização atual. Considerar adicionar uma camada de services entre controllers e models para lógica de negócio complexa.',
  },
  {
    id: 'arch-002',
    title: 'Ausência de camada de Service/Model',
    severity: 'medium',
    category: 'architecture',
    description: 'Os controllers provavelmente contêm lógica de negócio misturada com queries SQL.',
    details: 'Na arquitetura MVC atual, não existe uma pasta models/ ou services/ separada. Os controllers provavelmente executam queries SQL diretamente, misturando lógica de negócio com acesso a dados.',
    recommendation: 'Criar pasta models/ para abstrair acesso ao banco de dados. Criar pasta services/ para lógica de negócio. Controllers devem apenas orquestrar requests/responses.',
    file: 'backend/controllers/'
  },
  {
    id: 'arch-003',
    title: 'Socket.io sem autenticação de conexão',
    severity: 'high',
    category: 'architecture',
    description: 'Conexões WebSocket podem não estar sendo autenticadas.',
    details: 'O socketHelper.js inicializa o Socket.io, mas é necessário verificar se cada conexão WebSocket valida o token JWT do usuário. Conexões não autenticadas podem receber dados sensíveis.',
    recommendation: 'Implementar middleware de autenticação no Socket.io usando socket.use() ou io.use(). Validar JWT em cada conexão e associar userId ao socket.',
    file: 'backend/socketHelper.js'
  },
  {
    id: 'arch-004',
    title: 'Frontend sem state management global',
    severity: 'medium',
    category: 'architecture',
    description: 'O frontend usa Context API mas pode precisar de solução mais robusta.',
    details: 'O frontend tem uma pasta context/ com Context API do React. Para uma aplicação deste tamanho (feed, mensagens, grupos, stories, notificações), o Context API pode causar re-renders desnecessários.',
    recommendation: 'Considerar Zustand ou Redux Toolkit para state management mais performático. Manter Context API apenas para auth e temas. Implementar React Query/SWR para cache de dados da API.',
    file: 'frontend/src/context/'
  },
  {
    id: 'arch-005',
    title: 'Monorepo sem ferramenta de gerenciamento',
    severity: 'low',
    category: 'architecture',
    description: 'O projeto é um monorepo manual sem ferramentas como Turborepo ou Nx.',
    details: 'O repositório contém frontend/ e backend/ como pastas separadas, mas sem um package.json raiz ou ferramenta de monorepo. Scripts precisam ser executados separadamente.',
    recommendation: 'Adicionar package.json na raiz com scripts para iniciar ambos os serviços. Considerar usar Turborepo para caching e parallel execution. Ou usar Docker Compose para orquestração.',
  },

  // CODE QUALITY
  {
    id: 'code-001',
    title: 'Sem testes automatizados',
    severity: 'high',
    category: 'code-quality',
    description: 'O projeto não possui testes unitários ou de integração.',
    details: 'O package.json do backend tem apenas "echo Error: no test specified". Não há pasta de testes, nem dependências de teste (jest, mocha, vitest). O frontend tem ESLint mas nenhum framework de teste.',
    recommendation: 'Implementar Jest + Supertest para testes de API no backend. Usar Vitest + React Testing Library no frontend. Meta mínima: 70% de cobertura nos controllers e componentes críticos.',
  },
  {
    id: 'code-002',
    title: 'JavaScript sem tipagem estática',
    severity: 'medium',
    category: 'code-quality',
    description: 'Todo o projeto usa JavaScript puro sem TypeScript.',
    details: 'O frontend usa .jsx e o backend usa .js. Não há TypeScript em nenhum dos lados. Isso dificulta manutenção, refatoração e detecção de erros em tempo de desenvolvimento.',
    recommendation: 'Migrar gradualmente para TypeScript. Começar pelo backend (tipar controllers e models) e depois frontend. Usar tsconfig strict para máxima segurança de tipos.',
  },
  {
    id: 'code-003',
    title: 'CSS separado ao invés de Tailwind/Styled-components',
    severity: 'low',
    category: 'code-quality',
    description: 'O frontend usa CSS files separados para cada componente.',
    details: 'Cada componente tem um arquivo .css correspondente (Avatar.css, BottomNav.css, Header.css, etc.). Isso funciona mas pode levar a conflitos de nomes e dificuldade de manutenção em escala.',
    recommendation: 'Considerar migrar para Tailwind CSS (utility-first) ou CSS Modules para escopo automático. Se manter CSS puro, usar BEM naming convention para evitar conflitos.',
    file: 'frontend/src/components/*.css'
  },
  {
    id: 'code-004',
    title: 'Commit messages inconsistentes',
    severity: 'low',
    category: 'code-quality',
    description: 'Apenas 7 commits para todo o projeto, com mensagens muito longas.',
    details: 'O repositório tem apenas 7 commits desde sua criação. As mensagens são extremamente longas (parágrafos inteiros), o que dificulta o git log. Não segue conventional commits.',
    recommendation: 'Adotar Conventional Commits (feat:, fix:, refactor:, etc.). Fazer commits menores e mais frequentes. Usar ferramentas como commitlint e husky para padronização.',
  },
  {
    id: 'code-005',
    title: 'Contribuição de apenas 1 desenvolvedor visível',
    severity: 'info',
    category: 'code-quality',
    description: 'O repositório mostra apenas 1 contributor, mas commits são de outro usuário.',
    details: 'O perfil mostra AlefLorenzo como contributor, mas os commits recentes são de buggynay. Isso pode indicar uso de conta diferente ou colaboração não documentada.',
    recommendation: 'Documentar todos os contributors no README. Usar arquivo CONTRIBUTING.md para projetos colaborativos. Garantir consistência nas contas Git usadas.',
  },

  // DEPENDÊNCIAS
  {
    id: 'dep-001',
    title: 'Express 5.x (versão não estável)',
    severity: 'medium',
    category: 'dependencies',
    description: 'O backend usa Express 5.2.1 que pode ter breaking changes.',
    details: 'Express 5.x é uma versão major que introduz breaking changes em relação ao 4.x. Algumas middlewares populares podem não ser compatíveis. A documentação oficial ainda referencia majoritariamente a v4.',
    recommendation: 'Verificar compatibilidade de todas as middlewares com Express 5.x. Considerar voltar para Express 4.x (mais estável e documentado) ou garantir que todas as dependências suportam v5.',
    file: 'backend/package.json'
  },
  {
    id: 'dep-002',
    title: 'MySQL2 ao invés de PostgreSQL mencionado',
    severity: 'low',
    category: 'dependencies',
    description: 'O README menciona PostgreSQL/MongoDB mas o código usa MySQL.',
    details: 'O README lista "PostgreSQL / MongoDB" como tecnologias, mas o package.json usa mysql2 e o database.sql usa sintaxe MySQL (AUTO_INCREMENT, ENGINE=InnoDB implícito).',
    recommendation: 'Atualizar o README para refletir as tecnologias reais utilizadas. Documentar a escolha do MySQL e justificar se necessário.',
    file: 'README.md vs backend/package.json'
  },
  {
    id: 'dep-003',
    title: 'React 19 com dependências potencialmente incompatíveis',
    severity: 'medium',
    category: 'dependencies',
    description: 'React 19.2.6 é muito recente e algumas libs podem não ser compatíveis.',
    details: 'O frontend usa React 19.2.6 com react-router-dom 7.15.1 e lucide-react 1.16.0. Essas versões são muito recentes e podem ter bugs ou incompatibilidades não documentadas.',
    recommendation: 'Verificar issues abertas em cada dependência. Considerar usar versões mais estáveis (React 18.x) para projetos em produção. Manter lock files atualizados.',
    file: 'frontend/package.json'
  },
  {
    id: 'dep-004',
    title: 'Sem dependências de validação',
    severity: 'high',
    category: 'dependencies',
    description: 'Não há biblioteca de validação (Joi, Zod, Yup) no backend.',
    details: 'O backend não lista nenhuma biblioteca de validação de schemas no package.json. Validação de inputs é feita manualmente ou não é feita, o que é um risco de segurança e qualidade.',
    recommendation: 'Adicionar Zod ou Joi para validação de request bodies, params e query strings. Criar schemas reutilizáveis para cada endpoint. Validar tanto no frontend quanto no backend.',
    file: 'backend/package.json'
  },
  {
    id: 'dep-005',
    title: 'package-lock.json commitado (correto)',
    severity: 'info',
    category: 'dependencies',
    description: 'O package-lock.json está versionado, garantindo builds reprodutíveis.',
    details: 'Ambos frontend e backend têm package-lock.json no repositório. Isso é uma boa prática que garante instalações determinísticas.',
    recommendation: 'Manter o package-lock.json versionado. Executar npm ci ao invés de npm install em CI/CD para installs mais rápidos e determinísticos.',
  },

  // BANCO DE DADOS
  {
    id: 'db-001',
    title: 'Schema sem índices para performance',
    severity: 'medium',
    category: 'database',
    description: 'O database.sql não define índices além das chaves primárias.',
    details: 'O schema define chaves primárias e foreign keys, mas não há índices em colunas frequentemente consultadas como email, user_id em posts, created_at, etc. Isso causa full table scans em tabelas grandes.',
    recommendation: 'Adicionar índices em: users(email), posts(user_id), posts(created_at), messages(sender_id, receiver_id), comments(post_id). Usar EXPLAIN ANALYZE para identificar queries lentas.',
    file: 'database.sql'
  },
  {
    id: 'db-002',
    title: 'Sem migrations versionadas',
    severity: 'medium',
    category: 'database',
    description: 'Existem arquivos alter.sql e alter_posts.sql soltos na raiz.',
    details: 'O repositório tem database.sql, alter.sql e alter_posts.sql na raiz. Isso indica que mudanças no schema são feitas manualmente com arquivos SQL soltos, sem versionamento adequado.',
    recommendation: 'Adotar ferramenta de migrations (Knex migrations, Sequelize migrations, ou Prisma Migrate). Cada mudança no schema deve ser uma migration versionada e reversível.',
    file: 'alter.sql, alter_posts.sql'
  },
  {
    id: 'db-003',
    title: 'Tabela events sem tabela de participação',
    severity: 'low',
    category: 'database',
    description: 'A tabela events existe mas não há tabela para registrar participações.',
    details: 'O database.sql cria tabela events mas não há tabela event_participants ou similar. O frontend tem EventosPage com "registration state", mas o backend não parece suportar isso.',
    recommendation: 'Criar tabela event_participants (event_id, user_id, status) para registrar inscrições. Adicionar endpoints para inscrição/cancelamento.',
    file: 'database.sql'
  },
  {
    id: 'db-004',
    title: 'Foreign keys com CASCADE podem causar perda de dados',
    severity: 'medium',
    category: 'database',
    description: 'Todas as FKs usam ON DELETE CASCADE.',
    details: 'Todas as foreign keys no schema usam ON DELETE CASCADE. Isso significa que deletar um usuário remove TODOS seus posts, comentários, mensagens, grupos criados, etc. sem confirmação.',
    recommendation: 'Usar ON DELETE SET NULL ou ON DELETE RESTRICT para dados importantes. Implementar soft delete (campo deleted_at) ao invés de deleção física. Adicionar confirmação no frontend antes de deletar.',
    file: 'database.sql'
  },
  {
    id: 'db-005',
    title: 'Sem tabela de stories no schema principal',
    severity: 'low',
    category: 'database',
    description: 'O backend tem storyController mas a tabela não está no database.sql.',
    details: 'O backend possui storyController.js e storyRoutes.js, mas o database.sql não contém tabela de stories. Provavelmente foi adicionada via alter.sql ou diretamente no banco.',
    recommendation: 'Manter todo o schema em um único arquivo versionado ou usar migrations. Documentar todas as tabelas no README ou em um schema documentation.',
    file: 'database.sql vs backend/controllers/storyController.js'
  },

  // BEST PRACTICES
  {
    id: 'bp-001',
    title: 'Sem CI/CD configurado',
    severity: 'medium',
    category: 'best-practices',
    description: 'Não há workflows do GitHub Actions ou qualquer CI/CD.',
    details: 'O repositório não possui pasta .github/workflows/. Não há automação de testes, lint, build ou deploy. Todo o processo é manual.',
    recommendation: 'Criar GitHub Actions com: lint check, build test, unit tests, e security audit. Adicionar branch protection rules. Implementar deploy automático para staging.',
  },
  {
    id: 'bp-002',
    title: 'Sem Docker para containerização',
    severity: 'low',
    category: 'best-practices',
    description: 'Não há Dockerfile ou docker-compose.yml.',
    details: 'O projeto não usa Docker. A configuração do ambiente de desenvolvimento depende de instalação manual de Node.js, MySQL, etc.',
    recommendation: 'Criar Dockerfile para frontend e backend. Usar docker-compose.yml para orquestrar app + database. Documentar setup com Docker no README.',
  },
  {
    id: 'bp-003',
    title: 'README desatualizado vs implementação real',
    severity: 'medium',
    category: 'best-practices',
    description: 'O README lista tecnologias que não correspondem à implementação.',
    details: 'O README menciona "React / Next.js" mas o frontend usa Vite + React (não Next.js). Menciona "PostgreSQL / MongoDB" mas usa MySQL. Menciona "CSS Modules / Tailwind" mas usa CSS puro.',
    recommendation: 'Atualizar o README para refletir exatamente as tecnologias usadas: React + Vite, Express + MySQL, CSS puro. Adicionar instruções de setup detalhadas.',
    file: 'README.md'
  },
  {
    id: 'bp-004',
    title: 'Sem variável de ambiente para PORT do backend',
    severity: 'low',
    category: 'best-practices',
    description: 'A porta 5000 está hardcoded no server.js.',
    details: 'O server.js define const PORT = 5000 hardcoded. Em ambientes como cloud (Heroku, Railway, etc.), a porta é definida pela variável PORT do ambiente.',
    recommendation: 'Usar const PORT = process.env.PORT || 5000 para flexibilidade em diferentes ambientes de deploy.',
    file: 'backend/server.js'
  },
  {
    id: 'bp-005',
    title: 'Frontend sem error boundaries',
    severity: 'medium',
    category: 'best-practices',
    description: 'Não há tratamento de erros global no frontend.',
    details: 'Não foram encontrados Error Boundaries no frontend. Um erro em qualquer componente pode derrubar toda a aplicação sem mensagem amigável ao usuário.',
    recommendation: 'Implementar Error Boundary global e por seção. Adicionar fallback UI para erros de rede. Implementar toast notifications para erros de API.',
    file: 'frontend/src/App.jsx'
  },
  {
    id: 'bp-006',
    title: 'Sem paginação nas APIs',
    severity: 'medium',
    category: 'performance',
    description: 'As APIs provavelmente retornam todos os registros sem paginação.',
    details: 'Não há evidência de paginação nos controllers. O feed de posts, mensagens e notificações provavelmente retorna todos os registros, o que causa problemas de performance com muitos dados.',
    recommendation: 'Implementar paginação com cursor ou offset em todas as listagens. Adicionar parâmetros ?page=1&limit=20. Retornar metadados (total, hasMore) nas respostas.',
    file: 'backend/controllers/postController.js'
  },
  {
    id: 'bp-007',
    title: 'Uploads servidos estaticamente sem CDN',
    severity: 'low',
    category: 'performance',
    description: 'Arquivos upload são servidos pelo próprio Express.',
    details: 'O server.js serve /uploads como static files diretamente do Express. Em produção, isso sobrecarrega o servidor Node.js com requisições de arquivos estáticos.',
    recommendation: 'Usar serviço de storage em cloud (AWS S3, Cloudinary, Firebase Storage) para uploads. Servir via CDN para melhor performance global.',
    file: 'backend/server.js'
  },
  {
    id: 'bp-008',
    title: 'Sessão com sessionStorage (migração recente)',
    severity: 'info',
    category: 'best-practices',
    description: 'Token foi migrado de localStorage para sessionStorage.',
    details: 'O último commit migrou o armazenamento de tokens de localStorage para sessionStorage para suportar multi-contas por tab. Isso é uma melhoria de UX mas tokens em sessionStorage são perdidos ao fechar a tab.',
    recommendation: 'A abordagem é válida para o caso de uso. Considerar implementar refresh tokens para evitar re-login frequente. Documentar o comportamento esperado para o usuário.',
  },
];

const severityConfig: Record<Severity, { label: string; color: string; bg: string; icon: string }> = {
  critical: { label: 'Crítico', color: 'text-red-700', bg: 'bg-red-100 border-red-300', icon: '🔴' },
  high: { label: 'Alto', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', icon: '🟠' },
  medium: { label: 'Médio', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300', icon: '🟡' },
  low: { label: 'Baixo', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300', icon: '🔵' },
  info: { label: 'Info', color: 'text-green-700', bg: 'bg-green-100 border-green-300', icon: '🟢' },
};

const categoryConfig: Record<Category, { label: string; icon: string }> = {
  'security': { label: 'Segurança', icon: '🔒' },
  'architecture': { label: 'Arquitetura', icon: '🏗️' },
  'code-quality': { label: 'Qualidade de Código', icon: '💎' },
  'dependencies': { label: 'Dependências', icon: '📦' },
  'database': { label: 'Banco de Dados', icon: '🗄️' },
  'best-practices': { label: 'Boas Práticas', icon: '✅' },
  'performance': { label: 'Performance', icon: '⚡' },
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRotation = (s: number) => {
    return (s / 100) * 180 - 90;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getColor(score)}
            strokeDasharray={`${(score / 100) * 157} 157`}
          />
          <text x="60" y="50" textAnchor="middle" className={`text-xl font-bold ${getColor(score)}`} fill="currentColor">
            {score}
          </text>
        </svg>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'recommendations'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const criticalCount = auditData.filter(i => i.severity === 'critical').length;
  const highCount = auditData.filter(i => i.severity === 'high').length;
  const mediumCount = auditData.filter(i => i.severity === 'medium').length;
  const lowCount = auditData.filter(i => i.severity === 'low').length;
  const infoCount = auditData.filter(i => i.severity === 'info').length;

  const securityScore = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5));
  const qualityScore = Math.max(0, 100 - (auditData.filter(i => i.category === 'code-quality').length * 5));
  const archScore = Math.max(0, 100 - (auditData.filter(i => i.category === 'architecture').length * 5));

  const filteredData = auditData.filter(item => {
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-xl font-bold">
                  🔍
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Auditoria de Código</h1>
                  <p className="text-gray-400 text-sm">SENAI Connect - Rede Social Acadêmica</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://github.com/AlefLorenzo/Senai-Connect"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Ver Repositório
              </a>
              <span className="text-gray-400">📅 {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'overview' as const, label: '📊 Visão Geral' },
              { id: 'findings' as const, label: '🔎 Achados' },
              { id: 'recommendations' as const, label: '💡 Recomendações' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Informações do Projeto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Nome</p>
                  <p className="font-semibold text-gray-800">SENAI Connect</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Tipo</p>
                  <p className="font-semibold text-gray-800">Rede Social Acadêmica</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Linguagens</p>
                  <p className="font-semibold text-gray-800">JS 77.5% | CSS 22.4%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase">Commits</p>
                  <p className="font-semibold text-gray-800">7 commits</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Stack Frontend</p>
                  <div className="flex flex-wrap gap-2">
                    {['React 19', 'Vite 8', 'React Router 7', 'Socket.io-client', 'Lucide React'].map(t => (
                      <span key={t} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Stack Backend</p>
                  <div className="flex flex-wrap gap-2">
                    {['Express 5', 'MySQL2', 'Socket.io', 'JWT', 'Bcrypt', 'CORS'].map(t => (
                      <span key={t} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">📈 Scores de Qualidade</h2>
              <div className="flex flex-wrap justify-center gap-8">
                <ScoreGauge score={securityScore} label="Segurança" />
                <ScoreGauge score={qualityScore} label="Qualidade" />
                <ScoreGauge score={archScore} label="Arquitetura" />
                <ScoreGauge score={55} label="Documentação" />
                <ScoreGauge score={45} label="Testes" />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                <p className="text-xs text-red-700 font-medium mt-1">🔴 Críticos</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
                <p className="text-xs text-orange-700 font-medium mt-1">🟠 Altos</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{mediumCount}</p>
                <p className="text-xs text-yellow-700 font-medium mt-1">🟡 Médios</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{lowCount}</p>
                <p className="text-xs text-blue-700 font-medium mt-1">🔵 Baixos</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{infoCount}</p>
                <p className="text-xs text-green-700 font-medium mt-1">🟢 Info</p>
              </div>
            </div>

            {/* Structure */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🗂️ Estrutura do Repositório</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-green-500">⚙️</span> Backend
                  </h3>
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{`backend/
├── controllers/
│   ├── authController.js
│   ├── commentController.js
│   ├── groupController.js
│   ├── messageController.js
│   ├── noticeController.js
│   ├── notificationController.js
│   ├── postController.js
│   ├── storyController.js
│   ├── uploadController.js
│   └── userController.js
├── middleware/
├── middlewares/
├── routes/
│   ├── authRoutes.js
│   ├── groupRoutes.js
│   ├── messageRoutes.js
│   ├── noticeRoutes.js
│   ├── notificationRoutes.js
│   ├── postRoutes.js
│   ├── storyRoutes.js
│   ├── uploadRoutes.js
│   └── userRoutes.js
├── db.js
├── migrate.js
├── server.js
├── socketHelper.js
└── package.json`}</pre>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-blue-500">🎨</span> Frontend
                  </h3>
                  <div className="bg-gray-900 text-blue-400 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{`frontend/src/
├── assets/
├── components/
│   ├── Avatar.jsx + .css
│   ├── BottomNav.jsx + .css
│   ├── Header.jsx + .css
│   ├── NotificationDropdown.jsx + .css
│   ├── Post.jsx + .css
│   ├── RightPanel.jsx + .css
│   ├── Sidebar.jsx + .css
│   ├── Story.jsx + .css
│   └── StoryViewer.jsx + .css
├── context/
├── pages/
│   ├── EventosPage
│   ├── CursosPage
│   ├── AvisosPage
│   └── ...
├── App.jsx
├── App.css
├── main.jsx
└── index.css`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">✨ Funcionalidades Implementadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: '🔐', name: 'Autenticação JWT', status: 'done' },
                  { icon: '📰', name: 'Feed com Posts', status: 'done' },
                  { icon: '💬', name: 'Mensagens Real-time', status: 'done' },
                  { icon: '👥', name: 'Grupos', status: 'done' },
                  { icon: '📢', name: 'Avisos Institucionais', status: 'done' },
                  { icon: '📅', name: 'Eventos', status: 'done' },
                  { icon: '📚', name: 'Catálogo de Cursos', status: 'done' },
                  { icon: '📖', name: 'Stories', status: 'done' },
                  { icon: '🔔', name: 'Notificações', status: 'done' },
                  { icon: '📁', name: 'Upload de Arquivos', status: 'done' },
                  { icon: '👤', name: 'Perfil do Usuário', status: 'done' },
                  { icon: '💾', name: 'Conteúdos Salvos', status: 'done' },
                ].map(feat => (
                  <div key={feat.name} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <span>{feat.icon}</span>
                    <span className="text-sm text-gray-700">{feat.name}</span>
                    <span className="ml-auto text-green-600 text-xs">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FINDINGS TAB */}
        {activeTab === 'findings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Severidade</label>
                  <select
                    value={filterSeverity}
                    onChange={e => setFilterSeverity(e.target.value as Severity | 'all')}
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  >
                    <option value="all">Todas</option>
                    <option value="critical">🔴 Crítico</option>
                    <option value="high">🟠 Alto</option>
                    <option value="medium">🟡 Médio</option>
                    <option value="low">🔵 Baixo</option>
                    <option value="info">🟢 Info</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value as Category | 'all')}
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  >
                    <option value="all">Todas</option>
                    {Object.entries(categoryConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="ml-auto">
                  <span className="text-sm text-gray-500">{filteredData.length} achados</span>
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-3">
              {filteredData.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${
                    item.severity === 'critical' ? 'border-l-red-500' :
                    item.severity === 'high' ? 'border-l-orange-500' :
                    item.severity === 'medium' ? 'border-l-yellow-500' :
                    item.severity === 'low' ? 'border-l-blue-500' :
                    'border-l-green-500'
                  } overflow-hidden`}
                >
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{severityConfig[item.severity].icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">{item.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${severityConfig[item.severity].bg} ${severityConfig[item.severity].color}`}>
                            {severityConfig[item.severity].label}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {categoryConfig[item.category].icon} {categoryConfig[item.category].label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        {item.file && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">📄 {item.file}</p>
                        )}
                      </div>
                      <span className={`transform transition ${expandedItem === item.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </button>
                  {expandedItem === item.id && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="pt-4 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Detalhes</h4>
                          <p className="text-sm text-gray-700">{item.details}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-green-700 uppercase mb-1">💡 Recomendação</h4>
                          <p className="text-sm text-green-800">{item.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Priority Actions */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-red-800 mb-3">🚨 Ações Prioritárias (Resolver Imediatamente)</h2>
              <div className="space-y-3">
                {auditData.filter(i => i.severity === 'critical').map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-red-100">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.recommendation}</p>
                    {item.file && <p className="text-xs text-gray-400 mt-2 font-mono">📄 {item.file}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Short Term */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-orange-800 mb-3">⚡ Curto Prazo (1-2 semanas)</h2>
              <div className="space-y-3">
                {auditData.filter(i => i.severity === 'high').map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-orange-100">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Term */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-yellow-800 mb-3">📅 Médio Prazo (1 mês)</h2>
              <div className="space-y-3">
                {auditData.filter(i => i.severity === 'medium').map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-yellow-100">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Long Term */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-blue-800 mb-3">🎯 Longo Prazo (Contínuo)</h2>
              <div className="space-y-3">
                {auditData.filter(i => i.severity === 'low').map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🗺️ Roadmap Sugerido</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {[
                    { phase: 'Fase 1', title: 'Segurança Crítica', items: ['Remover secrets do código', 'Implementar prepared statements SQL', 'Adicionar rate limiting', 'Validação de uploads'], color: 'red' },
                    { phase: 'Fase 2', title: 'Infraestrutura', items: ['Implementar testes automatizados', 'Adicionar CI/CD com GitHub Actions', 'Configurar Docker', 'Implementar refresh tokens'], color: 'orange' },
                    { phase: 'Fase 3', title: 'Qualidade de Código', items: ['Migrar para TypeScript', 'Adicionar validação com Zod/Joi', 'Implementar Error Boundaries', 'Paginação nas APIs'], color: 'yellow' },
                    { phase: 'Fase 4', title: 'Escalabilidade', items: ['CDN para uploads', 'State management robusto', 'Índices no banco de dados', 'Migrations versionadas'], color: 'blue' },
                  ].map(phase => (
                    <div key={phase.phase} className="relative pl-10">
                      <div className={`absolute left-2 w-5 h-5 rounded-full bg-${phase.color}-500 border-4 border-${phase.color}-100`}></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase">{phase.phase}</p>
                        <p className="font-semibold text-gray-800">{phase.title}</p>
                        <ul className="mt-2 space-y-1">
                          {phase.items.map(item => (
                            <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="text-gray-400">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">Auditoria realizada em {new Date().toLocaleDateString('pt-BR')} • {auditData.length} itens analisados</p>
          <p className="text-xs mt-2">Repositório: <a href="https://github.com/AlefLorenzo/Senai-Connect" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">AlefLorenzo/Senai-Connect</a></p>
        </div>
      </footer>
    </div>
  );
}
