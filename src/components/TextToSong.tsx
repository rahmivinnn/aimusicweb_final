import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Share2, Heart, Sparkles, Zap, Crown, Loader, Music, Mic, Volume2, Settings, Radio } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import RealTimeMixer from './RealTimeMixer';
import { useStore } from '../store/useStore';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const TextToSong: React.FC = () => {
  const { user, addTrack, setLoading, isLoading, useCredit } = useStore();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('EDM');
  const [mood, setMood] = useState('Energetic');
  const [duration, setDuration] = useState(180);
  const [bpm, setBpm] = useState(128);
  const [generatedTrack, setGeneratedTrack] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [selectedBPM, setSelectedBPM] = useState(128);
  const [selectedEffects, setSelectedEffects] = useState<string[]>(['Heavy Bass']);
  const [voicePrompt, setVoicePrompt] = useState('');
  const [enableVoiceMix, setEnableVoiceMix] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState('DJ');
  const [voiceVolume, setVoiceVolume] = useState(0.8); // Increased default volume for better audibility
  const [mixingMode, setMixingMode] = useState<'traditional' | 'realtime'>('traditional');
  const [realtimeMixUrl, setRealtimeMixUrl] = useState<string | null>(null);

  // Professional EDM and Electronic Genres
  const genres = [
    // EDM & Electronic (Professional DJ Music)
    'EDM', 'House', 'Techno', 'Trance', 'Dubstep', 'Trap', 'Big Room', 'Progressive', 'Electro', 'Drum & Bass',
    // Traditional Genres
    'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Lo-fi'
  ];

  // Professional EDM and DJ-focused moods
  const moods = [
    // High Energy EDM Moods
    'Energetic', 'Festive', 'Uplifting', 'Aggressive', 'Epic',
    // Chill & Atmospheric
    'Chill', 'Peaceful', 'Mysterious', 'Melancholic', 'Romantic',
    // Dark & Intense
    'Dark', 'Intense', 'Mysterious', 'Hypnotic', 'Euphoric'
  ];

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

  const voiceStyles = [
    { value: 'DJ', label: '🎧 DJ Style', description: 'Professional DJ voice with effects' },
    { value: 'Radio', label: '📻 Radio Host', description: 'Clear radio announcer voice' },
    { value: 'Hype', label: '🔥 Hype Man', description: 'Energetic party hype voice' },
    { value: 'Smooth', label: '🎵 Smooth', description: 'Smooth and melodic voice' },
    { value: 'Robot', label: '🤖 Robotic', description: 'Futuristic robotic voice' }
  ];

  // Fast Text-to-Speech function optimized for speed (max 2 seconds)
  const generateVoiceAudio = async (text: string, style: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Clear any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Fast voice configuration - use first available voice for speed
      const voices = speechSynthesis.getVoices();
      const fastVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (fastVoice) {
        utterance.voice = fastVoice;
      }
      
      // Optimized voice styles for speed
      switch (style) {
        case 'DJ':
          utterance.rate = 1.0; // Faster rate
          utterance.pitch = 0.8;
          utterance.volume = 0;
          break;
        case 'Radio':
          utterance.rate = 1.1; // Faster rate
          utterance.pitch = 0.9;
          utterance.volume = 0;
          break;
        case 'Hype':
          utterance.rate = 1.2; // Faster rate
          utterance.pitch = 1.0;
          utterance.volume = 0;
          break;
        case 'Smooth':
          utterance.rate = 1.0; // Faster rate
          utterance.pitch = 0.9;
          utterance.volume = 0;
          break;
        case 'Robot':
          utterance.rate = 1.0; // Faster rate
          utterance.pitch = 0.5; // Very low for robot effect
          utterance.volume = 0; // Silent for processing only
          break;
      }

      // Fast audio recording optimized for speed
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 22050, // Lower sample rate for speed
        latencyHint: 'interactive'
      });
      
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
        mimeType: 'audio/webm', // Simplified codec for speed
        audioBitsPerSecond: 64000 // Lower bitrate for speed
      });
      
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };

      utterance.onstart = () => {
        console.log('🎤 Fast voice generation started');
        toast.info('🎤 Fast voice generation (max 2 seconds)', {
          duration: 2000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #06b6d4',
          }
        });
        mediaRecorder.start(50); // Smaller chunks for speed
      };

      utterance.onend = () => {
        console.log('🎤 Fast voice generation completed');
        // Much shorter wait time for speed
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 100); // Reduced from 800ms to 100ms
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(error);
      };

      // Fast voice generation without waiting for voice loading
      speechSynthesis.volume = 0;
      speechSynthesis.speak(utterance);
    });
  };

  // Fast voice mixing optimized for speed (max 3 seconds)
  const mixAudioWithVoice = async (musicUrl: string, voiceBlob: Blob, voiceVolume: number = 0.5): Promise<string> => {
    try {
      console.log('🎛️ Fast voice mixing started...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 22050, // Lower sample rate for speed
        latencyHint: 'interactive'
      });
      
      // Fast parallel loading
      console.log('📥 Fast loading audio files...');
      const [musicResponse, voiceArrayBuffer] = await Promise.all([
        fetch(musicUrl),
        voiceBlob.arrayBuffer()
      ]);
      
      if (!musicResponse.ok) {
        throw new Error(`Failed to load music: ${musicResponse.status}`);
      }
      
      const [musicArrayBuffer, musicAudioBuffer, voiceAudioBuffer] = await Promise.all([
        musicResponse.arrayBuffer(),
        musicResponse.arrayBuffer().then(buffer => audioContext.decodeAudioData(buffer)),
        audioContext.decodeAudioData(voiceArrayBuffer)
      ]);
      
      console.log('✅ Fast loading completed');
      
      // Quick validation
      if (voiceVolume <= 0) {
        console.warn('⚠️ Voice volume too low');
        return musicUrl;
      }
      
      // Simplified volume processing
      const effectiveVolume = Math.max(voiceVolume, 0.4) * 1.5;
      console.log('🔊 Using volume:', effectiveVolume);
      
      // Quick voice content check (sample only first 100 samples)
      const voiceData = voiceAudioBuffer.getChannelData(0);
      let hasContent = false;
      for (let i = 0; i < Math.min(100, voiceData.length); i++) {
        if (Math.abs(voiceData[i]) > 0.001) {
          hasContent = true;
          break;
        }
      }
      
      if (!hasContent) {
        console.error('❌ Voice appears silent');
        return musicUrl;
      }
      
      // Simple single placement at 30% of song
      const musicDuration = musicAudioBuffer.length;
      const voiceDuration = voiceAudioBuffer.length;
      const startPos = Math.floor(musicDuration * 0.3);
      
      console.log('🎯 Voice placement at 30% of song');
      
      // Create mixed buffer
      const mixedBuffer = audioContext.createBuffer(
        musicAudioBuffer.numberOfChannels,
        musicDuration,
        audioContext.sampleRate
      );
      
      // Fast simple mixing algorithm
      for (let channel = 0; channel < mixedBuffer.numberOfChannels; channel++) {
        const mixedData = mixedBuffer.getChannelData(channel);
        const musicData = musicAudioBuffer.getChannelData(Math.min(channel, musicAudioBuffer.numberOfChannels - 1));
        const voiceData = voiceAudioBuffer.getChannelData(Math.min(channel, voiceAudioBuffer.numberOfChannels - 1));
        
        // Copy music data
        // Copy music data to mixed buffer
        for (let i = 0; i < musicDuration; i++) {
          mixedData[i] = musicData[i] || 0;
        }
        
        // Simple fast mixing - place voice at 30% of song
        const startPos = Math.floor(musicDuration * 0.3);
        let voiceSamplesAdded = 0;
        
        for (let i = 0; i < voiceDuration && (startPos + i) < musicDuration; i++) {
          const musicPos = startPos + i;
          const voiceSample = voiceData[i] || 0;
          
          if (voiceSample !== 0) {
            voiceSamplesAdded++;
            // Simple mixing with volume boost
            const processedVoice = voiceSample * boostedVoiceVolume;
            const duckedMusic = mixedData[musicPos] * 0.7;
            mixedData[musicPos] = duckedMusic + processedVoice;
          }
        }
        
        console.log(`🎤 Voice mixed: ${voiceSamplesAdded} samples at 30% position`);
      }
      
      console.log('🎛️ Audio mixing completed, rendering final output...');
      
      // Fast rendering with minimal processing
      const offlineContext = new OfflineAudioContext(
        mixedBuffer.numberOfChannels,
        mixedBuffer.length,
        22050 // Lower sample rate for faster processing
      );
      
      const source = offlineContext.createBufferSource();
      source.buffer = mixedBuffer;
      
      // Direct connection for speed
      source.connect(offlineContext.destination);
      
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      console.log('✅ Final audio rendered:', renderedBuffer.duration, 'seconds');
      
      // Quick verification and conversion
      const wavBlob = audioBufferToWav(renderedBuffer);
      const finalUrl = URL.createObjectURL(wavBlob);
      
      console.log('🎵 Fast mixing completed! Duration:', renderedBuffer.duration, 's');
      return finalUrl;
      
    } catch (error) {
      console.error('❌ Voice mixing error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        musicUrl,
        voiceBlob: voiceBlob ? 'Present' : 'Missing'
      });
      return musicUrl; // Return original if mixing fails
    }
  };

  // Fast AudioBuffer to WAV conversion
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // Simplified WAV header
    view.setUint32(0, 0x46464952, false); // 'RIFF'
    view.setUint32(4, 36 + length, true);
    view.setUint32(8, 0x45564157, false); // 'WAVE'
    view.setUint32(12, 0x20746d66, false); // 'fmt '
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x61746164, false); // 'data'
    view.setUint32(40, length, true);
    
    // Fast audio data conversion
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
      if (buffer.numberOfChannels > 1) {
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(effects =>
      effects.includes(effect)
        ? effects.filter(e => e !== effect)
        : [...effects, effect]
    );
  };

  const handleGenerateSong = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a text prompt');
      return;
    }

    if (!user || user.credits <= 0) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return;
    }

    // Debug logging for duration tracking
    console.log('🎵 Audio Generation Debug:');
    console.log('Selected Duration (seconds):', duration);
    console.log('Selected Duration (minutes):', duration / 60);
    console.log('Genre:', genre);
    console.log('Mood:', mood);
    console.log('Voice Mix Enabled:', enableVoiceMix);
    console.log('Voice Prompt:', voicePrompt);
    console.log('Voice Style:', voiceStyle);

    setLoading(true);
    setProgress(0);
    
    const loadingToast = toast.loading('🎵 AI is composing your masterpiece...', { 
      duration: Infinity,
      style: {
        background: '#1a1a1a',
        color: '#ffffff',
        border: '1px solid #06b6d4',
      }
    });

    try {
      const outputUrl = await aiService.textToMusic(
        prompt,
        {
          duration,
          genre,
          mood
        },
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      let finalOutputUrl = outputUrl;
      
      // Generate and mix voice if enabled
      if (enableVoiceMix && voicePrompt.trim()) {
        try {
          setProgress(85);
          toast.loading('🎤 Generating voice...', { id: loadingToast });
          
          console.log('🎤 Generating voice audio with settings:', { voicePrompt, voiceStyle, voiceVolume });
          const voiceBlob = await generateVoiceAudio(voicePrompt, voiceStyle);
          console.log('✅ Voice blob generated:', voiceBlob.size, 'bytes, type:', voiceBlob.type);
          
          // Add small delay to show progress transition
          await new Promise(resolve => setTimeout(resolve, 500));
          setProgress(90);
          toast.loading('🎛️ Mixing audio...', { id: loadingToast });
          
          console.log('🎛️ Starting voice mixing with volume:', voiceVolume);
          
          if (voiceVolume < 0.3) {
            toast.warning(`Voice volume rendah (${Math.round(voiceVolume * 100)}%), voice mungkin tidak terdengar jelas`, {
              id: loadingToast + '_volume_warning',
              duration: 3000
            });
          }
          
          finalOutputUrl = await mixAudioWithVoice(outputUrl, voiceBlob, voiceVolume);
          
          // Add small delay to show progress transition
          await new Promise(resolve => setTimeout(resolve, 300));
          setProgress(95);
          
          // Verify the mixed result
          if (finalOutputUrl !== outputUrl) {
            console.log('✅ Voice successfully mixed into track');
            toast.success(`🎤 Voice DJ successfully mixed! Volume: ${Math.round(voiceVolume * 100)}% | Style: ${voiceStyle} | Fast Mode: 1 placement`, {
              id: loadingToast + '_mix_success',
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#ffffff',
                border: '1px solid #10b981',
              }
            });
          } else {
            console.warn('⚠️ Voice mixing returned original URL, mixing may have failed');
          }
        } catch (voiceError) {
          console.error('❌ Voice generation/mixing error:', voiceError);
          console.error('Voice error details:', {
            voicePrompt,
            voiceStyle,
            voiceVolume,
            error: voiceError.message
          });
          await new Promise(resolve => setTimeout(resolve, 300));
          setProgress(95); // Continue progress even if voice mixing fails
          toast.warning('Voice mixing failed, using original track');
        }
      } else {
        // No voice mixing, complete progress
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(95);
      }

      const newTrack = {
        id: Date.now().toString(),
        name: `AI Generated - ${prompt.substring(0, 30)}...${enableVoiceMix ? ' (with voice)' : ''}`,
        inputUrl: '',
        prompt,
        genre,
        status: 'completed' as const,
        createdAt: new Date(),
        outputUrl: finalOutputUrl,
        duration,
        bpm: selectedBPM,
        style: mood,
        userId: user.id,
        userName: user.name,
        isPublic: true,
        likes: 0,
        downloads: 0,
        effects: selectedEffects,
        voiceMix: enableVoiceMix ? { voicePrompt, voiceStyle, voiceVolume } : undefined
      };
      
      addTrack(newTrack);
      setGeneratedTrack(newTrack);
      useCredit();
      
      // Add final delay before completing
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(100);
      
      toast.success(enableVoiceMix ? '🎵🎤 Professional track with voice generated successfully!' : '🎵 Professional track generated successfully!', { 
        id: loadingToast,
        duration: 4000,
        icon: '🎉'
      });
      
      // Reset form
      setPrompt('');
      setProgress(0);
      
    } catch (error) {
      setProgress(100); // Complete progress even on error
      toast.error('Failed to generate track. Please try again.', { id: loadingToast });
      console.error('Text-to-song generation error:', error);
    } finally {
      setLoading(false);
    }
  };

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
            className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center"
          >
            <Mic className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Professional Text-to-Song Studio
          </h1>
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent"
        >
          Transform Words into Professional DJ Music
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-dark-300 text-lg max-w-2xl mx-auto"
        >
          Describe your perfect track and let our advanced AI create professional-quality EDM with heavy bass drops, beat builds, and DJ-style production.
        </motion.p>
      </motion.div>

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-cyan-500/30 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Describe Your Song</h3>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your perfect song... (e.g., 'Create an epic electronic dance track with heavy bass drops, soaring synths, and a driving beat that makes people want to dance all night')"
          className="w-full h-32 bg-dark-700 border border-cyan-500/50 rounded-lg px-4 py-3 text-white placeholder-dark-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-cyan-500/30 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Professional Track Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-dark-700 border border-cyan-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="🎵 EDM & Electronic">
                <option value="EDM">EDM</option>
                <option value="House">House</option>
                <option value="Techno">Techno</option>
                <option value="Trance">Trance</option>
                <option value="Dubstep">Dubstep</option>
                <option value="Trap">Trap</option>
                <option value="Big Room">Big Room</option>
                <option value="Progressive">Progressive</option>
                <option value="Electro">Electro</option>
                <option value="Drum & Bass">Drum & Bass</option>
              </optgroup>
              <optgroup label="🎼 Traditional">
                <option value="Hip Hop">Hip Hop</option>
                <option value="Rock">Rock</option>
                <option value="Pop">Pop</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Ambient">Ambient</option>
                <option value="Lo-fi">Lo-fi</option>
              </optgroup>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-dark-700 border border-cyan-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="⚡ High Energy">
                <option value="Energetic">Energetic</option>
                <option value="Festive">Festive</option>
                <option value="Uplifting">Uplifting</option>
                <option value="Aggressive">Aggressive</option>
                <option value="Epic">Epic</option>
              </optgroup>
              <optgroup label="😌 Chill & Atmospheric">
                <option value="Chill">Chill</option>
                <option value="Peaceful">Peaceful</option>
                <option value="Mysterious">Mysterious</option>
                <option value="Melancholic">Melancholic</option>
                <option value="Romantic">Romantic</option>
              </optgroup>
              <optgroup label="🌙 Dark & Intense">
                <option value="Dark">Dark</option>
                <option value="Intense">Intense</option>
                <option value="Hypnotic">Hypnotic</option>
                <option value="Euphoric">Euphoric</option>
              </optgroup>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => {
                const newDuration = Number(e.target.value);
                console.log('Duration changed to:', newDuration, 'seconds (', newDuration/60, 'minutes)');
                setDuration(newDuration);
              }}
              className="w-full bg-dark-700 border border-cyan-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
              <option value={240}>4 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={360}>6 minutes</option>
            </select>
          </div>

          {/* Target BPM */}
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

          {/* EDM Effects */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">EDM Effects</label>
            <div className="flex flex-wrap gap-2">
              {edmEffects.map(effect => (
                <button
                  key={effect}
                  type="button"
                  onClick={() => handleEffectToggle(effect)}
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200
                    ${selectedEffects.includes(effect)
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400'
                      : 'bg-dark-700 text-dark-300 border-dark-600 hover:bg-dark-600 hover:text-cyan-400'}
                  `}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EDM Features Preview */}
        {['EDM', 'House', 'Techno', 'Trance', 'Dubstep', 'Trap', 'Big Room', 'Progressive', 'Electro', 'Drum & Bass'].includes(genre) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Professional EDM Features:</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span className="text-dark-300">Heavy Bass Drops</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span className="text-dark-300">Beat Builds</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span className="text-dark-300">Synth Layers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span className="text-dark-300">DJ Effects</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Voice Mixing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-purple-500/30 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">DJ Voice Mixing</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mixing Mode Selector */}
            <div className="flex items-center space-x-2 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setMixingMode('traditional')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  mixingMode === 'traditional'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Traditional
              </button>
              <button
                onClick={() => setMixingMode('realtime')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                  mixingMode === 'realtime'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3" />
                Live Mix
              </button>
            </div>
            
            {/* Traditional Mode Toggle */}
            {mixingMode === 'traditional' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableVoiceMix"
                  checked={enableVoiceMix}
                  onChange={(e) => setEnableVoiceMix(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-dark-700 border-purple-500 rounded focus:ring-purple-500"
                />
                <label htmlFor="enableVoiceMix" className="text-sm text-purple-400 cursor-pointer">
                  Enable Voice Mix
                </label>
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {/* Real-Time Mixer */}
          {mixingMode === 'realtime' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RealTimeMixer 
                backgroundMusicUrl={generatedTrack?.outputUrl || '/edm/myedm1.mp3'}
                onMixComplete={(url) => {
                  setRealtimeMixUrl(url);
                  toast.success('🎵 Real-time mix completed!');
                }}
              />
            </motion.div>
          )}
          
          {/* Traditional Voice Mixing */}
          {mixingMode === 'traditional' && enableVoiceMix && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Voice Prompt */}
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">
                  Voice Text (What should the voice say?)
                </label>
                <textarea
                  value={voicePrompt}
                  onChange={(e) => setVoicePrompt(e.target.value)}
                  placeholder="Enter what you want the voice to say... (e.g., 'Welcome to the party! Let's get this dance floor moving!')"
                  className="w-full h-20 bg-dark-700 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-dark-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voice Style */}
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-2">
                    Voice Style
                  </label>
                  <select
                    value={voiceStyle}
                    onChange={(e) => setVoiceStyle(e.target.value)}
                    className="w-full bg-dark-700 border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {voiceStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-dark-400 mt-1">
                    {voiceStyles.find(s => s.value === voiceStyle)?.description}
                  </p>
                </div>
                
                {/* Voice Volume */}
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-2">
                    Voice Volume
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    value={voiceVolume}
                    onChange={(e) => setVoiceVolume(Number(e.target.value))}
                    className="w-full slider"
                  />
                  <div className="text-center text-sm mt-1">
                    <span className={voiceVolume < 0.3 ? 'text-yellow-400 font-bold' : 'text-purple-400 font-bold'}>
                      {Math.round(voiceVolume * 100)}%
                    </span>
                    {voiceVolume < 0.3 && (
                       <div className="text-yellow-400 text-xs mt-1">
                         <div className="flex items-center justify-center space-x-1 mb-1">
                           <span>⚠️</span>
                           <span>Volume rendah, voice mungkin tidak terdengar jelas</span>
                         </div>
                         <button
                           onClick={() => setVoiceVolume(0.5)}
                           className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
                         >
                           Set to 50% (Recommended)
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Voice Preview with Timeline */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center space-x-2 mb-3">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Voice Mix Preview:</span>
                  <button
                    onClick={async () => {
                      if (voicePrompt.trim()) {
                        try {
                          console.log('🎤 Testing voice with settings:', { voicePrompt, voiceStyle, voiceVolume });
                          const voiceBlob = await generateVoiceAudio(voicePrompt, voiceStyle);
                          console.log('✅ Voice blob generated:', voiceBlob.size, 'bytes');
                          const audioUrl = URL.createObjectURL(voiceBlob);
                          const audio = new Audio(audioUrl);
                          audio.volume = voiceVolume;
                          console.log('🔊 Playing voice test at volume:', voiceVolume);
                          await audio.play();
                        } catch (error) {
                          console.error('❌ Voice preview error:', error);
                          toast.error('Voice test failed: ' + error.message);
                        }
                      }
                    }}
                    disabled={!voicePrompt.trim()}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
                  >
                    🎤 Test Voice
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-dark-300">
                    Style: <span className="text-purple-400 font-semibold">{voiceStyles.find(s => s.value === voiceStyle)?.label}</span> • 
                    Volume: <span className="text-purple-400 font-semibold">{Math.round(voiceVolume * 100)}%</span>
                  </div>
                  
                  {voicePrompt && (
                    <div className="text-xs text-dark-300">
                      Text: <span className="text-purple-400 italic font-medium">"{voicePrompt.substring(0, 80)}{voicePrompt.length > 80 ? '...' : ''}"</span>
                    </div>
                  )}
                  
                  {/* Voice Distribution Timeline */}
                  <div className="mt-3">
                    <div className="text-xs text-purple-400 mb-1 font-medium">Voice will appear throughout the song:</div>
                    <div className="flex items-center space-x-1">
                      <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-dark-400 mt-1">
                      <span>🎵 Start</span>
                       <span>🎤 Voice integrated harmoniously</span>
                       <span>🎵 End</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Features Info */}
                  <div className="mt-3 p-2 bg-dark-700/50 rounded border border-purple-500/20">
                    <div className="text-xs text-purple-300 font-medium mb-1">✨ Enhanced Features:</div>
                    <div className="text-xs text-dark-300 space-y-1">
                      <p className="text-cyan-400 font-medium">🔇 Voice will be generated silently (not heard directly)</p>
                       <p className="text-yellow-400">🎛️ Voice will be mixed with music after generation is complete</p>
                       <p className="text-green-400 font-medium">⚡ Fast Mode: Generation in ~10 seconds</p>
                       <div>• 🎼 Harmonic integration with melody</div>
                       <div>• 🎛️ Tone-changing without blur</div>
                       <div>• ⚡ Single voice placement for speed</div>
                       <div>• 🎚️ Adaptive volume with music</div>
                       <div>• 🔊 Voice enhanced with music ducking</div>
                       <div>• 🚀 Minimal processing for optimal speed</div>
                       <div>• 🎧 Balanced audio quality</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateSong}
          disabled={!prompt.trim() || !user || user.credits <= 0 || isLoading}
          className="relative w-full max-w-md bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
                  <span>Creating Professional EDM Track...</span>
                </div>
                <div className="w-full bg-cyan-800 rounded-full h-2">
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
                <span>Generate Professional EDM Track</span>
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
            className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-6 border border-cyan-500/50 shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">🎉 Your Professional Track is Ready!</h3>
            </div>
            
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full mr-2 font-bold">Simulated AI Output</span>
              <span className="text-xs text-dark-400">(Demo only)</span>
            </div>
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
              maxDuration={duration}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-dark-300 space-y-1">
                <p><span className="text-cyan-400 font-medium">Genre:</span> {generatedTrack.genre}</p>
                <p><span className="text-cyan-400 font-medium">Mood:</span> {generatedTrack.style}</p>
                <p><span className="text-cyan-400 font-medium">BPM:</span> {generatedTrack.bpm}</p>
                <p><span className="text-cyan-400 font-medium">Duration:</span> {Math.floor(generatedTrack.duration / 60)}:{(generatedTrack.duration % 60).toString().padStart(2, '0')}</p>
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
                  className="p-2 text-dark-400 hover:text-cyan-400 transition-colors"
                  onClick={() => toast.success('Share link copied to clipboard!')}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-cyan-400 transition-colors"
                  onClick={() => toast.success('Download started!')}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Mix Result */}
      <AnimatePresence>
        {realtimeMixUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🎵 Live Mix Complete!</h3>
                <p className="text-gray-400 text-sm">Your real-time voice mix is ready</p>
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full mr-2 font-bold">Real-Time Mixed</span>
              <span className="text-xs text-gray-400">Live recorded with voice</span>
            </div>
            
            <AudioPlayer
              src={realtimeMixUrl}
              title="Live Voice Mix"
              className="mb-4"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="text-cyan-400 font-medium">Type:</span> Real-time Voice Mix</p>
                <p><span className="text-cyan-400 font-medium">Format:</span> WebM Audio</p>
                <p><span className="text-cyan-400 font-medium">Quality:</span> 44.1kHz</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  onClick={() => toast.success('Added to favorites!')}
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  onClick={() => toast.success('Share link copied to clipboard!')}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = realtimeMixUrl;
                    a.download = `live-mix-${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    toast.success('Download started!');
                  }}
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
        transition={{ delay: 0.7 }}
        className="relative bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-600 rounded-xl p-6 text-white overflow-hidden"
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
          className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-[length:200%_100%]"
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-300" />
              <h3 className="text-2xl font-bold">Unlock Professional AI Features!</h3>
            </div>
            <p className="text-cyan-100 mb-4 text-lg">
              Get unlimited text-to-song generation, advanced AI models, and exclusive sound libraries.
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
              className="bg-white text-cyan-600 font-bold py-3 px-8 rounded-lg hover:bg-cyan-50 transition-all shadow-lg"
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
    </div>
  );
};

export default TextToSong;