import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    User, TrendingUp, Activity, MapPin, Save, 
    Dumbbell, Flame, Clock, CalendarDays, History,
    AlertTriangle, CheckCircle2, Lock, ArrowLeft, ArrowRight
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// --- MODAL KEBERHASILAN (Success) ---
const SuccessModal = ({ message, onClose }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space">
        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-sm text-center border-2 border-green-200 ring-4 ring-green-500/20 transform scale-105">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Update Success!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition transform hover:-translate-y-0.5"
            >
                CLOSE
            </button>
        </div>
    </div>
);

// --- MODAL KEGAGALAN (Failure) / Reusable Placeholder ---
const FailureModal = ({ title, message, onClose, actionButton, actionLink }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {actionButton && actionLink ? (
                <Link 
                    to={actionLink}
                    onClick={onClose}
                    className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    {actionButton}
                </Link>
            ) : (
                <button 
                    onClick={onClose}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition transform hover:-translate-y-0.5"
                >
                    {actionButton || 'TRY AGAIN'}
                </button>
            )}
        </div>
    </div>
);


export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State baru untuk Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  // State baru untuk Modal Placeholder (View All)
  const [showPlaceholderModal, setShowPlaceholderModal] = useState({ show: false, title: '', message: '' }); 
  
  // State untuk pagination semu (hanya untuk UI)
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5; 

  // State untuk Edit Form
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // Logika Pagination Semu
  const currentLogs = user?.recent_activity || [];
  const totalPages = Math.ceil(currentLogs.length / logsPerPage);

  // Filter logs berdasarkan halaman saat ini (walaupun data hanya 5)
  const logsToDisplay = currentLogs.slice(
      (currentPage - 1) * logsPerPage,
      currentPage * logsPerPage
  );


  const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const res = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setUser(res.data);
        setEditData({
            weight: res.data.weight,
            height: res.data.height,
            goal: res.data.goal,
            location: res.data.location,
            fitness_level: res.data.fitness_level,
            sessions_per_week: 3, 
            busy_times: [], 
            injuries: []
        });
    } catch (error) {
        console.error("Gagal ambil profil:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
        const token = localStorage.getItem('token');
        setLoading(true);
        
        const payload = {
            ...editData,
            weight: parseFloat(editData.weight),
            height: parseInt(editData.height),
        };

        await axios.put(`${API_BASE_URL}/users/me`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setIsEditing(false);
        fetchProfile(); 
        setShowSuccessModal(true);

    } catch (error) {
        console.error(error);
        setShowFailureModal(true);
    } finally {
        setLoading(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-space">
      <Navbar />

      {/* RENDER MODAL SUKSES */}
      {showSuccessModal && (
          <SuccessModal
              message="Physical data and your schedule have been successfully updated!"
              onClose={() => setShowSuccessModal(false)}
          />
      )}

      {/* RENDER MODAL GAGAL */}
      {showFailureModal && (
          <FailureModal
              title="Update Failed"
              message="Failed to update physical data. Please ensure the data is valid and try again."
              onClose={() => setShowFailureModal(false)}
          />
      )}
      
      {/* RENDER MODAL PLACEHOLDER UNTUK VIEW ALL */}
      {showPlaceholderModal.show && (
          <FailureModal
              title={showPlaceholderModal.title}
              message={showPlaceholderModal.message}
              onClose={() => setShowPlaceholderModal({ show: false, title: '', message: '' })}
          />
      )}
      
      <div className={`max-w-5xl mx-auto px-4 py-10 pt-28 ${showSuccessModal || showFailureModal || showPlaceholderModal.show ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {/* HEADER PROFILE */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-3xl shadow-md border-2 border-gray-100">
            {/* Hapus Shadow Foto Profil */}
            <div className="w-24 h-24 bg-gradient-to-br from-brand-red to-red-600 rounded-full flex items-center justify-center text-white shadow-none"> 
                <User size={48} />
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.username}</h1>
                <p className="text-gray-500 font-medium">{user.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-red-50 text-brand-red rounded-lg text-xs font-bold uppercase tracking-wider">{user.fitness_level}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">{user.location}</span>
                </div>
            </div>
            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
                    isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-900 text-white hover:bg-black shadow-md'
                }`}
            >
                {/* TEXT DIUBAH */}
                {isEditing ? <><Save size={18}/> Save Metrics</> : 'Update Metrics'} 
            </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* LEFT: STATS TRACKER */}
            <div className="md:col-span-2 space-y-8">
                
                {/* 1. SUMMARY CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Dumbbell size={24} className="text-brand-red" />
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_workouts}</p>
                        <span className="text-sm font-bold uppercase text-gray-500">Workouts</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <Flame size={24} />
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_calories}</p>
                        <span className="text-sm font-bold uppercase text-orange-500">Total Kkal</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <Clock size={24} />
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_minutes}</p>
                        <span className="text-sm font-bold uppercase text-blue-500">Minutes</span>
                    </div>
                </div>

                {/* 2. RECENT HISTORY LIST */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <History className="text-brand-red" />
                            <h3 className="font-bold text-gray-900 text-xl">Recent Activity</h3>
                        </div>
                        <button 
                            className="text-sm font-bold text-gray-600 hover:text-brand-red transition"
                            // LOGIKA PENTING: Mengganti alert() dengan modal placeholder
                            onClick={() => setShowPlaceholderModal({
                                show: true,
                                title: "FEATURE NOT READY YET",
                                message: "Woy orang Backend! Endpoint untuk mengambil semua riwayat aktivitas (/users/me/logs) belum diimplementasikan di Backend. Mohon dikerjakan ya!",
                            })}
                            title="Redirect to full activity history page"
                        >
                            View All →
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {logsToDisplay.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-4">No recent activity logs.</p>
                        ) : (
                            logsToDisplay.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2 rounded-lg border border-gray-200">
                                            <CalendarDays size={20} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{log.exercise_name}</h4>
                                            <p className="text-xs text-gray-500">{log.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{log.duration} mins</div>
                                        <div className="text-xs text-orange-500 font-bold">{log.calories} kkal</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Semu */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: PHYSICAL DATA FORM */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md h-fit">
                <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-brand-red" /> Physical Data
                </h3>
                
                <div className="space-y-4">
                    {/* Weight */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Weight (kg)</label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={editData.weight} 
                                onChange={(e) => setEditData({...editData, weight: e.target.value})}
                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1"
                            />
                        ) : (
                            <p className="text-xl font-bold text-gray-900">{user.weight} kg</p>
                        )}
                    </div>

                    {/* Height */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Height (cm)</label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={editData.height} 
                                onChange={(e) => setEditData({...editData, height: e.target.value})}
                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1"
                            />
                        ) : (
                            <p className="text-xl font-bold text-gray-900">{user.height} cm</p>
                        )}
                    </div>

                    {/* Main Goal */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Main Goal</label>
                         {isEditing ? (
                            <select 
                                value={editData.goal}
                                onChange={(e) => setEditData({...editData, goal: e.target.value})}
                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1 bg-white"
                            >
                                {['Muscle Gain', 'Fat Loss', 'Stay Healthy', 'Flexibility'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                             <div className="flex items-center gap-2 mt-1">
                                <TrendingUp size={18} className="text-brand-red" />
                                <p className="text-lg font-bold text-gray-900">{user.goal}</p>
                            </div>
                        )}
                    </div>

                     {/* Preferred Location */}
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Preferred Location</label>
                         {isEditing ? (
                            <select 
                                value={editData.location}
                                onChange={(e) => setEditData({...editData, location: e.target.value})}
                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1 bg-white"
                            >
                                {['Home', 'Gym'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                             <div className="flex items-center gap-2 mt-1">
                                <MapPin size={18} className="text-brand-red" />
                                <p className="text-lg font-bold text-gray-900">{user.location}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}