import { useState } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, EmptyState, Modal } from '../components/UI';
import { Camera, Edit3, BookOpen, Heart, Bookmark, Settings, HelpCircle, Trash2, Plus, X } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { posts, stories } = useData();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [showOnboardingHelp, setShowOnboardingHelp] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    course: user?.course || '',
    interests: user?.interests?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const userPosts = posts.filter(p => p.userId === user?.id);
  const likedPosts = posts.filter(p => user && p.likes.includes(user.id));
  const savedPosts = posts.filter(p => p.saved);
  const userStories = stories.filter(s => s.userId === user?.id);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateProfile({
      bio: formData.bio,
      course: formData.course,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
    });
    addToast('success', 'Alterações do perfil salvas.');
    setEditing(false);
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-senai via-senai-dark to-senai-hover relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <Avatar name={user.name} size="xl" className="border-4 border-white shadow-lg" />
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-senai rounded-full flex items-center justify-center text-white shadow hover:bg-senai-hover transition" aria-label="Alterar foto do perfil">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 sm:pb-2">
              <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-senai-light text-senai-dark rounded-full text-xs font-medium">
                  {user.role}
                </span>
                {user.course && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <BookOpen className="w-3 h-3" /> {user.course}
                  </span>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4" /> Editar perfil
            </Button>
          </div>
          {user.bio && <p className="mt-4 text-sm text-gray-600 leading-relaxed">{user.bio}</p>}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.interests.map(i => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{i}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Seus Stories</h2>
          <span className="text-xs text-gray-500">{userStories.length} ativo{userStories.length !== 1 ? 's' : ''}</span>
        </div>
        {userStories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum story ativo. Os stories duram 24 horas.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {userStories.map(story => (
              <div key={story.id} className="relative aspect-square rounded-xl overflow-hidden group">
                {story.mediaType === 'image' ? (
                  <img src={story.mediaUrl} alt={story.caption || 'Story'} className="w-full h-full object-cover" />
                ) : (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-medium">{story.views.length} visualizações</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{userPosts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Publicações</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{likedPosts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Curtidas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{savedPosts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Salvos</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
        <h2 className="text-sm font-semibold text-gray-500 uppercase px-2 mb-2">Configurações</h2>
        <button onClick={() => setShowOnboardingHelp(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition text-left">
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Rever dicas do onboarding</p>
            <p className="text-xs text-gray-500">Veja novamente as instruções da plataforma</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition text-left">
          <Settings className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Preferências de notificação</p>
            <p className="text-xs text-gray-500">Controle quais notificações você recebe</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition text-left">
          <Bookmark className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Conteúdos salvos</p>
            <p className="text-xs text-gray-500">{savedPosts.length} publicações salvas</p>
          </div>
        </button>
      </div>

      {/* User Posts */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-senai" /> Suas publicações
        </h2>
        {userPosts.length === 0 ? (
          <EmptyState icon={<Edit3 className="w-8 h-8" />} title="Nenhuma publicação" description="Você ainda não publicou nada. Compartilhe algo com a comunidade!" />
        ) : (
          <div className="space-y-3">
            {userPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-700">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>{post.likes.length} curtidas</span>
                  <span>{post.comments.length} comentários</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Editar perfil" size="lg">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Sobre você</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Curso</label>
            <input
              type="text"
              value={formData.course}
              onChange={e => setFormData(prev => ({ ...prev, course: e.target.value }))}
              placeholder="Ex: Desenvolvimento de Sistemas"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Interesses</label>
            <input
              type="text"
              value={formData.interests}
              onChange={e => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="Separe por vírgula: React, IoT, Design"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
            <p className="text-xs text-gray-500">Separe os interesses por vírgula</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Salvar alterações</Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding Help Modal */}
      <Modal open={showOnboardingHelp} onClose={() => setShowOnboardingHelp(false)} title="Dicas da plataforma">
        <div className="space-y-4">
          <div className="p-3 bg-senai-light rounded-xl border border-senai-200">
            <p className="text-sm text-senai-dark">
              <strong>Boas-vindas ao SENAI Connect!</strong> Aqui estão as dicas para aproveitar a plataforma:
            </p>
          </div>
          {[
            { icon: '📰', title: 'Feed', desc: 'Na página inicial, veja publicações da comunidade. Curta, comente e compartilhe!' },
            { icon: '👥', title: 'Grupos', desc: 'Participe de grupos de estudo e projetos colaborativos.' },
            { icon: '💬', title: 'Mensagens', desc: 'Converse diretamente com colegas e professores.' },
            { icon: '🔔', title: 'Notificações', desc: 'Receba alertas sobre curtidas, comentários e avisos.' },
            { icon: '👤', title: 'Perfil', desc: 'Complete seu perfil para que outros te conheçam melhor.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
          <Button onClick={() => setShowOnboardingHelp(false)} className="w-full mt-4">Entendi!</Button>
        </div>
      </Modal>
    </div>
  );
}
