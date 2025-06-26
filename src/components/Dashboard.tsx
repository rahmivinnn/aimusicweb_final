import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Music, Sparkles, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import AudioPlayer from './AudioPlayer';

const Dashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, tracks } = useStore();
  const recentTracks = tracks.slice(0, 4);

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
        <h2 className="text-2xl font-bold text-white mb-2">Resent Remixes</h2>
        <p className="text-dark-300 mb-6">Here is the list of your recent remixes</p>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {recentTracks.map((track, idx) => (
            <div key={track.id} className="relative min-w-[220px] max-w-[220px] bg-dark-800 rounded-2xl shadow-lg flex flex-col items-center p-3 group">
              <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                <img src={track.albumArt || ''} alt={track.name} className="w-full h-full object-cover rounded-xl" />
                <button className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:text-red-400 transition-colors">
                  <span role="img" aria-label="love">❤️</span>
                </button>
              </div>
              <div className="w-full flex flex-col items-start">
                <h3 className="text-white font-semibold text-lg truncate w-full">{track.name}</h3>
                <span className="text-cyan-300 text-xs font-medium mb-1">{track.genre}</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-6 h-6 rounded-full border-2 border-cyan-400" />
                  <span className="text-xs text-white/80">{track.userName}</span>
                </div>
              </div>
              <AudioPlayer src={track.outputUrl || ''} title={track.name} className="mt-2 w-full" maxDuration={track.duration} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;