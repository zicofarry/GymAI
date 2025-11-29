import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Activity, Target, Calendar } from 'lucide-react';

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // State untuk Data Input
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    fitness_level: 'Beginner',
    goal: 'Stay Healthy',
    location: 'Home',
    sessions_per_week: 3,
    // Default dummy busy times (bisa dikembangkan nanti jadi UI selector yang kompleks)
    busy_times: [
      { day: "Monday", is_full_day: false, start_time: "", end_time: "" },
      { day: "Wednesday", is_full_day: false, start_time: "", end_time: "" },
      { day: "Friday", is_full_day: false, start_time: "", end_time: "" }
    ]
  });

  // Cek apakah user sudah login saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Anda harus login untuk mengakses halaman ini!");
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- BAGIAN UTAMA LOGIC SUBMIT ---
  const handleSubmit = async () => {
    // 1. Validasi Token (Double Check)
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sesi habis, silakan login kembali.");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 2. Bersihkan Data (Data Cleaning)
      // Backend Pydantic tidak suka string kosong "" untuk jam, jadi ubah ke null
      const cleanedBusyTimes = formData.busy_times.map(b => ({
        day: b.day,
        is_full_day: b.is_full_day,
        start_time: b.start_time || null, 
        end_time: b.end_time || null
      }));

      // Pastikan angka dikirim sebagai number, bukan string
      const payload = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        height: parseInt(formData.height) || 0,
        busy_times: cleanedBusyTimes
      };

      // 3. Kirim Request ke Backend dengan Header Auth
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/schedules/generate', 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // <--- PENTING: Kirim Token JWT
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 4. Sukses! Pindah ke halaman hasil
      navigate('/result', { state: { result: response.data } });

    } catch (error) {
      console.error("Error generating schedule:", error);
      
      // Handle Error Spesifik
      if (error.response) {
        if (error.response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login ulang.");
          localStorage.removeItem('token'); // Hapus token kadaluarsa
          navigate('/login');
        } else {
          alert(`Gagal: ${error.response.data.detail || "Terjadi kesalahan pada server."}`);
        }
      } else {
        alert("Gagal terhubung ke server Backend. Pastikan Backend menyala!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 mt-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Your AI-Optimized <span className="text-brand-red">Schedule</span></h2>
          <p className="text-gray-500">Our system generates your perfect, sustainable fitness plan.</p>
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
                <input 
                  type="number" 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-blueSolid transition"
                  placeholder="e.g. 70"
                  value={formData.weight}
                  onChange={(e) => handleUpdate('weight', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-blueSolid transition"
                  placeholder="e.g. 175"
                  value={formData.height}
                  onChange={(e) => handleUpdate('height', e.target.value)}
                />
              </div>
              <button onClick={() => setStep(2)} className="col-span-2 mt-2 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">Next Step</button>
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
              <input 
                type="range" 
                min="0" max="3" 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                value={['Beginner', 'Intermediate', 'Advanced', 'Athlete'].indexOf(formData.fitness_level)}
                onChange={(e) => handleUpdate('fitness_level', ['Beginner', 'Intermediate', 'Advanced', 'Athlete'][e.target.value])}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
                <span>Beginner</span>
                <span>Inter</span>
                <span>Adv</span>
                <span>Athlete</span>
              </div>
              <div className="mt-4 text-center font-bold text-brand-red text-xl">
                {formData.fitness_level}
              </div>
              <button onClick={() => setStep(3)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">Next Step</button>
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
                    <button 
                      key={goal}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${formData.goal === goal ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red'}`}
                      onClick={() => handleUpdate('goal', goal)}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Where do you workout?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home', 'Gym'].map(loc => (
                    <button 
                      key={loc}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${formData.location === loc ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}
                      onClick={() => handleUpdate('location', loc)}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Sessions per week?</label>
                <div className="flex justify-between gap-2">
                   {[3, 4, 5, 6].map(num => (
                     <button 
                      key={num}
                      className={`flex-1 py-2 rounded-full border text-sm font-bold transition ${formData.sessions_per_week === num ? 'bg-brand-blueSolid text-white border-brand-blueSolid' : 'bg-white text-gray-600 border-gray-200'}`}
                      onClick={() => handleUpdate('sessions_per_week', num)}
                     >{num}x</button>
                   ))}
                </div>
              </div>
              <button onClick={() => setStep(4)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">Next Step</button>
            </div>
          )}
        </div>

        {/* STEP 4: BUSY TIME (SIMPLIFIED FOR DEMO) */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-4 transition-all ${step === 4 ? 'ring-2 ring-brand-blueSolid' : 'opacity-60'}`}>
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setStep(4)}>
            <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
              <Calendar className="text-brand-red" /> Busy Time (Simulasi)
            </div>
            <span className="bg-brand-blueSolid text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">4</span>
          </div>
          
          {step === 4 && (
             <div className="text-sm text-gray-500">
                <p className="mb-4">Untuk demo ini, kami menggunakan default busy times (dari state awal): <br/> {JSON.stringify(formData.busy_times.map(b => b.day))}</p>
                <p className='bg-yellow-50 p-3 rounded text-yellow-800 border border-yellow-200'>
                  Note: Kamu bisa mengembangkan UI "Day Selector" yang kompleks seperti di desain Figma kamu di sini.
                </p>
             </div>
          )}
        </div>

        {/* GENERATE BUTTON */}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition flex justify-center items-center gap-2"
        >
          {loading ? 'Thinking...' : '✨ GENERATE JADWAL'}
        </button>

      </div>
    </div>
  );
}