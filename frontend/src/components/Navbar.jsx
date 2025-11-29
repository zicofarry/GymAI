import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    if (confirm("Logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  const navLinkClass = ({ isActive }) => 
    `relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
      isActive 
        ? 'bg-white text-gray-900 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] ring-1 ring-black/5' 
        : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
    }`;

  return (
    <div className="fixed top-8 w-full flex justify-center z-50 px-6">
      {/* IMPROVED: Backdrop blur lebih kuat, shadow lebih soft, border lebih crisp */}
      <nav className="flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full ring-1 ring-white/50">
        
        {/* Logo Section */}
        <NavLink to="/" className="flex items-center gap-2 pl-2 pr-4 group mr-1">
          <div className="bg-gradient-to-br from-brand-red to-red-600 p-1.5 rounded-full text-white group-hover:rotate-12 transition-transform shadow-lg shadow-red-500/30">
            <Dumbbell size={16} fill="currentColor" />
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900 font-space">
            GYM<span className="text-brand-red">AI</span>
          </span>
        </NavLink>

        <div className="h-6 w-px bg-gray-300/50 mx-1"></div>

        {/* --- BAGIAN LINK (UPDATED) --- */}
        <div className="flex items-center gap-1 p-1">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          
          {/* Menu My Plan: Hanya muncul kalau sudah login */}
          {token && (
            <NavLink to="/result" className={navLinkClass}>My Plan</NavLink>
          )}
          
          {/* Menu Create: Ganti nama jadi 'New Plan' kalau sudah login */}
          <NavLink to="/create" className={navLinkClass}>
            {token ? 'New Plan' : 'Schedule'}
          </NavLink>
        </div>

        {/* Auth Section */}
        <div className="pl-3">
          {token ? (
            <div className="flex items-center gap-2 bg-white/80 rounded-full pl-1 pr-1 py-1 border border-white shadow-sm">
               <div className="flex items-center gap-2 px-3">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="text-xs font-bold text-gray-700 max-w-[80px] truncate">{username}</span>
               </div>
               <button 
                onClick={handleLogout} 
                className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110"
               >
                 <LogOut size={14}/>
               </button>
            </div>
          ) : (
            <NavLink to="/login" className="bg-gray-900 text-white text-xs px-5 py-2.5 rounded-full font-bold hover:bg-black transition-all hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 ml-2">
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}