import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, Modal } from './UI';
import { Plus, X, ChevronLeft, ChevronRight, Eye, Trash2, Pause } from 'lucide-react';
import type { Story } from '../store';

export function StoriesBar() {
  const { user } = useAuth();
  const { stories, addStory, viewStory, deleteStory } = useData();
  const { addToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [showViewers, setShowViewers] = useState<Story | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Organizar stories: não visualizados primeiro, depois visualizados
  const organizedStories = (() => {
    const storiesByUser = new Map<string, Story[]>();
    
    stories.forEach(story => {
      if (!storiesByUser.has(story.userId)) {
        storiesByUser.set(story.userId, []);
      }
      storiesByUser.get(story.userId)!.push(story);
    });

    // Ordenar stories de cada usuário por data (mais recente primeiro)
    storiesByUser.forEach(userStories => {
      userStories.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    // Separar em visualizados e não visualizados
    const unviewed: Story[] = [];
    const viewed: Story[] = [];

    storiesByUser.forEach(userStories => {
      const firstStory = userStories[0];
      const hasUnviewed = userStories.some(s => !s.views.includes(user?.id || ''));
      
      if (hasUnviewed) {
        unviewed.push(firstStory);
      } else {
        viewed.push(firstStory);
      }
    });

    // Dentro de cada grupo, ordenar por data
    unviewed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    viewed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { unviewed, viewed, all: [...unviewed, ...viewed] };
  })();

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

  const handleViewStory = (story: Story) => {
    setViewingStory(story);
    setCurrentStoryIndex(organizedStories.all.findIndex(s => s.id === story.id));
    
    // Não contar o próprio usuário como visualizador
    if (story.userId !== user?.id) {
      viewStory(story.id);
    }
  };

  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < organizedStories.all.length - 1) {
      const nextStory = organizedStories.all[currentStoryIndex + 1];
      setViewingStory(nextStory);
      setCurrentStoryIndex(currentStoryIndex + 1);
      
      // Não contar o próprio usuário como visualizador
      if (nextStory.userId !== user?.id) {
        viewStory(nextStory.id);
      }
    } else {
      setViewingStory(null);
    }
  }, [currentStoryIndex, organizedStories.all, user?.id, viewStory]);

  const handlePrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      const prevStory = organizedStories.all[currentStoryIndex - 1];
      setViewingStory(prevStory);
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  }, [currentStoryIndex, organizedStories.all]);

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

            {/* Stories não visualizados */}
            {organizedStories.unviewed.map(story => (
              <button
                key={story.id}
                onClick={() => handleViewStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
                aria-label={`Ver story de ${story.userName} (não visualizado)`}
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-senai via-senai-dark to-senai-hover">
                  <div className="p-0.5 bg-white rounded-full">
                    <Avatar name={story.userName} src={story.userAvatar} size="lg" />
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium max-w-[64px] truncate">
                  {story.userName.split(' ')[0]}
                </span>
              </button>
            ))}

            {/* Stories visualizados */}
            {organizedStories.viewed.map(story => (
              <button
                key={story.id}
                onClick={() => handleViewStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
                aria-label={`Ver story de ${story.userName} (visualizado)`}
              >
                <div className="p-0.5 rounded-full bg-gray-300">
                  <div className="p-0.5 bg-white rounded-full">
                    <Avatar name={story.userName} src={story.userAvatar} size="lg" />
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium max-w-[64px] truncate">
                  {story.userName.split(' ')[0]}
                </span>
              </button>
            ))}

            {organizedStories.all.length === 0 && (
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

      {/* Story Viewer com mecânica completa */}
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
          onDelete={() => {
            deleteStory(viewingStory.id);
            addToast('info', 'Story excluído.');
            setViewingStory(null);
          }}
          onViewers={() => setShowViewers(viewingStory)}
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
                  // Mock user data - in real app would fetch from database
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
    </>
  );
}

// Story Viewer Component com mecânica completa do Instagram
function StoryViewer({
  story,
  onClose,
  onNext,
  onPrev,
  onDelete,
  onViewers,
  isOwner
}: {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: () => void;
  onViewers: () => void;
  isOwner: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideo, setIsVideo] = useState(story.mediaType === 'video');
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  // Duração: 5s para imagem, duração do vídeo para vídeo
  const duration = isVideo ? 0 : 5000; // 0 means use video duration

  // Avanço automático
  useEffect(() => {
    if (isPaused) return;

    if (isVideo && videoRef.current) {
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
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / duration) * 100;
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          onNext();
        }
      }, 50);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [isPaused, isVideo, duration, onNext]);

  // Pausar quando página perde foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else {
        setIsPaused(false);
        if (videoRef.current) {
          videoRef.current.play();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Resetar progresso quando story muda
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
  }, [story.id]);

  // Pause ao segurar
  const handleMouseDown = () => {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMouseUp = () => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Clique para avançar/voltar
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      onPrev();
    } else if (x > (width * 2) / 3) {
      onNext();
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
                  onClick={onViewers}
                  className="text-white p-2 hover:bg-white/20 rounded-full transition flex items-center gap-1"
                  aria-label="Ver visualizações"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">{story.views.length}</span>
                </button>
                <button
                  onClick={onDelete}
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
          onClick={onPrev}
          aria-label="Story anterior"
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={onNext}
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
              onEnded={onNext}
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
