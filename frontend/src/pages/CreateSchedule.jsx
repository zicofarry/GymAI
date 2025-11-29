import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Atau import { api } from '../config/api' jika sudah buat config
import { User, Activity, Target, Calendar, Clock, Check } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Inisialisasi state busy_times untuk SEMUA hari agar UI mudah dirender
  const initialBusyTimes = DAYS.map(day => ({
    day: day,
    is_busy: false,     // Flag lokal untuk UI (checkbox)
    is_full_day: false,
    start_time: "",
    end_time: ""
  }));

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    fitness_level: 'Beginner',
    goal: 'Stay Healthy',
    location: 'Home',
    sessions_per_week: 3,
    busy_times: initialBusyTimes
  });

  // Cek Login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Anda harus login untuk mengakses halaman ini!");
      navigate('/login'); // Pastikan route login benar
    }
  }, [navigate]);

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler khusus untuk update busy time
  const handleBusyUpdate = (index, field, value) => {
    const newBusyTimes = [...formData.busy_times];
    newBusyTimes[index][field] = value;
    
    // Jika is_busy dimatikan, reset field lainnya
    if (field === 'is_busy' && !value) {
        newBusyTimes[index].is_full_day = false;
        newBusyTimes[index].start_time = "";
        newBusyTimes[index].end_time = "";
    }

    handleUpdate('busy_times', newBusyTimes);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      // Filter hanya hari yang dicentang sibuk (is_busy = true)
      const activeBusyTimes = formData.busy_times
        .filter(b => b.is_busy)
        .map(b => ({
            day: b.day,
            is_full_day: b.is_full_day,
            // Backend butuh null jika string kosong
            start_time: b.start_time || null, 
            end_time: b.end_time || null
        }));

      const payload = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        height: parseInt(formData.height) || 0,
        busy_times: activeBusyTimes
      };

      // PERHATIKAN URL ENDPOINT YANG BARU (/api/v1/...)
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/schedules/generate', 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      navigate('/result', { state: { result: response.data } });

    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.detail || "Gagal generate jadwal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Setup Your <span className="text-brand-red">Plan</span></h2>
          <p className="text-gray-500">Sesuaikan profil agar AI bisa membuat jadwal yang akurat.</p>
        </div>

        {/* STEP 1: PHYSICAL PROFILE */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-4 transition-all ${step === 1 ? 'ring-2 ring-brand-blueSolid' : 'opacity-60'}`}>
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setStep(1)}>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
              <User className="text-brand-red" /> Physical Profile
            </div>
            <span className="bg-brand-blueSolid text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">1</span>
          </div>
          
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weight (kg)</label>
                <input type="number" className="w-full border p-3 rounded-lg" placeholder="70" value={formData.weight} onChange={(e) => handleUpdate('weight', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Height (cm)</label>
                <input type="number" className="w-full border p-3 rounded-lg" placeholder="175" value={formData.height} onChange={(e) => handleUpdate('height', e.target.value)} />
              </div>
              <button onClick={() => setStep(2)} className="col-span-2 mt-2 bg-gray-900 text-white py-3 rounded-lg font-bold">Next</button>
            </div>
          )}
        </div>

        {/* STEP 2: FITNESS LEVEL */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-4 transition-all ${step === 2 ? 'ring-2 ring-brand-blueSolid' : 'opacity-60'}`}>
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setStep(2)}>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
              <Activity className="text-brand-red" /> Fitness Level
            </div>
            <span className="bg-brand-blueSolid text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">2</span>
          </div>

          {step === 2 && (
            <div>
              <input type="range" min="0" max="3" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                value={['Beginner', 'Intermediate', 'Advanced', 'Athlete'].indexOf(formData.fitness_level)}
                onChange={(e) => handleUpdate('fitness_level', ['Beginner', 'Intermediate', 'Advanced', 'Athlete'][e.target.value])}
              />
              <div className="flex justify-between text-sm mt-2 font-medium"><span>Beginner</span><span>Intermediate</span><span>Advanced</span><span>Athlete</span></div>
              <div className="mt-4 text-center font-bold text-brand-red text-xl">{formData.fitness_level}</div>
              <button onClick={() => setStep(3)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-bold">Next</button>
            </div>
          )}
        </div>

        {/* STEP 3: TARGET & LOCATION */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-4 transition-all ${step === 3 ? 'ring-2 ring-brand-blueSolid' : 'opacity-60'}`}>
           <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setStep(3)}>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
              <Target className="text-brand-red" /> Target & Location
            </div>
            <span className="bg-brand-blueSolid text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
          </div>

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Main Goal?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Fat Loss', 'Muscle Gain', 'Stay Healthy', 'Flexibility'].map(goal => (
                    <button key={goal} className={`py-2 border rounded-lg ${formData.goal === goal ? 'bg-brand-red text-white' : 'bg-white'}`} onClick={() => handleUpdate('goal', goal)}>{goal}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Location?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home', 'Gym'].map(loc => (
                    <button key={loc} className={`py-2 border rounded-lg ${formData.location === loc ? 'bg-gray-800 text-white' : 'bg-white'}`} onClick={() => handleUpdate('location', loc)}>{loc}</button>
                  ))}
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Sessions/week?</label>
                <div className="flex gap-2">
                   {[3, 4, 5, 6].map(num => (
                     <button key={num} className={`flex-1 py-2 border rounded-full ${formData.sessions_per_week === num ? 'bg-brand-blueSolid text-white' : 'bg-white'}`} onClick={() => handleUpdate('sessions_per_week', num)}>{num}x</button>
                   ))}
                </div>
              </div>
              <button onClick={() => setStep(4)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-bold">Next</button>
            </div>
          )}
        </div>

        {/* STEP 4: BUSY TIME (UPDATED UI) */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-4 transition-all ${step === 4 ? 'ring-2 ring-brand-blueSolid' : 'opacity-60'}`}>
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setStep(4)}>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
              <Calendar className="text-brand-red" /> Busy Times
            </div>
            <span className="bg-brand-blueSolid text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">4</span>
          </div>
          
          {step === 4 && (
             <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">Tandai hari dimana kamu <b>TIDAK BISA</b> latihan.</p>
                
                {formData.busy_times.map((item, idx) => (
                    <div key={item.day} className={`p-3 rounded-lg border transition ${item.is_busy ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-red-500"
                                    checked={item.is_busy}
                                    onChange={(e) => handleBusyUpdate(idx, 'is_busy', e.target.checked)}
                                />
                                <span className={`font-medium ${item.is_busy ? 'text-red-700' : 'text-gray-600'}`}>{item.day}</span>
                            </label>

                            {item.is_busy && (
                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={item.is_full_day}
                                        onChange={(e) => handleBusyUpdate(idx, 'is_full_day', e.target.checked)}
                                    />
                                    Full Day Busy?
                                </label>
                            )}
                        </div>

                        {/* Time Picker hanya muncul jika Busy = True DAN Full Day = False */}
                        {item.is_busy && !item.is_full_day && (
                            <div className="mt-3 flex items-center gap-2 animate-fadeIn">
                                <Clock size={14} className="text-gray-400"/>
                                <input 
                                    type="time" 
                                    className="border rounded px-2 py-1 text-sm bg-white"
                                    value={item.start_time}
                                    onChange={(e) => handleBusyUpdate(idx, 'start_time', e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="time" 
                                    className="border rounded px-2 py-1 text-sm bg-white"
                                    value={item.end_time}
                                    onChange={(e) => handleBusyUpdate(idx, 'end_time', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                ))}
             </div>
          )}
        </div>

        {/* GENERATE BUTTON */}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-black transition flex justify-center items-center gap-2"
        >
          {loading ? 'Thinking...' : '✨ GENERATE JADWAL'}
        </button>

      </div>
    </div>
  );
}