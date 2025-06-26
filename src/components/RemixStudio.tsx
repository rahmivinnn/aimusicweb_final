import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Share2, Heart, Sparkles, Zap, Crown, Loader, Music, Info, Headphones, Drum, Guitar, Mic2, Disc3 } from 'lucide-react';
import FileUpload from './FileUpload';
import GenreSelector from './GenreSelector';
import RemixSettings from './RemixSettings';
import AudioPlayer from './AudioPlayer';
import { useStore } from '../store/useStore';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const RemixStudio: React.FC = () => {
  const { user, addTrack, setLoading, isLoading, useCredit } = useStore();
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [targetBPM, setTargetBPM] = useState(120);
  const [genreStyle, setGenreStyle] = useState('EDM');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedTrack, setGeneratedTrack] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAivaModal, setShowAivaModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const edmFiles = [
    'edm/myedm1.mp3',
    'edm/myedm2.mp3',
    'edm/myedm3.mp3',
    'edm/myedm4.mp3',
    'edm/myedm5.mp3',
    'edm/myedm6.mp3',
    'edm/myedm7.mp3',
    'edm/myedm8.mp3',
    'edm/myedm9.mp3',
    'edm/myedm10.mp3',
    'edm/myedm11.mp3',
    'edm/myedm12.mp3',
    'edm/myedm13.mp3'
  ];
  const [selectedBPM, setSelectedBPM] = useState(128);
  const [selectedEffects, setSelectedEffects] = useState<string[]>(['Heavy Bass']);
  const edmEffects = [
    'Heavy Bass',
    'Synth FX',
    'DJ Transitions',
    'Beat Drops',
    'Vocal Chops',
    'Sidechain',
    'Reverb',
    'Build Up',
    'Filter Sweep'
  ];

  const aivaEdmSamples = [
    { title: 'AIVA Anthem 1', url: 'edm/myedm1.mp3' },
    { title: 'AIVA Anthem 2', url: 'edm/myedm2.mp3' },
    { title: 'AIVA Anthem 3', url: 'edm/myedm3.mp3' },
    { title: 'AIVA Anthem 4', url: 'edm/myedm4.mp3' }
  ];

  const genreFxMap: Record<string, string> = {
    EDM: 'remix-sounds/edm_drop.mp3',
    Rock: 'remix-sounds/rock_fx.mp3',
    Pop: 'remix-sounds/pop_chorus.mp3',
    HipHop: 'remix-sounds/hiphop_beat.mp3',
    Jazz: 'remix-sounds/jazz_solo.mp3',
    Blues: 'remix-sounds/blues_fx.mp3',
    Electronic: 'remix-sounds/synthwave_layer.mp3',
    Sad: 'remix-sounds/ambient_pad.mp3'
  };
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixResult, setRemixResult] = useState<any>(null);

  // Add a helper to get genre
  const genreBgMap: Record<string, string> = {
    EDM: 'from-cyan-900 via-cyan-700 to-blue-900',
    Rock: 'from-gray-800 via-red-800 to-gray-900',
    Pop: 'from-pink-700 via-pink-400 to-rose-500',
    HipHop: 'from-yellow-700 via-yellow-500 to-orange-700',
    Jazz: 'from-purple-900 via-indigo-700 to-purple-700',
    Blues: 'from-blue-900 via-blue-700 to-indigo-900',
    Electronic: 'from-cyan-700 via-blue-700 to-indigo-800',
    Sad: 'from-gray-700 via-blue-800 to-gray-900',
    Default: 'from-dark-800 via-dark-700 to-dark-900'
  };

  // Helper to get genre icon
  const genreIconMap: Record<string, React.ReactNode> = {
    EDM: <Zap className="w-40 h-40 text-cyan-500/40" />,
    Rock: <Guitar className="w-40 h-40 text-red-500/30" />,
    Pop: <Disc3 className="w-40 h-40 text-pink-400/30" />,
    HipHop: <Mic2 className="w-40 h-40 text-yellow-400/30" />,
    Jazz: <Headphones className="w-40 h-40 text-purple-400/30" />,
    Blues: <Music className="w-40 h-40 text-blue-400/30" />,
    Electronic: <Music className="w-40 h-40 text-cyan-400/30" />,
    Sad: <Music className="w-40 h-40 text-gray-400/30" />,
    Default: <Music className="w-40 h-40 text-cyan-400/20" />
  };

  // Simple animated waveform bars (not real audio analysis)
  const AnimatedWaveform: React.FC<{ color?: string }> = ({ color = 'bg-cyan-400' }) => (
  <div className="flex items-end gap-1 h-8 my-4">
    {[1,2,3,4,5,6,7,8,9,10].map((n, i) => (
      <div
        key={i}
        className={`w-2 rounded ${color}`}
        style={{
          height: `${Math.abs(Math.sin(Date.now()/400 + i)) * 24 + 8}px`,
          transition: 'height 0.3s cubic-bezier(.4,0,.2,1)'
        }}
      />
    ))}
  </div>
);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(effects =>
      effects.includes(effect)
        ? effects.filter(e => e !== effect)
        : [...effects, effect]
    );
  };

  const handleSimulatedRemix = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an audio file first!');
      return;
    }
    setIsRemixing(true);
    setRemixResult(null);
    await new Promise(res => setTimeout(res, 3000));
    setRemixResult({
      userAudio: URL.createObjectURL(uploadedFile),
      fxAudio: genreFxMap[genreStyle] || '',
      bpm: selectedBPM,
      genre: genreStyle
    });
    setIsRemixing(false);
  };

  const handleGenerateRemix = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an audio file first!');
      return;
    }
    if (!user) {
      toast.error('User not found. Please login.');
      return;
    }
    setLoading(true);
    setProgress(0);
    // Simulate progress
    for (let i = 1; i <= 3; i++) {
      setProgress(i * 33);
      await new Promise(res => setTimeout(res, 600));
    }
    // Pick a random EDM file from the full collection
    const randomIndex = Math.floor(Math.random() * edmFiles.length);
    const outputUrl = edmFiles[randomIndex];
    const newTrack = {
      id: Date.now().toString(),
      name: `Remix of: ${uploadedFile.name}`,
      inputUrl: '',
      prompt,
      genre: genreStyle,
      status: 'completed' as const,
      createdAt: new Date(),
      outputUrl,
      duration: 180,
      bpm: selectedBPM,
      style: genreStyle,
      userId: user.id,
      userName: user.name,
      isPublic: true,
      likes: 0,
      downloads: 0,
      effects: selectedEffects,
      originalFileName: uploadedFile.name
    };
    addTrack(newTrack);
    setGeneratedTrack(newTrack);
    useCredit();
    toast.success('🎵 Remix generated!', { duration: 3000 });
    setLoading(false);
    setProgress(0);
  };

  // Confetti burst animation (simple SVG burst)
  const ConfettiBurst: React.FC = () => (
    <svg className="absolute left-1/2 top-0 -translate-x-1/2 z-30 animate-fade-in" width="220" height="80" viewBox="0 0 220 80" fill="none">
      {[...Array(16)].map((_, i) => (
        <circle
          key={i}
          cx={110 + 80 * Math.cos((i / 16) * 2 * Math.PI)}
          cy={40 + 30 * Math.sin((i / 16) * 2 * Math.PI)}
          r={4 + Math.random() * 3}
          fill={`hsl(${i * 22}, 90%, 60%)`}
          opacity={0.7}
        />
      ))}
    </svg>
  );

  // Floating particles animation
  const FloatingParticles: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );

  // Animated sparkles
  const AnimatedSparkles: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-400"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );

  // Celebration animation
  const CelebrationAnimation: React.FC = () => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      className="absolute -top-4 -right-4 z-40"
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Professional AI Remix Studio
          </h1>
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
        >
          Transform Your Music with AI
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-dark-300 text-lg max-w-2xl mx-auto"
        >
          Upload your track and let our advanced AI create professional-quality remixes with custom BPM, effects, and style.
        </motion.p>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700 shadow-xl"
      >
        <FileUpload onFileUpload={handleFileUpload} />
      </motion.div>

      {/* Prompt Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-dark-700 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">AI Remix Prompt</h3>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your perfect remix... (e.g., 'Transform this into an epic synthwave track with heavy bass, retro synths, and cyberpunk vibes')"
          className="w-full h-32 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        
        <div className="mt-6">
          <GenreSelector 
            selectedGenres={selectedGenres}
            onGenreToggle={handleGenreToggle}
          />
        </div>
      </motion.div>

      {/* Remix Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">Target BPM</label>
          <input
            type="range"
            min={100}
            max={170}
            step={1}
            value={selectedBPM}
            onChange={e => setSelectedBPM(Number(e.target.value))}
            className="w-full slider"
          />
          <div className="text-center text-sm text-cyan-400 mt-1 font-bold">{selectedBPM} BPM</div>
        </div>
        <div className="flex items-center mb-2 relative">
          <label className="block text-sm font-medium text-cyan-400 mr-2">EDM Effects</label>
          <button
            className="text-cyan-400"
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="w-4 h-4" />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-8 z-50 bg-dark-800 text-white p-3 rounded shadow-lg text-xs max-w-xs border border-cyan-500">
              The selected effects are reflected through audio samples from our curated EDM set. Actual effect processing will be activated in the full version.
            </div>
          )}
          <button
            className="ml-3 flex items-center text-cyan-400 hover:underline"
            type="button"
            onClick={() => setShowAivaModal(true)}
          >
            <Zap className="w-4 h-4 mr-1" /> Try AIVA AI
          </button>
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateRemix}
          disabled={!uploadedFile || !prompt.trim() || !user || user.credits <= 0 || isLoading}
          className="relative w-full max-w-md bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Professional Remix...</span>
                </div>
                <div className="w-full bg-purple-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-white h-2 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-sm opacity-75">{Math.round(progress)}% Complete</span>
              </motion.div>
            ) : (
              <motion.div
                key="generate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Professional Remix</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Animated background */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.button>
      </motion.div>

      {/* Generated Track Preview */}
      <AnimatePresence>
        {generatedTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-purple-500/50 shadow-xl"
          >
            <div className="mb-3 text-cyan-200 text-base font-semibold">
              🎧 Let's remix your track into a dancefloor anthem with custom-selected EDM effects!<br />
              Style: EDM | BPM: {generatedTrack.bpm} | Effects: {generatedTrack.effects && generatedTrack.effects.join(', ')}<br />
              🧠 Now processing your remix with intelligent FX mapping...<br />
              <span className="text-cyan-400 text-sm">
                Our system interprets your chosen style and effect settings to apply enhancements that reflect modern EDM production trends.
              </span>
            </div>
            <div className="mb-2 text-sm text-cyan-400">Remix of: <span className="font-bold">{generatedTrack.originalFileName}</span></div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full font-bold">BPM: {generatedTrack.bpm}</span>
              {generatedTrack.effects && generatedTrack.effects.map((effect: string) => (
                <span key={effect} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full font-bold">{effect}</span>
              ))}
            </div>
            
            <AudioPlayer
              src={generatedTrack.outputUrl}
              title={generatedTrack.name}
              className="mb-4"
              maxDuration={generatedTrack.duration}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-dark-300 space-y-1">
                <p><span className="text-purple-400 font-medium">Genre:</span> {generatedTrack.genre}</p>
                <p><span className="text-purple-400 font-medium">BPM:</span> {generatedTrack.bpm}</p>
                <p><span className="text-purple-400 font-medium">Style:</span> {generatedTrack.style}</p>
                <p><span className="text-purple-400 font-medium">Duration:</span> {Math.floor(generatedTrack.duration / 60)}:{(generatedTrack.duration % 60).toString().padStart(2, '0')}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                  onClick={() => toast.success('Added to favorites!')}
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-purple-400 transition-colors"
                  onClick={() => toast.success('Share link copied to clipboard!')}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-green-400 transition-colors"
                  onClick={() => toast.success('Download started!')}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Upgrade Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-xl p-6 text-white overflow-hidden"
      >
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 bg-[length:200%_100%]"
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-300" />
              <h3 className="text-2xl font-bold">Unlock Professional AI Features!</h3>
            </div>
            <p className="text-purple-100 mb-4 text-lg">
              Get unlimited professional remixes, advanced AI models, and exclusive sound libraries.
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Unlimited Credits</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Pro AI Models</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">HD Downloads</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-purple-50 transition-all shadow-lg"
              onClick={() => toast.success('Redirecting to premium plans...')}
            >
              Upgrade to Pro - $19.99/month
            </motion.button>
          </div>
          
          <div className="hidden md:block">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <Crown className="w-16 h-16 text-yellow-300" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* AIVA Modal */}
      {showAivaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full relative border border-cyan-500">
            <button className="absolute top-2 right-2 text-cyan-400" onClick={() => setShowAivaModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center"><Zap className="w-5 h-5 mr-2" />AIVA AI Remix Preview</h2>
            <ul className="mb-4">
              {aivaEdmSamples.map((sample) => (
                <li key={sample.url} className="flex items-center mb-2">
                  <span className="flex-1 text-white">{sample.title}</span>
                  <button onClick={() => setPreviewUrl(sample.url)} className="text-cyan-400 underline ml-2">Preview</button>
                  <button
                    onClick={() => {
                      setGeneratedTrack({
                        id: Date.now().toString(),
                        name: `AIVA Remix - ${sample.title}`,
                        inputUrl: '',
                        prompt: prompt,
                        genre: genreStyle,
                        status: 'completed',
                        createdAt: new Date(),
                        outputUrl: sample.url,
                        duration: 180,
                        bpm: selectedBPM,
                        style: genreStyle,
                        userId: user?.id || '1',
                        userName: user?.name || 'AIVA',
                        isPublic: true,
                        likes: 0,
                        downloads: 0,
                        effects: selectedEffects,
                        originalFileName: uploadedFile?.name || sample.title
                      });
                      setShowAivaModal(false);
                      setPreviewUrl(null);
                    }}
                    className="ml-2 bg-cyan-500 text-white px-3 py-1 rounded text-xs hover:bg-cyan-600"
                  >
                    Apply
                  </button>
                </li>
              ))}
            </ul>
            {previewUrl && <AudioPlayer src={previewUrl} title="AIVA Preview" />}
          </div>
        </div>
      )}

      {/* Remix Now Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSimulatedRemix}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300"
          disabled={!uploadedFile || isRemixing}
        >
          Remix Now
        </button>
      </div>

      {/* Remix Result */}
      {isRemixing && (
        <div className="text-cyan-400 text-lg font-bold my-8 text-center">Now Remixing…</div>
      )}
      {remixResult && (
        <div className="relative">
          {/* Dynamic animated background */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl blur-xl remix-premium-bg"
            animate={{
              background: [
                'linear-gradient(135deg, #06b6d4 0%, #a21caf 100%)',
                'linear-gradient(135deg, #a21caf 0%, #06b6d4 100%)',
                'linear-gradient(135deg, #06b6d4 0%, #a21caf 100%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`remix-output mt-8 p-6 rounded-xl border-2 relative overflow-hidden bg-gradient-to-br ${genreBgMap[remixResult.genre] || genreBgMap.Default} animate-gradient-shift`}
            style={{ 
              minHeight: 220,
              backgroundSize: '400% 400%',
              animation: 'gradientShift 8s ease infinite'
            }}
          >
            {/* Pulsing border effect */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(6, 182, 212, 0.4)",
                  "0 0 0 20px rgba(6, 182, 212, 0)",
                  "0 0 0 0 rgba(6, 182, 212, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-xl pointer-events-none"
            />
            
            {/* Floating particles */}
            <FloatingParticles />
            
            {/* Animated sparkles */}
            <AnimatedSparkles />
            
            {/* Confetti burst animation */}
            <ConfettiBurst />
            
            {/* Celebration animation */}
            <CelebrationAnimation />
            
            {/* Genre background icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none z-0">
              {genreIconMap[remixResult.genre] || genreIconMap.Default}
            </div>
            
            <div className="mb-2 flex gap-2 relative z-10">
              <motion.span 
                className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full font-bold animate-pulse-glow shadow-cyan-400/30 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                BPM: {remixResult.bpm}
              </motion.span>
              <motion.span 
                className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full font-bold animate-pulse-glow shadow-cyan-400/30 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {remixResult.genre}
              </motion.span>
            </div>
            
            {/* Animated waveform visual */}
            <AnimatedWaveform color="bg-cyan-400" />
            
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
              <AudioPlayer src={remixResult.userAudio} title="Your Audio" />
              {remixResult.fxAudio && <AudioPlayer src={remixResult.fxAudio} title="Genre FX" />}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RemixStudio;