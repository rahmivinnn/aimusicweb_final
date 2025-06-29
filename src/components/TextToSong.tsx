import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const TextToSong: React.FC = () => {
  const { addTrack } = useStore();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('EDM');
  const [mood, setMood] = useState('Energetic');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
    setProgress(0);

    try {
      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(interval);
      setProgress(100);

          // Add a sample track to the store
      const newTrack = {
        id: uuidv4(),
        name: `${genre} Track - ${new Date().toLocaleTimeString()}`,
        inputUrl: 'https://example.com/sample.mp3',
        outputUrl: 'https://example.com/sample.mp3',
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
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={handleGenerateTrack}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all
              bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
              transform hover:scale-105 flex items-center justify-center gap-2
              ${isLoading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}
              ${!isLoading ? 'hover:scale-105' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{prompt.trim() ? 'Generate Track' : 'Enter a description to begin'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToSong;