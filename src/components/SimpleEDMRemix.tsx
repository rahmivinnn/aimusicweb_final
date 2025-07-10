import React, { useState } from 'react';
import { generateEDMEffect, bufferToWavBlob } from './EDMAudioGenerator';

// Simple EDM effects configuration
const EDM_EFFECTS = [
  { name: 'Riser', type: 'riser', duration: 1.5, volume: 0.3 },
  { name: 'Drop', type: 'drop', duration: 2.0, volume: 0.4 },
  { name: 'Sweep', type: 'sweep', duration: 1.2, volume: 0.25 },
  { name: 'Bass Boost', type: 'bassboost', duration: 1.8, volume: 0.35 },
  { name: 'Echo', type: 'echo', duration: 1.0, volume: 0.2 },
  { name: 'Pitch Shift', type: 'pitchshift', duration: 1.5, volume: 0.3 },
  { name: 'Reverse', type: 'reverse', duration: 1.3, volume: 0.25 },
  { name: 'Filter Sweep', type: 'filtersweep', duration: 1.6, volume: 0.28 },
  { name: 'Sidechain', type: 'sidechain', duration: 1.4, volume: 0.32 },
  { name: 'Build Up', type: 'buildup', duration: 2.0, volume: 0.38 }
];

export default function SimpleEDMRemix() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer|null>(null);
  const [remixUrl, setRemixUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEffects, setSelectedEffects] = useState<string[]>(['Riser', 'Drop', 'Sweep']);
  const [effectIntensity, setEffectIntensity] = useState(0.5);
  const [effectFrequency, setEffectFrequency] = useState(0.7);
  const [originalVolume, setOriginalVolume] = useState(0.8);
  const [edmVolume, setEdmVolume] = useState(0.3);
  const [bpm, setBpm] = useState(120); // Default BPM

  // Upload and decode audio
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new window.AudioContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      
      // Simple BPM estimation based on audio duration
      // In a real app, you'd use proper BPM detection
      const estimatedBPM = Math.round(60 / (buffer.duration / 32)); // Rough estimate
      setBpm(Math.max(80, Math.min(160, estimatedBPM)));
      
    } catch (error) {
      console.error('Error processing audio:', error);
    }
    setLoading(false);
  }

  // Create remix with generated EDM effects
  async function handleCreateRemix() {
    if (!audioBuffer) return;
    setLoading(true);
    
    try {
      const ctx = new window.OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Main audio source
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      // Main gain control
      const mainGain = ctx.createGain();
      mainGain.gain.value = originalVolume;
      source.connect(mainGain);

      // EDM effects mixer
      const edmMixer = ctx.createGain();
      edmMixer.gain.value = edmVolume * effectIntensity;
      edmMixer.connect(ctx.destination);

      // Compressor for overall mix
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-20, 0);
      compressor.knee.setValueAtTime(10, 0);
      compressor.ratio.setValueAtTime(4, 0);
      compressor.attack.setValueAtTime(0.005, 0);
      compressor.release.setValueAtTime(0.25, 0);
      
      mainGain.connect(compressor);
      compressor.connect(ctx.destination);

      // Calculate effect timing
      const beatInterval = 60 / bpm; // seconds per beat
      const effectInterval = beatInterval * (1 / effectFrequency);
      
      // Schedule EDM effects
      let lastEffectTime = -999;
      const selectedEffectTypes = selectedEffects.map(name => 
        EDM_EFFECTS.find(effect => effect.name === name)
      ).filter(Boolean);

      for (let time = 0; time < audioBuffer.duration; time += effectInterval) {
        // Skip if too close to previous effect
        if (time - lastEffectTime < 0.5) continue;
        
        // Randomly select an effect
        const effect = selectedEffectTypes[Math.floor(Math.random() * selectedEffectTypes.length)];
        if (!effect) continue;

        try {
          // Generate effect audio
          const effectBuffer = await generateEDMEffect(effect.type, effect.duration, ctx.sampleRate);

          // Create effect source
          const effectSource = ctx.createBufferSource();
          effectSource.buffer = effectBuffer;

          // Effect-specific processing
          const effectGain = ctx.createGain();
          effectGain.gain.value = effect.volume * effectIntensity;

          // Apply effect-specific processing
          if (effect.type === 'reverse') {
            // Reverse the audio buffer
            for (let ch = 0; ch < effectBuffer.numberOfChannels; ch++) {
              const channelData = effectBuffer.getChannelData(ch);
              const reversedData = new Float32Array(channelData.length);
              for (let i = 0; i < channelData.length; i++) {
                reversedData[i] = channelData[channelData.length - 1 - i];
              }
              effectBuffer.copyToChannel(reversedData, ch);
            }
          }

          if (effect.type === 'pitchshift') {
            effectSource.playbackRate.value = 1.2;
          }

          if (effect.type === 'echo') {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.25;
            const feedbackGain = ctx.createGain();
            feedbackGain.gain.value = 0.3;
            
            effectSource.connect(effectGain);
            effectGain.connect(delay);
            delay.connect(feedbackGain);
            feedbackGain.connect(delay);
            delay.connect(edmMixer);
          } else {
            effectSource.connect(effectGain);
            effectGain.connect(edmMixer);
          }

          // Sidechain ducking for certain effects
          if (effect.type === 'riser' || effect.type === 'drop' || effect.type === 'sidechain') {
            mainGain.gain.setValueAtTime(originalVolume, time);
            mainGain.gain.linearRampToValueAtTime(originalVolume * 0.7, time + 0.1);
            mainGain.gain.linearRampToValueAtTime(originalVolume, time + effect.duration);
          }

          // Schedule effect
          effectSource.start(time);
          lastEffectTime = time;

        } catch (error) {
          console.warn(`Failed to process effect ${effect.name}:`, error);
        }
      }

      // Start main audio
      source.start(0);

      // Render the mix
      const renderedBuffer = await ctx.startRendering();
      const wavBlob = bufferToWavBlob(renderedBuffer);
      setRemixUrl(URL.createObjectURL(wavBlob));
      
    } catch (error) {
      console.error('Error during remix:', error);
    }
    
    setLoading(false);
  }

  const handleEffectToggle = (effectName: string) => {
    setSelectedEffects(prev => 
      prev.includes(effectName)
        ? prev.filter(e => e !== effectName)
        : [...prev, effectName]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-dark-800 rounded-xl shadow-xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-white text-center">🎵 Simple EDM Remix Studio</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload & Controls */}
        <div className="space-y-6">
          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Upload Music</h3>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleUpload} 
              className="w-full p-3 border border-gray-600 rounded-lg bg-dark-600 text-white"
            />
          </div>

          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">EDM Effects</h3>
            <div className="grid grid-cols-2 gap-2">
              {EDM_EFFECTS.map((effect) => (
                <label key={effect.name} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEffects.includes(effect.name)}
                    onChange={() => handleEffectToggle(effect.name)}
                    className="rounded text-cyan-500"
                  />
                  <span className="text-white text-sm">{effect.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Mix Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">BPM (Manual Override)</label>
                <input
                  type="range"
                  min="80"
                  max="160"
                  step="1"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{bpm} BPM</span>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Effect Intensity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={effectIntensity}
                  onChange={(e) => setEffectIntensity(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{Math.round(effectIntensity * 100)}%</span>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Effect Frequency</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={effectFrequency}
                  onChange={(e) => setEffectFrequency(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{Math.round(effectFrequency * 100)}%</span>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Original Music Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={originalVolume}
                  onChange={(e) => setOriginalVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{Math.round(originalVolume * 100)}%</span>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">EDM Effects Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={edmVolume}
                  onChange={(e) => setEdmVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{Math.round(edmVolume * 100)}%</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreateRemix} 
            disabled={!audioBuffer || loading} 
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg shadow-lg hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? '🎵 Processing Remix...' : '🎵 Create EDM Remix'}
          </button>
        </div>

        {/* Right Column - Results & Info */}
        <div className="space-y-6">
          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">Track Info</h3>
            <div className="space-y-2 text-white">
              <div>🎵 BPM: <span className="text-cyan-400">{bpm}</span></div>
              {audioBuffer && (
                <div>⏱️ Duration: <span className="text-cyan-400">{audioBuffer.duration.toFixed(1)}s</span></div>
              )}
              <div>🎛️ Effects Selected: <span className="text-cyan-400">{selectedEffects.length}</span></div>
            </div>
          </div>

          {remixUrl && (
            <div className="bg-dark-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-white">🎵 Your Remix</h3>
              <audio controls src={remixUrl} className="w-full mb-4" />
              <a 
                href={remixUrl} 
                download="simple-edm-remix.wav" 
                className="inline-block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-all"
              >
                💾 Download Remix
              </a>
            </div>
          )}

          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-white">✨ Features</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• 🎵 Short 1-2 second EDM effects that don't overpower</li>
              <li>• 🔄 Repeating effects that blend smoothly</li>
              <li>• 🎚️ Smart sidechain ducking for clean mixing</li>
              <li>• 🎛️ Adjustable intensity and frequency controls</li>
              <li>• 🎧 Professional audio compression</li>
              <li>• ⚡ Real-time audio generation (no external files needed)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 