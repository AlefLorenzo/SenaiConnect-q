import { useState } from 'react';
import { useData, useToast } from '../store';
import { Avatar, EmptyState, Button, Modal } from '../components/UI';
import { Bell, Heart, MessageCircle, Users, FileText, Check, CheckCheck, Calendar, BookOpen, Bookmark, AlertTriangle, Info, Star, Clock, MapPin, Plus, Camera, Trash2, X } from 'lucide-react';
import { useAuth } from '../store';

// ===== NOTIFICATIONS PAGE =====
export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { addToast } = useToast();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAll = () => {
    markAllNotificationsRead();
    addToast('success', 'Todas as notificações foram marcadas como lidas.');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow': return <Users className="w-4 h-4 text-green-500" />;
      case 'group': return <Users className="w-4 h-4 text-purple-500" />;
      case 'notice': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Notificações</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAll} icon={<CheckCheck className="w-4 h-4" />}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="Nenhuma notificação"
            description="Quando alguém interagir com você, aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left ${
                  !notif.read ? 'bg-senai-light/50' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={notif.fromUser} size="md" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center border shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{notif.createdAt}</p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 bg-senai rounded-full shrink-0" aria-label="Não lida" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== EVENTS PAGE =====
export function EventsPage() {
  const [registered, setRegistered] = useState<string[]>([]);
  const { addToast } = useToast();

  const events = [
    { id: 'e1', title: 'Feira de Profissões SENAI', date: '2026-07-15', time: '09:00', location: 'Auditório Principal', description: 'Conheça as oportunidades de carreira nas indústrias.', category: 'Feira' },
    { id: 'e2', title: 'Workshop de IoT', date: '2026-07-20', time: '14:00', location: 'Lab 3 - Eletrônica', description: 'Mão na massa com Arduino e sensores.', category: 'Workshop' },
    { id: 'e3', title: 'Hackathon Estudantil', date: '2026-08-05', time: '08:00', location: 'Espaço Maker', description: '48h desenvolvendo soluções inovadoras.', category: 'Competição' },
    { id: 'e4', title: 'Palestra: Indústria 4.0', date: '2026-08-12', time: '19:00', location: 'Online', description: 'Tendências e tecnologias da quarta revolução industrial.', category: 'Palestra' },
  ];

  const handleRegister = (eventId: string, title: string) => {
    if (registered.includes(eventId)) {
      setRegistered(prev => prev.filter(id => id !== eventId));
      addToast('info', `Inscrição cancelada para "${title}".`);
    } else {
      setRegistered(prev => [...prev, eventId]);
      addToast('success', `Inscrição realizada para "${title}"!`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Eventos</h1>
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-senai-light rounded-xl flex flex-col items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-senai" />
                <span className="text-[10px] text-senai-dark font-bold mt-0.5">
                  {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">{event.category}</span>
                </div>
                <h3 className="font-semibold text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <Button
                variant={registered.includes(event.id) ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleRegister(event.id, event.title)}
                icon={registered.includes(event.id) ? <Check className="w-4 h-4" /> : undefined}
              >
                {registered.includes(event.id) ? 'Inscrito' : 'Inscrever-se'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== COURSES PAGE =====
export function CoursesPage() {
  const [enrolled, setEnrolled] = useState<string[]>(['c1']);
  const { addToast } = useToast();

  const courses = [
    { id: 'c1', title: 'Desenvolvimento Web com React', instructor: 'Prof. Carlos', duration: '40h', progress: 65, level: 'Intermediário', icon: '💻' },
    { id: 'c2', title: 'IoT com Arduino', instructor: 'Prof. Ana', duration: '30h', progress: 0, level: 'Iniciante', icon: '🤖' },
    { id: 'c3', title: 'Design de Interfaces', instructor: 'Prof. Maria', duration: '25h', progress: 0, level: 'Iniciante', icon: '🎨' },
    { id: 'c4', title: 'Banco de Dados MySQL', instructor: 'Prof. João', duration: '35h', progress: 0, level: 'Intermediário', icon: '🗄️' },
  ];

  const handleEnroll = (courseId: string, title: string) => {
    if (enrolled.includes(courseId)) {
      setEnrolled(prev => prev.filter(id => id !== courseId));
      addToast('info', `Matrícula cancelada em "${title}".`);
    } else {
      setEnrolled(prev => [...prev, courseId]);
      addToast('success', `Matrícula realizada em "${title}"!`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Cursos Disponíveis</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{course.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{course.instructor} • {course.duration}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">{course.level}</span>
              </div>
            </div>
            {enrolled.includes(course.id) && course.progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary">Progresso</span>
                  <span className="font-bold text-senai">{course.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-senai to-senai-dark rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            )}
            <div className="mt-3">
              <Button
                variant={enrolled.includes(course.id) ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleEnroll(course.id, course.title)}
                className="w-full"
              >
                {enrolled.includes(course.id) ? (course.progress > 0 ? 'Continuar curso' : 'Matriculado') : 'Matricular-se'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== NOTICES PAGE =====
export function NoticesPage() {
  const notices = [
    { id: 'n1', title: 'Matrículas abertas para o próximo semestre', date: 'Hoje', priority: 'urgente', content: 'As matrículas para o próximo semestre já estão abertas. Compareça à secretaria ou acesse o portal do aluno.' },
    { id: 'n2', title: 'Manutenção do laboratório de informática', date: 'Ontem', priority: 'importante', content: 'O laboratório 2 ficará em manutenção na próxima quarta-feira. Utilize o laboratório 4 como alternativa.' },
    { id: 'n3', title: 'Novo horário da biblioteca', date: '3 dias atrás', priority: 'informativo', content: 'A biblioteca agora funciona até as 21h durante a semana. Aproveitem!' },
    { id: 'n4', title: 'Semana de provas - Calendário atualizado', date: '1 semana atrás', priority: 'urgente', content: 'O calendário de provas foi atualizado. Confiram as datas no portal do aluno.' },
  ];

  const priorityStyles = {
    urgente: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> },
    importante: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: <Star className="w-4 h-4 text-yellow-500 shrink-0" /> },
    informativo: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: <Info className="w-4 h-4 text-blue-500 shrink-0" /> },
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Avisos Institucionais</h1>
      <div className="space-y-3">
        {notices.map(notice => {
          const style = priorityStyles[notice.priority as keyof typeof priorityStyles];
          return (
            <div key={notice.id} className={`${style.bg} border ${style.border} rounded-xl p-4 animate-fade-in max-w-full`}>
              <div className="flex items-start gap-3">
                {style.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.badge}`}>{notice.priority}</span>
                    <span className="text-xs text-gray-500">{notice.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">{notice.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed break-words">{notice.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== SAVED PAGE =====
export function SavedPage() {
  const { posts } = useData();
  const savedPosts = posts.filter(p => p.saved);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Conteúdos Salvos</h1>
      {savedPosts.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="Nenhum conteúdo salvo"
          description="Salve publicações interessantes para acessar depois."
        />
      ) : (
        <div className="space-y-3">
          {savedPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={post.userName} size="sm" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{post.userName}</p>
                  <p className="text-xs text-gray-500">{post.createdAt}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== STORIES PAGE =====
export function StoriesPage() {
  const { user } = useAuth();
  const { stories, addStory, viewStory, deleteStory } = useData();
  const { addToast } = useToast();
  const [viewingStory, setViewingStory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const mediaUrl = reader.result as string;
        const mediaType = file.type.startsWith('video') ? 'video' : 'image';
        addStory(mediaUrl, mediaType, caption || undefined);
        addToast('success', 'Story publicado! Dura 24 horas.');
        setCaption('');
        setShowCreate(false);
      };
      reader.readAsDataURL(file);
    } catch {
      addToast('error', 'Não foi possível publicar o story.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewStory = (storyId: string) => {
    setViewingStory(storyId);
    viewStory(storyId);
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
    addToast('info', 'Story excluído.');
  };

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, typeof stories>);

  const activeStory = stories.find(s => s.id === viewingStory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Stories</h1>
        <Button size="sm" onClick={() => setShowCreate(true)} icon={<Plus className="w-4 h-4" />}>
          Novo Story
        </Button>
      </div>

      {/* Create Story Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Publicar Story">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Foto ou Vídeo</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-senai-light file:text-senai-dark hover:file:bg-senai-200"
            />
            <p className="text-xs text-gray-500">Máximo 10MB. O story dura 24 horas.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Legenda (opcional)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Adicione uma legenda..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
          </div>
          {uploading && <p className="text-sm text-senai">Publicando...</p>}
        </div>
      </Modal>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <EmptyState
          icon={<Camera className="w-8 h-8" />}
          title="Nenhum story ativo"
          description="Stories duram 24 horas. Publique o seu!"
          action={<Button size="sm" onClick={() => setShowCreate(true)}>Publicar Story</Button>}
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Object.entries(storiesByUser).map(([userId, userStories]) => (
            <div key={userId} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar name={userStories[0].userName} size="xs" />
                <span className="text-xs font-medium text-gray-700 truncate">{userStories[0].userName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {userStories.map(story => (
                  <div key={story.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 border-senai hover:border-senai-dark transition">
                    {story.mediaType === 'image' ? (
                      <img src={story.mediaUrl} alt={story.caption || 'Story'} className="w-full h-full object-cover" />
                    ) : (
                      <video src={story.mediaUrl} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      {story.userId === user?.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition"
                          aria-label="Excluir story"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewStory(story.id)}
                      className="absolute inset-0"
                      aria-label={`Ver story de ${story.userName}`}
                    />
                    {story.views.length > 0 && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                        👁 {story.views.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setViewingStory(null)}>
          <div className="relative max-w-lg w-full h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar name={activeStory.userName} size="sm" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{activeStory.userName}</p>
                  <p className="text-white/70 text-xs">
                    {new Date(activeStory.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <button onClick={() => setViewingStory(null)} className="text-white p-2" aria-label="Fechar">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            {/* Media */}
            <div className="flex-1 flex items-center justify-center">
              {activeStory.mediaType === 'image' ? (
                <img src={activeStory.mediaUrl} alt={activeStory.caption || 'Story'} className="max-w-full max-h-full object-contain" />
              ) : (
                <video src={activeStory.mediaUrl} controls autoPlay className="max-w-full max-h-full" />
              )}
            </div>
            {/* Caption */}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm text-center">{activeStory.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== HELP PAGE =====
export function HelpPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Ajuda e Dicas</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="p-4 bg-senai-light rounded-xl border border-senai-200">
          <h2 className="font-semibold text-senai-dark mb-2">🎯 Sobre o SENAI Connect</h2>
          <p className="text-sm text-text-primary">
            O SENAI Connect é uma rede social acadêmica desenvolvida para conectar alunos, professores e a comunidade SENAI. Aqui você pode compartilhar conteúdos, participar de grupos, trocar mensagens e muito mais.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: '📰', title: 'Feed', desc: 'Na página inicial, veja publicações da comunidade. Curta, comente e compartilhe conteúdos.' },
            { icon: '👥', title: 'Grupos', desc: 'Participe de grupos de estudo e projetos. Encontre pessoas com interesses similares.' },
            { icon: '💬', title: 'Mensagens', desc: 'Converse diretamente com colegas e professores de forma privada.' },
            { icon: '🔔', title: 'Notificações', desc: 'Receba alertas sobre curtidas, comentários e avisos importantes.' },
            { icon: '📅', title: 'Eventos', desc: 'Fique por dentro dos eventos e atividades do SENAI.' },
            { icon: '📚', title: 'Cursos', desc: 'Acesse cursos complementares e acompanhe seu progresso.' },
            { icon: '📢', title: 'Avisos', desc: 'Veja comunicados institucionais e informações importantes.' },
            { icon: '👤', title: 'Perfil', desc: 'Personalize seu perfil e gerencie suas configurações.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== SETTINGS PAGE =====
export function SettingsPage() {
  const { settings, updateSettings } = useData();
  const { addToast } = useToast();

  const handleNotifToggle = (key: keyof typeof settings.notifications) => {
    updateSettings({
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    });
    addToast('success', 'Preferência salva.');
  };

  const handlePrivacyToggle = (key: keyof typeof settings.privacy) => {
    updateSettings({
      privacy: { ...settings.privacy, [key]: !settings.privacy[key] }
    });
    addToast('success', 'Preferência de privacidade salva.');
  };

  const handleAppearanceToggle = (key: keyof typeof settings.appearance) => {
    updateSettings({
      appearance: { ...settings.appearance, [key]: !settings.appearance[key] }
    });
    addToast('success', 'Preferência de aparência salva.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
      
      {/* Notificações */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">Notificações</h2>
        {Object.entries(settings.notifications).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700 capitalize">
              {key === 'likes' ? 'Curtidas' : key === 'comments' ? 'Comentários' : key === 'follows' ? 'Novos seguidores' : key === 'groups' ? 'Grupos' : key === 'notices' ? 'Avisos' : 'Mensagens'}
            </span>
            <button
              onClick={() => handleNotifToggle(key as keyof typeof settings.notifications)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-senai' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={value}
              aria-label={`Notificações de ${key}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Privacidade */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">Privacidade</h2>
        {Object.entries(settings.privacy).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700">
              {key === 'showEmail' ? 'Mostrar e-mail no perfil' : key === 'showCourse' ? 'Mostrar curso no perfil' : 'Permitir mensagens de todos'}
            </span>
            <button
              onClick={() => handlePrivacyToggle(key as keyof typeof settings.privacy)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-senai' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={value}
              aria-label={key}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Aparência */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">Aparência</h2>
        {Object.entries(settings.appearance).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700">
              {key === 'compactMode' ? 'Modo compacto' : 'Reduzir animações'}
            </span>
            <button
              onClick={() => handleAppearanceToggle(key as keyof typeof settings.appearance)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-senai' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={value}
              aria-label={key}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Sobre</h2>
        <p className="text-sm text-gray-600">SENAI Connect v1.1.0</p>
        <p className="text-xs text-gray-400 mt-1">Rede Social Acadêmica • © 2026</p>
        <p className="text-xs text-gray-400 mt-1">Dados persistidos localmente</p>
      </div>
    </div>
  );
}
