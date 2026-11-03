import { useState, useRef, useEffect } from 'react';
import { useAuth, useToast } from '../store';
import { Avatar, Button, EmptyState, Modal } from '../components/UI';
import { 
  Users, Search, UserPlus, UserMinus, Check, MessageCircle, 
  Send, ArrowLeft, Plus, X, Trash2, Pin, Image as ImageIcon,
  FileText, Calendar, BarChart3, Settings, Bell
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: number;
  joined: boolean;
  category: string;
  isPrivate: boolean;
  creatorId: string;
}

interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  type: 'text' | 'image' | 'file' | 'pinned';
  pinned?: boolean;
}

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: number;
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: string[] }[];
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

const MOCK_COMMUNITIES: Community[] = [
  { id: 'c1', name: 'Desenvolvimento Web', description: 'Grupo para discutir HTML, CSS, JS e frameworks modernos', icon: '💻', members: 45, joined: true, category: 'Tecnologia', isPrivate: false, creatorId: '1' },
  { id: 'c2', name: 'IoT e Automação', description: 'Projetos com Arduino, Raspberry Pi e sensores', icon: '🤖', members: 32, joined: false, category: 'Tecnologia', isPrivate: false, creatorId: '2' },
  { id: 'c3', name: 'Design UI/UX', description: 'Compartilhe seus designs e receba feedback', icon: '🎨', members: 28, joined: true, category: 'Design', isPrivate: false, creatorId: '3' },
  { id: 'c4', name: 'Preparação para Estágio', description: 'Dicas de currículo, entrevistas e oportunidades', icon: '💼', members: 67, joined: false, category: 'Carreira', isPrivate: false, creatorId: '1' },
  { id: 'c5', name: 'Matemática Aplicada', description: 'Resolução de problemas e estudo em grupo', icon: '📐', members: 21, joined: false, category: 'Estudos', isPrivate: false, creatorId: '2' },
];

const MOCK_MESSAGES: Record<string, CommunityMessage[]> = {
  'c1': [
    { id: 'm1', userId: '2', userName: 'Maria Silva', userAvatar: '', content: 'Oi pessoal! Alguém já trabalhou com React 19?', createdAt: '10:30', type: 'text' },
    { id: 'm2', userId: '3', userName: 'Prof. Carlos', userAvatar: '', content: 'Sim! Os novos hooks são muito interessantes. Principalmente o use() para promises.', createdAt: '10:32', type: 'text' },
    { id: 'm3', userId: '1', userName: 'Alef Lorenzo', userAvatar: '', content: 'Estou estudando agora. A documentação está bem completa!', createdAt: '10:35', type: 'text' },
    { id: 'm4', userId: '2', userName: 'Maria Silva', userAvatar: '', content: 'Valeu! Vou dar uma olhada também 👍', createdAt: '10:40', type: 'text' },
  ],
  'c3': [
    { id: 'm5', userId: '4', userName: 'Ana Santos', userAvatar: '', content: 'Alguém tem dicas de ferramentas para prototipagem?', createdAt: '09:15', type: 'text' },
    { id: 'm6', userId: '3', userName: 'Prof. Carlos', userAvatar: '', content: 'Figma é excelente! Gratuito para estudantes.', createdAt: '09:20', type: 'text' },
  ]
};

