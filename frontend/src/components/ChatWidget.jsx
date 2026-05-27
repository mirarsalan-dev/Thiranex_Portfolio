import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi! I'm the AI assistant for this portfolio. What would you like to know about their skills or experience?" }] }
  ]);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when a new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    const chatHistory = [...messages, userMessage];
    
    setMessages(chatHistory);
    setInput('');
    setIsLoading(true);

    try {
      // NEW: Filter out the hardcoded initial greeting before sending history
      const historyToSend = messages
        .filter((msg, index) => index !== 0) 
        .map(msg => ({ role: msg.role, parts: msg.parts }));

      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        history: historyToSend // Pass the cleaned history
      });

      setMessages([...chatHistory, { role: 'model', parts: [{ text: response.data.reply }] }]);
    } catch (error) {
      setMessages([...chatHistory, { role: 'model', parts: [{ text: "Sorry, my servers are a bit busy right now. Please try again later!" }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[450px]"
          >
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-sm">AI Recruiter Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-900">
              {messages.map((msg, idx) => (
                <div key={idx} className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white self-end rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 self-start rounded-bl-none border border-slate-700'
                }`}>
                  {msg.parts[0].text}
                </div>
              ))}
              {isLoading && (
                <div className="bg-slate-800 text-slate-400 self-start p-3 rounded-xl rounded-bl-none text-xs flex gap-1 animate-pulse">
                  <span>AI is typing</span><span>...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my skills..."
                className="flex-grow bg-slate-900 text-white placeholder:text-slate-500 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm border border-slate-800"
              />
              <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-500 transition disabled:opacity-50">
                &rarr;
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 ml-auto"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}