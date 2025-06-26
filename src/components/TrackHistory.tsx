import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Share2, Heart, Clock, Music, Pause, MoreVertical, Filter, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import AudioPlayer from './AudioPlayer';
import toast from 'react-hot-toast';

const TrackHistory: React.FC = () => {
  const { tracks, currentlyPlaying, setCurrentlyPlaying, downloadTrack, likeTrack } = useStore();
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
      <h1 className="text-4xl font-bold text-white mb-6">My Library</h1>
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Track Artwork */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 rounded-lg flex items-center justify-center shadow-lg overflow-hidden album-art-premium-glow"
                  >
                    {track.albumArt ? (
                      <img 
                        src={track.albumArt} 
                        alt={`${track.name} album art`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to Music icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center ${track.albumArt ? 'hidden' : ''}`}>
                      <Music className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  {track.status === 'processing' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-purple-400 border-t-transparent rounded-lg"
                    />
                  )}

                  {track.status === 'completed' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-dark-400 text-sm mb-2 line-clamp-2">{track.prompt}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-dark-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{track.createdAt.toLocaleDateString()}</span>
                    </span>
                    <span>Genre: {track.genre}</span>
                    {track.bpm && <span>BPM: {track.bpm}</span>}
                    {track.duration && (
                      <span>Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      track.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      track.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {track.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-purple-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(track.id)}
                  className="p-2 text-dark-400 hover:text-green-400 transition-colors"
                  disabled={track.status !== 'completed'}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-white transition-colors relative"
                  onClick={() => setOpenMenuId(openMenuId === track.id ? null : track.id)}
                >
                  <MoreVertical className="w-5 h-5" />
                  {openMenuId === track.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 animate-fade-in">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-dark-700"
                        onClick={() => { handleShare(track); setOpenMenuId(null); }}
                      >
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-dark-700"
                        onClick={() => { handleDownload(track.id); setOpenMenuId(null); }}
                        disabled={track.status !== 'completed'}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-dark-700"
                        onClick={() => { handleLike(track.id); setOpenMenuId(null); }}
                      >
                        <Heart className="w-4 h-4 mr-2" /> Love
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-dark-700"
                        onClick={() => { toast.success('More action!'); setOpenMenuId(null); }}
                      >
                        <MoreVertical className="w-4 h-4 mr-2" /> More
                      </button>
                    </div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Audio Player */}
            {track.status === 'completed' && track.outputUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-dark-700"
              >
                <AudioPlayer
                  src={track.outputUrl}
                  title={track.name}
                  isPlaying={currentlyPlaying === track.id}
                  onPlayPause={(playing) => handlePlayPause(track.id, playing)}
                  maxDuration={track.duration}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrackHistory;