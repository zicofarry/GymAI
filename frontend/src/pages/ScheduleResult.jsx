import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { 
    Calendar, Clock, Zap, Dumbbell, ArrowRight, CheckCircle2, 
    TrendingUp, Award, Loader2, Undo2, AlertTriangle, X 
} from 'lucide-react';

// --- MODAL KEGAGALAN/INFO (REUSABLE) ---
const FailureModal = ({ title, message, onClose, actionButton, actionLink }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
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
            const response = await api.get(
                `/schedules/my-schedule`,
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
          const response = await api.post(
              `/schedules/items/${itemId}/toggle`, 
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
    // Hapus bg-gray-50, tambahkan relative
    <div className="min-h-screen pb-20 font-space relative overflow-hidden">
      <Navbar />

      {/* --- BACKGROUND LAYER (Dynamic) --- */}
      <div className="bg-noise z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
      <div className="absolute top-[10%] right-[-20%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[50vw] h-[50vw] bg-red-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>
      <div className="absolute inset-0 bg-animated-grid animate-grid-flow z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-0 pointer-events-none" />
      
      {/* Konten utama dengan z-10 agar di atas background */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 pt-28">
        
        {/* HEADER MOTIVATION (Redesign: Lebih Premium) */}
        <div className="text-center mb-12">
            
            {/* Tag Status */}
            <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 rounded-xl mb-4 shadow-sm border border-green-200">
                <Award size={20} strokeWidth={2.5} className="mr-2"/>
                <span className="text-sm font-bold uppercase">Protocol Active</span>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                Your <span className="text-brand-red">Workout Plan</span>
            </h1>
            
            {/* Quote Container (Outline dihapus) */}
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 max-w-xl mx-auto">
                <p className="text-gray-700 italic font-medium text-lg">"{result.motivation}"</p>
            </div>
        </div>

        {/* LIST JADWAL (Redesign Cards) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.schedule.map((item) => (
              <div 
                key={item.id} 
                // Shadow diubah ke shadow-md dan hover:shadow-md
                className={`rounded-3xl p-6 shadow-md border transition-all duration-300 relative group overflow-hidden ${
                    item.is_completed 
                    ? 'bg-green-50/80 border-green-200 opacity-90' 
                    : 'bg-white border-gray-100 hover:shadow-md hover:-translate-y-0.5' 
                }`}
              >
                {/* Background Icon */}
                <Dumbbell className={`absolute -right-4 -bottom-4 opacity-50 transition transform ${item.is_completed ? 'text-green-200' : 'text-gray-100 group-hover:rotate-6'}`} size={100} />

                {/* HEADER CARD */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      item.is_completed ? 'bg-green-600 text-white' : 'bg-brand-red text-white shadow-sm'
                  }`}>
                    {item.day}
                  </div>
                  
                  {/* TOMBOL TOGGLE (Check / Undo) */}
                  <button 
                    onClick={() => handleToggle(item.id)}
                    disabled={updatingId === item.id}
                    className={`p-2 rounded-full transition-all shadow-sm ${
                        item.is_completed
                        ? 'bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-500 border border-green-200'
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
                  
                  {/* DETAIL BLOCKS (Disederhanakan) */}
                  <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 font-medium">
                      
                    {/* Time & Duration (Blok Utama) */}
                    <div className="bg-gray-50 p-2 rounded-lg flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" /> 
                            <span className='font-bold text-gray-700'>{item.time}</span>
                        </div>
                        <span className="text-xs font-semibold bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{item.duration} min</span>
                    </div>

                    {/* Muscle Group & Calories (Blok Pendamping) */}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 border border-gray-100">
                            <TrendingUp size={16} className="text-brand-red" />
                            <p className="text-sm font-semibold text-gray-700">{item.muscle_group}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 border border-gray-100">
                            <Zap size={16} className="text-orange-500" />
                            <p className="text-sm font-semibold text-gray-700">~{item.calories} kkal</p>
                        </div>
                    </div>

                    {/* Sets & Reps Block */}
                    <div className="col-span-2 bg-gray-100 text-gray-900 p-3 rounded-xl flex justify-between items-center shadow-inner mt-3 border border-gray-200">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sets</span>
                            <span className="text-lg font-black font-mono text-gray-900">{item.sets}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reps / Time</span>
                            <span className="text-lg font-black font-mono text-gray-900">{item.reps}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Rest</span>
                            <span className="text-lg font-black font-mono text-gray-900">{item.rest}s</span>
                        </div>
                    </div>
                  </div>

                  {/* TIPS (Redesign Bubble) */}
                  {!item.is_completed && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-xs text-blue-800">
                          <strong className="block mb-1">💡 Coach Tip:</strong> {item.tips}
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
             className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-black transition flex items-center gap-2 hover:-translate-y-0.5"
           >
             Save / Print <ArrowRight size={20} />
           </button>
        </div>

      </div>
    </div>
  );
}