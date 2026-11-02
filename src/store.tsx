import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// ===== TYPES =====
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Aluno' | 'Professor' | 'Admin';
  avatar: string;
  bio: string;
  course: string;
  interests: string[];
  onboardingCompleted: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  saved: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: number;
  joined: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'group' | 'notice';
  message: string;
  createdAt: string;
  read: boolean;
  fromUser: string;
  fromAvatar: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// ===== MOCK DATA =====
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alef Lorenzo', email: 'alef@sp.senai.br', role: 'Aluno', avatar: '', bio: 'Estudante de Desenvolvimento de Sistemas', course: 'Desenvolvimento de Sistemas', interests: ['React', 'Node.js', 'UI/UX'], onboardingCompleted: false },
  { id: '2', name: 'Maria Silva', email: 'maria@sp.senai.br', role: 'Aluno', avatar: '', bio: 'Apaixonada por tecnologia', course: 'Eletrotécnica', interests: ['IoT', 'Automação'], onboardingCompleted: true },
  { id: '3', name: 'Prof. Carlos', email: 'carlos@sp.senai.br', role: 'Professor', avatar: '', bio: 'Professor de Programação', course: '', interests: ['Python', 'IA'], onboardingCompleted: true },
  { id: '4', name: 'Ana Santos', email: 'ana@sp.senai.br', role: 'Aluno', avatar: '', bio: 'Estudante de Mecânica', course: 'Mecânica Industrial', interests: ['CAD', 'Manufatura'], onboardingCompleted: true },
];

const MOCK_POSTS: Post[] = [
  { id: 'p1', userId: '2', userName: 'Maria Silva', userAvatar: '', content: 'Acabei de terminar meu projeto de IoT usando Arduino! 🎉 O sensor de temperatura está funcionando perfeitamente. Alguém mais está trabalhando com Arduino no curso?', likes: ['1', '3'], comments: [{ id: 'c1', userId: '3', userName: 'Prof. Carlos', userAvatar: '', content: 'Excelente trabalho, Maria! Continue assim 👏', createdAt: '2h atrás' }], createdAt: '3h atrás', saved: false },
  { id: 'p2', userId: '3', userName: 'Prof. Carlos', userAvatar: '', content: '📚 Dica de estudo: Para quem está aprendendo React, recomendo começar pelos conceitos de componentes e props antes de partir para hooks. A base sólida faz toda a diferença!', likes: ['1', '2', '4'], comments: [], createdAt: '5h atrás', saved: false },
  { id: 'p3', userId: '4', userName: 'Ana Santos', userAvatar: '', content: 'Alguém sabe quando será a próxima visita técnica à indústria? Gostaria de me inscrever! 🏭', likes: ['2'], comments: [{ id: 'c2', userId: '2', userName: 'Maria Silva', userAvatar: '', content: 'Acho que será semana que vem! Olha os avisos.', createdAt: '1h atrás' }], createdAt: '6h atrás', saved: false },
  { id: 'p4', userId: '1', userName: 'Alef Lorenzo', userAvatar: '', content: 'Criando minha primeira rede social como projeto do SENAI! Aprendendo muito sobre React e Node.js. 💻🚀', likes: ['2', '3', '4'], comments: [], createdAt: '1d atrás', saved: false },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  { userId: '2', userName: 'Maria Silva', userAvatar: '', lastMessage: 'Obrigada pela ajuda!', lastTime: '10min', unread: 2 },
  { userId: '3', userName: 'Prof. Carlos', userAvatar: '', lastMessage: 'Não esqueça da entrega', lastTime: '1h', unread: 0 },
  { userId: '4', userName: 'Ana Santos', userAvatar: '', lastMessage: 'Vamos estudar juntos?', lastTime: '3h', unread: 1 },
];

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Desenvolvimento Web', description: 'Grupo para discutir HTML, CSS, JS e frameworks', icon: '💻', members: 45, joined: true },
  { id: 'g2', name: 'IoT e Automação', description: 'Projetos com Arduino, Raspberry Pi e sensores', icon: '🤖', members: 32, joined: false },
  { id: 'g3', name: 'Design UI/UX', description: 'Compartilhe seus designs e receba feedback', icon: '🎨', members: 28, joined: true },
  { id: 'g4', name: 'Preparação para Estágio', description: 'Dicas de currículo, entrevistas e oportunidades', icon: '💼', members: 67, joined: false },
  { id: 'g5', name: 'Matemática Aplicada', description: 'Resolução de problemas e estudo em grupo', icon: '📐', members: 21, joined: false },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'like', message: 'Maria Silva curtiu sua publicação', createdAt: '5min', read: false, fromUser: 'Maria Silva', fromAvatar: '' },
  { id: 'n2', type: 'comment', message: 'Prof. Carlos comentou na sua publicação', createdAt: '1h', read: false, fromUser: 'Prof. Carlos', fromAvatar: '' },
  { id: 'n3', type: 'follow', message: 'Ana Santos começou a seguir você', createdAt: '3h', read: true, fromUser: 'Ana Santos', fromAvatar: '' },
  { id: 'n4', type: 'group', message: 'Você foi adicionado ao grupo "Desenvolvimento Web"', createdAt: '1d', read: true, fromUser: 'Grupo', fromAvatar: '' },
  { id: 'n5', type: 'notice', message: 'Novo aviso: Feira de Profissões na próxima semana', createdAt: '2d', read: true, fromUser: 'SENAI', fromAvatar: '' },
];

// ===== AUTH CONTEXT =====
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('senai_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('senai_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('senai_user');
    }
  }, [user]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    // Allow any @senai.br email for demo
    if (email.includes('@') && email.includes('senai')) {
      const newUser: User = { ...MOCK_USERS[0], email, name: email.split('@')[0], onboardingCompleted: false };
      setUser(newUser);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'Aluno',
      avatar: '',
      bio: '',
      course: '',
      interests: [],
      onboardingCompleted: false,
    };
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('senai_user');
    sessionStorage.removeItem('senai_onboarding');
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
    sessionStorage.setItem('senai_onboarding', 'true');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// ===== TOAST CONTEXT =====
interface ToastContextType {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

// ===== DATA CONTEXT =====
interface DataContextType {
  posts: Post[];
  conversations: Conversation[];
  groups: Group[];
  notifications: Notification[];
  addPost: (content: string, image?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleSave: (postId: string) => void;
  toggleGroup: (groupId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const addPost = useCallback((content: string, image?: string) => {
    if (!user) return;
    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      image,
      likes: [],
      comments: [],
      createdAt: 'Agora',
      saved: false,
    };
    setPosts(prev => [newPost, ...prev]);
  }, [user]);

  const toggleLike = useCallback((postId: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(user.id);
      return { ...p, likes: liked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id] };
    }));
  }, [user]);

  const addComment = useCallback((postId: string, content: string) => {
    if (!user) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: 'Agora',
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  }, [user]);

  const toggleSave = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <DataContext.Provider value={{ posts, conversations, groups, notifications, addPost, toggleLike, addComment, toggleSave, toggleGroup, markNotificationRead, markAllNotificationsRead }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
