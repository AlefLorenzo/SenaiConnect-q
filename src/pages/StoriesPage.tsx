import { useState, useRef, useEffect } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, EmptyState, Modal } from '../components/UI';
import { Plus, X, Eye, Trash2, Clock, Pause } from 'lucide-react';
import type { Story } from '../store';

export function StoriesPage() {
  const { user } = useAuth();
  const { stories, addStory, viewStory, deleteStory } = useData();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [showViewers, setShowViewers] = useState<Story | null>(null);
  const [filter, setFilter] = useState<'all' | 'mine' | 'others'>('all');

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
    if (story.userId !== user?.id) {
      viewStory(story.id);
    }
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
    addToast('info', 'Story excluído.');
    setViewingStory(null);
  };

  // Filter stories
  const filteredStories = stories.filter(s => {
    if (filter === 'mine') return s.userId === user?.id;
    if (filter === 'others') return s.userId !== user?.id;
    return true;
  });

  // Group by user
  const storiesByUser = filteredStories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Sort each user's stories by date
  Object.values(storiesByUser).forEach(userStories => {
    userStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">Stories</h1>
        <Button size="sm" onClick={() => setShowCreate(true)} icon={<Plus className="w-4 h-4" />}>
          Novo Story
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-1">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'mine', label: 'Meus Stories' },
          { id: 'others', label: 'Outros' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.id ? 'bg-senai text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      {Object.keys(storiesByUser).length === 0 ? (
        <EmptyState
          icon={<Eye className="w-8 h-8" />}
          title="Nenhum story ativo"
          description="Stories duram 24 horas. Publique o seu!"
          action={<Button size="sm" onClick={() => setShowCreate(true)}>Publicar Story</Button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(storiesByUser).map(([userId, userStories]) => (
            <div key={userId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={userStories[0].userName} src={userStories[0].userAvatar} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{userStories[0].userName}</p>
                  <p className="text-xs text-gray-500">{userStories.length} stories ativos</p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {userStories.map((story, idx) => {
                  const hasViewed = story.views.includes(user?.id || '');
                  const isOwner = story.userId === user?.id;
                  return (
                    <div key={story.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      {story.mediaType === 'image' ? (
                        <img src={story.mediaUrl} alt={story.caption || 'Story'} className="w-full h-full object-cover" />
                      ) : (
                        <video src={story.mediaUrl} className="w-full h-full object-cover" />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2">
                        {story.caption && (
                          <p className="text-white text-xs truncate">{story.caption}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(story.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwner && (
                            <span className="text-white text-[10px] flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {story.views.length}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Unviewed indicator */}
                      {!hasViewed && !isOwner && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-senai rounded-full" />
                      )}
                      {/* Owner actions */}
                      {isOwner && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition"
                          aria-label="Excluir story"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      {/* Viewers button for owner */}
                      {isOwner && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowViewers(story); }}
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-black/60 text-white rounded-full transition"
                          aria-label="Ver visualizações"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      )}
                      {/* Click to view */}
                      <button
                        onClick={() => handleViewStory(story, stories.findIndex(s => s.id === story.id))}
                        className="absolute inset-0"
                        aria-label={`Ver story de ${story.userName}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

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
        <StoryViewer
          story={viewingStory}
          allStories={filteredStories}
          currentIndex={viewingIndex}
          onClose={() => setViewingStory(null)}
          onDelete={handleDeleteStory}
          onViewers={setShowViewers}
          onNavigate={setViewingStory}
          isOwner={viewingStory.userId === user?.id}
        />
      )}

      {/* Viewers Modal */}
      {showViewers && (
        <Modal open={!!showViewers} onClose={() => setShowViewers(null)} title="Visualizações" size="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-senai-light rounded-xl">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-senai" />
                <span className="font-semibold text-senai-dark">{showViewers.views.length}</span>
              </div>
              <span className="text-sm text-gray-600">visualizações</span>
            </div>
            {showViewers.views.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma visualização ainda</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {showViewers.views.map(viewerId => {
                  const viewerName = `Usuário ${viewerId.slice(0, 4)}`;
                  return (
                    <div key={viewerId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl">
                      <Avatar name={viewerName} size="md" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{viewerName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Story Viewer Component com navegação completa
function StoryViewer({
  story,
  allStories,
  currentIndex,
  onClose,
  onDelete,
  onViewers,
  onNavigate,
  isOwner
}: {
  story: Story;
  allStories: Story[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onViewers: (story: Story) => void;
  onNavigate: (story: Story) => void;
  isOwner: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleNext = () => {
    if (currentIndex < allStories.length - 1) {
      const nextStory = allStories[currentIndex + 1];
      onNavigate(nextStory);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevStory = allStories[currentIndex - 1];
      onNavigate(prevStory);
    }
  };

  // Avanço automático
  useEffect(() => {
    if (isPaused) return;

    if (story.mediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      const handleTimeUpdate = () => {
        const videoProgress = (video.currentTime / video.duration) * 100;
        setProgress(videoProgress);
      };
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    } else {
      // Imagem: avanço automático em 5s
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / 5000) * 100;
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          handleNext();
        }
      }, 50);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isPaused, story.id, story.mediaType]);

  // Resetar progresso quando story muda
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
  }, [story.id]);

  // Pause ao segurar
  const handleMouseDown = () => {
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsPaused(false);
  };

  // Clique para avançar/voltar
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      handlePrev();
    } else if (x > (width * 2) / 3) {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative max-w-lg w-full h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
          {/* Progress bar */}
          <div className="mb-3 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Avatar name={story.userName} size="sm" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{story.userName}</p>
              <p className="text-white/70 text-xs">
                {new Date(story.createdAt).toLocaleString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </p>
            </div>
            {isOwner && (
              <>
                <button
                  onClick={() => onViewers(story)}
                  className="text-white p-2 hover:bg-white/20 rounded-full transition flex items-center gap-1"
                  aria-label="Ver visualizações"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">{story.views.length}</span>
                </button>
                <button
                  onClick={() => onDelete(story.id)}
                  className="text-white p-2 hover:bg-white/20 rounded-full transition"
                  aria-label="Excluir story"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button 
              onClick={onClose} 
              className="text-white p-2 hover:bg-white/20 rounded-full transition" 
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Pause className="w-16 h-16 text-white/50" />
            </div>
          )}
        </div>
        
        {/* Navigation areas */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={handlePrev}
          aria-label="Story anterior"
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={handleNext}
          aria-label="Próximo story"
        />
        
        {/* Media */}
        <div 
          className="flex-1 flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onClick={handleClick}
        >
          {story.mediaType === 'image' ? (
            <img 
              src={story.mediaUrl} 
              alt={story.caption || 'Story'} 
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          ) : (
            <video 
              ref={videoRef}
              src={story.mediaUrl} 
              controls={false}
              autoPlay={!isPaused}
              className="max-w-full max-h-full"
              onEnded={handleNext}
            />
          )}
        </div>
        
        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10">
            <p className="text-white text-sm text-center">{story.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
