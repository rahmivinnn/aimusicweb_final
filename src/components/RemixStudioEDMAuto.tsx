import React, { useRef, useState } from 'react';
import * as MusicBeatDetector from 'music-beat-detector';

// EDM effect files
const EDM_EFFECTS = [
  { name: 'Riser', file: '/edm/riser1.wav', type: 'riser' },
  { name: 'Drop', file: '/edm/drop1.wav', type: 'drop' },
  { name: 'Sweep', file: '/edm/sweep1.wav', type: 'sweep' },
  { name: 'Bass Boost', file: '/edm/bassboost1.wav', type: 'bassboost' },
  { name: 'Echo', file: '/edm/echo1.wav', type: 'echo' },
  { name: 'Pitch Shift', file: '/edm/pitchshift1.wav', type: 'pitchshift' },
  { name: 'Reverse', file: '/edm/reverse1.wav', type: 'reverse' },
];

export default function RemixStudioEDMAuto() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer|null>(null);
  const [bpm, setBpm] = useState<number|null>(null);
  const [beatMarkers, setBeatMarkers] = useState<number[]>([]);
  const [remixUrl, setRemixUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Upload & decode audio + auto BPM/beat
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const ctx = new window.AudioContext();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    setAudioBuffer(buffer);

    // Deteksi BPM & beat marker otomatis
    const audioBlob = new Blob([arrayBuffer]);
    const bpmResult = await (MusicBeatDetector as any)(audioBlob);
    setBpm(bpmResult.tempo);
    setBeatMarkers(bpmResult.beats);
    setLoading(false);
  }

  // 2. Smart Remix Otomatis
  async function handleSmartRemix() {
    if (!audioBuffer || !bpm || !beatMarkers.length) return;
    setLoading(true);
    const ctx = new window.OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    // Chain: source → gain → compressor → destination
    const gainNode = ctx.createGain();
    source.connect(gainNode);
    // Limiter/Compressor
    const compressor = ctx.createDynamicsCompressor();
    gainNode.connect(compressor);
    compressor.connect(ctx.destination);
    // Jadwalkan efek otomatis di beat marker (anti tabrakan)
    let lastEffectTime = -999;
    for (let i = 0; i < EDM_EFFECTS.length; i++) {
      const effect = EDM_EFFECTS[i];
      // Pilih beat marker untuk efek (misal: riser di awal, drop di tengah, dst)
      let effectTime = beatMarkers[Math.floor((i + 1) * beatMarkers.length / (EDM_EFFECTS.length + 1))] || 0;
      // Anti tabrakan: skip jika terlalu dekat
      if (effectTime - lastEffectTime < 0.5) continue;
      lastEffectTime = effectTime;
      // Load efek audio
      const effectBuffer = await fetch(effect.file)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b));
      // Buat source node untuk efek
      const effectSource = ctx.createBufferSource();
      effectSource.buffer = effectBuffer;
      // Efek khusus
      if (effect.type === 'reverse') {
        for (let ch = 0; ch < effectBuffer.numberOfChannels; ch++) {
          Array.prototype.reverse.call(effectBuffer.getChannelData(ch));
        }
      }
      if (effect.type === 'pitchshift') {
        effectSource.playbackRate.value = 1.2;
      }
      if (effect.type === 'echo') {
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.25;
        effectSource.connect(delay);
        delay.connect(ctx.destination);
      }
      // Sidechain ducking: riser/drop → turunkan gain lagu utama
      if (effect.type === 'riser' || effect.type === 'drop') {
        gainNode.gain.setValueAtTime(1, effectTime);
        gainNode.gain.linearRampToValueAtTime(0.3, effectTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(1, effectTime + 2);
      }
      // Jadwalkan efek di waktu yang sinkron
      (effect.type === 'echo' ? null : effectSource).connect(ctx.destination);
      effectSource.start(effectTime);
    }
    source.start(0);
    // Render & export
    const renderedBuffer = await ctx.startRendering();
    const wavBlob = bufferToWavBlob(renderedBuffer);
    setRemixUrl(URL.createObjectURL(wavBlob));
    setLoading(false);
  }

  // Helper: Convert AudioBuffer to WAV
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
    <div className="max-w-xl mx-auto p-6 bg-dark-800 rounded-xl shadow-xl mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Remix Studio EDM (Auto)</h2>
      <input type="file" accept="audio/*" onChange={handleUpload} className="mb-4" />
      <button onClick={handleSmartRemix} disabled={!audioBuffer || !bpm || loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition-all mb-4">
        {loading ? 'Processing...' : 'Smart Remix Otomatis'}
      </button>
      {remixUrl && (
        <div className="mt-4">
          <audio controls src={remixUrl} className="w-full"></audio>
          <a href={remixUrl} download="remix.wav" className="inline-block mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-all">Download Remix</a>
        </div>
      )}
      <div className="mt-4 text-white">
        {bpm && <div>BPM: {bpm}</div>}
        {beatMarkers.length > 0 && <div>Beat Markers: {beatMarkers.slice(0, 10).map(b => b.toFixed(2)).join(', ')} ...</div>}
      </div>
    </div>
  );
} 