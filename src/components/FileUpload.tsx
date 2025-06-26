import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, Plus, X, FileAudio, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, className = '' }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error('Please upload a valid audio file (MP3, WAV, FLAC, M4A, OGG)');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFiles(prev => [...prev, file]);
      onFileUpload(file);
      toast.success(`${file.name} uploaded successfully!`);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden
          ${isDragActive 
            ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/25' 
            : 'border-dark-600 hover:border-cyan-500 hover:bg-dark-800/50'
          }
        `}
      >
        {/* Background Animation */}
        <motion.div
          animate={{
            background: isDragActive 
              ? 'radial-gradient(circle at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(34, 211, 238, 0.05) 0%, transparent 70%)'
          }}
          className="absolute inset-0"
        />

        <input {...getInputProps()} />
        
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <motion.div 
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0
            }}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${isDragActive 
                ? 'bg-cyan-400/20 shadow-lg shadow-cyan-500/25' 
                : 'bg-dark-700 hover:bg-dark-600'
              }
            `}
          >
            <Upload className={`w-10 h-10 ${isDragActive ? 'text-cyan-400' : 'text-dark-400'}`} />
          </motion.div>
          
          <div>
            <motion.p 
              animate={{ color: isDragActive ? '#22d3ee' : '#ffffff' }}
              className="text-xl font-semibold mb-2"
            >
              {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
            </motion.p>
            <p className="text-dark-400 mb-4">
              Supports MP3, WAV, FLAC, M4A, OGG, AAC (Max 10MB)
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Browse Files</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="text-white font-medium flex items-center space-x-2">
              <FileAudio className="w-5 h-5 text-cyan-400" />
              <span>Uploaded Files</span>
            </h4>
            
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-dark-400 text-sm">
                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(index)}
                    className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;