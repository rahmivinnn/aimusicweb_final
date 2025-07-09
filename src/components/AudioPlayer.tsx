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
  buttonClassName?: string;
  progressBarClassName?: string;
  showWaveformVisualizer?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  isPlaying = false,
  onPlayPause,
  className = '',
  maxDuration,
  buttonClassName = '',
  progressBarClassName = '',
  showWaveformVisualizer = false
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
          className={`w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/25 ${buttonClassName}`}
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </motion.button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{title}</h4>
          
          {/* Progress Bar */}
          <div className="mt-2 space-y-1">
            <div className={`relative ${progressBarClassName}`}>
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
      {showWaveformVisualizer && <VisualizerGelombang audioRef={audioRef} />}
    </div>
  );
};

// Komponen VisualizerGelombang
const VisualizerGelombang: React.FC<{ audioRef: React.RefObject<HTMLAudioElement> }> = ({ audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;
    let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    let animationId: number;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array;
    let source: MediaElementAudioSourceNode | null = null;
    let audioCtx: AudioContext | null = null;
    function draw() {
      if (!ctx || !analyser) return;
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.restore();
      animationId = requestAnimationFrame(draw);
    }
    function setup() {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      dataArray = new Uint8Array(analyser.fftSize);
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      draw();
    }
    setup();
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioCtx) audioCtx.close();
    };
  }, [audioRef]);
  return (
    <div className="w-full flex justify-center mt-2">
      <canvas ref={canvasRef} width={320} height={60} className="w-full max-w-lg h-16 bg-transparent" />
    </div>
  );
};

export default AudioPlayer;