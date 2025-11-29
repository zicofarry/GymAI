import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Activity, Target, Calendar, Check, X, Clock, Plus, Trash, 
    Weight, Ruler, Dumbbell, Zap, TrendingUp, Heart, Armchair,
    ShieldAlert, Sun, Moon, Sunrise, Sunset
} from 'lucide-react';

// --- UTILS & CONSTANTS ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];

const GOALS = {
    'Muscle Gain': TrendingUp,
    'Fat Loss': Zap,
    'Stay Healthy': Heart,
    'Flexibility': Armchair
};

const INJURY_OPTIONS = [
    'Shoulders', 'Legs', 'Back', 'Chest', 'Arms', 'Core', 'Cardio'
];

const TIME_PREFERENCES = [
    { label: 'Morning', icon: Sunrise, desc: '06:00 - 11:00' },
    { label: 'Afternoon', icon: Sun, desc: '11:00 - 16:00' },
    { label: 'Evening', icon: Sunset, desc: '16:00 - 20:00' },
    { label: 'Night', icon: Moon, desc: '20:00+' },
    { label: 'Anytime', icon: Clock, desc: 'Flexible' },
];

// Initial Helpers
const getInitialBusySlots = () => ALL_DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
const getInitialFullDayBlocked = () => ALL_DAYS.reduce((acc, day) => ({ ...acc, [day]: false }), {});

