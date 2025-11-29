import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LogOut, X } from 'lucide-react';

// --- LOGOUT MODAL COMPONENT (REVISED) ---
const LogoutModal = ({ onConfirm, onCancel, username }) => (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-2 border-gray-200 ring-1 ring-gray-100 transform scale-105">
            
            {/* Close Button */}
            <button 
                onClick={onCancel} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"
                title="Close"
            >
                <X size={24} />
            </button>
            
            {/* ICON FIX: Menggunakan LogOut dan Brand Red */}
            <LogOut size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Log Out?</h3>
            
            {/* FIX ASTERISKS: Menggunakan <strong> untuk styling */}
            <p className="text-gray-600 mb-6">
                Yakin ingin keluar, <strong className="font-bold text-gray-900">{username}</strong>? Anda harus login lagi untuk mengakses jadwal.
            </p>
            
            <div className="flex gap-3">
                {/* CANCEL BUTTON FIX: Flat & Bordered */}
                <button 
                    onClick={onCancel}
                    className="flex-1 text-gray-600 py-3 rounded-xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="flex-1 bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <LogOut size={20}/> Log Out
                </button>
            </div>
        </div>
    </div>
);
// ------------------------------------


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // FUNGSI LOGOUT SEBENARNYA
  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setShowLogoutModal(false);
    navigate('/login');
  };

  // Logic untuk mengecek apakah path saat ini adalah bagian dari flow Schedule
  const isSchedulePath = location.pathname.startsWith('/schedule') ||
                         location.pathname.startsWith('/create') ||
                         location.pathname.startsWith('/result');

  // Fungsi yang menghitung class berdasarkan status aktif atau path manual
  const navLinkClass = (linkPath) => {
    const isActive = linkPath === location.pathname;
    const isScheduleActive = linkPath === '/schedule' && isSchedulePath;

    return `relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out ${
      isActive || isScheduleActive
        ? 'bg-white text-gray-900 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] ring-1 ring-black/5' 
        : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
    }`;
  };

  return (
    <>
      {/* Render Modal jika state aktif */}
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={executeLogout}
          onCancel={() => setShowLogoutModal(false)}
          username={username}
        />
      )}

      {/* Opacity 30 dan disable pointer events jika modal aktif */}
      <div 
        className={`fixed top-8 w-full flex justify-center z-50 px-6 transition-opacity ${showLogoutModal ? 'opacity-30 pointer-events-none' : ''}`}
      >
        <nav className="flex items-center gap-1 p-1.5 bg-gray-50/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-gray-200/40 rounded-full ring-1 ring-gray-900/5">
          
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center gap-2 pl-2 pr-4 group mr-1">
            <div className="bg-gradient-to-br from-brand-red to-red-600 p-1.5 rounded-full text-white group-hover:rotate-12 transition-transform shadow-lg shadow-red-500/30">
              <Dumbbell size={16} fill="currentColor" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900 font-space">
              GYM<span className="text-brand-red">AI</span>
            </span>
          </NavLink>

          <div className="h-6 w-px bg-gray-200/60 mx-1"></div>

          {/* --- BAGIAN LINK --- */}
          <div className="flex items-center gap-1 p-1">
            <NavLink to="/" className={() => navLinkClass("/")}>Home</NavLink>
            
            <NavLink to="/schedule" className={() => navLinkClass("/schedule")}> 
              Schedule
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
                 {/* TOMBOL LOGOUT: Membuka modal */}
                 <button 
                  onClick={() => setShowLogoutModal(true)} 
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
    </>
  );
}