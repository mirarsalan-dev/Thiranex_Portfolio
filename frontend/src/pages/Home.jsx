import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget'; // <-- NEW: Importing the Bot

function Home() {
  const [projects, setProjects] = useState([]);
  const [githubStats, setGithubStats] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingGithub, setLoadingGithub] = useState(true);
  const [selectedTech, setSelectedTech] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchGithubStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/github-stats');
        setGithubStats(response.data);
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
      } finally {
        setLoadingGithub(false);
      }
    };

    fetchProjects();
    fetchGithubStats();
  }, []);

  const allTechnologies = ['All', ...new Set(projects.flatMap(p => p.technologies || []))];
  const filteredProjects = selectedTech === 'All' 
    ? projects 
    : projects.filter(p => p.technologies && p.technologies.includes(selectedTech));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-blue-200 relative">
      
      {/* PREMIUM HERO SECTION */}
      <header className="relative bg-slate-950 text-white py-24 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-500/10 blur-[100px] pointer-events-none rounded-full"></div>
        
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left z-10"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 text-transparent bg-clip-text">
                Full-Stack
              </span>
              <br /> Developer.
            </h1>
            <p className="text-xl text-slate-400 font-light max-w-lg mt-6 leading-relaxed">
              Building scalable web applications with React, Node.js, and a relentless focus on user experience.
            </p>

            {/* NEW: Dynamic PDF Download Button */}
            <div className="mt-8 flex justify-center md:justify-start">
              <a 
                href="http://localhost:5000/api/download-resume" 
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-blue-600 border border-white/20 hover:border-blue-500 rounded-xl font-bold text-white transition-all duration-300 shadow-lg overflow-hidden"
              >
                {/* PDF Icon */}
                <svg className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download Resume (PDF)
              </a>
            </div>
          </motion.div>

          {/* GitHub Glassmorphism Card */}
          {!loadingGithub && githubStats ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4 hover:border-white/20 transition-colors z-10"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={githubStats.avatarUrl} 
                  alt={githubStats.name} 
                  className="w-16 h-16 rounded-full border-2 border-blue-500/50 shadow-lg"
                />
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{githubStats.name || 'GitHub'}</h3>
                  <p className="text-xs text-blue-300 font-medium tracking-wide uppercase mt-1">Live Activity</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 line-clamp-2">{githubStats.bio}</p>
              
              <div className="grid grid-cols-3 gap-2 text-center bg-black/20 p-3 rounded-xl border border-white/5 mt-2">
                <div>
                  <div className="text-lg font-bold text-white">{githubStats.publicRepos}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Repos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{githubStats.followers}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Followers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{githubStats.following}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Following</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm h-48 animate-pulse flex items-center justify-center text-slate-500 z-10">
              Fetching live stats...
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto py-20 px-6">
        
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Selected Works</h2>
          
          {!loadingProjects && projects.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              {allTechnologies.map(tech => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(tech)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedTech === tech
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Grid */}
        {loadingProjects ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <motion.div 
                  variants={itemVariants}
                  key={project.id} 
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col flex-grow"
                >
                  <div className="p-8 flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.technologies.map((tech, index) => (
                          <span 
                            key={index} 
                            className="bg-slate-50 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-5 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                    <Link 
                      to={`/project/${project.id}`}
                      className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                    >
                      Read Case Study 
                      <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                    </Link>
                    
                    <a 
                      href={project.githubLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-700 transition-colors font-medium text-sm"
                    >
                      Source Code
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
                <p className="text-lg text-slate-500 font-medium">No projects match the selected filter.</p>
                <button 
                  onClick={() => setSelectedTech('All')}
                  className="mt-4 text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="py-8 text-center border-t border-slate-200 mt-12 bg-white">
        <p className="text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} My Portfolio. Built with React & Node.
          <span className="mx-2">|</span>
          <Link to="/login" className="text-white hover:text-slate-300 transition-colors cursor-default">
            π
          </Link>
        </p>
      </footer>

      {/* NEW: The AI Floating Widget */}
      <ChatWidget />
      
    </div>
  );
}

export default Home;