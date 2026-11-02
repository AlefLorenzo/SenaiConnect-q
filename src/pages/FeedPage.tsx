import { useState, useEffect } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, PostSkeleton, EmptyState } from '../components/UI';
import { Heart, MessageCircle, Bookmark, Share2, Send, Image, MoreHorizontal, Edit3 } from 'lucide-react';
import type { Post } from '../store';

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { toggleLike, addComment, toggleSave } = useData();
  const { addToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = () => {
    setIsLiking(true);
    toggleLike(post.id);
    setTimeout(() => setIsLiking(false), 400);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    addComment(post.id, commentText.trim());
    setCommentText('');
    addToast('success', 'Comentário enviado.');
    setSubmitting(false);
  };

  const handleSave = () => {
    toggleSave(post.id);
    addToast('info', post.saved ? 'Removido dos salvos.' : 'Publicação salva.');
  };

  const handleShare = () => {
    addToast('info', 'Link copiado para a área de transferência.');
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in" aria-label={`Publicação de ${post.userName}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar name={post.userName} src={post.userAvatar} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{post.userName}</p>
          <p className="text-xs text-gray-500">{post.createdAt}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Mais opções">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img src={post.image} alt="Imagem da publicação" className="w-full rounded-xl object-cover max-h-96" />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{post.likes.length > 0 ? `${post.likes.length} curtida${post.likes.length > 1 ? 's' : ''}` : ''}</span>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-gray-700 transition"
        >
          {post.comments.length > 0 ? `${post.comments.length} comentário${post.comments.length > 1 ? 's' : ''}` : ''}
        </button>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
            isLiked ? 'text-senai bg-senai-light' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`}
          aria-label={isLiked ? 'Descurtir publicação' : 'Curtir publicação'}
          aria-pressed={isLiked}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} ${isLiking ? 'animate-heart' : ''}`} />
          <span className="hidden sm:inline">Curtir</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition text-sm font-medium"
          aria-label="Comentar"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Comentar</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition text-sm font-medium"
          aria-label="Compartilhar"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition text-sm font-medium ${
            post.saved ? 'text-senai bg-senai-light' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`}
          aria-label={post.saved ? 'Remover dos salvos' : 'Salvar publicação'}
          aria-pressed={post.saved}
        >
          <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Salvar</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-100 animate-slide-down">
          {/* Existing comments */}
          {post.comments.length > 0 && (
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar name={comment.userName} src={comment.userAvatar} size="xs" />
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800">{comment.userName}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{comment.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* New comment input */}
          <div className="p-3 border-t border-gray-50 flex gap-2">
            <Avatar name={user?.name || 'U'} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition"
                aria-label="Escrever comentário"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="p-2 text-senai hover:bg-senai-light rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar comentário"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function CreatePost() {
  const { user } = useAuth();
  const { addPost } = useData();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    addPost(content.trim());
    setContent('');
    setExpanded(false);
    addToast('success', 'Publicação criada com sucesso!');
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex gap-3">
        <Avatar name={user?.name || 'U'} size="md" />
        <div className="flex-1">
          <textarea
            placeholder="O que você gostaria de compartilhar?"
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            className={`w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition-all ${
              expanded ? 'min-h-[100px]' : 'min-h-[44px]'
            }`}
            aria-label="Criar publicação"
          />
          {expanded && (
            <div className="flex items-center justify-between mt-3 animate-fade-in">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition" aria-label="Adicionar imagem">
                  <Image className="w-4 h-4" /> Foto
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setContent(''); }}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit} loading={submitting} disabled={!content.trim()}>
                  <Send className="w-3.5 h-3.5" /> Publicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeedPage() {
  const { posts } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800 sr-only">Feed de Publicações</h1>
      <CreatePost />
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Edit3 className="w-8 h-8" />}
          title="Nenhuma publicação ainda"
          description="Seja o primeiro a compartilhar algo com a comunidade!"
          action={<Button size="sm">Criar publicação</Button>}
        />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
