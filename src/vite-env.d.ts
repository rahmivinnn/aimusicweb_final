/// <reference types="vite/client" />

declare module 'music-beat-detector' {
  interface BeatDetectionResult {
    tempo: number;
    beats: number[];
  }
  
  function detectBeats(audioBlob: Blob): Promise<BeatDetectionResult>;
  export = detectBeats;
}
