import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    if (confirm("Yakin ingin logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  // Class untuk link: Aktif vs Tidak Aktif
  const navLinkClass = ({ isActive }) => 
    `transition font-medium ${isActive ? 'text-brand-red font-bold' : 'text-gray-600 hover:text-brand-red'}`;

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-50">
      <NavLink to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-red p-2 rounded-lg text-white group-hover:rotate-12 transition">
          <Dumbbell size={24} />
        </div>
        <span className="text-2xl font-bold italic tracking-tighter text-gray-800">
          GYYYM<span className="text-brand-red">AI</span>
        </span>
      </NavLink>
      
      <div className="hidden md:flex gap-8 items-center">
        <NavLink to="/" className={navLinkClass}>Home</NavLink>
        <NavLink to="/create" className={navLinkClass}>Schedule</NavLink>
        
        {token ? (
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200 ml-4">
             <div className="flex items-center gap-2 text-gray-900 font-bold">
               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-brand-dark">
                 <User size={16} />
               </div>
               <span>{username}</span>
             </div>
             <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
             >
               <LogOut size={16}/> Logout
             </button>
          </div>
        ) : (
          <NavLink to="/login" className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition shadow-lg shadow-gray-200">
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}