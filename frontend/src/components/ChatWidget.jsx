import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
    MessageCircle, X, Send, Bot, Zap, Info, Loader2, Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Import Library Markdown
import remarkGfm from 'remark-gfm';         // Import Support Tabel/List

// --- MODAL OTENTIKASI GAGAL (Sesi Habis) ---
const AuthRequiredModal = ({ onRedirect, onClose }) => (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <Lock size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h3>
            <p className="text-gray-600 mb-6">
                Sesi Anda telah habis. Silakan login kembali untuk melanjutkan chat.
            </p>
            <button 
                onClick={onRedirect}
                className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5"
            >
                GO TO LOGIN
            </button>
        </div>
    </div>
);
// --- END MODAL ---

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('info'); // 'info' or 'action'
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); 
  
  const [chatHistories, setChatHistories] = useState({
      info: [
          { 
              id: 1, 
              text: "Halo! Saya **GymAI Assistant**. Ada yang bisa saya bantu? 👋\n\nCoba tanya: _\"Cara mengecilkan perut?\"_", 
              sender: 'ai', 
              mode: 'info' 
          }
      ],
      action: [
          { 
              id: 2, 
              text: "Mode **Update Data**: Sampaikan perubahan data Anda (e.g., berat, tinggi, goal). ⚡️", 
              sender: 'ai', 
              mode: 'action' 
          }
      ]
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistories, mode, isOpen]);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    const currentMode = mode;
    setInput(''); 

    const userMsgObject = { id: Date.now(), text: userMessage, sender: 'user', mode: currentMode };
    setChatHistories(prev => ({
        ...prev,
        [currentMode]: [...prev[currentMode], userMsgObject]
    }));

    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        const response = await axios.post(
            'http://127.0.0.1:8000/api/v1/chat/',
            { message: userMessage, mode: currentMode },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const aiReplyObject = { id: Date.now() + 1, text: response.data.reply, sender: 'ai', mode: currentMode };
        setChatHistories(prev => ({
            ...prev,
            [currentMode]: [...prev[currentMode], aiReplyObject]
        }));

    } catch (error) {
        console.error("Chat Error:", error);
        const errorMsgObject = { id: Date.now() + 1, text: "Maaf, terjadi kesalahan koneksi. Coba lagi nanti.", sender: 'ai', isError: true, mode: currentMode };
        setChatHistories(prev => ({
            ...prev,
            [currentMode]: [...prev[currentMode], errorMsgObject]
        }));
    } finally {
        setLoading(false);
    }
  };

  if (!localStorage.getItem('token')) return null;

  return (
    <>
      {showAuthModal && (
          <AuthRequiredModal
              onRedirect={() => navigate('/login', { replace: true })}
              onClose={() => setShowAuthModal(false)}
          />
      )}

      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans ${showAuthModal ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {isOpen && (
          <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeInUp">
              
              {/* Header */}
              <div className="bg-gray-900 p-4 text-white">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                          <div className="bg-brand-red p-1.5 rounded-lg">
                              <Bot size={20} className="text-white" />
                          </div>
                          <div>
                              <h3 className="font-bold text-sm">GymAI Assistant</h3>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                              </p>
                          </div>
                      </div>
                      <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex bg-gray-800/50 p-1 rounded-lg">
                      <button 
                          onClick={() => { setMode('info'); setInput(''); }} 
                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                              mode === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'
                          }`}
                      >
                          <Info size={14} /> Tanya Coach
                      </button>
                      <button 
                          onClick={() => { setMode('action'); setInput(''); }} 
                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                              mode === 'action' ? 'bg-brand-red text-white shadow-sm' : 'text-gray-400 hover:text-white'
                          }`}
                      >
                          <Zap size={14} /> Update Data
                      </button>
                  </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                  {chatHistories[mode].map((msg) => (
                      <div 
                          key={msg.id} 
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                          <div 
                              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                  msg.sender === 'user' 
                                  ? 'bg-gray-900 text-white rounded-br-none' 
                                  : msg.isError 
                                      ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none'
                                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                              }`}
                          >
                              {/* RENDER MARKDOWN DISINI */}
                              <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Custom styling agar elemen markdown pas di chat bubble
                                    p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                                    ul: ({children}) => <ul className="list-disc list-inside ml-1 mb-1">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside ml-1 mb-1">{children}</ol>,
                                    li: ({children}) => <li className="">{children}</li>,
                                    strong: ({children}) => <span className="font-bold">{children}</span>,
                                    em: ({children}) => <span className="italic opacity-90">{children}</span>,
                                    a: ({children, href}) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-brand-blueSolid hover:text-blue-600">
                                            {children}
                                        </a>
                                    ),
                                    table: ({children}) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs border-collapse border border-gray-200">{children}</table></div>,
                                    th: ({children}) => <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-bold">{children}</th>,
                                    td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-2 italic my-1 text-gray-500">{children}</blockquote>
                                  }}
                              >
                                  {msg.text}
                              </ReactMarkdown>
                          </div>
                      </div>
                  ))}
                  
                  {loading && (
                      <div className="flex justify-start">
                          <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin text-brand-red" />
                              <span className="text-xs text-gray-400 italic">AI sedang mengetik...</span>
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                  <input 
                      ref={inputRef}
                      type="text" 
                      className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-blueSolid outline-none transition text-gray-800"
                      placeholder={mode === 'info' ? "Tanya seputar fitness..." : "Contoh: Update berat jadi 70kg..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                  />
                  <button 
                      type="submit" 
                      disabled={!input.trim() || loading}
                      className="bg-brand-red text-white p-2 rounded-xl hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Send size={18} />
                  </button>
              </form>
          </div>
        )}

        {/* Floating Button */}
        <button 
            onClick={() => setIsOpen(true)} 
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center bg-gradient-to-r from-brand-red to-red-600 animate-bounce ${isOpen ? 'hidden' : ''}`}
        >
            <MessageCircle size={32} className="text-white" />
        </button>
      </div>
    </>
  );
}