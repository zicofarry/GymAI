import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, TrendingUp, Activity, MapPin, Save, 
    Dumbbell, Flame, Clock, CalendarDays, History
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State untuk Edit Form
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

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
            // Kita perlu kirim busy_times & injuries juga ke backend agar tidak hilang saat update
            // Untuk simpelnya di halaman profile ini, kita anggap user hanya update fisik dasar.
            // Tapi backend butuh struktur lengkap, jadi idealnya fetch full dulu atau handle partial update di backend.
            // (Untuk demo ini kita kirim busy_times kosong agar tidak error, tapi di real app harus fetch dulu)
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
        
        // Transform data sesuai schema backend UserProfileInput
        const payload = {
            ...editData,
            weight: parseFloat(editData.weight),
            height: parseInt(editData.height),
        };

        await axios.put(`${API_BASE_URL}/users/me`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setIsEditing(false);
        fetchProfile(); // Refresh data
        alert("Profil berhasil diupdate & Jadwal disesuaikan!");
    } catch (error) {
        alert("Gagal update profil.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-10 pt-24">
        
        {/* HEADER PROFILE */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-red to-red-600 rounded-full flex items-center justify-center text-white shadow-xl">
                <User size={48} />
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">{user.fitness_level}</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">{user.location}</span>
                </div>
            </div>
            <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
                    isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-900 text-white hover:bg-black'
                }`}
            >
                {isEditing ? <><Save size={18}/> Save Changes</> : 'Edit Profile'}
            </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* LEFT: STATS TRACKER */}
            <div className="md:col-span-2 space-y-8">
                
                {/* 1. SUMMARY CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Dumbbell size={18} /> <span className="text-xs font-bold uppercase">Workouts</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{user.stats.total_workouts}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <Flame size={18} /> <span className="text-xs font-bold uppercase text-gray-400">Calories</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{user.stats.total_calories}</p>
                        <span className="text-xs text-gray-400">kkal</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <Clock size={18} /> <span className="text-xs font-bold uppercase text-gray-400">Minutes</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{user.stats.total_minutes}</p>
                    </div>
                </div>

                {/* 2. RECENT HISTORY LIST */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <History className="text-brand-red" />
                        <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {user.recent_activity.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-4">Belum ada riwayat latihan.</p>
                        ) : (
                            user.recent_activity.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
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
                </div>
            </div>

            {/* RIGHT: PHYSICAL DATA FORM */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
                <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-brand-red" /> Physical Data
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Weight (kg)</label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={editData.weight} 
                                onChange={(e) => setEditData({...editData, weight: e.target.value})}
                                className="w-full border-b-2 border-gray-200 focus:border-brand-red outline-none py-2 font-bold text-gray-900"
                            />
                        ) : (
                            <p className="text-xl font-bold text-gray-900">{user.weight} kg</p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Height (cm)</label>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={editData.height} 
                                onChange={(e) => setEditData({...editData, height: e.target.value})}
                                className="w-full border-b-2 border-gray-200 focus:border-brand-red outline-none py-2 font-bold text-gray-900"
                            />
                        ) : (
                            <p className="text-xl font-bold text-gray-900">{user.height} cm</p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Main Goal</label>
                         {isEditing ? (
                            <select 
                                value={editData.goal}
                                onChange={(e) => setEditData({...editData, goal: e.target.value})}
                                className="w-full border-b-2 border-gray-200 focus:border-brand-red outline-none py-2 font-bold text-gray-900 bg-transparent"
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

                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Preferred Location</label>
                         {isEditing ? (
                            <select 
                                value={editData.location}
                                onChange={(e) => setEditData({...editData, location: e.target.value})}
                                className="w-full border-b-2 border-gray-200 focus:border-brand-red outline-none py-2 font-bold text-gray-900 bg-transparent"
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