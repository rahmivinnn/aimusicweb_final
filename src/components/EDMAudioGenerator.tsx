import React, { useState } from 'react';

// Utility to generate short EDM effect audio files
export const generateEDMEffect = async (
  type: string, 
  duration: number, 
  sampleRate: number = 44100
): Promise<AudioBuffer> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  switch (type) {
    case 'riser':
      // Rising frequency sweep
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 200 + (t / duration) * 2000; // 200Hz to 2200Hz
        const amplitude = 0.3 * Math.exp(-t * 2); // Fade out
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.1);
      }
      break;
      
    case 'drop':
      // Bass drop with impact
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 60 + 40 * Math.exp(-t * 10); // Bass frequency
        const amplitude = 0.4 * Math.exp(-t * 3);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
      }
      break;
      
    case 'sweep':
      // Filter sweep effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 800 + 400 * Math.sin(t * 4); // Sweeping frequency
        const amplitude = 0.25 * Math.exp(-t * 2);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.05);
      }
      break;
      
    case 'bassboost':
      // Bass boost effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 80 + 20 * Math.sin(t * 8);
        const amplitude = 0.35 * Math.exp(-t * 1.5);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
      }
      break;
      
    case 'echo':
      // Echo effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 400;
        const amplitude = 0.2 * Math.exp(-t * 4);
        const echo = i > sampleRate * 0.1 ? leftChannel[i - Math.floor(sampleRate * 0.1)] * 0.3 : 0;
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t) + echo;
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.1) + echo;
      }
      break;
      
    case 'pitchshift':
      // Pitch shift effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 300 + 100 * Math.sin(t * 6);
        const amplitude = 0.3 * Math.exp(-t * 2);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.1);
      }
      break;
      
    case 'reverse':
      // Reverse effect (will be reversed in processing)
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 500;
        const amplitude = 0.25 * Math.exp(-t * 3);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
      }
      break;
      
    case 'filtersweep':
      // Filter sweep
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 600 + 300 * (t / duration);
        const amplitude = 0.28 * Math.exp(-t * 2.5);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.05);
      }
      break;
      
    case 'sidechain':
      // Sidechain compression effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 120;
        const amplitude = 0.32 * Math.exp(-t * 2) * (0.5 + 0.5 * Math.sin(t * 8));
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
      }
      break;
      
    case 'buildup':
      // Build up effect
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 200 + 100 * (t / duration);
        const amplitude = 0.38 * (t / duration) * Math.exp(-t * 1.5);
        leftChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t);
        rightChannel[i] = amplitude * Math.sin(2 * Math.PI * freq * t + 0.1);
      }
      break;
      
    default:
      // Default white noise
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const amplitude = 0.2 * Math.exp(-t * 2);
        leftChannel[i] = amplitude * (Math.random() * 2 - 1);
        rightChannel[i] = amplitude * (Math.random() * 2 - 1);
      }
  }
  
  return buffer;
};

// Convert AudioBuffer to WAV Blob
export const bufferToWavBlob = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  
  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
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
};

// Component to generate and download EDM effect files
export const EDMAudioGenerator: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  
  const effects = [
    { name: 'riser', duration: 1.5 },
    { name: 'drop', duration: 2.0 },
    { name: 'sweep', duration: 1.2 },
    { name: 'bassboost', duration: 1.8 },
    { name: 'echo', duration: 1.0 },
    { name: 'pitchshift', duration: 1.5 },
    { name: 'reverse', duration: 1.3 },
    { name: 'filtersweep', duration: 1.6 },
    { name: 'sidechain', duration: 1.4 },
    { name: 'buildup', duration: 2.0 }
  ];
  
  const generateAllEffects = async () => {
    setGenerating(true);
    
    for (const effect of effects) {
      try {
        const buffer = await generateEDMEffect(effect.name, effect.duration);
        const blob = bufferToWavBlob(buffer);
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${effect.name}1.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate ${effect.name}:`, error);
      }
    }
    
    setGenerating(false);
  };
  
  return (
    <div className="p-4 bg-dark-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Generate EDM Effect Files</h3>
      <button
        onClick={generateAllEffects}
        disabled={generating}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate All Effects'}
      </button>
      <p className="text-sm text-gray-400 mt-2">
        This will generate and download short EDM effect files (1-2 seconds each)
      </p>
    </div>
  );
}; 