import { useState, useRef } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, Modal } from './UI';
import { Plus, X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import type { Story } from '../store';

export function StoriesBar() {
  const { user } = useAuth();
  const { stories, addStory, viewStory, deleteStory } = useData();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Agrupa stories por usuário
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  const userStories = user ? (storiesByUser[user.id] || []) : [];
  const otherUsersStories = Object.entries(storiesByUser).filter(([userId]) => userId !== user?.id);

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

  const handleViewStory = (story: Story, index: number) => {
    setViewingStory(story);
    setViewingIndex(index);
    viewStory(story.id);
  };

  const handleNextStory = () => {
    const allStories = stories.filter(s => s.userId !== user?.id);
    if (viewingIndex < allStories.length - 1) {
      const nextStory = allStories[viewingIndex + 1];
      setViewingStory(nextStory);
      setViewingIndex(viewingIndex + 1);
      viewStory(nextStory.id);
    } else {
      setViewingStory(null);
    }
  };

  const handlePrevStory = () => {
    if (viewingIndex > 0) {
      const allStories = stories.filter(s => s.userId !== user?.id);
      const prevStory = allStories[viewingIndex - 1];
      setViewingStory(prevStory);
      setViewingIndex(viewingIndex - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition hidden md:flex"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition hidden md:flex"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Stories container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Seu Story */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
              aria-label="Criar novo story"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-senai group-hover:bg-senai-light transition">
                  <Avatar name={user?.name || 'U'} size="lg" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-senai rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium max-w-[64px] truncate">Seu Story</span>
            </button>

            {/* Stories de outros usuários */}
            {otherUsersStories.map(([userId, userStories]) => {
              const firstStory = userStories[0];
              const hasUnviewed = userStories.some(s => !s.views.includes(user?.id || ''));
              
              return (
                <button
                  key={userId}
                  onClick={() => handleViewStory(firstStory, stories.findIndex(s => s.id === firstStory.id))}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                  aria-label={`Ver stories de ${firstStory.userName}`}
                >
                  <div className={`p-0.5 rounded-full ${hasUnviewed ? 'bg-gradient-to-tr from-senai via-senai-dark to-senai-hover' : 'bg-gray-300'}`}>
                    <div className="p-0.5 bg-white rounded-full">
                      <Avatar name={firstStory.userName} src={firstStory.userAvatar} size="lg" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium max-w-[64px] truncate">
                    {firstStory.userName.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {otherUsersStories.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-4">
                <p className="text-sm text-gray-400">Nenhum story ativo no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Story Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Publicar Story" size="md">
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

      {/* Story Viewer */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setViewingStory(null)}>
          <div className="relative max-w-lg w-full h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <Avatar name={viewingStory.userName} size="sm" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{viewingStory.userName}</p>
                  <p className="text-white/70 text-xs">
                    {new Date(viewingStory.createdAt).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
                {viewingStory.userId === user?.id && (
                  <button
                    onClick={() => { deleteStory(viewingStory.id); setViewingStory(null); addToast('info', 'Story excluído.'); }}
                    className="text-white p-2 hover:bg-white/20 rounded-full transition"
                    aria-label="Excluir story"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setViewingStory(null)} className="text-white p-2 hover:bg-white/20 rounded-full transition" aria-label="Fechar">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[shimmer_5s_linear]" style={{ width: '100%' }} />
              </div>
            </div>
            
            {/* Navigation areas */}
            <button
              onClick={handlePrevStory}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
              aria-label="Story anterior"
            />
            <button
              onClick={handleNextStory}
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
              aria-label="Próximo story"
            />
            
            {/* Media */}
            <div className="flex-1 flex items-center justify-center">
              {viewingStory.mediaType === 'image' ? (
                <img src={viewingStory.mediaUrl} alt={viewingStory.caption || 'Story'} className="max-w-full max-h-full object-contain" />
              ) : (
                <video src={viewingStory.mediaUrl} controls autoPlay className="max-w-full max-h-full" />
              )}
            </div>
            
            {/* Caption */}
            {viewingStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm text-center">{viewingStory.caption}</p>
              </div>
            )}
            
            {/* Views count */}
            {viewingStory.userId === user?.id && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-full text-white text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {viewingStory.views.length} visualizações
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
