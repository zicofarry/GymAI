import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/login', { email, password });
      
      // Simpan Token di LocalStorage
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.username);
      
      alert("Login Berhasil!");
      navigate('/create'); // Arahkan ke halaman Create Schedule
    } catch (error) {
      alert("Email atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center mt-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back!</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blueSolid outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-blueSolid outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button type="submit" className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-black transition">
              LOGIN
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Belum punya akun? <Link to="/register" className="text-brand-blueSolid font-bold hover:underline">Daftar disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}