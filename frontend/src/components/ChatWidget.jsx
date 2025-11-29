import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
    MessageCircle, X, Send, Bot, User, Zap, Info, Loader2, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('info'); // 'info' or 'action'
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
        id: 1, 
        text: "Halo! Saya GymAI Assistant. Ada yang bisa saya bantu? 👋", 
        sender: 'ai', 
        mode: 'info' 
    }
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll ke pesan terakhir
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Focus input saat dibuka
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
    setInput(''); // Clear input segera agar UI responsif

    // 1. Tambahkan pesan user ke UI
    setMessages(prev => [
        ...prev, 
        { id: Date.now(), text: userMessage, sender: 'user', mode: currentMode }
    ]);

    setLoading(true);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Sesi habis. Silakan login kembali.");
            navigate('/login');
            return;
        }

        // 2. Kirim ke Backend
        const response = await axios.post(
            'http://127.0.0.1:8000/api/v1/chat/',
            { message: userMessage, mode: currentMode },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // 3. Tambahkan balasan AI ke UI
        setMessages(prev => [
            ...prev, 
            { id: Date.now() + 1, text: response.data.reply, sender: 'ai', mode: currentMode }
        ]);

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [
            ...prev, 
            { id: Date.now() + 1, text: "Maaf, terjadi kesalahan koneksi. Coba lagi nanti.", sender: 'ai', isError: true }
        ]);
    } finally {
        setLoading(false);
    }
  };

  // Render Component
  if (!localStorage.getItem('token')) return null; // Sembunyikan jika belum login

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* --- CHAT WINDOW --- */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeInUp">
            
            {/* Header & Toggle */}
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
                        onClick={() => setMode('info')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                            mode === 'info' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Info size={14} /> Tanya Coach
                    </button>
                    <button 
                        onClick={() => setMode('action')}
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
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.sender === 'user' 
                                ? 'bg-gray-900 text-white rounded-br-none' 
                                : msg.isError 
                                    ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none'
                                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                            }`}
                        >
                            {msg.text}
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
                    className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-blueSolid outline-none transition"
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

      {/* --- FLOATING BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isOpen ? 'bg-gray-900 rotate-90' : 'bg-gradient-to-r from-brand-red to-red-600 animate-bounce-slow'
        }`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageCircle size={32} className="text-white" />}
      </button>
    </div>
  );
}
