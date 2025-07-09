import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin?: () => void;
}

const ROBOT_IMG = '/image.png';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1123]">
      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(120deg, #1a1123 0%, #2e1a47 50%, #0ff 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 8s ease-in-out infinite'
        }}
      />
      {/* Particle layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-transparent rounded-2xl overflow-hidden shadow-2xl">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.img src="/logo.png" alt="Logo" className="w-24 mb-4" style={{filter:'drop-shadow(0 0 8px #fff)'}}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            />
            <motion.h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >Get Started</motion.h1>
            <motion.p className="text-lg text-gray-300 text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >Log in to create and remix music with AI-powered tools.</motion.p>
          </motion.div>
          <form className="space-y-6" onSubmit={e => {e.preventDefault();}}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-[#181028] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:shadow-[0_0_16px_#0ff8] transition-all duration-200"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 rounded-lg bg-[#181028] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:shadow-[0_0_16px_#0ff8] transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Show password"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye"><path d="M1 11s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="11" cy="11" r="3"/></svg>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-cyan-400 mr-2"
                />
                Remember me
              </label>
              <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-cyan-400 text-white font-bold text-lg shadow-lg hover:bg-cyan-300 transition-all relative overflow-hidden"
              onClick={e => { setLoading(true); setTimeout(() => { setLoading(false); onLogin?.(); }, 1200); }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-6 h-6" /> Loading...</span>
              ) : (
                <span className="relative z-10">Log in</span>
              )}
              <span className="absolute left-1/2 top-1/2 w-0 h-0 bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 group-active:w-32 group-active:h-32 transition-all duration-500" />
            </button>
            <button
              type="button"
              className="w-full py-3 rounded-lg border border-gray-600 text-white font-semibold flex items-center justify-center gap-2 bg-transparent hover:bg-gray-800 transition-all"
              onClick={() => { onLogin?.(); }}
            >
              <svg width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20.5-7.5 20.5-21 0-1.4-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.2 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.2 0-13.5 2.9-18.2 7.7z"/><path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.6-5.1l-6.7-5.5C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.5 42.1 15.1 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.7 7.5-11.7 7.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.2 2.6l6.2-6.2C36.7 5.1 30.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20.5-7.5 20.5-21 0-1.4-.1-2.7-.3-4z"/></g></svg>
              Sign up with Google
            </button>
          </form>
          <div className="mt-8 text-center text-gray-300">
            Don&apos;t have an account? <button className="text-cyan-400 hover:underline" onClick={() => alert('Sign up simulated!')}>Sign Up</button>
          </div>
        </div>
        {/* Right: Image */}
        <div className="flex-1 hidden md:flex items-center justify-center bg-[#181028]">
          <img src={ROBOT_IMG} alt="Robot Piano" className="w-full h-full object-cover rounded-2xl max-h-[600px]" style={{border:'2px solid #fff', boxShadow:'0 0 32px #0008'}} />
        </div>
      </div>
      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#181028] rounded-xl p-8 max-w-md w-full relative border border-cyan-500 shadow-2xl"
            >
              <button className="absolute top-2 right-2 text-cyan-400 text-2xl" onClick={() => setShowForgot(false)}>&times;</button>
              <div className="flex flex-col items-center mb-4">
                <div className="bg-cyan-500 rounded-full p-4 mb-2">
                  <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-lock"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Forget Password</h2>
                <p className="text-gray-300 text-center mb-4">Enter your email address to receive verification code</p>
              </div>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-[#1a1123] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
              <button
                className="w-full py-3 rounded-lg bg-cyan-400 text-white font-bold text-lg shadow-lg hover:bg-cyan-300 transition-all"
                onClick={() => { setForgotSent(true); setTimeout(() => setShowForgot(false), 1500); }}
              >
                Send Code
              </button>
              {forgotSent && <div className="text-green-400 text-center mt-4">Verification code sent!</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthScreen; 