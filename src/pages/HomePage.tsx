import { useState, useEffect } from 'react';
import { useAuth, useData } from '../store';
import { StoriesBar } from '../components/StoriesBar';
import { Avatar, Button, EmptyState, PostSkeleton } from '../components/UI';
import { 
  Heart, MessageCircle, Bookmark, Share2, Send, Image, MoreHorizontal, 
  Edit3, Trash2, Sparkles, TrendingUp, Users, Calendar, Award, 
  Briefcase, BookOpen, Lightbulb, ArrowRight
} from 'lucide-react';
import type { Post } from '../store';

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { toggleLike, addComment, toggleSave, deletePost } = useData();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = user?.id === post.userId;

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
    setSubmitting(false);
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar name={post.userName} src={post.userAvatar} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">{post.userName}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition" 
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && isOwner && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-slide-down">
                <button
                  onClick={() => { deletePost(post.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image && (
        <div className="px-4 pb-3">
          <img src={post.image} alt="Imagem da publicação" className="w-full rounded-xl object-cover max-h-96" />
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span>{post.likes.length > 0 ? `${post.likes.length} curtida${post.likes.length > 1 ? 's' : ''}` : ''}</span>
        <button onClick={() => setShowComments(!showComments)} className="hover:text-gray-700 transition">
          {post.comments.length > 0 ? `${post.comments.length} comentário${post.comments.length > 1 ? 's' : ''}` : ''}
        </button>
      </div>

      <div className="px-2 py-1 flex items-center border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
            isLiked ? 'text-senai bg-senai-light' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
          aria-label={isLiked ? 'Descurtir' : 'Curtir'}
          aria-pressed={isLiked}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} ${isLiking ? 'animate-heart' : ''}`} />
          <span className="hidden sm:inline">Curtir</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition text-sm font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Comentar</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition text-sm font-medium">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>
        <button
          onClick={() => toggleSave(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition text-sm font-medium ${
            post.saved ? 'text-senai bg-senai-light' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
          aria-pressed={post.saved}
        >
          <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Salvar</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 animate-slide-down">
          {post.comments.length > 0 && (
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar name={comment.userName} src={comment.userAvatar} size="xs" />
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800">{comment.userName}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="p-2 text-senai hover:bg-senai-light rounded-xl transition disabled:opacity-50"
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
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
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
          />
          {expanded && (
            <div className="flex items-center justify-between mt-3 animate-fade-in">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition">
                <Image className="w-4 h-4" /> Foto
              </button>
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

function SuggestedGroup({ name, icon, members }: { name: string; icon: string; members: number }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500">{members} membros</p>
      </div>
      <Button size="sm" variant="secondary">Participar</Button>
    </div>
  );
}

function UpcomingEvent({ title, date, location }: { title: string; date: string; location: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
      <div className="w-10 h-10 bg-senai-light rounded-xl flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-senai" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-500">{date} • {location}</p>
      </div>
    </div>
  );
}

function SuggestedUser({ name, course }: { name: string; course: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
      <Avatar name={name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{course}</p>
      </div>
      <Button size="sm" variant="secondary">Conectar</Button>
    </div>
  );
}

export function HomePage() {
  const { posts } = useData();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'community' | 'projects'>('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* Stories Bar - Instagram style */}
      <StoriesBar />

      {/* Create Post */}
      <CreatePost />

      {/* Feed Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'Para você', icon: Sparkles },
          { id: 'following', label: 'Seguindo', icon: Users },
          { id: 'community', label: 'Comunidade', icon: TrendingUp },
          { id: 'projects', label: 'Projetos', icon: Lightbulb },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              filter === f.id
                ? 'bg-senai text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Feed - Main column */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Edit3 className="w-8 h-8" />}
              title="Nenhuma publicação ainda"
              description="Seja o primeiro a compartilhar algo com a comunidade!"
            />
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Sidebar - Recommendations */}
        <div className="space-y-4 hidden lg:block">
          {/* Avisos importantes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-senai" />
                Avisos importantes
              </h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-semibold text-red-700">Matrículas abertas</p>
                <p className="text-xs text-red-600 mt-0.5">Próximo semestre - Inscreva-se!</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700">Feira de Profissões</p>
                <p className="text-xs text-blue-600 mt-0.5">Próxima semana - Auditório Principal</p>
              </div>
            </div>
          </div>

          {/* Grupos recomendados */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-senai" />
                Grupos para você
              </h3>
              <button className="text-xs text-senai hover:text-senai-dark font-medium">Ver todos</button>
            </div>
            <div className="space-y-1">
              <SuggestedGroup name="Desenvolvimento Web" icon="💻" members={45} />
              <SuggestedGroup name="IoT e Automação" icon="🤖" members={32} />
            </div>
          </div>

          {/* Eventos próximos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-senai" />
                Próximos eventos
              </h3>
            </div>
            <div className="space-y-1">
              <UpcomingEvent title="Hackathon SENAI" date="15 Nov" location="Online" />
              <UpcomingEvent title="Workshop de IA" date="20 Nov" location="Lab 3" />
            </div>
          </div>

          {/* Sugestões de conexão */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-senai" />
                Pessoas para conectar
              </h3>
            </div>
            <div className="space-y-1">
              <SuggestedUser name="João Pereira" course="Automação Industrial" />
              <SuggestedUser name="Carla Mendes" course="Design Gráfico" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
