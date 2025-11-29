import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, Clock, Zap, Dumbbell, ArrowRight, CheckCircle2, 
    TrendingUp, Award, Loader2, Undo2, AlertTriangle, X 
} from 'lucide-react';

// Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// --- MODAL KEGAGALAN/INFO (REUSABLE) ---
const FailureModal = ({ title, message, onClose, actionButton, actionLink }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {actionButton && (
                <Link 
                    to={actionLink || '/create'}
                    onClick={onClose}
                    className="w-full bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    {actionButton}
                </Link>
            )}
            {!actionButton && (
                <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition transform hover:-translate-y-0.5">OK</button>
            )}
        </div>
    </div>
);

export default function ScheduleResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result); 
  const [updatingId, setUpdatingId] = useState(null); 
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '', action: null }); 

  // Fetch Data
  useEffect(() => {
    if (result) return;
    const fetchMySchedule = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        try {
            const response = await axios.get(
                `${API_BASE_URL}/schedules/my-schedule`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setResult(response.data);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 404) {
                // Modal: Jadwal Belum Ada
                setErrorModal({
                    show: true,
                    title: "No Active Plan Found",
                    message: "Anda belum memiliki jadwal aktif. Mari buat yang baru!",
                    actionButton: "CREATE NEW PLAN"
                });
            } else {
                // Modal: Fetch Gagal
                setErrorModal({
                    show: true,
                    title: "Fetch Error",
                    message: error.response?.data?.detail || "Gagal memuat jadwal dari server.",
                    actionButton: "Go Home",
                    actionLink: "/"
                });
            }
        } finally {
            setLoading(false);
        }
    };
    fetchMySchedule();
  }, [navigate, result]);

  // --- LOGIC TOGGLE (CHECK / UNCHECK) ---
  const handleToggle = async (itemId) => {
      if (updatingId === itemId) return; 
      setUpdatingId(itemId); 

      const token = localStorage.getItem('token');
      try {
          const response = await axios.post(
              `${API_BASE_URL}/schedules/items/${itemId}/toggle`, 
              {}, 
              { headers: { 'Authorization': `Bearer ${token}` } }
          );

          const newStatus = response.data.is_completed;

          setResult(prev => ({
              ...prev,
              schedule: prev.schedule.map(item => 
                  item.id === itemId ? { ...item, is_completed: newStatus } : item
              )
          }));

      } catch (error) {
          // Modal: Toggle Gagal
          setErrorModal({
              show: true,
              title: "Update Failed",
              message: "Gagal mengubah status latihan. Coba lagi.",
              onClose: () => setErrorModal({ show: false, title: '', message: '', action: null })
          });
          console.error(error);
      } finally {
          setUpdatingId(null);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-red" size={48}/></div>;
  
  // Render Modal Jika Ada Error (404, Gagal Fetch, dll)
  if (errorModal.show) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <FailureModal 
                title={errorModal.title}
                message={errorModal.message}
                onClose={() => setErrorModal({ show: false, title: '', message: '', action: null })}
                actionButton={errorModal.actionButton}
                actionLink={errorModal.actionLink}
            />
        </div>
    );
  }
  
  if (!result) return null; // Fallback jika tidak ada data dan tidak ada modal (seharusnya tidak terjadi)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-space">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10 pt-28">
        
        {/* HEADER MOTIVATION (Redesign Match) */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
            <Award size={32} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Your <span className="text-brand-red">Protocol</span> is Active
          </h1>
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 max-w-xl mx-auto">
            <p className="text-gray-700 italic font-medium">"{result.motivation}"</p>
          </div>
        </div>

        {/* LIST JADWAL (Redesign Cards) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.schedule.map((item) => (
              <div 
                key={item.id} 
                className={`rounded-3xl p-6 shadow-xl border transition-all duration-300 relative group overflow-hidden ${
                    item.is_completed 
                    ? 'bg-green-50/80 border-green-200 opacity-80' 
                    : 'bg-white border-gray-100 hover:shadow-2xl hover:-translate-y-0.5'
                }`}
              >
                {/* Background Icon */}
                <Dumbbell className={`absolute -right-4 -bottom-4 opacity-50 transition transform ${item.is_completed ? 'text-green-200' : 'text-gray-100 group-hover:rotate-6'}`} size={100} />

                {/* HEADER CARD */}
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      item.is_completed ? 'bg-green-600 text-white' : 'bg-brand-red text-white'
                  }`}>
                    {item.day}
                  </div>
                  
                  {/* TOMBOL TOGGLE (Check / Undo) */}
                  <button 
                    onClick={() => handleToggle(item.id)}
                    disabled={updatingId === item.id}
                    className={`p-2 rounded-full transition-all shadow-sm ${
                        item.is_completed
                        ? 'bg-white text-green-600 hover:bg-red-100 hover:text-red-500 border border-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 border border-transparent'
                    }`}
                    title={item.is_completed ? "Undo (Batalkan)" : "Mark as Done"}
                  >
                      {updatingId === item.id ? (
                          <Loader2 size={20} className="animate-spin" />
                      ) : item.is_completed ? (
                          <CheckCircle2 size={20} className="group-hover:hidden" />
                      ) : (
                          <div className="w-5 h-5 border-2 border-current rounded-full"></div>
                      )}
                      
                      {/* Icon Undo (Muncul saat hover di item yg sudah completed) */}
                      {item.is_completed && !updatingId && (
                          <Undo2 size={20} className="hidden group-hover:block" />
                      )}
                  </button>
                </div>

                {/* CONTENT */}
                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold mb-2 leading-tight transition-all ${item.is_completed ? 'text-green-900 line-through decoration-green-500/50' : 'text-gray-900'}`}>
                    {item.exercise_name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={item.is_completed ? "text-green-600" : "text-gray-400"} /> 
                      <span>{item.time} | {item.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className={item.is_completed ? "text-green-600" : "text-brand-red"} /> 
                      <span className='font-bold'>{item.muscle_group}</span>
                    </div>
                  </div>

                  {/* TIPS (Redesign Bubble) */}
                  {!item.is_completed && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-xs text-blue-800">
                          <strong className="block mb-1">💡 Tip:</strong> {item.tips}
                        </p>
                      </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-16 flex justify-center gap-4 flex-wrap">
           <Link 
             to="/create" 
             className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-900 transition flex items-center gap-2 shadow-md hover:-translate-y-0.5"
           >
             Regenerate Plan
           </Link>
           
           <button 
             onClick={() => window.print()} 
             className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-xl hover:shadow-gray-700 hover:bg-black transition flex items-center gap-2 hover:-translate-y-0.5"
           >
             Save / Print <ArrowRight size={20} />
           </button>
        </div>

      </div>
    </div>
  );
}