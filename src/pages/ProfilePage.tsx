import { useState } from 'react';
import { useAuth, useData, useToast } from '../store';
import { Avatar, Button, EmptyState, Modal } from '../components/UI';
import { 
  Camera, Edit3, BookOpen, Heart, Bookmark, Settings, HelpCircle, 
  Briefcase, Award, Code, GraduationCap, Link2, MapPin, Calendar,
  Github, Linkedin, Mail, Plus, X, Trash2, ExternalLink
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  demo?: string;
  date: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Básico' | 'Intermediário' | 'Avançado';
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { posts, stories } = useData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'about'>('posts');
  const [editing, setEditing] = useState(false);
  const [showOnboardingHelp, setShowOnboardingHelp] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data (would come from backend)
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    course: user?.course || '',
    interests: user?.interests?.join(', ') || '',
    location: 'São Paulo, SP',
    unit: 'SENAI São Paulo',
    linkedin: '',
    github: '',
    website: '',
  });

  // Mock data for demonstration
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'SENAI Connect - Rede Social',
      description: 'Plataforma social acadêmica desenvolvida com React, TypeScript e Supabase.',
      technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
      github: 'https://github.com/AlefLorenzo/SenaiConnect-q',
      date: '2026-11'
    },
    {
      id: '2',
      title: 'Sistema IoT com Arduino',
      description: 'Monitoramento de temperatura e umidade com envio de dados para nuvem.',
      technologies: ['Arduino', 'C++', 'MQTT', 'Node.js'],
      date: '2026-09'
    }
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      title: 'Estagiário de Desenvolvimento',
      company: 'Empresa XYZ',
      period: '2026 - Presente',
      description: 'Desenvolvimento de aplicações web com React e Node.js.'
    }
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'React', level: 'Intermediário' },
    { id: '2', name: 'TypeScript', level: 'Intermediário' },
    { id: '3', name: 'Node.js', level: 'Básico' },
    { id: '4', name: 'SQL', level: 'Intermediário' },
  ]);

  const userPosts = posts.filter(p => p.userId === user?.id);
  const likedPosts = posts.filter(p => user && p.likes.includes(user.id));
  const savedPosts = posts.filter(p => p.saved);
  const userStories = stories.filter(s => s.userId === user?.id);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateProfile({
      bio: profileData.bio,
      course: profileData.course,
      interests: profileData.interests.split(',').map(i => i.trim()).filter(Boolean),
    });
    addToast('success', 'Perfil atualizado com sucesso!');
    setEditing(false);
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-senai via-senai-dark to-senai-hover relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Avatar + Info */}
        <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <Avatar name={user.name} size="xl" className="border-4 border-white shadow-lg w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl" />
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-senai rounded-full flex items-center justify-center text-white shadow hover:bg-senai-hover transition" aria-label="Alterar foto">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 sm:pb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-senai-light text-senai-dark rounded-full text-xs font-medium">
                  {user.role}
                </span>
                {user.course && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <GraduationCap className="w-3 h-3" /> {user.course}
                  </span>
                )}
                {profileData.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    <MapPin className="w-3 h-3" /> {profileData.location}
                  </span>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4" /> Editar perfil
            </Button>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{user.bio}</p>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-3">
            {profileData.github && (
              <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-senai transition">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {profileData.linkedin && (
              <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-senai transition">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {profileData.website && (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-senai transition">
                <Link2 className="w-4 h-4" /> Website
              </a>
            )}
          </div>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.interests.map(i => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{i}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{userPosts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Publicações</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{projects.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Projetos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{skills.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Competências</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{likedPosts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Curtidas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: 'posts', label: 'Publicações', icon: BookOpen },
            { id: 'projects', label: 'Portfólio', icon: Briefcase },
            { id: 'about', label: 'Sobre', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-senai text-senai'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              {userPosts.length === 0 ? (
                <EmptyState
                  icon={<Edit3 className="w-8 h-8" />}
                  title="Nenhuma publicação"
                  description="Compartilhe algo com a comunidade!"
                />
              ) : (
                <div className="space-y-3">
                  {userPosts.map(post => (
                    <div key={post.id} className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-700">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes.length}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {post.comments.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Meus Projetos</h3>
                <Button size="sm" onClick={() => setShowAddProject(true)}>
                  <Plus className="w-4 h-4" /> Novo projeto
                </Button>
              </div>
              {projects.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="w-8 h-8" />}
                  title="Nenhum projeto"
                  description="Adicione projetos do seu portfólio!"
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.map(project => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm">{project.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map(tech => (
                          <span key={tech} className="px-2 py-0.5 bg-senai-light text-senai-dark rounded-full text-[10px] font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs text-senai hover:text-senai-dark flex items-center gap-1">
                            <Github className="w-3 h-3" /> Código
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-senai hover:text-senai-dark flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Demo
                          </a>
                        )}
                        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {project.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Code className="w-4 h-4 text-senai" /> Competências
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddSkill(true)}>
                    <Plus className="w-4 h-4" /> Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div key={skill.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        skill.level === 'Avançado' ? 'bg-green-100 text-green-700' :
                        skill.level === 'Intermediário' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experiences */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-senai" /> Experiências
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddExperience(true)}>
                    <Plus className="w-4 h-4" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-3">
                  {experiences.map(exp => (
                    <div key={exp.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{exp.title}</h4>
                          <p className="text-xs text-senai font-medium">{exp.company}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{exp.period}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stories */}
              {userStories.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    Stories ativos ({userStories.length})
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {userStories.map(story => (
                      <div key={story.id} className="relative aspect-square rounded-xl overflow-hidden">
                        {story.mediaType === 'image' ? (
                          <img src={story.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                        ) : (
                          <video src={story.mediaUrl} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
            <p className="text-sm font-medium text-gray-700">Preferências de privacidade</p>
            <p className="text-xs text-gray-500">Controle quem vê seu perfil</p>
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

      {/* Edit Profile Modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Editar perfil" size="lg">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Sobre você</label>
            <textarea
              value={profileData.bio}
              onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Curso</label>
              <input
                type="text"
                value={profileData.course}
                onChange={e => setProfileData(prev => ({ ...prev, course: e.target.value }))}
                placeholder="Ex: Desenvolvimento de Sistemas"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Localização</label>
              <input
                type="text"
                value={profileData.location}
                onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo, SP"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Interesses</label>
            <input
              type="text"
              value={profileData.interests}
              onChange={e => setProfileData(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="Separe por vírgula: React, IoT, Design"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Github className="w-3 h-3" /> GitHub
              </label>
              <input
                type="url"
                value={profileData.github}
                onChange={e => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </label>
              <input
                type="url"
                value={profileData.linkedin}
                onChange={e => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={e => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none"
              />
            </div>
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
            { icon: '💼', title: 'Portfólio', desc: 'Apresente seus projetos e competências para a comunidade.' },
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
