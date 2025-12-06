import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import Navbar from '../components/Navbar';
import { UserPlus, AtSign, Lock, User as UserIcon, CheckCircle2, AlertTriangle, X } from 'lucide-react'; 


// --- MODAL KEGAGALAN (REUSABLE STRUCTURE) ---
const FailureModal = ({ title, message, onClose }) => (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition transform hover:-translate-y-0.5"
            >
                TRY AGAIN
            </button>
        </div>
    </div>
);
// --- MODAL KEBERHASILAN (Success) ---
const RegisterSuccessModal = () => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xs text-center border-2 border-green-200 ring-4 ring-green-500/20 transform scale-105">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4 animate-pulse" strokeWidth={2}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Success!</h3>
            <p className="text-gray-600">Redirecting to login page...</p>
        </div>
    </div>
);


export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' }); // NEW STATE
  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorModal({ show: false, title: '', message: '' }); // Reset error
    
    try {
      await api.post(`/register`, { username, email, password });
      
      setShowSuccessModal(true); 

    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      
      // Ganti alert() dengan Modal
      setErrorModal({
          show: true,
          title: "Registration Failed",
          message: detail || "Gagal terhubung ke server Backend. Coba lagi."
      });

    } finally {
      setLoading(false);
    }
  };
  
  if (showSuccessModal) {
      return <RegisterSuccessModal />;
  }
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-space flex flex-col pt-32"> 
      <Navbar />
      
      {/* RENDER MODAL KEGAGALAN JIKA ADA */}
      {errorModal.show && (
          <FailureModal
              title={errorModal.title}
              message={errorModal.message}
              onClose={() => setErrorModal({ show: false, title: '', message: '' })}
          />
      )}

      <div className={`flex flex-1 justify-center items-center px-4 mb-20 ${errorModal.show ? 'opacity-30 pointer-events-none' : ''}`}>
        {/* Konten Form */}
        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md border border-gray-200 ring-1 ring-gray-200/50">
          <div className="text-center mb-6">
            <UserPlus size={40} className="text-brand-red mx-auto mb-2" strokeWidth={2.5}/>
            <h2 className="text-3xl font-bold text-gray-900">Join GymAI</h2>
            <p className="text-gray-500 text-sm mt-1">Create your account and start generating plans.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><UserIcon size={16}/> Username</label>
              <input 
                type="text" required
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><AtSign size={16}/> Email</label>
              <input 
                type="email" required
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Lock size={16}/> Password</label>
              <input 
                type="password" required
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : <><UserPlus size={20}/> REGISTER</>}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Sudah punya akun? <Link to="/login" className="text-gray-900 font-bold hover:underline">Login disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}