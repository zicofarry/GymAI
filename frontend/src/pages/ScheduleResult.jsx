import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, Clock, Zap, Dumbbell, ArrowRight, CheckCircle2, 
    TrendingUp, Award, Loader2 
} from 'lucide-react';

export default function ScheduleResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State: Bisa dari generate barusan (location.state) ATAU null dulu
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result); // Loading jika data belum ada

  useEffect(() => {
    // Jika data sudah ada dari hasil generate, tidak perlu fetch
    if (result) return;

    const fetchMySchedule = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/v1/schedules/my-schedule',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setResult(response.data);
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
            // Jika error 404 (Belum punya jadwal), arahkan ke create
            if (error.response && error.response.status === 404) {
                alert("Kamu belum memiliki jadwal aktif. Yuk buat dulu!");
                navigate('/create');
            } else if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    fetchMySchedule();
  }, [navigate, result]);

  // --- LOADING STATE ---
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
              <p className="text-gray-500 font-medium">Fetching your plan...</p>
          </div>
      );
  }

  // --- EMPTY STATE (Jaga-jaga) ---
  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10 pt-10">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
            <CheckCircle2 size={32} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Your Active <span className="text-brand-red">Plan</span>
          </h1>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-red"></div>
            <p className="text-lg text-gray-600 italic font-medium">"{result.motivation}"</p>
          </div>
        </div>

        {/* SCHEDULE TIMELINE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-gray-400" size={20} />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Weekly Schedule</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.schedule.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300 relative group overflow-hidden"
              >
                <Dumbbell className="absolute -right-4 -bottom-4 text-gray-50 opacity-50 group-hover:rotate-12 transition transform" size={100} />

                {/* Card Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                    {item.day}
                  </div>
                  <div className="bg-red-50 text-brand-red px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={12} />
                    {item.muscle_group}
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-brand-red transition-colors">
                    {item.exercise_name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-semibold">{item.time}</span>
                      <span className="text-gray-400">•</span>
                      <span>{item.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-500" />
                      <span>Moderate Intensity</span>
                    </div>
                  </div>

                  {/* AI Tip Box */}
                  <div className="mt-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong className="block mb-1 flex items-center gap-1">
                        <Award size={12} /> Pro Tip:
                      </strong> 
                      {item.tips}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-16 flex justify-center gap-4">
           <Link 
             to="/create" 
             className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-900 transition flex items-center gap-2"
           >
             Re-Generate Plan
           </Link>
           <button 
             onClick={() => window.print()} 
             className="px-8 py-4 bg-brand-red text-white font-bold rounded-xl shadow-lg hover:shadow-red-200 hover:bg-red-600 transition flex items-center gap-2"
           >
             Save / Print <ArrowRight size={20} />
           </button>
        </div>

      </div>
    </div>
  );
}