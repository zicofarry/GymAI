import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, Clock, Zap, Dumbbell, ArrowRight, CheckCircle2, 
    TrendingUp, Award, Loader2, Undo2 
} from 'lucide-react';

export default function ScheduleResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result); 
  const [updatingId, setUpdatingId] = useState(null); // State untuk loading per item

  // Fetch Data
  useEffect(() => {
    if (result) return;
    const fetchMySchedule = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/v1/schedules/my-schedule',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setResult(response.data);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 404) {
                alert("Belum ada jadwal. Yuk buat dulu!");
                navigate('/create');
            }
        } finally {
            setLoading(false);
        }
    };
    fetchMySchedule();
  }, []);

  // --- LOGIC TOGGLE (CHECK / UNCHECK) ---
  const handleToggle = async (itemId) => {
      if (updatingId === itemId) return; // Cegah double click
      setUpdatingId(itemId); // Set loading status

      const token = localStorage.getItem('token');
      try {
          // Panggil API Toggle
          const response = await axios.post(
              `http://127.0.0.1:8000/api/v1/schedules/items/${itemId}/toggle`, 
              {}, 
              { headers: { 'Authorization': `Bearer ${token}` } }
          );

          // Update UI dengan status baru dari Backend
          const newStatus = response.data.is_completed;

          setResult(prev => ({
              ...prev,
              schedule: prev.schedule.map(item => 
                  item.id === itemId ? { ...item, is_completed: newStatus } : item
              )
          }));

      } catch (error) {
          alert("Gagal update status.");
          console.error(error);
      } finally {
          setUpdatingId(null);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-red" size={48}/></div>;
  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10 pt-28">
        
        {/* HEADER */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
            <CheckCircle2 size={32} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Your Active <span className="text-brand-red">Plan</span>
          </h1>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
            <p className="text-gray-600 italic font-medium">"{result.motivation}"</p>
          </div>
        </div>

        {/* LIST JADWAL */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.schedule.map((item) => (
              <div 
                key={item.id} 
                className={`rounded-3xl p-6 shadow-sm border transition-all duration-300 relative group overflow-hidden ${
                    item.is_completed 
                    ? 'bg-green-50/80 border-green-200' 
                    : 'bg-white border-gray-100 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {/* Background Icon */}
                <Dumbbell className={`absolute -right-4 -bottom-4 opacity-50 transition transform ${item.is_completed ? 'text-green-200' : 'text-gray-50 group-hover:rotate-12'}`} size={100} />

                {/* HEADER CARD */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                      item.is_completed ? 'bg-green-200 text-green-800' : 'bg-gray-900 text-white'
                  }`}>
                    {item.day}
                  </div>
                  
                  {/* TOMBOL TOGGLE (Check / Undo) */}
                  <button 
                    onClick={() => handleToggle(item.id)}
                    disabled={updatingId === item.id}
                    className={`p-2 rounded-full transition-all shadow-sm ${
                        item.is_completed
                        ? 'bg-white text-green-600 hover:bg-red-50 hover:text-red-500 border border-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 border border-transparent'
                    }`}
                    title={item.is_completed ? "Undo (Batalkan)" : "Mark as Done"}
                  >
                      {updatingId === item.id ? (
                          <Loader2 size={20} className="animate-spin" />
                      ) : item.is_completed ? (
                          <CheckCircle2 size={20} className="group-hover:hidden" /> // Icon Check normal
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
                  <h3 className={`text-xl font-bold mb-1 leading-tight transition-all ${item.is_completed ? 'text-green-900 line-through decoration-green-500/50' : 'text-gray-900'}`}>
                    {item.exercise_name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={item.is_completed ? "text-green-600" : "text-gray-400"} /> 
                      <span>{item.time} ({item.duration}m)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className={item.is_completed ? "text-green-600" : "text-brand-red"} /> 
                      <span>{item.muscle_group}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {/* Waktu */}
                      <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 border border-gray-100">
                          <Clock size={16} className="text-blue-500" />
                          <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Time</p>
                              <p className="font-semibold text-gray-700">{item.time} ({item.duration}m)</p>
                          </div>
                      </div>

                      {/* Kalori */}
                      <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 border border-gray-100">
                          <Zap size={16} className="text-orange-500" />
                          <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Burn</p>
                              <p className="font-semibold text-gray-700">~{item.calories} kkal</p>
                          </div>
                      </div>

                      {/* Sets & Reps (Full Width) */}
                      <div className="col-span-2 bg-gray-900 text-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                          <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sets</span>
                              <span className="text-lg font-black font-mono">{item.sets}</span>
                          </div>
                          <div className="h-8 w-px bg-gray-700"></div>
                          <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reps / Time</span>
                              <span className="text-lg font-black font-mono">{item.reps}</span>
                          </div>
                          <div className="h-8 w-px bg-gray-700"></div>
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rest</span>
                              <span className="text-lg font-black font-mono">{item.rest}s</span>
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* TIPS (Hilang kalau sudah selesai biar bersih) */}
                  {!item.is_completed && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 animate-fadeIn">
                        <p className="text-xs text-blue-800">
                          <strong className="block mb-1">💡 Tip:</strong> {item.tips}
                        </p>
                      </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ACTION BUTTONS (Updated) */}
        <div className="mt-16 flex justify-center gap-4 flex-wrap">
           <Link 
             to="/create" 
             className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-900 transition flex items-center gap-2"
           >
             Regenerate Plan
           </Link>
           
           <button 
             onClick={() => window.print()} 
             className="px-6 py-3 bg-brand-red text-white font-bold rounded-xl shadow-lg hover:shadow-red-200 hover:bg-red-600 transition flex items-center gap-2"
           >
             Save / Print <ArrowRight size={20} />
           </button>
        </div>

      </div>
    </div>
  );
}