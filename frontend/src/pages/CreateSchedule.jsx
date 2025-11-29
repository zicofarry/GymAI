import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Activity, Target, Calendar, Check, X, Clock, Plus, Trash, 
    Weight, Ruler, Dumbbell, Zap, TrendingUp, Heart, Armchair 
} from 'lucide-react';
import { nanoid } from 'nanoid';

// --- CONSTANTS & INITIAL DATA ---
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];
const GOALS = {
    'Muscle Gain': TrendingUp,
    'Fat Loss': Zap,
    'Stay Healthy': Heart,
    'Flexibility': Armchair
};

const getInitialBusySlots = () => {
    return ALL_DAYS.reduce((acc, day) => {
        acc[day] = []; 
        return acc;
    }, {});
};

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // FIX: Nilai awal untuk number diatur sebagai string kosong untuk input field
    weight: '', 
    height: '',
    fitness_level: 'Beginner',
    goal: 'Muscle Gain',
    location: 'Home',
    sessions_per_week: 3,
    busy_slots: getInitialBusySlots(), 
    full_day_blocked: ALL_DAYS.reduce((acc, day) => { acc[day] = false; return acc; }, {}),
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Anda harus login untuk mengakses halaman ini!");
      navigate('/login');
    }
  }, [navigate]);

  // FIX Bug 2: handleUpdate dibuat simpel, biarkan input type="number" memproses input sebagai string di state.
  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- LOGIC VALIDATION (Fix Bug 1: Tombol Next Step) ---
  const canAdvance = (currentStep) => {
    if (currentStep === 1) {
      // FIX: Cek apakah input Weight/Height adalah angka positif dan bukan string kosong
      const weightValid = parseFloat(formData.weight) > 0;
      const heightValid = parseInt(formData.height) > 0;
      return weightValid && heightValid;
    }
    // Steps 2, 3, 4 selalu valid karena memiliki nilai default/opsional
    return true; 
  };

  const handleNextStep = (num) => {
      if (canAdvance(num)) {
          setStep(num + 1);
      } else {
          alert("Harap lengkapi Berat dan Tinggi badan (harus angka positif) sebelum melanjutkan.");
      }
  };

  // --- LOGIC STEP 4: MULTIPLE BUSY SLOTS ---
  const handleSlotChange = (day, slotId, field, value) => {
      setFormData(prev => ({
          ...prev,
          busy_slots: {
              ...prev.busy_slots,
              [day]: prev.busy_slots[day].map(slot => 
                  slot.id === slotId ? { ...slot, [field]: value } : slot
              )
          }
      }));
  };

  const handleAddSlot = (day) => {
      // Pastikan slot baru tidak ditambahkan jika Full Day aktif
      if (formData.full_day_blocked[day]) return;
      
      setFormData(prev => ({
          ...prev,
          busy_slots: {
              ...prev.busy_slots,
              [day]: [...prev.busy_slots[day], { id: nanoid(), start_time: "08:00", end_time: "10:00", is_full_day: false }]
          }
      }));
  };

  const handleRemoveSlot = (day, slotId) => {
      setFormData(prev => ({
          ...prev,
          busy_slots: {
              ...prev.busy_slots,
              [day]: prev.busy_slots[day].filter(slot => slot.id !== slotId)
          }
      }));
  };

  const handleFullDayBlock = (day, isChecked) => {
      setFormData(prev => ({
          ...prev,
          full_day_blocked: {
              ...prev.full_day_blocked,
              [day]: isChecked
          },
          // Jika Full Day dicentang, clear semua slot. Jika tidak, tambahkan minimal 1 slot.
          busy_slots: {
              ...prev.busy_slots,
              [day]: isChecked ? [] : (prev.busy_slots[day].length === 0 ? [{ id: nanoid(), start_time: "08:00", end_time: "10:00", is_full_day: false }] : prev.busy_slots[day])
          }
      }));
  };

  const handleDayToggle = (day, isChecked) => {
      if (isChecked) {
          // Jika dicentang, aktifkan minimal 1 slot waktu (bukan full day)
          handleFullDayBlock(day, false);
          handleAddSlot(day);
      } else {
          // Jika dicentang, nonaktifkan full day dan clear semua slot
          handleFullDayBlock(day, false);
          setFormData(prev => ({
              ...prev, 
              busy_slots: { ...prev.busy_slots, [day]: [] }
          }));
      }
  }


  // --- COMPONENTS UI (Timeline, Card, etc.) ---
  const StepCard = ({ num, title, icon: Icon, isActive, isCompleted, children }) => {
    const isLocked = num > step && !isCompleted;
    
    return (
      <div className="flex">
        {/* Vertical Timeline Bar */}
        <div className="flex flex-col items-center mr-6">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10 shadow-lg ${
              isActive ? 'bg-brand-red text-white ring-4 ring-red-500/30' : 
              isCompleted ? 'bg-green-500 text-white shadow-xl' : 
              'bg-white text-gray-500 border-2 border-gray-200'
            }`}>
              {isCompleted ? <Check size={18} /> : num}
            </span>
            {/* Garis timeline (hilang di step terakhir) */}
            {num < 4 && (
                <div className={`w-1 flex-grow transition-colors duration-500 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
            )}
        </div>

        {/* Card Content */}
        <div className="flex-grow">
          <div 
            className={`bg-white p-6 rounded-3xl shadow-xl w-full mb-6 transition-all duration-300 border-2 ${
              isLocked ? 'border-gray-200 opacity-50 cursor-not-allowed' : 
              isActive ? 'border-gray-900 ring-2 ring-gray-900/10' : 
              'border-gray-100 hover:shadow-2xl cursor-pointer'
            }`}
            onClick={() => !isLocked && setStep(num)}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon className={isActive ? "text-brand-red" : isCompleted ? "text-green-500" : "text-gray-500"} size={22} /> 
              <span className="font-bold text-lg text-gray-900">{title}</span>
            </div>
            
            {isActive && 
              <div className="pt-4 border-t border-gray-100">
                {children}
                {num < 4 && (
                  <button 
                    onClick={() => handleNextStep(num)} 
                    disabled={!canAdvance(num)}
                    className={`w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold transition transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                      canAdvance(num) ? 'hover:bg-black' : ''
                    }`}
                  >
                    Next Step →
                  </button>
                )}
              </div>
            }
          </div>
        </div>
      </div>
    );
  };
  
  // --- SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    if (!canAdvance(1)) {
        setStep(1); 
        alert("Harap lengkapi Berat dan Tinggi badan (harus angka positif) sebelum generate jadwal.");
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    
    // 1. Filter dan Format Busy Times
    let finalBusyTimes = [];
    
    Object.keys(formData.busy_slots).forEach(day => {
        const slots = formData.busy_slots[day];
        const isFullDay = formData.full_day_blocked[day];

        if (isFullDay) {
            // Blokir hari penuh
             finalBusyTimes.push({
                day: day,
                is_full_day: true,
                start_time: null, 
                end_time: null
            });
        } else if (slots.length > 0) {
            // Tambahkan setiap slot waktu per hari
            slots.forEach(slot => {
                 finalBusyTimes.push({
                    day: day,
                    is_full_day: false,
                    start_time: slot.start_time + ":00", // Format HH:MM:SS
                    end_time: slot.end_time + ":00" // Format HH:MM:SS
                });
            });
        }
    });
    
    // 2. Final Payload (Parsing angka di sini, bukan di onChange)
    const payload = {
        weight: parseFloat(formData.weight) || 0,
        height: parseInt(formData.height) || 0,
        fitness_level: formData.fitness_level,
        goal: formData.goal,
        location: formData.location,
        sessions_per_week: parseInt(formData.sessions_per_week),
        busy_times: finalBusyTimes
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate-schedule', payload, { 
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
      });
      navigate('/result', { state: { result: response.data } });

    } catch (error) {
      console.error("Error generating schedule:", error.response || error);
      if (error.response && error.response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login ulang.");
          localStorage.removeItem('token'); 
          navigate('/login');
      } else {
          alert(`Gagal Generate Jadwal: ${error.response?.data?.detail || "Terjadi kesalahan pada server."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-space">
      <Navbar />
      
      <div className="max-w-xl mx-auto px-4 py-10 pt-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">Generate Your <span className="text-brand-red">AI Plan</span></h2>
          <p className="text-gray-500 mt-2">Fill in the 4 steps below. The AI will take care of the rest.</p>
        </div>

        {/* STEP 1: PHYSICAL PROFILE */}
        <StepCard num={1} title="Physical Profile" icon={Weight} isActive={step === 1} isCompleted={step > 1}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1"><Weight size={14} /> Weight (kg)</label>
              <input 
                type="number" 
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-blueSolid focus:border-brand-blueSolid transition"
                placeholder="e.g. 70"
                value={formData.weight}
                onChange={(e) => handleUpdate('weight', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1"><Ruler size={14} /> Height (cm)</label>
              <input 
                type="number" 
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-blueSolid focus:border-brand-blueSolid transition"
                placeholder="e.g. 175"
                value={formData.height}
                onChange={(e) => handleUpdate('height', e.target.value)}
              />
            </div>
          </div>
        </StepCard>

        {/* STEP 2: FITNESS LEVEL */}
        <StepCard num={2} title="Fitness Level" icon={Activity} isActive={step === 2} isCompleted={step > 2}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-6">How fit are you right now? ({formData.fitness_level})</label>
            
            <div className="flex flex-col items-center">
                <Dumbbell 
                    size={48} 
                    className={`mb-6 transition-all duration-500 ease-out ${
                        formData.fitness_level === 'Beginner' ? 'text-brand-red/50 scale-75' : 
                        formData.fitness_level === 'Intermediate' ? 'text-brand-red/70 scale-100' :
                        formData.fitness_level === 'Advanced' ? 'text-brand-red scale-125' :
                        'text-brand-red shadow-lg scale-150'
                    }`} 
                    strokeWidth={1.5}
                />
            </div>

            <input 
              type="range" 
              min="0" max="3" 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
              value={FITNESS_LEVELS.indexOf(formData.fitness_level)}
              onChange={(e) => handleUpdate('fitness_level', FITNESS_LEVELS[e.target.value])}
            />
            {/* FIX: Alignment Fix menggunakan absolute positioning */}
            <div className="relative flex justify-between text-sm text-gray-600 mt-2 font-medium">
              <span className='absolute left-0 -translate-x-1/2'>Beginner</span>
              <span className='absolute left-1/3 -translate-x-1/2'>Inter</span>
              <span className='absolute left-2/3 -translate-x-1/2'>Adv</span>
              <span className='absolute right-0 translate-x-1/2'>Athlete</span>
            </div>
            
            <div className="mt-8 text-center font-bold text-gray-900 text-xl border-t border-gray-100 pt-4">
              {formData.fitness_level}
            </div>
          </div>
        </StepCard>

        {/* STEP 3: TARGET & LOCATION */}
        <StepCard num={3} title="Target & Preferences" icon={Target} isActive={step === 3} isCompleted={step > 3}>
          <div className="space-y-6">
            
            {/* Goal Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">What is your main goal?</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(GOALS).map(([goal, Icon]) => (
                  <button 
                    key={goal}
                    className={`py-4 px-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-1 ${formData.goal === goal ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-red'}`}
                    onClick={() => handleUpdate('goal', goal)}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Where do you usually workout?</label>
              <div className="grid grid-cols-2 gap-3">
                {['Home', 'Gym'].map(loc => (
                  <button 
                    key={loc}
                    className={`py-4 px-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-1 ${formData.location === loc ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'}`}
                    onClick={() => handleUpdate('location', loc)}
                  >
                    <Dumbbell size={24} strokeWidth={2.5} />
                    {loc}
                  </button>
                ))}
              </div>
            </div>

             {/* Sessions Per Week Selector */}
             <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">Sessions per week?</label>
              <div className="flex justify-between gap-2">
                 {[3, 4, 5, 6].map(num => (
                   <button 
                    key={num}
                    className={`flex-1 py-3 rounded-full border-2 text-sm font-bold transition ${formData.sessions_per_week === num ? 'bg-brand-blueSolid text-white border-brand-blueSolid shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blueSolid'}`}
                    onClick={() => handleUpdate('sessions_per_week', num)}
                   >{num}x</button>
                 ))}
              </div>
            </div>
          </div>
        </StepCard>

        {/* STEP 4: BUSY TIME */}
        <StepCard num={4} title="Busy Time Configuration" icon={Calendar} isActive={step === 4} isCompleted={step > 4}>
          <p className="text-sm text-gray-500 mb-4">Select the days you are <span className='text-gray-800 font-semibold'>busy</span> and define the corresponding time slot. The AI must <span className='text-brand-red font-semibold'>NOT</span> schedule a workout during these times.</p>
          
          <div className="space-y-4">
              {ALL_DAYS.map((day) => {
                  const slots = formData.busy_slots[day] || [];
                  const isFullDay = formData.full_day_blocked[day];
                  const hasSlots = slots.length > 0;
                  
                  return (
                      <div 
                          key={day} 
                          className={`p-4 rounded-xl border transition-all ${isFullDay || hasSlots ? 'border-brand-red bg-red-50' : 'border-gray-200'}`}
                      >
                          <div className="flex items-center justify-between pb-2 border-b border-red-100/50">
                              {/* Day Checkbox */}
                              <label className="flex items-center space-x-3 cursor-pointer select-none">
                                  <input
                                      type="checkbox"
                                      checked={isFullDay || hasSlots}
                                      onChange={(e) => handleDayToggle(day, e.target.checked)}
                                      className="h-5 w-5 rounded-md border-gray-300 accent-brand-red focus:ring-brand-red"
                                  />
                                  <span className="font-bold text-gray-800">{day}</span>
                              </label>

                              {/* Full Day Checkbox */}
                              {(isFullDay || hasSlots) && (
                                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                                      <input
                                          type="checkbox"
                                          checked={isFullDay}
                                          onChange={(e) => handleFullDayBlock(day, e.target.checked)}
                                          className="h-4 w-4 rounded-sm border-gray-300 accent-gray-700 focus:ring-gray-700"
                                      />
                                      <span>Block Full Day</span>
                                  </label>
                              )}
                          </div>

                          {/* Multiple Slots Input */}
                          {hasSlots && !isFullDay && (
                              <div className="space-y-2 mt-3">
                                  {slots.map((slot) => (
                                      <div key={slot.id} className="flex gap-2 items-center p-2 bg-white rounded-lg border border-red-200">
                                          <Clock size={18} className="text-red-500 min-w-4" />
                                          <input
                                              type="time"
                                              value={slot.start_time}
                                              onChange={(e) => handleSlotChange(day, slot.id, 'start_time', e.target.value)}
                                              className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-red-500 text-sm"
                                          />
                                          <span className="text-gray-500">–</span>
                                          <input
                                              type="time"
                                              value={slot.end_time}
                                              onChange={(e) => handleSlotChange(day, slot.id, 'end_time', e.target.value)}
                                              className="w-full p-1 border-b border-gray-300 focus:outline-none focus:border-red-500 text-sm"
                                          />
                                          <button 
                                              onClick={() => handleRemoveSlot(day, slot.id)} 
                                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                              title="Remove Slot"
                                          >
                                              <Trash size={16} />
                                          </button>
                                      </div>
                                  ))}
                                  
                                  <button 
                                      onClick={() => handleAddSlot(day)} 
                                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-100/70 p-2 rounded-lg transition-colors border border-dashed border-red-300"
                                  >
                                      <Plus size={16} /> Add Time Slot
                                  </button>
                              </div>
                          )}
                          
                          {isFullDay && (
                              <div className="flex items-center gap-2 mt-3 p-3 bg-red-100 rounded-lg text-red-700 border border-red-300">
                                  <X size={18} className="min-w-4" />
                                  <span className="text-sm font-medium">Full day block active. AI will skip this day.</span>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
        </StepCard>

        {/* GENERATE BUTTON */}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-red text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-600 transition flex justify-center items-center gap-2 mt-12 transform hover:-translate-y-1 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : '✨ GENERATE JADWAL'}
        </button>

      </div>
    </div>
  );
}