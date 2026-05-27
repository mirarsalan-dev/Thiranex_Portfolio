import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { motion } from 'framer-motion';

function Admin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: '',
    technologies: '',
    content: ''
  });

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Encrypting and uploading project...' });

    try {
      const token = await auth.currentUser.getIdToken();
      const techArray = formData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const projectPayload = { ...formData, technologies: techArray };

      await axios.post('http://localhost:5000/api/projects', projectPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus({ type: 'success', message: 'Project deployed successfully! 🚀' });
      setFormData({ title: '', description: '', githubLink: '', technologies: '', content: '' });
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ type: 'error', message: 'Failed to publish. Connection refused.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    }
  };

  // Animation configurations
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
              Command Center
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Secure Session: {auth.currentUser?.email}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="group relative px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 text-sm font-bold text-slate-300 group-hover:text-red-400 transition-colors">
              Terminate Session
            </span>
          </button>
        </motion.header>

        {/* Status Alerts */}
        {status.message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl mb-8 border backdrop-blur-md font-medium text-sm flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {status.type === 'info' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            {status.message}
          </motion.div>
        )}

        {/* Main Form UI */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10"
        >
          <div className="mb-8 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white">Deploy New Project</h2>
            <p className="text-sm text-slate-400 mt-1">Fill out the details below to push a new case study to the grid.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVars}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                  placeholder="e.g., Next-Gen Analytics"
                />
              </motion.div>

              <motion.div variants={itemVars}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">GitHub Repository</label>
                <input 
                  type="url" 
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleChange}
                  required
                  className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                  placeholder="https://github.com/..."
                />
              </motion.div>
            </div>

            <motion.div variants={itemVars}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tech Stack (Comma Separated)</label>
              <input 
                type="text" 
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="React, Node.js, Firebase, Framer Motion"
              />
            </motion.div>

            <motion.div variants={itemVars}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Short Summary</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="2"
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-600 font-medium"
                placeholder="A brief punchy description for the project card..."
              />
            </motion.div>

            <motion.div variants={itemVars}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Full Case Study</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">Markdown Supported</span>
              </label>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="8"
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed placeholder:text-slate-700"
                placeholder="## The Challenge&#10;Describe the architecture and problems solved here..."
              />
            </motion.div>

            <motion.button 
              variants={itemVars}
              type="submit" 
              disabled={isSubmitting}
              className={`mt-6 w-full relative overflow-hidden font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg ${
                isSubmitting 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 border border-blue-500/50'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
                  Deploying to Database...
                </span>
              ) : (
                'Publish Project'
              )}
            </motion.button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

export default Admin;