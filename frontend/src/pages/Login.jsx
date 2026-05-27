import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); 
    } catch (err) {
      setError('Access Denied. Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans relative overflow-hidden px-4">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-medium z-20">
        &larr; Back to Grid
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="bg-white/[0.02] backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Gateway</h1>
          <p className="text-sm text-slate-400 mt-2">Identify yourself to access the command center.</p>
        </div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium"
          >
            {error}
          </motion.p>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passphrase</label>
            <input 
              type="password" 
              required
              className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`mt-4 w-full relative overflow-hidden font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg ${
              isSubmitting 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 border border-blue-500/50'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : (
              'Initialize Session'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;