// --- COMPONENT STEP CARD (UI) ---
const StepCard = ({ num, title, currentStep, setStep, icon: Icon, isActive, isCompleted, canAdvance, handleNextStep, children }) => {
    const isLocked = num > currentStep && !isCompleted;
    
    return (
      <div className="flex">
        {/* Timeline */}
        <div className="flex flex-col items-center mr-4 md:mr-6">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10 shadow-lg ${
              isActive ? 'bg-brand-red text-white ring-4 ring-red-500/30' : 
              isCompleted ? 'bg-green-500 text-white shadow-xl' : 
              'bg-white text-gray-500 border-2 border-gray-200'
            }`}>
              {isCompleted ? <Check size={18} /> : num}
            </span>
            {num < 5 && ( // Updated: Ada 5 step sekarang
                <div className={`w-1 flex-grow transition-colors duration-500 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
            )}
        </div>

        {/* Card Content */}
        <div className="flex-grow">
          <div 
            className={`bg-white p-6 rounded-3xl shadow-sm w-full mb-8 transition-all duration-300 border-2 ${
              isLocked ? 'border-gray-100 opacity-50 cursor-not-allowed' : 
              isActive ? 'border-gray-900 ring-1 ring-gray-900/5 shadow-xl' : 
              'border-gray-100 hover:shadow-md cursor-pointer'
            }`}
            onClick={() => !isLocked && setStep(num)}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon className={isActive ? "text-brand-red" : isCompleted ? "text-green-500" : "text-gray-400"} size={24} /> 
              <span className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
            </div>
            
            {isActive && 
              <div className="pt-4 border-t border-gray-100 animate-fadeIn">
                {children}
                {num < 5 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNextStep(num); }} 
                    disabled={!canAdvance(num)}
                    className={`w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
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

// --- MAIN COMPONENT ---
export default function CreateSchedule() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    weight: '', height: '', 
    fitness_level: 'Beginner',
    goal: 'Muscle Gain',
    location: 'Home',
    sessions_per_week: 3,
    
    // NEW FIELDS
    preferred_workout_time: 'Anytime',
    injuries: [], // Array string

    busy_slots: getInitialBusySlots(), 
    full_day_blocked: getInitialFullDayBlocked(),
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { alert("Login required!"); navigate('/login'); }
  }, [navigate]);

  const handleUpdate = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Logic Toggle Injury (Array)
  const toggleInjury = (injury) => {
      setFormData(prev => {
          const exists = prev.injuries.includes(injury);
          return {
              ...prev,
              injuries: exists 
                ? prev.injuries.filter(i => i !== injury) 
                : [...prev.injuries, injury]
          };
      });
  };

  // --- VALIDATION ---
  const checkCanAdvance = (currentStep) => {
    if (currentStep === 1) {
      const w = parseFloat(formData.weight);
      const h = parseInt(formData.height);
      return !isNaN(w) && w > 0 && !isNaN(h) && h > 0;
    }
    return true; 
  };

  const handleNextStep = (num) => {
      if (checkCanAdvance(num)) {
          setStep(num + 1);
      } else {
          alert("Mohon lengkapi data profil.");
      }
  };

  // --- BUSY SLOTS LOGIC (Sama seperti sebelumnya) ---
  const handleSlotChange = (day, slotId, field, value) => {
      setFormData(prev => ({
          ...prev,
          busy_slots: {
              ...prev.busy_slots,
              [day]: prev.busy_slots[day].map(slot => slot.id === slotId ? { ...slot, [field]: value } : slot)
          }
      }));
  };
  const handleAddSlot = (day) => {
      if (formData.full_day_blocked[day]) return;
      setFormData(prev => ({
          ...prev,
          busy_slots: { ...prev.busy_slots, [day]: [...prev.busy_slots[day], { id: generateId(), start_time: "08:00", end_time: "10:00" }] }
      }));
  };
  const handleRemoveSlot = (day, slotId) => {
      setFormData(prev => ({
          ...prev,
          busy_slots: { ...prev.busy_slots, [day]: prev.busy_slots[day].filter(slot => slot.id !== slotId) }
      }));
  };
  const handleFullDayBlock = (day, isChecked) => {
      setFormData(prev => ({
          ...prev,
          full_day_blocked: { ...prev.full_day_blocked, [day]: isChecked },
          busy_slots: { ...prev.busy_slots, [day]: isChecked ? [] : (prev.busy_slots[day].length === 0 ? [{ id: generateId(), start_time: "08:00", end_time: "10:00" }] : prev.busy_slots[day]) }
      }));
  };
  const handleDayToggle = (day, isChecked) => {
      if (isChecked) { handleFullDayBlock(day, false); handleAddSlot(day); } 
      else { handleFullDayBlock(day, false); setFormData(prev => ({ ...prev, busy_slots: { ...prev.busy_slots, [day]: [] } })); }
  }

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!checkCanAdvance(1)) return setStep(1);
    
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
        let finalBusyTimes = [];
        ALL_DAYS.forEach(day => {
            const isFullDay = formData.full_day_blocked[day];
            const slots = formData.busy_slots[day];
            if (isFullDay) {
                finalBusyTimes.push({ day, is_full_day: true, start_time: null, end_time: null });
            } else if (slots.length > 0) {
                slots.forEach(slot => {
                    finalBusyTimes.push({
                        day, is_full_day: false,
                        start_time: slot.start_time.length === 5 ? slot.start_time + ":00" : slot.start_time,
                        end_time: slot.end_time.length === 5 ? slot.end_time + ":00" : slot.end_time
                    });
                });
            }
        });

        const payload = {
            weight: parseFloat(formData.weight),
            height: parseInt(formData.height),
            fitness_level: formData.fitness_level,
            goal: formData.goal,
            location: formData.location,
            sessions_per_week: parseInt(formData.sessions_per_week),
            
            // Field Baru
            preferred_workout_time: formData.preferred_workout_time,
            injuries: formData.injuries,
            
            busy_times: finalBusyTimes
        };

        const response = await axios.post(
            'http://127.0.0.1:8000/api/v1/schedules/generate', payload, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        navigate('/result', { state: { result: response.data } });

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.detail || "Gagal menghubungi server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-10 pt-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Create Your <span className="text-brand-red">Plan</span></h2>
          <p className="text-gray-500 mt-2 font-medium">Personalized for your body and time.</p>
        </div>

        {/* STEP 1 */}
        <StepCard num={1} title="Body Metrics" icon={Weight} currentStep={step} setStep={setStep} isActive={step === 1} isCompleted={step > 1} canAdvance={checkCanAdvance} handleNextStep={handleNextStep}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
              <input type="number" className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-lg focus:outline-none focus:border-brand-blueSolid" placeholder="0" value={formData.weight} onChange={(e) => handleUpdate('weight', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Height (cm)</label>
              <input type="number" className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-lg focus:outline-none focus:border-brand-blueSolid" placeholder="0" value={formData.height} onChange={(e) => handleUpdate('height', e.target.value)} />
            </div>
          </div>
        </StepCard>

        {/* STEP 2 */}
        <StepCard num={2} title="Experience Level" icon={Activity} currentStep={step} setStep={setStep} isActive={step === 2} isCompleted={step > 2} canAdvance={checkCanAdvance} handleNextStep={handleNextStep}>
          <div>
            <input type="range" min="0" max="3" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red" value={FITNESS_LEVELS.indexOf(formData.fitness_level)} onChange={(e) => handleUpdate('fitness_level', FITNESS_LEVELS[e.target.value])} />
            <div className="flex justify-between text-xs font-bold text-gray-400 mt-3 uppercase"><span>Beginner</span><span>Inter</span><span>Advanced</span><span>Athlete</span></div>
            <div className="mt-4 text-center"><span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-bold">{formData.fitness_level}</span></div>
          </div>
        </StepCard>

        {/* STEP 3 */}
        <StepCard num={3} title="Goals & Logistics" icon={Target} currentStep={step} setStep={setStep} isActive={step === 3} isCompleted={step > 3} canAdvance={checkCanAdvance} handleNextStep={handleNextStep}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Goal</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(GOALS).map(([goal, Icon]) => (
                  <button key={goal} className={`p-4 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-2 ${formData.goal === goal ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-500 border-gray-100 hover:border-red-200'}`} onClick={() => handleUpdate('goal', goal)}><Icon size={24} />{goal}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Location</label>
              <div className="flex gap-3">
                {['Home', 'Gym'].map(loc => (
                  <button key={loc} className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold transition ${formData.location === loc ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-900'}`} onClick={() => handleUpdate('location', loc)}>{loc}</button>
                ))}
              </div>
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Frequency</label>
              <div className="flex justify-between gap-2 bg-gray-100 p-1 rounded-xl">
                 {[3, 4, 5, 6].map(num => (
                   <button key={num} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${formData.sessions_per_week === num ? 'bg-white text-brand-blueSolid shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} onClick={() => handleUpdate('sessions_per_week', num)}>{num}x</button>
                 ))}
              </div>
            </div>
          </div>
        </StepCard>

        {/* STEP 4 (BARU): SAFETY & PREFERENCES */}
        <StepCard num={4} title="Safety & Timing" icon={ShieldAlert} currentStep={step} setStep={setStep} isActive={step === 4} isCompleted={step > 4} canAdvance={checkCanAdvance} handleNextStep={handleNextStep}>
            <div className="space-y-6">
                
                {/* INJURIES */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        Any Injuries? <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {INJURY_OPTIONS.map(injury => {
                            const isSelected = formData.injuries.includes(injury);
                            return (
                                <button
                                    key={injury}
                                    onClick={() => toggleInjury(injury)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                                        isSelected 
                                        ? 'bg-red-100 text-red-600 border-red-200' 
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    {injury} {isSelected && <X size={14} className="inline ml-1"/>}
                                </button>
                            );
                        })}
                    </div>
                    {formData.injuries.length > 0 && (
                        <p className="mt-2 text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg inline-block">
                            ⚠️ We will exclude exercises involving these muscles.
                        </p>
                    )}
                </div>

                {/* TIME PREFERENCE */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Workout Time</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TIME_PREFERENCES.map((pref) => (
                            <button
                                key={pref.label}
                                onClick={() => handleUpdate('preferred_workout_time', pref.label)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                    formData.preferred_workout_time === pref.label
                                    ? 'border-brand-blueSolid bg-blue-50 ring-1 ring-blue-200'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${formData.preferred_workout_time === pref.label ? 'bg-brand-blueSolid text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <pref.icon size={20} />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${formData.preferred_workout_time === pref.label ? 'text-blue-900' : 'text-gray-700'}`}>{pref.label}</div>
                                    <div className="text-xs text-gray-400">{pref.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepCard>

        {/* STEP 5: BUSY TIME (Digeser jadi Step 5) */}
        <StepCard num={5} title="Busy Schedule" icon={Calendar} currentStep={step} setStep={setStep} isActive={step === 5} isCompleted={step > 5} canAdvance={checkCanAdvance} handleNextStep={handleNextStep}>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6 text-yellow-800 text-sm">
             <strong>Instruction:</strong> Mark when you <u>cannot</u> workout.
          </div>
          
          <div className="space-y-3">
              {ALL_DAYS.map((day) => {
                  const slots = formData.busy_slots[day] || [];
                  const isFullDay = formData.full_day_blocked[day];
                  const hasSlots = slots.length > 0;
                  
                  return (
                      <div key={day} className={`p-4 rounded-xl border-2 transition-all ${isFullDay || hasSlots ? 'border-red-100 bg-white shadow-sm' : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-3 cursor-pointer select-none">
                                  <input type="checkbox" checked={isFullDay || hasSlots} onChange={(e) => handleDayToggle(day, e.target.checked)} className="w-5 h-5 rounded border-gray-300 accent-brand-red" />
                                  <span className={`font-bold ${isFullDay || hasSlots ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                              </label>
                              {(isFullDay || hasSlots) && (
                                  <label className="flex items-center space-x-2 text-xs font-bold text-gray-500 cursor-pointer bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition">
                                      <input type="checkbox" checked={isFullDay} onChange={(e) => handleFullDayBlock(day, e.target.checked)} className="accent-gray-900" />
                                      <span>FULL DAY</span>
                                  </label>
                              )}
                          </div>
                          {hasSlots && !isFullDay && (
                              <div className="mt-4 pl-8 space-y-2">
                                  {slots.map((slot) => (
                                      <div key={slot.id} className="flex gap-2 items-center">
                                          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg flex-1">
                                              <input type="time" value={slot.start_time} onChange={(e) => handleSlotChange(day, slot.id, 'start_time', e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none w-full" />
                                              <span className="text-gray-300">to</span>
                                              <input type="time" value={slot.end_time} onChange={(e) => handleSlotChange(day, slot.id, 'end_time', e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none w-full text-right" />
                                          </div>
                                          <button onClick={() => handleRemoveSlot(day, slot.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash size={16} /></button>
                                      </div>
                                  ))}
                                  <button onClick={() => handleAddSlot(day)} className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline mt-2"><Plus size={14} /> Add slot</button>
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
          className="w-full bg-gray-900 text-white text-xl font-bold py-5 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] transition transform flex justify-center items-center gap-3 mt-8 disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? 'AI is Thinking...' : '✨ GENERATE MY PLAN'}
        </button>

      </div>
    </div>
  );
}