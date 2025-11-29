import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Tambah state loading
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
      // Tampilkan pesan error spesifik dari Backend
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center mt-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Join GymAI</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blueSolid outline-none"
                value={username} onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blueSolid outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blueSolid outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'REGISTER'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Sudah punya akun? <Link to="/login" className="text-brand-blueSolid font-bold hover:underline">Login disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}