import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Lock, Mail, User, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live Password Validation Checks
  const passwordReqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordReqs).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prevent registration if password is weak
    if (!isLogin && !isPasswordValid) {
      setError('Please ensure your password meets all security requirements.');
      return;
    }

    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, firstName, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save the secure token to the browser
      localStorage.setItem('token', data.token);
      
      // Tell App.tsx to let the user in
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for the checklist
  const Requirement = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-xs font-bold ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-500/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-[#0d1117]/80 backdrop-blur-xl border border-gray-800 rounded-3xl z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
            <TerminalIcon className="text-green-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Linux Hero Academy</h2>
        </div>

        {/* Clear Tab System for Login vs Register */}
        <div className="flex p-1 bg-black/50 border border-gray-800 rounded-xl mb-8">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="First Name" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 text-white px-12 py-4 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 text-white px-12 py-4 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 text-white pl-12 pr-14 py-4 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
            {/* Show/Hide Password Toggle */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Live Password Checklist (Only shows during Registration) */}
          <AnimatePresence>
            {!isLogin && password.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-black/40 border border-gray-800 rounded-xl space-y-2 mt-2"
              >
                <Requirement met={passwordReqs.length} text="At least 8 characters" />
                <Requirement met={passwordReqs.upper} text="Contains an uppercase letter" />
                <Requirement met={passwordReqs.number} text="Contains a number" />
                <Requirement met={passwordReqs.special} text="Contains a special character (!@#$)" />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={isLoading || (!isLogin && !isPasswordValid)}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-green-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Authenticating...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}