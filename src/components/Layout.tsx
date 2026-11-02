import { ReactNode, useState } from 'react';
import { useAuth, useData } from '../store';
import { Avatar, Badge } from './UI';
import {
  Home, User, MessageCircle, Users, Bell, Bookmark, LogOut, Menu, X,
  HelpCircle, Settings, Calendar, BookOpen, FileText, ChevronDown
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'feed', label: 'Início', icon: Home },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'notifications', label: 'Avisos', icon: Bell, badge: unreadNotifications },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  const sidebarItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle },
    { id: 'notifications', label: 'Notificações', icon: Bell, badge: unreadNotifications },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'notices', label: 'Avisos', icon: FileText },
    { id: 'saved', label: 'Salvos', icon: Bookmark },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Skip to main content */}
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button onClick={() => onNavigate('feed')} className="flex items-center gap-2" aria-label="Ir para o feed">
              <div className="w-8 h-8 bg-gradient-to-br from-senai to-senai-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-gray-800 hidden sm:block">SENAI Connect</span>
            </button>
          </div>

          {/* Center: Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Buscar pessoas, grupos, publicações..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-senai/20 focus:border-senai outline-none transition"
                aria-label="Buscar"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition"
              aria-label={`Notificações, ${unreadNotifications} não lidas`}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge count={unreadNotifications} />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="Menu do perfil"
              >
                <Avatar name={user?.name || 'U'} size="sm" />
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down" role="menu">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('profile'); setProfileMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition" role="menuitem">
                      <User className="w-4 h-4" /> Meu Perfil
                    </button>
                    <button onClick={() => { onNavigate('settings'); setProfileMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition" role="menuitem">
                      <Settings className="w-4 h-4" /> Configurações
                    </button>
                    <button onClick={() => { onNavigate('help'); setProfileMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition" role="menuitem">
                      <HelpCircle className="w-4 h-4" /> Ajuda e Dicas
                    </button>
                    <div className="border-t mt-1 pt-1">
                      <button onClick={logout} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition" role="menuitem">
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 overflow-y-auto" role="navigation" aria-label="Navegação principal">
        <nav className="p-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-senai-50 text-senai border border-senai-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
              aria-current={currentPage === item.id ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && <Badge count={item.badge} />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white z-50 lg:hidden overflow-y-auto animate-slide-down shadow-xl" role="navigation" aria-label="Navegação principal">
            <nav className="p-4 space-y-1">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    currentPage === item.id
                      ? 'bg-senai-50 text-senai'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && <Badge count={item.badge} />}
                </button>
              ))}
              <div className="border-t pt-3 mt-3">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition">
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              </div>
            </nav>
          </aside>
        </>
      )}

      {/* Main content */}
      <main id="main-content" className="pt-16 pb-20 lg:pb-8 lg:pl-64 min-h-screen" role="main">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 lg:hidden safe-bottom" role="navigation" aria-label="Navegação inferior">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                currentPage === item.id
                  ? 'text-senai'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-current={currentPage === item.id ? 'page' : undefined}
              aria-label={item.label}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'scale-110' : ''} transition-transform`} />
                {item.badge && item.badge > 0 && <Badge count={item.badge} />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {currentPage === item.id && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-senai rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
