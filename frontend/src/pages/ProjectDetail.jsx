import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
        <h2 className="text-2xl font-bold mb-4">Project not found (404)</h2>
        <Link to="/" className="text-blue-400 hover:underline">Return to Portfolio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6 font-sans relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 font-medium transition-colors">
          &larr; Back to Portfolio
        </Link>
        
        <header className="mb-12 border-b border-white/10 pb-10">
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech, idx) => (
                <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {tech}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {project.title}
          </h1>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-2xl">
            {project.description}
          </p>
          
          <div className="flex gap-4">
            <a 
              href={project.githubLink} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
            >
              View Repository
            </a>
          </div>
        </header>

        {/* prose-invert is the magic class here! 
          It tells Tailwind Typography to color headings white and text light gray.
        */}
        <article className="prose prose-invert prose-lg max-w-none bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <ReactMarkdown>
            {project.content || "No detailed case study provided for this project yet."}
          </ReactMarkdown>
        </article>
      </motion.div>
    </div>
  );
}

export default ProjectDetail;