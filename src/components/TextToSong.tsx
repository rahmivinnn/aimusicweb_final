import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

const edmFiles = [
  '/new/edm-140530.mp3',
  '/new/bar-heights-edm-music-230648.mp3',
  '/new/edm-dance-club-music-259530.mp3',
  '/new/the-streets-of-tokyo-1-min-edit-japanese-style-edm-370224.mp3',
  '/new/quirky-edm-with-toy-sounds-silly-vocal-chops-371342.mp3',
  '/new/edm-club-music-265781.mp3'
];

const TextToSong: React.FC = () => {
  const { addTrack, user, useCredit } = useStore();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('EDM');
  const [mood, setMood] = useState('Energetic');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mixing, setMixing] = useState(false);
  const [mixProgress, setMixProgress] = useState(0);
  const [mixedUrl, setMixedUrl] = useState<string | null>(null);
  const [filesReady, setFilesReady] = useState(true);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [showSubModal, setShowSubModal] = useState(false);
  
  const isWordLimitExceeded = (text: string): boolean => {
    const wordCount = text.trim().split(/\s+/).length;
    return wordCount > 100;
  };

  const handleError = (error: unknown, defaultMessage = 'An error occurred'): void => {
    const message = error instanceof Error ? error.message : defaultMessage;
    toast.error(message, {
      style: { background: '#ff4444', color: '#fff' },
      duration: 5000
    });
    console.error(error);
  };

  const vokalFile = '/new/sample.mp3';

  // Pengecekan otomatis file EDM dan vokal di awal
  useEffect(() => {
    let cancelled = false;
    async function checkFiles() {
      const missing: string[] = [];
      // Cek vokal
      try {
        const res = await fetch(vokalFile, { method: 'HEAD' });
        if (!res.ok) missing.push(vokalFile);
      } catch {
        missing.push(vokalFile);
      }
      // Cek semua EDM
      for (const edm of edmFiles) {
        try {
          const res = await fetch(edm, { method: 'HEAD' });
          if (!res.ok) missing.push(edm);
        } catch {
          missing.push(edm);
        }
      }
      if (!cancelled) {
        setMissingFiles(missing);
        setFilesReady(missing.length === 0);
        if (missing.length > 0) {
          toast.error('Beberapa file audio tidak ditemukan: ' + missing.join(', '));
        }
      }
    }
    checkFiles();
    return () => { cancelled = true; };
  }, []);

  const handleGenerateTrack = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your song');
      return;
    }

    if (isWordLimitExceeded(prompt)) {
      toast.error('Please keep your description under 100 words');
      return;
    }

    setIsLoading(true);
    setMixing(true);
    setProgress(0);
    setMixProgress(0);
    setMixedUrl(null);

    try {
      // Pilih EDM random
      const edmUrl = edmFiles[Math.floor(Math.random() * edmFiles.length)];
      // Fetch vokal manusia
      let vokalResponse;
      try {
        vokalResponse = await fetch(vokalFile);
        if (!vokalResponse.ok) throw new Error('Vokal file not found');
      } catch (e) {
        toast.error('Vokal file gagal di-load. Pastikan /new/sample.mp3 ada dan bisa diakses.');
        setIsLoading(false);
        setMixing(false);
        return;
      }
      const vokalArrayBuffer = await vokalResponse.arrayBuffer();
      // Fetch EDM audio
      let edmResponse;
      try {
        edmResponse = await fetch(edmUrl);
        if (!edmResponse.ok) throw new Error('EDM file not found');
      } catch (e) {
        toast.error('EDM file gagal di-load. Pastikan file EDM ada di /new/.');
        setIsLoading(false);
        setMixing(false);
        return;
      }
      const edmArrayBuffer = await edmResponse.arrayBuffer();
      // Decode audio
      const audioCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(2, 44100 * 180, 44100);
      const [vokalBuffer, edmBuffer] = await Promise.all([
        audioCtx.decodeAudioData(vokalArrayBuffer.slice(0)),
        audioCtx.decodeAudioData(edmArrayBuffer.slice(0))
      ]);
      // Mixing: overlay vokal di atas EDM dari awal
      const duration = Math.min(vokalBuffer.duration, edmBuffer.duration, 180);
      const vokalSource = audioCtx.createBufferSource();
      vokalSource.buffer = vokalBuffer;
      const edmSource = audioCtx.createBufferSource();
      edmSource.buffer = edmBuffer;
      // Gain
      const vokalGain = audioCtx.createGain();
      vokalGain.gain.value = 0.85;
      const edmGain = audioCtx.createGain();
      edmGain.gain.value = 0.45;
      // Reverb/Echo pada vokal
      const convolver = audioCtx.createConvolver();
      // Buat impulse response sederhana untuk reverb
      const irBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 2, audioCtx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const channel = irBuffer.getChannelData(c);
        for (let i = 0; i < irBuffer.length; i++) {
          channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irBuffer.length, 2.5);
        }
      }
      convolver.buffer = irBuffer;
      // Routing: vokal -> gain -> reverb -> destination
      vokalSource.connect(vokalGain).connect(convolver).connect(audioCtx.destination);
      edmSource.connect(edmGain).connect(audioCtx.destination);
      vokalSource.start(0);
      edmSource.start(0);
      // Render
      const renderPromise = audioCtx.startRendering();
      // Simulasi progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        setMixProgress(Math.min(progress, 95));
      }, 400);
      const mixedBuffer = await renderPromise;
      clearInterval(progressInterval);
      setMixProgress(100);
      // Convert ke WAV/Blob
      const wavBlob = bufferToWavBlob(mixedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setMixedUrl(url);
      setIsLoading(false);
      setMixing(false);
      // Add to store
      const newTrack = {
        id: uuidv4(),
        name: `${genre} Track - ${new Date().toLocaleTimeString()}`,
        inputUrl: '',
        outputUrl: url,
        prompt: prompt,
        genre: genre,
        status: 'completed' as const,
        createdAt: new Date(),
        duration: 180,
        bpm: 120,
        style: mood,
        userId: 'demo-user',
        userName: 'Demo User',
        isPublic: false,
        likes: 0,
        downloads: 0
      };
      addTrack(newTrack);
      toast.success('Track generated successfully!');
    } catch (error) {
      handleError(error, 'Failed to generate track');
      setIsLoading(false);
      setMixing(false);
    }
  };

  // Helper: convert AudioBuffer to WAV Blob
  function bufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * numOfChan * 2, true);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        let sample = buffer.getChannelData(ch)[i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([bufferArray], { type: 'audio/wav' });
  }
  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-dark-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Text to Song Generator</h1>
        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Describe your song</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cyberpunk theme with heavy bass and electronic elements..."
                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-h-[120px] pr-12"
                disabled={isLoading}
              />
              <button
                onClick={() => setPrompt('')}
                className="absolute right-3 top-3 p-1 rounded-full bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {prompt.length > 0 && (
                <span className={isWordLimitExceeded(prompt) ? 'text-red-400' : ''}>
                  {prompt.trim().split(/\s+/).length} words
                </span>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="EDM">EDM</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Classical">Classical</option>
                <option value="Jazz">Jazz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="Energetic">Energetic</option>
                <option value="Chill">Chill</option>
                <option value="Happy">Happy</option>
                <option value="Melancholic">Melancholic</option>
                <option value="Dramatic">Dramatic</option>
              </select>
            </div>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1 text-white">
                <span>Generating your track...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-0.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-white mb-1">How it works</p>
                <p className="text-sm">Describe the song you want to create, select a genre and mood, then click "Generate Track". The AI will create a unique song based on your description.</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => {
              if (user?.credits === 0) {
                setShowSubModal(true);
                return;
              }
              handleGenerateTrack();
            }}
            disabled={user?.credits === 0 || isLoading}
            className={`w-full py-3 rounded-lg bg-cyan-400 text-white font-bold text-lg shadow-lg hover:bg-cyan-300 transition-all ${user?.credits === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Generating...' : 'Generate Song'}
          </button>
          {missingFiles.length > 0 && (
            <div className="text-red-400 text-sm mb-2">
              File tidak ditemukan: {missingFiles.join(', ')}
            </div>
          )}
        </div>
      </div>
      {mixedUrl && (
        <div className="mt-6">
          <AudioPlayer src={mixedUrl} title="Your EDM + Vocal Track" className="w-full" showWaveformVisualizer />
          <a
            href={mixedUrl}
            download="edm-vocal-mix.wav"
            className="inline-block mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition-all"
          >
            Download Mixed Audio
          </a>
        </div>
      )}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-dark-800 rounded-xl p-8 max-w-md w-full relative border border-cyan-500">
            <button className="absolute top-2 right-2 text-cyan-400" onClick={() => setShowSubModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">Upgrade to Pro</h2>
            <p className="text-white mb-4">Your free credits are used up. Subscribe to unlock unlimited text-to-song and premium features!</p>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold text-lg shadow-lg hover:bg-cyan-300 transition-all" onClick={() => window.location.hash = '#subscription'}>Go to Subscription</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSong;