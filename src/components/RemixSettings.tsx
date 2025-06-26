import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sliders, Music2, ChevronDown } from 'lucide-react';

interface RemixSettingsProps {
  targetBPM: number;
  onBPMChange: (bpm: number) => void;
  genreStyle: string;
  onGenreStyleChange: (style: string) => void;
}

const RemixSettings: React.FC<RemixSettingsProps> = ({
  targetBPM,
  onBPMChange,
  genreStyle,
  onGenreStyleChange
}) => {
  const genreStyles = [
    { name: 'EDM', description: 'Electronic Dance Music' },
    { name: 'Pop', description: 'Popular Music' },
    { name: 'Rock', description: 'Rock & Alternative' },
    { name: 'Solid', description: 'Solid Beats' },
    { name: 'Electronic', description: 'Electronic Vibes' },
    { name: 'Hip Hop', description: 'Hip Hop & Rap' },
    { name: 'Jazz', description: 'Jazz & Blues' },
    { name: 'Classical', description: 'Classical Music' }
  ];

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700 shadow-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Remix Settings</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Target BPM */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <label className="block text-sm font-medium text-white">
              Target BPM
            </label>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="range"
                min="60"
                max="200"
                value={targetBPM}
                onChange={(e) => onBPMChange(Number(e.target.value))}
                className="w-full h-3 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((targetBPM - 60) / 140) * 100}%, #374151 ${((targetBPM - 60) / 140) * 100}%, #374151 100%)`
                }}
              />
              <motion.div 
                animate={{ left: `${((targetBPM - 60) / 140) * 100}%` }}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-cyan-400 rounded-full shadow-lg border-2 border-white"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-400">60 BPM</span>
              <motion.div
                key={targetBPM}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold px-3 py-1 rounded-full"
              >
                {targetBPM} BPM
              </motion.div>
              <span className="text-dark-400">200 BPM</span>
            </div>
          </div>
        </div>

        {/* Genre Style */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Music2 className="w-5 h-5 text-cyan-400" />
            <label className="block text-sm font-medium text-white">
              Genre Style
            </label>
          </div>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer flex items-center justify-between hover:bg-dark-600 transition-colors"
            >
              <span className="font-medium">{genreStyle}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-dark-400" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-10 overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {genreStyles.map((style, index) => (
                      <motion.div
                        key={style.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#06b6d4', x: 4 }}
                        onClick={() => {
                          onGenreStyleChange(style.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                          genreStyle === style.name 
                            ? 'bg-cyan-600 text-white' 
                            : 'text-dark-300 hover:text-white'
                        }`}
                      >
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs opacity-75">{style.description}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Advanced Settings Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-300">Preview Settings:</span>
          <div className="flex items-center space-x-4 text-cyan-400">
            <span>{targetBPM} BPM</span>
            <span>•</span>
            <span>{genreStyle}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RemixSettings;