import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { UserPlus, AtSign, Lock, User as UserIcon } from 'lucide-react'; // Ikon baru

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/register', { username, email, password });
      alert("Registrasi Berhasil! Silakan Login.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        alert(`Gagal Register: ${error.response.data.detail}`);
      } else {
        alert("Gagal Register: Tidak dapat terhubung ke server Backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-space flex flex-col pt-32"> 
      <Navbar />
      <div className="flex flex-1 justify-center items-center px-4 mb-20">
        {/* Hapus shadow-2xl, ganti dengan shadow-md yang sangat halus */}
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