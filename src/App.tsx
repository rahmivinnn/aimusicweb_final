import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RemixStudio from './components/RemixStudio';
import SimpleEDMRemix from './components/SimpleEDMRemix';
import TrackHistory from './components/TrackHistory';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Subscription from './components/Subscription';
import AuthScreen from './components/AuthScreen';
import TextToSong from './components/TextToSong';
import { useStore } from './store/useStore';

function ProfileDemo() {
  const { user } = useStore();
  return (
    <div className="max-w-lg mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <div className="flex items-center gap-4 mb-4">
        <img src={user?.avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-cyan-500" />
        <div>
          <div className="text-xl font-semibold">{user?.name}</div>
          <div className="text-gray-400">{user?.email}</div>
        </div>
      </div>
      <div className="mb-2">Plan: <span className="font-bold text-cyan-400">{user?.plan}</span></div>
      <div className="mb-2">Language: {user?.settings.language}</div>
      <div className="mb-2">Theme: {user?.settings.theme}</div>
      <div className="mb-2">Quality: {user?.settings.quality}</div>
    </div>
  );
}
function CreditsDemo() {
  const { user } = useStore();
  return (
    <div className="max-w-lg mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-4">Credits</h2>
      <div className="text-2xl mb-2">{user?.credits} credits remaining</div>
      <div className="mb-4">Plan: <span className="font-bold text-cyan-400">{user?.plan}</span></div>
      <button className="px-4 py-2 bg-cyan-600 rounded text-white font-bold">Upgrade Plan</button>
    </div>
  );
}
function SubscriptionDemo() {
  const { user } = useStore();
  return (
    <div className="max-w-lg mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-4">Subscription</h2>
      <div className="mb-2">Current Plan: <span className="font-bold text-cyan-400">{user?.plan}</span></div>
      <div className="mb-2">Email: {user?.email}</div>
      <button className="px-4 py-2 bg-purple-600 rounded text-white font-bold">Upgrade to Premium</button>
    </div>
  );
}
function NotificationsDemo() {
  return (
    <div className="max-w-lg mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-3">
        <li className="bg-dark-700 p-3 rounded">🎵 Your remix is ready to download!</li>
        <li className="bg-dark-700 p-3 rounded">💡 New feature: Smart Prompt in Text to Song</li>
        <li className="bg-dark-700 p-3 rounded">🔥 You have 8 credits left</li>
      </ul>
    </div>
  );
}
function LibraryPlaceholder() {
  return <div className="p-8 text-center text-white">Your Library (coming soon)</div>;
}

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
      case 'edm-remix':
        return <SimpleEDMRemix />;
      case 'text-to-audio':
        return <TextToSong />;
      case 'history':
        return <TrackHistory />;
      case 'library':
        return <TrackHistory />; // Atau ganti ke <LibraryPlaceholder /> jika ingin beda
      case 'subscription':
        return <SubscriptionDemo />;
      case 'notifications':
        return <NotificationsDemo />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <ProfileDemo />;
      case 'credits':
        return <CreditsDemo />;
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