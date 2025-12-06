import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import Navbar from '../components/Navbar';
import { LogIn, AtSign, Lock, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react'; 


// --- MODAL KEGAGALAN LOGIN (NEW) ---
const LoginFailureModal = ({ onTryAgain }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            
            <button 
                onClick={onTryAgain} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"
                title="Close"
            >
                <X size={24} />
            </button>
            
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h3>
            <p className="text-gray-600 mb-6">
                Email atau Password salah. Silakan coba periksa kembali.
            </p>
            
            <button 
                onClick={onTryAgain}
                className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5"
            >
                TRY AGAIN
            </button>
        </div>
    </div>
);


// --- MODAL KEBERHASILAN REDIRECT (Dari sebelumnya) ---
const LoginRedirectModal = () => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs text-center border-2 border-green-200 ring-4 ring-green-500/20 transform scale-105">
            
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4 animate-pulse" strokeWidth={2}/>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h3>
            <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
                 <Loader2 size={16} className="animate-spin text-brand-red"/> 
                 Checking your plan...
            </p>
        </div>
    </div>
);


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false); // NEW STATE for Failure Modal
  const navigate = useNavigate();

  // --- LOGIC SMART REDIRECT (Success) ---
  useEffect(() => {
    if (showRedirectModal) {
        const checkAndRedirect = async () => {
            const token = localStorage.getItem('token');
            
            try {
                await api.get(`/schedules/my-schedule`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setTimeout(() => navigate('/result', { replace: true }), 1200); 
            } catch (error) {
                if (error.response?.status === 404) {
                    setTimeout(() => navigate('/create', { replace: true }), 1200);
                } else {
                    setTimeout(() => navigate('/', { replace: true }), 1200); 
                }
            }
        };
        checkAndRedirect();
    }
  }, [showRedirectModal, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Pastikan modal gagal ditutup jika user mencoba login lagi
    setShowFailureModal(false); 
    
    try {
      const res = await api.post(`/login`, { email, password });
      
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.username);
      
      // Sukses: Tampilkan modal redirect
      setShowRedirectModal(true); 

    } catch (error) {
      console.error(error);
      // GAGAL: Tampilkan modal kegagalan
      setShowFailureModal(true); 

    } finally {
      setLoading(false);
    }
  };

  // Jika salah satu modal aktif, render modal itu
  if (showRedirectModal) {
    return <LoginRedirectModal />;
  }
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-space flex flex-col pt-32"> 
      <Navbar />
      
      {/* RENDER MODAL KEGAGALAN JIKA ADA */}
      {showFailureModal && <LoginFailureModal onTryAgain={() => setShowFailureModal(false)} />}

      <div className={`flex flex-1 justify-center items-center px-4 mb-20 transition-opacity ${showFailureModal ? 'opacity-30 pointer-events-none' : ''}`}> 
        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md border border-gray-200 ring-1 ring-gray-200/50">
          <div className="text-center mb-6">
            <LogIn size={40} className="text-brand-red mx-auto mb-2" strokeWidth={2.5}/>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to access your AI schedule.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><AtSign size={16}/> Email</label>
              <input 
                type="email" 
                required
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition" 
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Lock size={16}/> Password</label>
              <input 
                type="password" 
                required
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition" 
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging In...' : <><LogIn size={20}/> LOGIN</>}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Belum punya akun? <Link to="/register" className="text-brand-red font-bold hover:underline">Daftar disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}