import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Volume2, VolumeX, Settings, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface RealTimeMixerProps {
  backgroundMusicUrl?: string;
  onMixComplete?: (mixedAudioUrl: string) => void;
}

const RealTimeMixer: React.FC<RealTimeMixerProps> = ({ 
  backgroundMusicUrl = '/edm/myedm1.mp3', 
  onMixComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mixedAudioUrl, setMixedAudioUrl] = useState<string | null>(null);

  // Audio references
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Context
  const initAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100,
          latencyHint: 'interactive'
        });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      toast.error('Failed to initialize audio system');
      throw error;
    }
  };

  // Load and setup background music
  const setupBackgroundMusic = async (audioContext: AudioContext) => {
    try {
      console.log('🎵 Loading background music:', backgroundMusicUrl);
      
      const response = await fetch(backgroundMusicUrl);
      if (!response.ok) {
        throw new Error(`Failed to load music: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create music source and gain
      const musicSource = audioContext.createBufferSource();
      const musicGain = audioContext.createGain();
      
      musicSource.buffer = audioBuffer;
      musicSource.loop = true; // Loop the background music
      
      musicSource.connect(musicGain);
      musicGain.gain.setValueAtTime(musicVolume, audioContext.currentTime);
      
      musicSourceRef.current = musicSource;
      musicGainRef.current = musicGain;
      
      console.log('✅ Background music loaded and ready');
      return { musicSource, musicGain };
    } catch (error) {
      console.error('Failed to setup background music:', error);
      toast.error('Failed to load background music');
      throw error;
    }
  };

  // Setup microphone input
  const setupMicrophone = async (audioContext: AudioContext) => {
    try {
      console.log('🎤 Setting up microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      const voiceSource = audioContext.createMediaStreamSource(stream);
      const voiceGain = audioContext.createGain();
      
      voiceSource.connect(voiceGain);
      voiceGain.gain.setValueAtTime(voiceVolume, audioContext.currentTime);
      
      voiceStreamRef.current = stream;
      voiceGainRef.current = voiceGain;
      
      console.log('✅ Microphone setup complete');
      return { voiceSource, voiceGain, stream };
    } catch (error) {
      console.error('Failed to setup microphone:', error);
      toast.error('Failed to access microphone. Please check permissions.');
      throw error;
    }
  };

  // Start real-time mixing
  const startMixing = async () => {
    try {
      const audioContext = await initAudioContext();
      
      // Setup audio sources
      const { musicSource, musicGain } = await setupBackgroundMusic(audioContext);
      const { voiceSource, voiceGain, stream } = await setupMicrophone(audioContext);
      
      // Create destination for recording
      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;
      
      // Connect everything
      musicGain.connect(destination);
      voiceGain.connect(destination);
      
      // Also connect to speakers for monitoring (optional)
      if (!isMuted) {
        musicGain.connect(audioContext.destination);
        voiceGain.connect(audioContext.destination);
      }
      
      // Start background music
      musicSource.start();
      
      // Setup MediaRecorder for the mixed output
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMixedAudioUrl(url);
        
        if (onMixComplete) {
          onMixComplete(url);
        }
        
        toast.success('🎵 Mix completed! Ready for download.');
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setIsRecording(true);
      setIsPlaying(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('🎤 Real-time mixing started!');
      
    } catch (error) {
      console.error('Failed to start mixing:', error);
      toast.error('Failed to start mixing');
    }
  };

  // Stop mixing
  const stopMixing = () => {
    try {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop music
      if (musicSourceRef.current) {
        musicSourceRef.current.stop();
        musicSourceRef.current = null;
      }
      
      // Stop microphone
      if (voiceStreamRef.current) {
        voiceStreamRef.current.getTracks().forEach(track => track.stop());
        voiceStreamRef.current = null;
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setIsPlaying(false);
      
      toast.success('🛑 Mixing stopped');
      
    } catch (error) {
      console.error('Failed to stop mixing:', error);
      toast.error('Failed to stop mixing');
    }
  };

  // Update volume controls
  useEffect(() => {
    if (musicGainRef.current && audioContextRef.current) {
      musicGainRef.current.gain.setValueAtTime(
        musicVolume, 
        audioContextRef.current.currentTime
      );
    }
  }, [musicVolume]);

  useEffect(() => {
    if (voiceGainRef.current && audioContextRef.current) {
      voiceGainRef.current.gain.setValueAtTime(
        voiceVolume, 
        audioContextRef.current.currentTime
      );
    }
  }, [voiceVolume]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Download mixed audio
  const downloadMix = () => {
    if (mixedAudioUrl) {
      const a = document.createElement('a');
      a.href = mixedAudioUrl;
      a.download = `fard-remix-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('🎵 Download started!');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMixing();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Real-Time Voice Mixer</h3>
          <p className="text-gray-400 text-sm">Mix your voice with background music live - no backend needed!</p>
        </div>
      </div>

      {/* Recording Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isRecording ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
            }`} />
            <span className="text-sm font-medium">
              {isRecording ? 'RECORDING' : 'READY'}
            </span>
          </div>
          
          {isRecording && (
            <div className="text-white font-mono text-lg">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition-colors ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🎵 Music Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{Math.round(musicVolume * 100)}%</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🎤 Voice Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-gray-400 mt-1">{Math.round(voiceVolume * 100)}%</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mb-6">
        {!isRecording ? (
          <button
            onClick={startMixing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            <Mic className="w-5 h-5" />
            Start Live Mix
          </button>
        ) : (
          <button
            onClick={stopMixing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}
        
        {mixedAudioUrl && (
          <button
            onClick={downloadMix}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download Mix
          </button>
        )}
      </div>

      {/* Mixed Audio Preview */}
      {mixedAudioUrl && (
        <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
          <h4 className="text-white font-medium mb-3">🎵 Your Mixed Track</h4>
          <audio 
            controls 
            src={mixedAudioUrl} 
            className="w-full"
            style={{
              filter: 'hue-rotate(270deg) saturate(2) brightness(1.2)',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h4 className="text-blue-400 font-medium mb-2">💡 How to Use:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Adjust music and voice volumes before starting</li>
          <li>• Click "Start Live Mix" to begin recording</li>
          <li>• Speak into your microphone while music plays</li>
          <li>• Click "Stop Recording" when finished</li>
          <li>• Download your mixed track!</li>
        </ul>
      </div>
    </div>
  );
};

export default RealTimeMixer;