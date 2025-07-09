import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Music, Sparkles, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import AudioPlayer from './AudioPlayer';
import defaultThumbnail from '/default-thumbnail.jpg';

const Dashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, tracks } = useStore();
  const recentTracks = tracks.slice(0, 30);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <motion.div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome back, {user?.name || 'User'}! <span role="img" aria-label="music">🎵</span>
          </h1>
        </div>
        <p className="text-dark-300 text-xl">
          Ready to create some amazing professional AI remixes?
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="w-full flex flex-col md:flex-row gap-6 mb-10">
        {/* Remix Song AI */}
        <div className="flex-1 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl shadow-xl relative overflow-hidden min-h-[180px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/70" style={{clipPath:'polygon(70% 0,100% 0,100% 100%,40% 100%)'}}></div>
          <div className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Sliders className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Remix Song AI</h2>
            </div>
            <p className="text-white/90 mb-4">Transform any song into an EDM remix with AI-powered creativity. Upload, remix, and enjoy!</p>
            <button
              className="px-6 py-3 bg-black/80 text-cyan-300 font-bold rounded-xl shadow-lg hover:bg-cyan-900 hover:text-white transition-all w-max"
              onClick={() => setActiveTab ? setActiveTab('remix') : (window.location.hash = '#remix')}
            >
              ✨ Create remix
            </button>
          </div>
        </div>
        {/* Text-to-Audio */}
        <div className="flex-1 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl shadow-xl relative overflow-hidden min-h-[180px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/70" style={{clipPath:'polygon(0 0,60% 0,30% 100%,0 100%)'}}></div>
          <div className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Text-to-Audio</h2>
            </div>
            <p className="text-white/90 mb-4">Convert your text into AI-generated music or vocals. Simply enter text and let AI create the sound!</p>
            <button
              className="px-6 py-3 bg-black/80 text-cyan-300 font-bold rounded-xl shadow-lg hover:bg-cyan-900 hover:text-white transition-all w-max"
              onClick={() => setActiveTab ? setActiveTab('text-to-audio') : (window.location.hash = '#text-to-audio')}
            >
              🎤 Generate Audio
            </button>
          </div>
        </div>
      </div>

      {/* Recent Remixes */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 transition-colors duration-500 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">Recent Remixes</h2>
        <p className="text-dark-300 mb-6">Here is the list of your recent remixes</p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {recentTracks.map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, type: 'spring', stiffness: 80 }}
              className="remix-card bg-gradient-to-br from-[#1a2740]/80 via-[#232b3a]/90 to-[#1a1f2c]/90 rounded-xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.035] hover:ring-2 hover:ring-cyan-400/60 hover:border-cyan-400/40 border border-white/10 backdrop-blur-md bg-opacity-80 group flex flex-col"
              style={{ boxShadow: '0 4px 32px 0 rgba(0,255,255,0.08)' }}
            >
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3">
                <img
                  src={track.albumArt || '/default-thumbnail.jpg'}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-thumbnail.jpg'; }}
                  alt={track.name}
                  className="w-full h-full object-cover aspect-video transition-all duration-300 hover:brightness-110 group-hover:scale-105 group-hover:shadow-[0_0_24px_#0ff5]"
                />
                <button
                  className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1 text-white hover:text-pink-400 transition-all hover:scale-125 group-hover:animate-bounce"
                  aria-label="Favorite"
                  tabIndex={0}
                >
                  <span role="img" aria-label="love" className="text-xl transition-all duration-200">❤️</span>
                </button>
              </div>
              <div className="w-full flex flex-col items-start mb-2">
                <h3 className="text-white font-semibold text-lg break-words leading-tight mb-1 group-hover:text-cyan-300 transition-colors" style={{wordBreak:'break-word',overflowWrap:'break-word'}}>{track.name}</h3>
                <span className="text-cyan-300 text-xs font-medium mb-1">{track.genre}</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-6 h-6 rounded-full border-2 border-cyan-400" />
                  <span className="text-xs text-white/80">{track.userName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-auto w-full">
                <div className="flex items-center gap-4 w-full">
                  <AudioPlayer
                    src={track.outputUrl || ''}
                    title={track.name}
                    className="w-full"
                    maxDuration={track.duration}
                    buttonClassName="w-12 h-12 hover:scale-110 transition-transform"
                    progressBarClassName="shadow-[0_0_10px_#0ff]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;