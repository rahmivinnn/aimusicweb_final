import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  isPlaying?: boolean;
  onPlayPause?: (playing: boolean) => void;
  className?: string;
  maxDuration?: number; // Maximum duration in seconds
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  isPlaying = false,
  onPlayPause,
  className = '',
  maxDuration
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Add event listeners for debugging audio loading issues
    const handleError = (e: ErrorEvent) => {
      console.error('🔴 Audio loading error:', e);
      console.error('🔴 Audio src that failed:', audio.src);
    };
    
    const handleCanPlay = () => {
      console.log('✅ Audio can play now:', audio.src);
    };
    
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('canplay', handleCanPlay);

    const updateTime = () => {
      const currentTime = audio.currentTime;
      setCurrentTime(currentTime);
      
      // Check if we've reached the max duration limit
      if (maxDuration && currentTime >= maxDuration) {
        audio.pause();
        setPlaying(false);
        onPlayPause?.(false);
        console.log(`Audio stopped at ${maxDuration} seconds (max duration reached)`);
      }
    };
    
    const updateDuration = () => {
      const actualDuration = audio.duration;
      // Always use maxDuration if specified, regardless of actual duration
      const effectiveDuration = maxDuration ? maxDuration : actualDuration;
      setDuration(effectiveDuration);
      console.log(`Audio duration set to ${effectiveDuration} seconds (actual: ${actualDuration}, max: ${maxDuration})`);
    };

    // Update duration immediately when maxDuration changes
    if (maxDuration && audio.duration) {
      setDuration(maxDuration);
      console.log(`Duration updated to ${maxDuration} seconds due to maxDuration change`);
    }

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => {
      setPlaying(false);
      onPlayPause?.(false);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [onPlayPause, maxDuration]);

  // Reset audio when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setPlaying(false);
    onPlayPause?.(false);
    
    // Set duration immediately if maxDuration is available
    if (maxDuration) {
      setDuration(maxDuration);
      console.log(`Duration set to ${maxDuration} seconds for new audio source`);
    }
  }, [src, maxDuration, onPlayPause]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
        onPlayPause?.(false);
      } else {
        await audio.play();
        setPlaying(true);
        onPlayPause?.(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    // Ensure we don't seek beyond maxDuration
    const clampedTime = maxDuration ? Math.min(newTime, maxDuration) : newTime;
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const formatTime = (time: number) => {
    // Handle NaN, Infinity, or invalid time values
    if (!isFinite(time) || isNaN(time) || time < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Debug audio source
  console.log('🎵 AudioPlayer rendering with src:', src);
  console.log('🎵 AudioPlayer title:', title);
  
  return (
    <div className={`bg-dark-800 rounded-lg p-4 border border-dark-700 ${className}`}>
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata" 
        onError={(e) => {
          console.error('🔴 Audio element error:', e);
          console.error('🔴 Failed audio src:', src);
        }}
        onLoadStart={() => console.log('🎵 Audio loading started:', src)}
        onCanPlay={() => console.log('✅ Audio can play:', src)}
        onLoadedData={() => console.log('✅ Audio data loaded:', src)}
      />
      
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/25"
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </motion.button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{title}</h4>
          
          {/* Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${progress}%, #374151 ${progress}%, #374151 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-dark-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="text-dark-400 hover:text-white transition-colors"
          >
            {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${muted ? 0 : volume * 100}%, #374151 ${muted ? 0 : volume * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;