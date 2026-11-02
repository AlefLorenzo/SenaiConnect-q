import { useState } from 'react';
import { useData, useToast } from '../store';
import { Avatar, EmptyState, Button } from '../components/UI';
import { Bell, Heart, MessageCircle, Users, FileText, Check, CheckCheck, Calendar, BookOpen, Bookmark, AlertTriangle, Info, Star, Clock, MapPin } from 'lucide-react';

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
                  !notif.read ? 'bg-senai-50/50' : ''
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
              <div className="w-14 h-14 bg-senai-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-senai" />
                <span className="text-[10px] text-senai-700 font-bold mt-0.5">
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
                  <span className="text-gray-500">Progresso</span>
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
    urgente: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
    importante: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: <Star className="w-4 h-4 text-yellow-500" /> },
    informativo: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: <Info className="w-4 h-4 text-blue-500" /> },
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Avisos Institucionais</h1>
      <div className="space-y-3">
        {notices.map(notice => {
          const style = priorityStyles[notice.priority as keyof typeof priorityStyles];
          return (
            <div key={notice.id} className={`${style.bg} border ${style.border} rounded-2xl p-5 animate-fade-in`}>
              <div className="flex items-start gap-3">
                {style.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.badge}`}>{notice.priority}</span>
                    <span className="text-xs text-gray-400">{notice.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{notice.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
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

// ===== HELP PAGE =====
export function HelpPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Ajuda e Dicas</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="p-4 bg-senai-50 rounded-xl border border-senai-100">
          <h2 className="font-semibold text-senai-700 mb-2">🎯 Sobre o SENAI Connect</h2>
          <p className="text-sm text-gray-700">
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
  const { addToast } = useToast();
  const [notifSettings, setNotifSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    groups: true,
    notices: true,
  });

  const handleToggle = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('info', 'Preferência atualizada.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">Notificações</h2>
        {Object.entries(notifSettings).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm text-gray-700 capitalize">
              {key === 'likes' ? 'Curtidas' : key === 'comments' ? 'Comentários' : key === 'follows' ? 'Novos seguidores' : key === 'groups' ? 'Grupos' : 'Avisos'}
            </span>
            <button
              onClick={() => handleToggle(key as keyof typeof notifSettings)}
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Sobre</h2>
        <p className="text-sm text-gray-600">SENAI Connect v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Rede Social Acadêmica • © 2026</p>
      </div>
    </div>
  );
}
