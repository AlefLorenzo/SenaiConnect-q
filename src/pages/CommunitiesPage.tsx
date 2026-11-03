import { useState, useRef, useEffect } from 'react';
import { useAuth, useToast } from '../store';
import { Avatar, Button, EmptyState, Modal } from '../components/UI';
import { 
  Users, Search, UserPlus, Check, MessageCircle, 
  Send, ArrowLeft, Plus, X, Image as ImageIcon,
  FileText, Calendar, BarChart3, Settings, Bell,
  ArrowRight
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
  type: 'text' | 'image' | 'file';
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
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'Tecnologia', isPrivate: false });
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

  // Mobile: Community Detail View (full screen)
  if (selectedCommunity && selected) {
    return (
      <div className="h-full flex flex-col bg-white lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-senai-light to-white shrink-0">
          <button
            onClick={() => setSelectedCommunity(null)}
            className="p-2 hover:bg-white/50 rounded-lg transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
            {selected.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 truncate text-sm">{selected.name}</h2>
            <p className="text-xs text-gray-500">{selected.members} membros</p>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto shrink-0">
          {[
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'posts', label: 'Posts', icon: FileText },
            { id: 'polls', label: 'Enquetes', icon: BarChart3 },
            { id: 'events', label: 'Eventos', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-senai text-senai'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Content */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {currentMessages.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle className="w-8 h-8" />}
                  title="Nenhuma mensagem"
                  description="Inicie a conversa!"
                />
              ) : (
                currentMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.userId !== user?.id && <Avatar name={msg.userName} size="xs" />}
                    <div className={`max-w-[75%] ${msg.userId === user?.id ? 'order-1' : ''}`}>
                      {msg.userId !== user?.id && (
                        <p className="text-[10px] font-semibold text-gray-600 mb-0.5 px-1">{msg.userName}</p>
                      )}
                      <div className={`px-3 py-2 rounded-xl text-xs ${
                        msg.userId === user?.id
                          ? 'bg-senai text-white rounded-br-sm'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-[9px] mt-0.5 ${msg.userId === user?.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {msg.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-100 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mensagem..."
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
                  disabled={sending}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-senai/20 focus:border-senai outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="p-2 bg-senai text-white rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab !== 'chat' && (
          <div className="flex-1 overflow-y-auto p-4">
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title={`Em breve: ${activeTab}`}
              description="Esta funcionalidade está em desenvolvimento."
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop: Full layout with sidebar + community detail
  return (
    <div className="h-full flex bg-white">
      {/* Left Panel: Communities List */}
      <div className="w-full lg:w-80 xl:w-96 border-r border-gray-100 flex flex-col h-full shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-800">Comunidades</h1>
            <button
              onClick={() => setShowCreateCommunity(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Criar comunidade"
            >
              <Plus className="w-5 h-5 text-senai" />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-senai/20 focus:border-senai outline-none"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'joined', 'available'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f ? 'bg-senai text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'joined' ? 'Minhas' : 'Descobrir'}
              </button>
            ))}
          </div>
        </div>

        {/* Communities List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="Nenhuma comunidade"
              description={search ? 'Tente outra busca.' : 'Crie a primeira!'}
            />
          ) : (
            <div className="p-2 space-y-1">
              {filtered.map(community => (
                <button
                  key={community.id}
                  onClick={() => community.joined ? setSelectedCommunity(community.id) : handleToggleCommunity(community.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                    selectedCommunity === community.id
                      ? 'bg-senai-light border border-senai-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm text-gray-800 truncate">{community.name}</p>
                      {community.isPrivate && <span className="text-xs">🔒</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{community.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">{community.members} membros</span>
                      {community.joined && (
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Participando
                        </span>
                      )}
                    </div>
                  </div>
                  {!community.joined && (
                    <ArrowRight className="w-4 h-4 text-senai shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Community Detail (Desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col h-full">
        {selectedCommunity && selected ? (
          <>
            {/* Community Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-senai-light to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
                  {selected.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-800 text-lg">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.members} membros • {selected.category}</p>
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
              <p className="text-sm text-gray-600 mt-2">{selected.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
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
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition ${
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

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {currentMessages.length === 0 ? (
                      <EmptyState
                        icon={<MessageCircle className="w-8 h-8" />}
                        title="Nenhuma mensagem ainda"
                        description="Seja o primeiro a iniciar a conversa!"
                      />
                    ) : (
                      currentMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          {msg.userId !== user?.id && <Avatar name={msg.userName} size="sm" />}
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
                  <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex gap-2">
                      <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition" aria-label="Anexar">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        placeholder="Digite uma mensagem..."
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
                        disabled={sending}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sending}
                        className="p-2.5 bg-senai text-white rounded-xl hover:bg-senai-hover transition disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab !== 'chat' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title={`Em breve: ${activeTab}`}
                    description="Esta funcionalidade está em desenvolvimento."
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="Selecione uma comunidade"
              description="Escolha uma comunidade na lista para começar a conversar."
            />
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      <Modal open={showCreateCommunity} onClose={() => setShowCreateCommunity(false)} title="Criar Comunidade" size="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Nome</label>
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
              placeholder="Descreva o propósito..."
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
            <span className="text-sm text-gray-700">Comunidade privada</span>
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
