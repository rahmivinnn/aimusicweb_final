import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Music, Download, Heart, Share2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'remix_complete' | 'like' | 'download' | 'share' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'remix_complete',
      title: 'Remix Complete!',
      message: 'Your "Epic Synthwave Remix" is ready for download',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: '2',
      type: 'like',
      title: 'New Like',
      message: 'ProRemixer liked your "Lo-fi Hip Hop Chill" track',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'download',
      title: 'Track Downloaded',
      message: 'Your track "Trap Remix Banger" was downloaded 5 times today',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    },
    {
      id: '4',
      type: 'system',
      title: 'Credits Refilled',
      message: 'Your monthly credits have been refilled. You now have 10 credits.',
      timestamp: new Date(Date.now() - 86400000),
      read: true
    },
    {
      id: '5',
      type: 'share',
      title: 'Track Shared',
      message: 'SoundDesigner shared your track on social media',
      timestamp: new Date(Date.now() - 172800000),
      read: true
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'remix_complete':
        return <Music className="w-5 h-5 text-green-400" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'download':
        return <Download className="w-5 h-5 text-blue-400" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-400" />;
      case 'system':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            {unreadCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Notifications</h1>
            <p className="text-dark-300">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </motion.button>
        )}
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border transition-all duration-300 ${
                notification.read 
                  ? 'border-dark-700 opacity-75' 
                  : 'border-purple-500/50 shadow-lg shadow-purple-500/10'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.read ? 'bg-dark-700' : 'bg-dark-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${
                        notification.read ? 'text-dark-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        notification.read ? 'text-dark-400' : 'text-dark-300'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-3 h-3 text-dark-500" />
                        <span className="text-xs text-dark-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {!notification.read && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 mt-4 rounded-full"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No notifications</h3>
            <p className="text-dark-400 text-lg">You're all caught up! Check back later for updates.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;