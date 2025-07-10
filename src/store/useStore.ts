import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  plan: 'free' | 'premium';
  avatar?: string;
  settings: {
    notifications: boolean;
    autoPlay: boolean;
    quality: 'standard' | 'high' | 'ultra';
    theme: 'dark' | 'light';
    language: 'en' | 'id';
  };
}

interface Track {
  id: string;
  name: string;
  inputUrl: string;
  outputUrl?: string;
  prompt: string;
  genre: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  duration?: number;
  bpm?: number;
  style?: string;
  userId: string;
  userName: string;
  isPublic: boolean;
  likes: number;
  downloads: number;
  albumArt?: string;
}

interface AppState {
  user: User | null;
  tracks: Track[];
  publicTracks: Track[];
  currentTrack: Track | null;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  currentlyPlaying: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  addTrack: (track: Track) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  setCurrentTrack: (track: Track | null) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentlyPlaying: (trackId: string | null) => void;
  useCredit: () => void;
  updateUserSettings: (settings: Partial<User['settings']>) => void;
  likeTrack: (trackId: string) => void;
  downloadTrack: (trackId: string) => void;
  subscribe: () => void;
  removeTrack: (trackId: string) => void;
}

// Ganti edmFiles dan premiumAlbumArts dengan file dari public/new
const newEdmFiles = [
  '/new/edm-140530.mp3',
  '/new/bar-heights-edm-music-230648.mp3',
  '/new/edm-dance-club-music-259530.mp3',
  '/new/the-streets-of-tokyo-1-min-edit-japanese-style-edm-370224.mp3',
  '/new/quirky-edm-with-toy-sounds-silly-vocal-chops-371342.mp3',
  '/new/edm-club-music-265781.mp3'
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const shuffledEdmFiles = shuffleArray(newEdmFiles);

const premiumAlbumArts = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80'
];

const sampleTracks: Track[] = shuffledEdmFiles.map((url, i) => ({
  id: (i + 1).toString(),
  name: `EDM Remix #${i + 1}`,
  inputUrl: '',
  outputUrl: url,
  prompt: 'EDM AI Remix',
  genre: 'EDM',
  status: 'completed',
  createdAt: new Date(Date.now() - (i * 86400000)),
  duration: 180,
  bpm: 120 + (i % 5) * 2,
  style: 'EDM',
  userId: '1',
  userName: 'Demo User',
  isPublic: true,
  likes: 0,
  downloads: 0,
  albumArt: premiumAlbumArts[i % premiumAlbumArts.length]
}));

export const useStore = create(
  persist<AppState>(
    (set, get) => ({
      user: {
        id: '1',
        email: 'demo@aimusicweb.com',
        name: 'Demo User',
        credits: 8,
        plan: 'free',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        settings: {
          notifications: true,
          autoPlay: false,
          quality: 'high',
          theme: 'dark',
          language: 'en'
        }
      },
      tracks: sampleTracks,
      publicTracks: sampleTracks,
      currentTrack: null,
      isLoading: false,
      sidebarCollapsed: false,
      currentlyPlaying: null,
      
      setUser: (user) => set({ user }),
      addTrack: (track) => set((state) => ({ 
        tracks: [track, ...state.tracks],
        publicTracks: track.isPublic ? [track, ...state.publicTracks] : state.publicTracks
      })),
      updateTrack: (id, updates) => set((state) => ({
        tracks: state.tracks.map(track => 
          track.id === id ? { ...track, ...updates } : track
        ),
        publicTracks: state.publicTracks.map(track => 
          track.id === id ? { ...track, ...updates } : track
        )
      })),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setLoading: (loading) => set({ isLoading: loading }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCurrentlyPlaying: (trackId) => set({ currentlyPlaying: trackId }),
      useCredit: () => set((state) => ({
        user: state.user ? { ...state.user, credits: Math.max(0, state.user.credits - 1) } : null
      })),
      updateUserSettings: (settings) => set((state) => ({
        user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null
      })),
      likeTrack: (trackId) => set((state) => ({
        publicTracks: state.publicTracks.map(track =>
          track.id === trackId ? { ...track, likes: track.likes + 1 } : track
        )
      })),
      downloadTrack: (trackId) => set((state) => ({
        publicTracks: state.publicTracks.map(track =>
          track.id === trackId ? { ...track, downloads: track.downloads + 1 } : track
        )
      })),
      subscribe: () => {
        alert('Thank you for subscribing! (This is a demo action)');
      },
      removeTrack: (trackId) => set((state) => ({
        tracks: state.tracks.filter(track => track.id !== trackId),
        publicTracks: state.publicTracks.filter(track => track.id !== trackId)
      })),
    }),
    {
      name: 'aimusicweb-store',
      merge: (persistedState, currentState) => {
        // Convert createdAt string to Date for tracks and publicTracks
        const fixDates = (tracks: any[] = []) =>
          Array.isArray(tracks)
            ? tracks.map(track => ({
                ...track,
                createdAt: track.createdAt ? new Date(track.createdAt) : new Date()
              }))
            : [];
        // Ensure both are objects
        const safePersisted = typeof persistedState === 'object' && persistedState !== null ? persistedState as Partial<AppState> : {};
        const safeCurrent = typeof currentState === 'object' && currentState !== null ? currentState as AppState : {} as AppState;
        const state: AppState = {
          ...safeCurrent,
          ...safePersisted,
        };
        if (Array.isArray(state.tracks)) state.tracks = fixDates(state.tracks);
        if (Array.isArray(state.publicTracks)) state.publicTracks = fixDates(state.publicTracks);
        return state;
      }
    }
  )
);