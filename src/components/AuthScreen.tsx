import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, ShieldCheck, Mail, Lock, User } from 'lucide-react';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, firstName, password);
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Check your database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500 text-black mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <Terminal size={32} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">LINUX HERO</h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">Engineering Path v7.8</p>
        </div>

        <div className="bg-[#0d1117] border border-gray-800 rounded-[32px] p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {isLogin ? 'Mission Authentication' : 'Create New Identity'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center gap-3">
              <ShieldCheck size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray-600" size={18} />
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-green-500 transition-all"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type="email"
                placeholder="Terminal Email"
                required
                className="w-full pl-12 pr-4 py-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-green-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type="password"
                placeholder="Access Password"
                required
                className="w-full pl-12 pr-4 py-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-green-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'SYNCING...' : isLogin ? 'INITIALIZE LOGIN' : 'RECRUIT ENGINEER'}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-6 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? 'Need a new identity? Register' : 'Existing Hero? Secure Login'}
          </button>
        </div>
      </div>
    </div>
  );
};