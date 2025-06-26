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
  Zap
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
    { id: 'history', label: 'Remix History', icon: History },
    { id: 'library', label: 'My Library', icon: Library },
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

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? 0 : 280,
          opacity: sidebarCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
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
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarCollapsed(true);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/25' 
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'notifications' && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    )}
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
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full"
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