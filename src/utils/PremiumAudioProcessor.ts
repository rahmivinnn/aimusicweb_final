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
    
    // High-pass filter to remove mud (below 60Hz)
    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 60;
    highPass.Q.value = 0.7;
    eqChain.push(highPass);
    
    // Bass boost for punchy EDM (80-120Hz)
    const bassBoost = this.audioContext.createBiquadFilter();
    bassBoost.type = 'peaking';
    bassBoost.frequency.value = 100;
    bassBoost.gain.value = 4.0; // Stronger for punchy EDM
    bassBoost.Q.value = 1.2;
    eqChain.push(bassBoost);
    
    // Low-mid boost for warmth (200-400Hz)
    const lowMidBoost = this.audioContext.createBiquadFilter();
    lowMidBoost.type = 'peaking';
    lowMidBoost.frequency.value = 250;
    lowMidBoost.gain.value = 3.0;
    lowMidBoost.Q.value = 1.0;
    eqChain.push(lowMidBoost);
    
    // Cut harsh frequencies (2-5kHz) that cause "siul-siul"
    const harshCut = this.audioContext.createBiquadFilter();
    harshCut.type = 'peaking';
    harshCut.frequency.value = 3500;
    harshCut.gain.value = -5.0; // More aggressive cut
    harshCut.Q.value = 2.0;
    eqChain.push(harshCut);
    
    // Cut more harsh frequencies (6-8kHz)
    const harshCut2 = this.audioContext.createBiquadFilter();
    harshCut2.type = 'peaking';
    harshCut2.frequency.value = 7000;
    harshCut2.gain.value = -4.0;
    harshCut2.Q.value = 1.5;
    eqChain.push(harshCut2);
    
    // High-shelf for air (above 10kHz) - lebih rendah
    const airBoost = this.audioContext.createBiquadFilter();
    airBoost.type = 'highshelf';
    airBoost.frequency.value = 10000;
    airBoost.gain.value = 0.0; // Remove high-frequency boost to avoid hiss
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

    // Real EDM effects - no more synthetic sounds
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
        // Real EDM riser - white noise with filter sweep
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const progress = t / duration;
          
          // White noise base
          const noise = (Math.random() * 2 - 1) * 0.3;
          
          // Filter sweep effect (low to high)
          const filterFreq = 200 + progress * 3000;
          const filterQ = 2.0;
          
          // Apply filter effect
          let filtered = noise;
          for (let j = 0; j < 4; j++) {
            const omega = 2 * Math.PI * filterFreq / sampleRate;
            const alpha = Math.sin(omega) / (2 * filterQ);
            const b0 = 1 + alpha;
            const b1 = -2 * Math.cos(omega);
            const b2 = 1 - alpha;
            const a0 = 1 + alpha;
            const a1 = -2 * Math.cos(omega);
            const a2 = 1 - alpha;
            
            filtered = (b0 * noise + b1 * noise + b2 * noise) / (a0 + a1 + a2);
          }
          
          // Fade in and stereo width
          const fadeIn = Math.min(1, t / 0.5);
          const fadeOut = Math.max(0, 1 - (t - (duration - 0.5)) / 0.5);
          const amplitude = 0.4 * fadeIn * fadeOut;
          
          leftChannel[i] = amplitude * filtered;
          rightChannel[i] = amplitude * filtered * 0.8;
        }
        break;
        
      case 'premium-drop':
        // Real EDM drop - kick drum with sub bass
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Kick drum
          const kickFreq = 60 * Math.exp(-t * 15);
          const kick = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-t * 8);
          
          // Sub bass
          const subFreq = 40;
          const sub = Math.sin(2 * Math.PI * subFreq * t) * Math.exp(-t * 3);
          
          // Hi-hat
          const hat = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 20);
          
          // Combine with proper mixing
          const combined = (kick * 0.6 + sub * 0.4 + hat * 0.2);
          const amplitude = 0.5 * Math.exp(-t * 2);
          
          leftChannel[i] = amplitude * combined;
          rightChannel[i] = amplitude * combined;
        }
        break;
        
      case 'premium-sweep':
        // Real EDM sweep - filtered noise with resonance
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          const progress = t / duration;
          
          // Noise base
          const noise = (Math.random() * 2 - 1) * 0.2;
          
          // Resonant filter sweep
          const centerFreq = 800 + progress * 2000;
          const resonance = 8.0;
          
          // Apply resonant filter
          let filtered = noise;
          const omega = 2 * Math.PI * centerFreq / sampleRate;
          const alpha = Math.sin(omega) / (2 * resonance);
          const b0 = alpha;
          const b1 = 0;
          const b2 = -alpha;
          const a0 = 1 + alpha;
          const a1 = -2 * Math.cos(omega);
          const a2 = 1 - alpha;
          
          filtered = (b0 * noise + b1 * noise + b2 * noise) / (a0 + a1 + a2);
          
          // Amplitude envelope
          const amplitude = 0.3 * Math.exp(-t * 1.5);
          
          leftChannel[i] = amplitude * filtered;
          rightChannel[i] = amplitude * filtered * 0.9;
        }
        break;
        
      case 'premium-punch':
        // Real EDM punch - heavy bass with sidechain
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Heavy bass
          const bassFreq = 45;
          const bass = Math.sin(2 * Math.PI * bassFreq * t) * Math.exp(-t * 2);
          
          // Mid bass
          const midFreq = 90;
          const mid = Math.sin(2 * Math.PI * midFreq * t) * Math.exp(-t * 3);
          
          // Sidechain effect (pumping)
          const pumpRate = 4; // 4 beats per second
          const pump = Math.sin(2 * Math.PI * pumpRate * t) * 0.3 + 0.7;
          
          // Combine with sidechain
          const combined = (bass * 0.7 + mid * 0.3) * pump;
          const amplitude = 0.6 * Math.exp(-t * 1.5);
          
          leftChannel[i] = amplitude * combined;
          rightChannel[i] = amplitude * combined;
        }
        break;
        
      case 'edm-kick':
        // Real EDM kick drum
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Kick drum with pitch envelope
          const pitchFreq = 80 * Math.exp(-t * 20);
          const kick = Math.sin(2 * Math.PI * pitchFreq * t) * Math.exp(-t * 10);
          
          // Add click at the beginning
          const click = (Math.random() * 2 - 1) * 0.2 * Math.exp(-t * 50);
          
          const combined = kick + click;
          const amplitude = 0.7 * Math.exp(-t * 1.5);
          
          leftChannel[i] = amplitude * combined;
          rightChannel[i] = amplitude * combined;
        }
        break;
        
      case 'edm-snare':
        // Real EDM snare drum
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Snare body
          const snareFreq = 200;
          const snare = Math.sin(2 * Math.PI * snareFreq * t) * Math.exp(-t * 8);
          
          // Snare noise
          const noise = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 15);
          
          const combined = snare + noise;
          const amplitude = 0.5 * Math.exp(-t * 2);
          
          leftChannel[i] = amplitude * combined;
          rightChannel[i] = amplitude * combined;
        }
        break;
        
      case 'edm-hihat':
        // Real EDM hi-hat
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Hi-hat noise
          const noise = (Math.random() * 2 - 1) * 0.2;
          
          // High-pass filter effect
          const filtered = noise * Math.exp(-t * 30);
          
          const amplitude = 0.4 * Math.exp(-t * 3);
          
          leftChannel[i] = amplitude * filtered;
          rightChannel[i] = amplitude * filtered * 0.9;
        }
        break;
        
      default:
        // Real EDM white noise
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          
          // Filtered white noise
          const noise = (Math.random() * 2 - 1) * 0.15;
          
          // Low-pass filter
          const cutoff = 2000;
          const filtered = noise * Math.exp(-t * 2);
          
          const amplitude = 0.2 * Math.exp(-t * 2);
          
          leftChannel[i] = amplitude * filtered;
          rightChannel[i] = amplitude * filtered * 0.85;
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