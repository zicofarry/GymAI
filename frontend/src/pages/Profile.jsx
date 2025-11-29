import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, TrendingUp, Activity, MapPin, Save, 
    Dumbbell, Flame, Clock, CalendarDays, History, 
    Sparkles, BrainCircuit, Loader2, X, ArrowLeft, ArrowRight,
    AlertTriangle, CheckCircle2
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// --- MODAL COMPONENTS ---

const SuccessModal = ({ message, onClose }) => (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border-2 border-green-200 ring-4 ring-green-500/20 transform scale-105">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">CLOSE</button>
        </div>
    </div>
);

const FailureModal = ({ title, message, onClose }) => (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">TRY AGAIN</button>
        </div>
    </div>
);

const AnalysisModal = ({ suggestion, onClose }) => (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border-2 border-purple-200 ring-4 ring-purple-500/20 relative flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3 text-purple-600">
                    <BrainCircuit size={32} />
                    <h3 className="text-2xl font-bold text-gray-900">AI Coach Analysis</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {suggestion}
            </div>
            <div className="p-6 pt-4 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
                <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">Got it!</button>
            </div>
        </div>
    </div>
);

const HistoryModal = ({ logs, onClose }) => {
    const [page, setPage] = useState(1);
    const logsPerPage = 7;
    const totalPages = Math.ceil(logs.length / logsPerPage);
    const currentLogs = logs.slice((page - 1) * logsPerPage, page * logsPerPage);

    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-200 relative flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 text-brand-red">
                        <History size={28} />
                        <h3 className="text-2xl font-bold text-gray-900">Full Activity Log</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto bg-gray-50 space-y-3">
                    {logs.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No activity found.</p>
                    ) : (
                        currentLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-2 rounded-lg text-gray-500">
                                        <CalendarDays size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{log.exercise_name}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{log.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 flex items-center gap-1 justify-end">
                                        <Clock size={14} className="text-gray-400"/> {log.duration}m
                                    </div>
                                    <div className="text-xs text-orange-500 font-bold mt-0.5 flex items-center gap-1 justify-end">
                                        <Flame size={12} /> {log.calories} kkal
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl flex justify-between items-center">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  
  // AI & Features States
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Edit Data State
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
            sessions_per_week: 3, busy_times: [], injuries: [] 
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
        setShowFailureModal(true);
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyze = async () => {
      setAnalyzing(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_BASE_URL}/users/analyze`, {}, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setSuggestion(res.data.suggestion);
      } catch (error) {
          alert("Gagal melakukan analisis.");
      } finally {
          setAnalyzing(false);
      }
  };

  if (loading || !user) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-brand-red" size={48}/></div>;

  return (
    <div className="min-h-screen pb-20 font-space relative overflow-hidden">
      <Navbar />
      
      {/* MODALS */}
      {suggestion && <AnalysisModal suggestion={suggestion} onClose={() => setSuggestion(null)} />}
      {showHistoryModal && <HistoryModal logs={user.recent_activity} onClose={() => setShowHistoryModal(false)} />}
      {showSuccessModal && <SuccessModal message="Profile updated successfully!" onClose={() => setShowSuccessModal(false)} />}
      {showFailureModal && <FailureModal title="Update Failed" message="Could not update profile." onClose={() => setShowFailureModal(false)} />}

      {/* BACKGROUND */}
      <div className="bg-noise z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
      <div className="absolute top-[10%] right-[-20%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[50vw] h-[50vw] bg-red-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>
      <div className="absolute inset-0 bg-animated-grid animate-grid-flow z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-0 pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className={`relative z-10 max-w-5xl mx-auto px-4 py-10 pt-28 ${showSuccessModal || showFailureModal || suggestion || showHistoryModal ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {/* HEADER PROFILE */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white p-8 rounded-3xl shadow-md border-2 border-gray-100 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-red to-red-600 rounded-full flex items-center justify-center text-white shadow-none">
                <User size={48} />
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.username}</h1>
                <p className="text-gray-500 font-medium">{user.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">{user.fitness_level}</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">{user.location}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-5 py-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-bold hover:bg-purple-100 transition flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                    {analyzing ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                    AI Insight
                </button>
                
                {/* TOMBOL UPDATE METRICS */}
                <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg ${
                        isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-900 text-white hover:bg-black'
                    }`}
                >
                    {isEditing ? <><Save size={18}/> Save Metrics</> : 'Update Metrics'}
                </button>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* LEFT: STATS TRACKER & REPORT */}
            <div className="md:col-span-2 space-y-8">
                
                {/* FITUR 3: WEEKLY REPORT CARD */}
                <div className="bg-gradient-to-r from-brand-dark to-gray-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden border border-gray-700">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100}/></div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 relative z-10 text-yellow-400">
                        <Sparkles size={18} /> Weekly Summary
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed relative z-10 italic">
                        "{user.weekly_report_text}"
                    </p>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Dumbbell size={24} className="text-brand-red" /> <span className="text-xs font-bold uppercase">Workouts</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_workouts}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                            <Flame size={24} /> <span className="text-xs font-bold uppercase text-gray-400">Calories</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_calories}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-blue-500 mb-2">
                            <Clock size={24} /> <span className="text-xs font-bold uppercase text-gray-400">Minutes</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">{user.stats.total_minutes}</p>
                    </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <History className="text-brand-red" />
                            <h3 className="font-bold text-gray-900 text-xl">Recent Activity</h3>
                        </div>
                        <button 
                            onClick={() => setShowHistoryModal(true)}
                            className="text-sm font-bold text-gray-500 hover:text-brand-red transition flex items-center gap-1"
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {user.recent_activity.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Dumbbell className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 italic">Belum ada riwayat latihan.</p>
                            </div>
                        ) : (
                            user.recent_activity.slice(0, 3).map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md border border-transparent transition duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm text-brand-red">
                                            <CalendarDays size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{log.exercise_name}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{log.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 flex items-center gap-1 justify-end">
                                            <Clock size={14} className="text-gray-400"/> {log.duration}m
                                        </div>
                                        <div className="text-xs text-orange-500 font-bold mt-0.5 flex items-center gap-1 justify-end">
                                            <Flame size={12} /> {log.calories} kkal
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: PHYSICAL DATA FORM */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md h-fit">
                <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-brand-red" /> Physical Data
                </h3>
                <div className="space-y-5">
                    {/* Weight */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Weight (kg)</label>
                        {isEditing ? (
                            <input type="number" value={editData.weight} onChange={(e) => setEditData({...editData, weight: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1"/>
                        ) : (<p className="text-xl font-bold text-gray-900 border-b-2 border-transparent py-1">{user.weight} kg</p>)}
                    </div>
                    
                    {/* Height */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Height (cm)</label>
                        {isEditing ? (
                            <input type="number" value={editData.height} onChange={(e) => setEditData({...editData, height: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1"/>
                        ) : (<p className="text-xl font-bold text-gray-900 border-b-2 border-transparent py-1">{user.height} cm</p>)}
                    </div>
                     
                    {/* Main Goal */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Main Goal</label>
                         {isEditing ? (
                            <select value={editData.goal} onChange={(e) => setEditData({...editData, goal: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1 bg-white">
                                {['Muscle Gain', 'Fat Loss', 'Stay Healthy', 'Flexibility'].map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                            </select>
                        ) : (<div className="flex items-center gap-2 mt-1"><TrendingUp size={18} className="text-brand-red" /><p className="text-lg font-bold text-gray-900">{user.goal}</p></div>)}
                    </div>

                    {/* Preferred Location (UPDATED) */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Preferred Location</label>
                         {isEditing ? (
                            <select 
                                value={editData.location}
                                onChange={(e) => setEditData({...editData, location: e.target.value})}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-brand-red outline-none font-bold text-lg text-gray-900 transition mt-1 bg-white"
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
                    
                    {/* Info Tambahan */}
                    {!isEditing && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Level</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{user.fitness_level}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}