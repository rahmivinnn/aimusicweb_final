// Premium Audio Processing System
// Handles professional mixing, mastering, and EQ to eliminate "cempreng" sound

export class PremiumAudioProcessor {
  private audioContext: AudioContext | OfflineAudioContext;
  
  constructor(audioContext: AudioContext | OfflineAudioContext) {
    this.audioContext = audioContext;
  }

  // Professional EQ to eliminate harsh frequencies and add warmth
  createPremiumEQ(): BiquadFilterNode[] {
    const eqChain: BiquadFilterNode[] = [];
    
    // High-pass filter to remove mud (below 80Hz)
    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 80;
    highPass.Q.value = 0.7;
    eqChain.push(highPass);
    
    // Low-mid boost for warmth (200-400Hz)
    const lowMidBoost = this.audioContext.createBiquadFilter();
    lowMidBoost.type = 'peaking';
    lowMidBoost.frequency.value = 250;
    lowMidBoost.gain.value = 2.5;
    lowMidBoost.Q.value = 1.0;
    eqChain.push(lowMidBoost);
    
    // Cut harsh frequencies (2-5kHz) that cause "cempreng"
    const harshCut = this.audioContext.createBiquadFilter();
    harshCut.type = 'peaking';
    harshCut.frequency.value = 3500;
    harshCut.gain.value = -3.0;
    harshCut.Q.value = 1.5;
    eqChain.push(harshCut);
    
    // High-shelf for air (above 8kHz)
    const airBoost = this.audioContext.createBiquadFilter();
    airBoost.type = 'highshelf';
    airBoost.frequency.value = 8000;
    airBoost.gain.value = 1.5;
    eqChain.push(airBoost);
    
    return eqChain;
  }

