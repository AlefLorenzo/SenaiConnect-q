import { useState } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, EmptyState, Badge } from '../components/UI';
import { Send, ArrowLeft, Search } from 'lucide-react';

interface MessageData {
  id: string;
  content: string;
  fromMe: boolean;
  time: string;
}

export function MessagesPage() {
  const { user } = useAuth();
  const { conversations } = useData();
  const { addToast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Record<string, MessageData[]>>({
    '2': [
      { id: 'm1', content: 'Oi! Tudo bem?', fromMe: false, time: '10:30' },
      { id: 'm2', content: 'Oi Maria! Tudo sim, e você?', fromMe: true, time: '10:32' },
      { id: 'm3', content: 'Bem também! Vi seu projeto de IoT, ficou muito legal!', fromMe: false, time: '10:35' },
      { id: 'm4', content: 'Obrigado! Fiquei bastante satisfeito com o resultado', fromMe: true, time: '10:36' },
      { id: 'm5', content: 'Obrigada pela ajuda!', fromMe: false, time: '10:40' },
    ],
    '3': [
      { id: 'm6', content: 'Bom dia, professor!', fromMe: true, time: '08:00' },
      { id: 'm7', content: 'Bom dia! Como estão os estudos?', fromMe: false, time: '08:15' },
      { id: 'm8', content: 'Não esqueça da entrega do projeto na sexta-feira', fromMe: false, time: '09:00' },
    ],
    '4': [
      { id: 'm9', content: 'E aí, vamos estudar juntos amanhã?', fromMe: false, time: '14:00' },
    ],
  });

  const selectedConv = conversations.find(c => c.userId === selectedConversation);
  const currentMessages = selectedConversation ? (messages[selectedConversation] || []) : [];

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 300));
    const newMsg: MessageData = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg],
    }));
    setMessageInput('');
    addToast('success', 'Mensagem enviada.');
    setSending(false);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

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
                <span className="px-2 py-0.5 bg-senai-50 text-senai-700 rounded-full text-xs font-bold">
                  {totalUnread} nova{totalUnread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar conversas..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
                aria-label="Buscar conversas"
              />
            </div>
          </div>
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <EmptyState
                icon={<Send className="w-8 h-8" />}
                title="Nenhuma conversa"
                description="Inicie uma conversa com um colega ou professor."
              />
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedConversation(conv.userId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${
                    selectedConversation === conv.userId ? 'bg-senai-50 border-l-2 border-l-senai' : ''
                  }`}
                  aria-label={`Conversa com ${conv.userName}`}
                >
                  <div className="relative">
                    <Avatar name={conv.userName} src={conv.userAvatar} size="md" />
                    {conv.unread > 0 && <Badge count={conv.unread} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-800 truncate">{conv.userName}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">{conv.lastTime}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
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
                <div>
                  <p className="font-semibold text-sm text-gray-800">{selectedConv.userName}</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {currentMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.fromMe
                        ? 'bg-senai text-white rounded-br-md'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.fromMe ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
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
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition"
                    aria-label="Digite uma mensagem"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sending}
                    className="p-2.5 bg-senai text-white rounded-xl hover:bg-senai-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                description="Escolha uma conversa na lista para começar a mensagens."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
