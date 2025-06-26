import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';

const Header: React.FC = () => {
  const { user, toggleSidebar, sidebarCollapsed } = useStore();

  return (
    <header className="bg-dark-900/95 backdrop-blur-sm border-b border-dark-700 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="lg:hidden text-dark-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tracks, artists, or genres..."
              className="w-full bg-dark-800/50 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-dark-400 hover:text-white transition-colors"
          >
            <Bell className="w-6 h-6" />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              3
            </motion.span>
          </motion.button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-dark-400 text-sm capitalize">{user?.plan} plan</p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;