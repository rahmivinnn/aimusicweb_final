import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GenreSelectorProps {
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenres, onGenreToggle }) => {
  const genres = [
    { name: 'Classic', color: 'from-amber-500 to-orange-500' },
    { name: 'Sad', color: 'from-blue-500 to-indigo-500' },
    { name: 'Rock', color: 'from-red-500 to-pink-500' },
    { name: 'Hiphop', color: 'from-purple-500 to-violet-500' },
    { name: 'Guitar music', color: 'from-green-500 to-emerald-500' },
    { name: 'High music', color: 'from-cyan-500 to-teal-500' },
    { name: 'Pop', color: 'from-pink-500 to-rose-500' },
    { name: 'EDM', color: 'from-cyan-400 to-blue-500' },
    { name: 'Jazz', color: 'from-yellow-500 to-amber-500' },
    { name: 'Blues', color: 'from-indigo-500 to-blue-600' },
    { name: 'Country', color: 'from-orange-500 to-red-500' },
    { name: 'Reggae', color: 'from-green-400 to-lime-500' },
    { name: 'Folk', color: 'from-brown-500 to-amber-600' },
    { name: 'Electronic', color: 'from-purple-400 to-pink-500' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        <h4 className="text-white font-medium">Popular Genres</h4>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {genres.map((genre, index) => {
          const isSelected = selectedGenres.includes(genre.name);
          
          return (
            <motion.button
              key={genre.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGenreToggle(genre.name)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 overflow-hidden
                ${isSelected 
                  ? 'text-white shadow-lg transform scale-105' 
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white border border-dark-600 hover:border-dark-500'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedGenre"
                  className={`absolute inset-0 bg-gradient-to-r ${genre.color}`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{genre.name}</span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-white/20 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreSelector;