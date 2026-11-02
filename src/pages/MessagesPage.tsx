import { useState, useEffect, useRef } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, EmptyState, Badge } from '../components/UI';
import { Send, ArrowLeft, Search, Trash2, Check, CheckCheck } from 'lucide-react';

export function MessagesPage() {
  const { user } = useAuth();
  const { conversations, messagesData, sendMessage, markMessagesRead } = useData();
  const { addToast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const selectedConv = conversations.find(c => c.userId === selectedConversation);
  const currentMessages = selectedConversation ? (messagesData[selectedConversation] || []) : [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentMessages.length > prevMessagesLengthRef.current && selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = currentMessages.length;
  }, [currentMessages.length, selectedConversation]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedConversation && user) {
      markMessagesRead(selectedConversation);
    }
  }, [selectedConversation, markMessagesRead, user]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;
    setSending(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      sendMessage(selectedConversation, messageInput.trim());
      setMessageInput('');
      addToast('success', 'Mensagem enviada.');
    } catch {
      addToast('error', 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Agora';
      if (mins < 60) return `${mins}min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-gray-800">Mensagens</h1>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 bg-senai-light text-senai-dark rounded-full text-xs font-bold">
                  {totalUnread} nova{totalUnread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar conversas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
                aria-label="Buscar conversas"
              />
            </div>
          </div>
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={<Send className="w-8 h-8" />}
                title={search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                description={search ? 'Tente buscar com outros termos.' : 'Inicie uma conversa com um colega ou professor.'}
              />
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv.userId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                    selectedConversation === conv.userId ? 'bg-senai-light border-l-2 border-l-senai' : ''
                  }`}
                  aria-label={`Conversa com ${conv.userName}${conv.unread > 0 ? `, ${conv.unread} mensagens não lidas` : ''}`}
                >
                  <div className="relative">
                    <Avatar name={conv.userName} src={conv.userAvatar} size="md" />
                    {conv.unread > 0 && <Badge count={conv.unread} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>
                        {conv.userName}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {formatTime(conv.lastTime)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Voltar para lista de conversas"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={selectedConv.userName} src={selectedConv.userAvatar} size="sm" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">{selectedConv.userName}</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <EmptyState
                      icon={<Send className="w-8 h-8" />}
                      title="Nenhuma mensagem ainda"
                      description="Envie a primeira mensagem para iniciar a conversa."
                    />
                  </div>
                ) : (
                  currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.fromId === user?.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.fromId === user?.id
                          ? 'bg-senai text-white rounded-br-md'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.fromId === user?.id ? 'justify-end' : ''}`}>
                          <p className={`text-[10px] ${msg.fromId === user?.id ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                          {msg.fromId === user?.id && (
                            msg.read
                              ? <CheckCheck className="w-3 h-3 text-white/70" />
                              : <Check className="w-3 h-3 text-white/50" />
                          )}
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
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition disabled:opacity-50"
                    aria-label="Digite uma mensagem"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sending}
                    className="p-2.5 bg-senai text-white rounded-xl hover:bg-senai-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<Send className="w-8 h-8" />}
                title="Selecione uma conversa"
                description="Escolha uma conversa na lista para começar a trocar mensagens."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