export function CommunitiesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'posts' | 'polls' | 'events' | 'files'>('chat');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'available'>('all');
  const [messages, setMessages] = useState<Record<string, CommunityMessage[]>>(MOCK_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'Tecnologia', isPrivate: false });
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = communities.find(c => c.id === selectedCommunity);
  const currentMessages = selectedCommunity ? (messages[selectedCommunity] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const filtered = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'joined' && c.joined) || (filter === 'available' && !c.joined);
    return matchesSearch && matchesFilter;
  });

  const handleToggleCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id !== communityId) return c;
      const newJoined = !c.joined;
      addToast('success', newJoined ? `Você entrou em "${c.name}"!` : `Você saiu de "${c.name}".`);
      return { ...c, joined: newJoined, members: newJoined ? c.members + 1 : c.members - 1 };
    }));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedCommunity || !user) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 300));
    
    const newMsg: CommunityMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: messageInput.trim(),
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedCommunity]: [...(prev[selectedCommunity] || []), newMsg]
    }));
    setMessageInput('');
    setSending(false);
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim() || !user) return;
    const community: Community = {
      id: Date.now().toString(),
      name: newCommunity.name,
      description: newCommunity.description,
      icon: '🌟',
      members: 1,
      joined: true,
      category: newCommunity.category,
      isPrivate: newCommunity.isPrivate,
      creatorId: user.id
    };
    setCommunities(prev => [community, ...prev]);
    addToast('success', `Comunidade "${community.name}" criada!`);
    setNewCommunity({ name: '', description: '', category: 'Tecnologia', isPrivate: false });
    setShowCreateCommunity(false);
  };

  const handleCreatePoll = () => {
    if (!newPoll.question.trim() || !user) return;
    addToast('success', 'Enquete criada com sucesso!');
    setNewPoll({ question: '', options: ['', ''] });
    setShowCreatePoll(false);
  };

  // Community List View
  if (!selectedCommunity) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-bold text-gray-800">Comunidades</h1>
          <Button size="sm" onClick={() => setShowCreateCommunity(true)} icon={<Plus className="w-4 h-4" />}>
            Nova Comunidade
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar comunidades..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition"
              aria-label="Buscar comunidades"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'joined', 'available'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f ? 'bg-senai text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'joined' ? 'Participando' : 'Disponíveis'}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="Nenhuma comunidade encontrada"
            description={search ? 'Tente buscar com outros termos.' : 'Crie a primeira comunidade!'}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map(community => (
              <button
                key={community.id}
                onClick={() => community.joined ? setSelectedCommunity(community.id) : handleToggleCommunity(community.id)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow animate-fade-in text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{community.name}</h3>
                      {community.isPrivate && <span className="text-xs text-gray-400">🔒</span>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{community.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {community.members} membros
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{community.category}</span>
                      {community.joined && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Participando
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {community.joined ? (
                    <Button variant="secondary" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedCommunity(community.id); }}>
                      <MessageCircle className="w-4 h-4" /> Entrar no chat
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleToggleCommunity(community.id); }}>
                      <UserPlus className="w-4 h-4" /> Participar
                    </Button>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Community Modal */}
        <Modal open={showCreateCommunity} onClose={() => setShowCreateCommunity(false)} title="Criar Comunidade" size="md">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nome da comunidade</label>
              <input
                type="text"
                value={newCommunity.name}
                onChange={e => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Desenvolvimento Mobile"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                value={newCommunity.description}
                onChange={e => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito da comunidade..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={newCommunity.category}
                onChange={e => setNewCommunity(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              >
                <option>Tecnologia</option>
                <option>Design</option>
                <option>Carreira</option>
                <option>Estudos</option>
                <option>Projetos</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCommunity.isPrivate}
                onChange={e => setNewCommunity(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-senai focus:ring-senai"
              />
              <span className="text-sm text-gray-700">Comunidade privada (requer aprovação)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreateCommunity(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleCreateCommunity} disabled={!newCommunity.name.trim()} className="flex-1">Criar</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Community Detail View
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-senai-light to-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCommunity(null)}
            className="p-2 hover:bg-white/50 rounded-lg transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
            {selected?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 truncate">{selected?.name}</h2>
            <p className="text-xs text-gray-500">{selected?.members} membros • {selected?.category}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/50 rounded-lg transition" aria-label="Notificações">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-white/50 rounded-lg transition" aria-label="Configurações">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{selected?.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {[
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'posts', label: 'Publicações', icon: FileText },
          { id: 'polls', label: 'Enquetes', icon: BarChart3 },
          { id: 'events', label: 'Eventos', icon: Calendar },
          { id: 'files', label: 'Arquivos', icon: ImageIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-senai text-senai'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {currentMessages.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle className="w-8 h-8" />}
                  title="Nenhuma mensagem ainda"
                  description="Seja o primeiro a iniciar a conversa!"
                />
              ) : (
                currentMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    {msg.userId !== user?.id && <Avatar name={msg.userName} src={msg.userAvatar} size="sm" />}
                    <div className={`max-w-[70%] ${msg.userId === user?.id ? 'order-1' : ''}`}>
                      {msg.userId !== user?.id && (
                        <p className="text-xs font-semibold text-gray-700 mb-0.5 px-1">{msg.userName}</p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.userId === user?.id
                          ? 'bg-senai text-white rounded-br-md'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.userId === user?.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {msg.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition" aria-label="Anexar arquivo">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition disabled:opacity-50"
                  aria-label="Digite uma mensagem"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="p-2.5 bg-senai text-white rounded-xl hover:bg-senai-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="flex-1 overflow-y-auto p-4">
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="Publicações da comunidade"
              description="Compartilhe conhecimento, projetos e dúvidas com os membros."
              action={<Button size="sm">Criar publicação</Button>}
            />
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setShowCreatePoll(true)} icon={<Plus className="w-4 h-4" />}>
                Nova enquete
              </Button>
            </div>
            <EmptyState
              icon={<BarChart3 className="w-8 h-8" />}
              title="Nenhuma enquete ativa"
              description="Crie uma enquete para ouvir a comunidade!"
            />
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto p-4">
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="Nenhum evento programado"
              description="Organize eventos e encontros com a comunidade."
              action={<Button size="sm">Criar evento</Button>}
            />
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto p-4">
            <EmptyState
              icon={<ImageIcon className="w-8 h-8" />}
              title="Nenhum arquivo compartilhado"
              description="Compartilhe materiais, documentos e imagens com a comunidade."
              action={<Button size="sm">Enviar arquivo</Button>}
            />
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      <Modal open={showCreatePoll} onClose={() => setShowCreatePoll(false)} title="Criar Enquete" size="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Pergunta</label>
            <input
              type="text"
              value={newPoll.question}
              onChange={e => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Qual sua pergunta?"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Opções</label>
            {newPoll.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...newPoll.options];
                    newOpts[idx] = e.target.value;
                    setNewPoll(prev => ({ ...prev, options: newOpts }));
                  }}
                  placeholder={`Opção ${idx + 1}`}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
                />
                {newPoll.options.length > 2 && (
                  <button
                    onClick={() => setNewPoll(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    aria-label="Remover opção"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {newPoll.options.length < 5 && (
              <button
                onClick={() => setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }))}
                className="text-sm text-senai hover:text-senai-hover font-medium"
              >
                + Adicionar opção
              </button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreatePoll(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreatePoll} disabled={!newPoll.question.trim()} className="flex-1">Criar enquete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
