import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  History, 
  Library, 
  CreditCard, 
  Bell, 
  Settings,
  Menu,
  X,
  Zap,
  Music,
  Sparkles,
  Crown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import PrismLogo from './PrismLogo';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'remix', label: 'Remix Studio', icon: Music },
    { id: 'edm-remix', label: 'EDM Remix', icon: Sparkles },
    { id: 'history', label: 'Remix History', icon: History },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'profile', label: 'Profile', icon: Crown },
    { id: 'credits', label: 'Credits', icon: Zap },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarCollapsed(true)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Animated gradient background sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 w-80 -z-10 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(120deg, #181028 0%, #2e1a47 50%, #0ff 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 8s ease-in-out infinite'
        }}
      />
      {/* Particle layer sidebar */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? 0 : 280,
          opacity: sidebarCollapsed ? 0 : 1,
          rotateY: sidebarCollapsed ? 60 : 0,
          scale: sidebarCollapsed ? 0.9 : 1
        }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className={`fixed lg:relative top-0 left-0 h-full bg-dark-900 border-r border-dark-700 flex flex-col z-50 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PrismLogo size={32} className="animate-float" />
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold text-white"
              >
                AI Music Web
              </motion.span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="lg:hidden text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.12, x: 10, rotate: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={e => {
                      // Ripple effect
                      const btn = e.currentTarget;
                      const ripple = document.createElement('span');
                      ripple.className = 'sidebar-ripple';
                      ripple.style.left = e.nativeEvent.offsetX + 'px';
                      ripple.style.top = e.nativeEvent.offsetY + 'px';
                      btn.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                      onTabChange(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarCollapsed(true);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-600 via-purple-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/25 animate-gradient-x sidebar-active-glow' 
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <motion.span
                      whileHover={{ y: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.6 } }}
                      className="inline-block"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.span>
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'notifications' && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    )}
                    {/* Ripple effect span */}
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* User Credits */}
        <div className="p-4 border-t border-dark-700">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-dark-800 to-dark-850 rounded-lg p-4 border border-dark-700"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-dark-300 text-sm font-medium">Credits Remaining</span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-lg">{user?.credits || 0}</span>
              </div>
            </div>
            
            <div className="w-full bg-dark-700 rounded-full h-2 mb-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((user?.credits || 0) / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.5, type: 'spring', bounce: 0.4 }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full shadow-[0_0_8px_#0ff8]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-dark-400">
                {user?.plan === 'free' ? 'Free Plan' : 'Premium Plan'}
              </p>
              {user?.plan === 'free' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTabChange('subscription')}
                  className="text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-3 py-1 rounded-full hover:shadow-lg transition-all"
                >
                  Upgrade
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 lg:hidden bg-dark-800 text-white p-2 rounded-lg border border-dark-700 shadow-lg ${
          sidebarCollapsed ? 'block' : 'hidden'
        }`}
      >
        <Menu className="w-6 h-6" />
      </motion.button>
    </>
  );
};

export default Sidebar;