import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Volume2, Download, Globe, Palette, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateUserSettings } = useStore();

  const handleSettingChange = (key: string, value: any) => {
    updateUserSettings({ [key]: value });
    toast.success('Settings updated successfully');
  };

  const settingSections = [
    {
      title: 'Audio Settings',
      icon: Volume2,
      settings: [
        {
          key: 'autoPlay',
          label: 'Auto-play tracks',
          description: 'Automatically play tracks when selected',
          type: 'toggle',
          value: user?.settings.autoPlay
        },
        {
          key: 'quality',
          label: 'Audio Quality',
          description: 'Default audio quality for remixes',
          type: 'select',
          value: user?.settings.quality,
          options: [
            { value: 'standard', label: 'Standard (128kbps)' },
            { value: 'high', label: 'High (320kbps)' },
            { value: 'ultra', label: 'Ultra (FLAC)' }
          ]
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notifications',
          label: 'Push Notifications',
          description: 'Receive notifications about remix completion',
          type: 'toggle',
          value: user?.settings.notifications
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: user?.settings.theme,
          options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' }
          ]
        }
      ]
    },
    {
      title: 'Language',
      icon: Globe,
      settings: [
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: user?.settings.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'id', label: 'Bahasa Indonesia' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-dark-300 text-lg">Customize your AI Music Web experience</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{user?.name}</h3>
            <p className="text-dark-400">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.plan === 'premium' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {user?.plan === 'premium' ? 'Premium' : 'Free'} Plan
              </span>
              <span className="text-dark-500">•</span>
              <span className="text-dark-400 text-sm">{user?.credits} credits remaining</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{setting.label}</h4>
                      <p className="text-dark-400 text-sm">{setting.description}</p>
                    </div>
                    
                    <div className="ml-4">
                      {setting.type === 'toggle' ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSettingChange(setting.key, !setting.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-purple-600' : 'bg-dark-600'
                          }`}
                        >
                          <motion.span
                            animate={{ x: setting.value ? 20 : 4 }}
                            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          />
                        </motion.button>
                      ) : (
                        <select
                          value={setting.value}
                          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                          className="bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Account Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Export started! Check your downloads.')}
            className="flex items-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export My Data</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.error('Account deletion requires email confirmation.')}
            className="flex items-center space-x-2 p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            <Shield className="w-5 h-5" />
            <span>Delete Account</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;