  // Professional compressor for dynamic control
  createPremiumCompressor(): DynamicsCompressorNode {
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, 0);
    compressor.knee.setValueAtTime(12, 0);
    compressor.ratio.setValueAtTime(3, 0);
    compressor.attack.setValueAtTime(0.003, 0);
    compressor.release.setValueAtTime(0.25, 0);
    return compressor;
  }

  // Limiter to prevent clipping
  createPremiumLimiter(): DynamicsCompressorNode {
    const limiter = this.audioContext.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-1, 0);
    limiter.knee.setValueAtTime(0, 0);
    limiter.ratio.setValueAtTime(20, 0);
    limiter.attack.setValueAtTime(0.001, 0);
    limiter.release.setValueAtTime(0.1, 0);
    return limiter;
  }

  // Stereo widening for more premium feel
  createStereoWidener(): StereoPannerNode[] {
    const leftPan = this.audioContext.createStereoPanner();
    leftPan.pan.value = -0.3;
    
    const rightPan = this.audioContext.createStereoPanner();
    rightPan.pan.value = 0.3;
    
    return [leftPan, rightPan];
  }

  // Subtle reverb for depth
  createPremiumReverb(): ConvolverNode {
    const convolver = this.audioContext.createConvolver();
    
    // Create impulse response for subtle reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 1.5; // 1.5 second reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with some randomness
        const decay = Math.exp(-i / (sampleRate * 0.8));
        const random = (Math.random() - 0.5) * 0.1;
        channelData[i] = (decay + random) * 0.3;
      }
    }
    
    convolver.buffer = impulse;
    return convolver;
  }

  // Master bus processing chain
  createMasterChain(): AudioNode[] {
    const chain: AudioNode[] = [];
    
    // EQ chain
    const eqChain = this.createPremiumEQ();
    chain.push(...eqChain);
    
    // Compressor
    const compressor = this.createPremiumCompressor();
    chain.push(compressor);
    
    // Stereo widener
    const wideners = this.createStereoWidener();
    chain.push(...wideners);
    
    // Subtle reverb
    const reverb = this.createPremiumReverb();
    chain.push(reverb);
    
    // Limiter
    const limiter = this.createPremiumLimiter();
    chain.push(limiter);
    
    return chain;
  }

  // Process audio with premium mastering
  async processWithPremiumMastering(
    source: AudioBufferSourceNode,
    gainNode: GainNode
  ): Promise<AudioBuffer> {
    const masterChain = this.createMasterChain();
    
    // Connect source through the chain
    let currentNode: AudioNode = source;
    currentNode.connect(gainNode);
    currentNode = gainNode;
    
    for (const node of masterChain) {
      currentNode.connect(node);
      currentNode = node;
    }
    
    // Connect to destination
    currentNode.connect(this.audioContext.destination);
    
    // Start rendering
    source.start(0);
    return await (this.audioContext as any).startRendering();
  }

  // Enhanced EDM effect generation with premium quality
  generatePremiumEDMEffect(
    type: string,
    duration: number,
    sampleRate: number = 44100
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    switch (type) {
      case 'premium-riser':
        // Premium riser with harmonics and stereo width
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const freq = 150 + (t / duration) * 1800;
          const amplitude = 0.25 * Math.exp(-t * 1.8);
          
          // Add harmonics for richness
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const harmonic1 = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
          const harmonic2 = 0.15 * Math.sin(2 * Math.PI * freq * 3 * t);
          
          leftChannel[i] = amplitude * (fundamental + harmonic1 + harmonic2);
          rightChannel[i] = amplitude * (fundamental + harmonic1 + harmonic2) * 0.9;
        }
        break;
        
      case 'premium-drop':
        // Premium bass drop with sub-bass and harmonics
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const freq = 45 + 25 * Math.exp(-t * 8);
          const amplitude = 0.35 * Math.exp(-t * 2.5);
          
          // Sub-bass + harmonics
          const subBass = Math.sin(2 * Math.PI * freq * t);
          const midBass = 0.4 * Math.sin(2 * Math.PI * freq * 2 * t);
          const highBass = 0.2 * Math.sin(2 * Math.PI * freq * 4 * t);
          
          leftChannel[i] = amplitude * (subBass + midBass + highBass);
          rightChannel[i] = amplitude * (subBass + midBass + highBass);
        }
        break;
        
      case 'premium-sweep':
        // Premium filter sweep with resonance
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const freq = 600 + 300 * (t / duration);
          const amplitude = 0.22 * Math.exp(-t * 2.2);
          
          // Add resonance and stereo movement
          const resonance = 0.1 * Math.sin(2 * Math.PI * freq * 0.5 * t);
          leftChannel[i] = amplitude * (Math.sin(2 * Math.PI * freq * t) + resonance);
          rightChannel[i] = amplitude * (Math.sin(2 * Math.PI * freq * t + 0.1) + resonance * 0.8);
        }
        break;
        
      default:
        // Premium white noise with filtering
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const amplitude = 0.18 * Math.exp(-t * 2.5);
          
          // Filtered noise for less harshness
          const noise = (Math.random() * 2 - 1) * 0.5;
          const filteredNoise = noise * Math.exp(-t * 3);
          
          leftChannel[i] = amplitude * filteredNoise;
          rightChannel[i] = amplitude * filteredNoise * 0.85;
        }
    }
    
    return buffer;
  }

  // Smart ducking for EDM effects
  createSmartDucking(
    mainGain: GainNode,
    effectGain: GainNode,
    duckAmount: number = 0.3
  ): void {
    // Create sidechain compression effect
    const duckingGain = this.audioContext.createGain();
    duckingGain.gain.value = 1 - duckAmount;
    
    // Connect effect to ducking gain
    effectGain.connect(duckingGain);
    duckingGain.connect(this.audioContext.destination);
    
    // Main audio gets ducked when effect plays
    mainGain.gain.setValueAtTime(1, 0);
    mainGain.gain.linearRampToValueAtTime(1 - duckAmount, 0.05);
    mainGain.gain.linearRampToValueAtTime(1, 0.5);
  }
}

// Utility function to convert AudioBuffer to WAV Blob
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