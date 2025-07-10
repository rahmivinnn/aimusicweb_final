import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import { PremiumAudioProcessor } from '../utils/PremiumAudioProcessor';

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

  // Smart Prompt Examples - EDM Focus
  const smartPrompts = [
    "Heavy EDM drop with jedag-jedug bass and aggressive synths",
    "Futuristic EDM anthem with pounding kicks and laser effects",
    "Epic EDM build-up with massive risers and explosive drops",
    "Dark EDM track with deep sub-bass and industrial sounds",
    "Uplifting EDM with euphoric melodies and powerful bass",
    "Progressive EDM with evolving synths and punchy drums",
    "Tropical EDM with summer vibes and heavy bass drops",
    "Melodic EDM with emotional leads and thumping kicks",
    "Hardstyle EDM with distorted kicks and aggressive energy",
    "Trance EDM with long builds and massive breakdowns",
    "House EDM with groovy basslines and club-ready beats",
    "Dubstep EDM with wobbly bass and heavy drops",
    "Future bass EDM with vocal chops and melodic drops",
    "Trap EDM with 808s and hi-hat rolls",
    "Electro EDM with robotic sounds and heavy kicks",
    "Big room EDM with festival energy and massive drops",
    "Progressive house EDM with smooth transitions",
    "Tech house EDM with minimal beats and deep bass",
    "Bass house EDM with heavy low-end and groovy rhythms",
    "Melodic dubstep EDM with emotional drops",
    "Hard dance EDM with aggressive kicks and energy",
    "Eurodance EDM with classic vibes and modern production",
    "Breaks EDM with broken beats and heavy bass",
    "Drumstep EDM with fast drums and melodic elements",
    "Glitch hop EDM with chopped beats and heavy bass",
    "Neurofunk EDM with complex rhythms and deep bass",
    "Liquid DnB EDM with smooth flows and heavy drops",
    "Jump up EDM with bouncy bass and energetic beats",
    "Crossbreed EDM with mixed genres and heavy energy",
    "Gabber EDM with extreme kicks and aggressive style",
    "Happy hardcore EDM with uplifting melodies",
    "UK hardcore EDM with British energy and heavy bass",
    "Freeform EDM with experimental sounds and heavy drops",
    "Speedcore EDM with ultra-fast beats and extreme energy",
    "Extratone EDM with maximum speed and heavy distortion",
    "Industrial EDM with mechanical sounds and heavy bass",
    "Cyberpunk EDM with futuristic vibes and aggressive drops",
    "Neon EDM with bright synths and heavy bass",
    "Retrowave EDM with 80s vibes and modern production",
    "Synthwave EDM with analog sounds and heavy kicks",
    "Vaporwave EDM with dreamy textures and heavy bass",
    "Chillwave EDM with relaxed vibes and deep bass",
    "Future garage EDM with atmospheric sounds and heavy drops",
    "UK garage EDM with British style and heavy bass",
    "Speed garage EDM with fast beats and heavy energy",
    "2-step EDM with broken rhythms and heavy bass",
    "Grime EDM with urban vibes and heavy drops",
    "Dub EDM with reggae influence and heavy bass",
    "Jungle EDM with breakbeats and heavy sub-bass",
    "Ragga jungle EDM with reggae vocals and heavy energy",
    "Drum and bass EDM with fast drums and heavy bass",
    "Liquid funk EDM with smooth flows and heavy drops",
    "Neurofunk EDM with complex rhythms and deep bass",
    "Jump up EDM with bouncy bass and energetic beats",
    "Crossbreed EDM with mixed genres and heavy energy"
  ];

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
      // Initialize premium audio processor
      const audioCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(2, 44100 * 180, 44100);
      const premiumProcessor = new PremiumAudioProcessor(audioCtx);
      
      // Decode audio with premium quality
      const [vokalBuffer, edmBuffer] = await Promise.all([
        audioCtx.decodeAudioData(vokalArrayBuffer.slice(0)),
        audioCtx.decodeAudioData(edmArrayBuffer.slice(0))
      ]);
      
      // Premium mixing with professional mastering
      const duration = Math.min(vokalBuffer.duration, edmBuffer.duration, 180);
      
      // Create sources
      const vokalSource = audioCtx.createBufferSource();
      vokalSource.buffer = vokalBuffer;
      const edmSource = audioCtx.createBufferSource();
      edmSource.buffer = edmBuffer;
      
      // Premium gain control with smooth fades
      const vokalGain = audioCtx.createGain();
      vokalGain.gain.setValueAtTime(0, 0);
      vokalGain.gain.linearRampToValueAtTime(0.9, 1.0);
      vokalGain.gain.setValueAtTime(0.9, duration - 2);
      vokalGain.gain.linearRampToValueAtTime(0, duration);
      
      const edmGain = audioCtx.createGain();
      edmGain.gain.setValueAtTime(0, 0);
      edmGain.gain.linearRampToValueAtTime(0.5, 1.5);
      edmGain.gain.setValueAtTime(0.5, duration - 2);
      edmGain.gain.linearRampToValueAtTime(0, duration);

      // --- AI-LIKE EFFECTS ---
      // Batasi efek random agar tidak membuat audio blank
      if (Math.random() < 0.5) {
        vokalSource.playbackRate.value = 0.97 + Math.random() * 0.07; // 0.97 - 1.04
      }
      if (Math.random() < 0.3) {
        edmSource.playbackRate.value = 0.98 + Math.random() * 0.04; // 0.98 - 1.02
      }
      // Random filter
      let vokalFilter, edmFilter;
      if (Math.random() < 0.5) {
        vokalFilter = audioCtx.createBiquadFilter();
        vokalFilter.type = Math.random() < 0.5 ? 'lowpass' : 'highpass';
        vokalFilter.frequency.value = 400 + Math.random() * 2000;
      }
      if (Math.random() < 0.4) {
        edmFilter = audioCtx.createBiquadFilter();
        edmFilter.type = Math.random() < 0.5 ? 'lowpass' : 'highpass';
        edmFilter.frequency.value = 200 + Math.random() * 3000;
      }
      // Random echo/delay
      let vokalDelay, edmDelay;
      if (Math.random() < 0.4) {
        vokalDelay = audioCtx.createDelay();
        vokalDelay.delayTime.value = 0.15 + Math.random() * 0.25;
        const feedback = audioCtx.createGain();
        feedback.gain.value = 0.2 + Math.random() * 0.2;
        vokalDelay.connect(feedback);
        feedback.connect(vokalDelay);
      }
      if (Math.random() < 0.3) {
        edmDelay = audioCtx.createDelay();
        edmDelay.delayTime.value = 0.1 + Math.random() * 0.2;
        const feedback = audioCtx.createGain();
        feedback.gain.value = 0.15 + Math.random() * 0.15;
        edmDelay.connect(feedback);
        feedback.connect(edmDelay);
      }
      // Stereo pan
      let vokalPan, edmPan;
      if (audioCtx.createStereoPanner) {
        if (Math.random() < 0.5) {
          vokalPan = audioCtx.createStereoPanner();
          vokalPan.pan.value = -0.3 + Math.random() * 0.6;
        }
        if (Math.random() < 0.5) {
          edmPan = audioCtx.createStereoPanner();
          edmPan.pan.value = -0.5 + Math.random();
        }
      }
      // Preset efek berdasarkan genre/mood
      if (genre === 'EDM' || mood === 'Energetic') {
        edmGain.gain.value = 0.55;
        if (vokalFilter) vokalFilter.frequency.value += 800;
      }
      if (genre === 'Jazz' || mood === 'Chill') {
        vokalGain.gain.value = 0.7;
        if (vokalDelay) vokalDelay.delayTime.value += 0.1;
      }
      if (genre === 'Rock' || mood === 'Dramatic') {
        edmGain.gain.value = 0.5;
        if (edmFilter) edmFilter.frequency.value += 1000;
      }
      // --- END AI-LIKE EFFECTS ---

      // Apply premium EQ to both tracks
      const vokalEQ = premiumProcessor.createPremiumEQ();
      const edmEQ = premiumProcessor.createPremiumEQ();
      
      // Connect vokal through premium processing chain
      let vokalChain: AudioNode = vokalSource;
      vokalChain.connect(vokalGain);
      vokalChain = vokalGain;
      
      for (const eqNode of vokalEQ) {
        vokalChain.connect(eqNode);
        vokalChain = eqNode;
      }
      
      // Connect EDM through premium processing chain
      let edmChain: AudioNode = edmSource;
      edmChain.connect(edmGain);
      edmChain = edmGain;
      
      for (const eqNode of edmEQ) {
        edmChain.connect(eqNode);
        edmChain = eqNode;
      }
      
      // Apply premium reverb to vocals for depth
      const premiumReverb = premiumProcessor.createPremiumReverb();
      vokalChain.connect(premiumReverb);
      vokalChain = premiumReverb;
      
      // Smart ducking: EDM ducks when vocals are present
      const duckingGain = audioCtx.createGain();
      duckingGain.gain.value = 0.7; // EDM is quieter when vocals play
      edmChain.connect(duckingGain);
      edmChain = duckingGain;
      
      // Apply premium mastering chain to final mix
      const masterChain = premiumProcessor.createMasterChain();
      
      // Create a mixer for both tracks
      const mixer = audioCtx.createGain();
      vokalChain.connect(mixer);
      edmChain.connect(mixer);
      
      // Connect mixer through mastering chain
      let masterChainNode: AudioNode = mixer;
      for (const node of masterChain) {
        masterChainNode.connect(node);
        masterChainNode = node;
      }
      masterChainNode.connect(audioCtx.destination);
      vokalSource.start(0);
      edmSource.start(0);
      // Render with premium quality
      const mixedBuffer = await audioCtx.startRendering();
      const wavBlob = bufferToWavBlob(mixedBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setMixedUrl(url);
      setIsLoading(false);
      setMixing(false);
      
      // Add to store
      const newTrack = {
        id: uuidv4(),
        name: `Premium ${genre} Track - ${new Date().toLocaleTimeString()}`,
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
      toast.success('Premium track generated with professional mastering!');
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
            <div className="mb-4">
              <div className="font-bold text-white mb-2">Smart Prompt</div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {smartPrompts.map((p, i) => (
                  <button
                    key={i}
                    className="px-3 py-1 bg-cyan-700 text-white rounded hover:bg-cyan-500 text-xs"
                    onClick={() => setPrompt(p)}
                    type="button"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Heavy EDM drop with jedag-jedug bass and aggressive synths..."
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

          {/* EDM Only Info */}
          <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Premium EDM Generation</h3>
                <p className="text-cyan-200 text-sm">Generate professional EDM tracks with jedag-jedug bass and premium mastering</p>
              </div>
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
                <p className="font-medium text-white mb-1">Premium EDM Generation</p>
                <p className="text-sm">Describe your EDM track with jedag-jedug bass, aggressive synths, and heavy drops. Our AI creates professional EDM with premium mastering.</p>
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
            {isLoading ? 'Generating Premium EDM...' : 'Generate Premium EDM Track'}
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