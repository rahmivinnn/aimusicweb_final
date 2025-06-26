import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RemixStudio from './components/RemixStudio';
import TrackHistory from './components/TrackHistory';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Subscription from './components/Subscription';
import AuthScreen from './components/AuthScreen';
import TextToSong from './components/TextToSong';
import { useStore } from './store/useStore';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { sidebarCollapsed, setSidebarCollapsed } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  if (!isLoggedIn) {
    return <AuthScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'remix':
        return <RemixStudio />;
      case 'text-to-audio':
        return <TextToSong />;
      case 'history':
        return <TrackHistory />;
      case 'library':
        return <TrackHistory />;
      case 'subscription':
        return <Subscription />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-850 flex overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #7c3aed',
          },
          success: {
            iconTheme: {
              primary: '#a855f7',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'lg:ml-0'}`}>
        <Header />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;