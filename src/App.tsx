import { useState } from 'react';
import { AuthProvider, ToastProvider, DataProvider, useAuth } from './store';
import { ToastContainer } from './components/UI';
import { Onboarding } from './components/Onboarding';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { GroupsPage } from './pages/GroupsPage';
import { NotificationsPage, EventsPage, CoursesPage, NoticesPage, SavedPage, HelpPage, SettingsPage } from './pages/OtherPages';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'feed': return <FeedPage />;
      case 'profile': return <ProfilePage />;
      case 'messages': return <MessagesPage />;
      case 'groups': return <GroupsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'events': return <EventsPage />;
      case 'courses': return <CoursesPage />;
      case 'notices': return <NoticesPage />;
      case 'saved': return <SavedPage />;
      case 'help': return <HelpPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      <Onboarding />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
          <ToastContainer />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
