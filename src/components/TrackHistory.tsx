import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Share2, Heart, Clock, Music, Pause, MoreVertical, Filter, Search, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import AudioPlayer from './AudioPlayer';
import toast from 'react-hot-toast';

const TrackHistory: React.FC = () => {
  const { tracks, currentlyPlaying, setCurrentlyPlaying, downloadTrack, likeTrack, removeTrack } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handlePlayPause = (trackId: string, playing: boolean) => {
    setCurrentlyPlaying(playing ? trackId : null);
  };

  const handleDownload = (trackId: string) => {
    downloadTrack(trackId);
    toast.success('🎵 Download started! Check your downloads folder.');
  };

  const handleLike = (trackId: string) => {
    likeTrack(trackId);
    toast.success('❤️ Added to favorites!');
  };

  const handleShare = (track: any) => {
    navigator.clipboard.writeText(`Check out my AI remix: ${track.name}`);
    toast.success('🔗 Share link copied to clipboard!');
  };

  // Filter and sort tracks
  const filteredTracks = tracks
    .filter(track => {
      const matchesSearch = track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           track.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           track.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || track.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (tracks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Music className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-semibold text-white mb-3">No remixes yet</h3>
          <p className="text-dark-400 text-lg">Start creating your first professional AI remix!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg"
            onClick={() => window.location.hash = '#home'}
          >
            Create Remix
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Remix History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map((track, idx) => (
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
                onClick={() => handleLike(track.id)}
              >
                <span role="img" aria-label="love" className="text-xl transition-all duration-200">❤️</span>
              </button>
              <button
                className="absolute top-2 right-10 z-10 bg-black/60 rounded-full p-1 text-white hover:text-red-400 transition-all hover:scale-125 group-hover:animate-bounce"
                aria-label="Delete"
                tabIndex={0}
                onClick={() => { removeTrack(track.id); toast.success('Track deleted!'); }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex flex-col items-start mb-2">
              <h3 className="text-white font-semibold text-lg break-words leading-tight mb-1 group-hover:text-cyan-300 transition-colors" style={{wordBreak:'break-word',overflowWrap:'break-word'}}>{track.name}</h3>
              <span className="text-cyan-300 text-xs font-medium mb-1">{track.genre}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/80">{track.userName}</span>
                <span className="text-xs text-dark-400">{track.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto w-full">
              <div className="flex items-center gap-4 w-full">
                {track.status === 'completed' && track.outputUrl && (
                  <AudioPlayer
                    src={track.outputUrl}
                    title={track.name}
                    isPlaying={currentlyPlaying === track.id}
                    onPlayPause={(playing) => handlePlayPause(track.id, playing)}
                    maxDuration={track.duration}
                    className="w-full"
                    buttonClassName="w-12 h-12 hover:scale-110 transition-transform"
                    progressBarClassName="shadow-[0_0_10px_#0ff]"
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrackHistory;