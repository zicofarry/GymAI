import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // <--- IMPORT BARU: Untuk render Markdown
import { 
    User, TrendingUp, Activity, MapPin, Save, 
    Dumbbell, Flame, Clock, CalendarDays, History, 
    Sparkles, BrainCircuit, Loader2, X, ArrowLeft, ArrowRight,
    AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// --- MODAL COMPONENTS (TANPA PERUBAHAN) ---

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

// --- MODIFIED: AnalysisModal dengan React Markdown ---
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
            
            {/* BAGIAN INI DIUPDATE: Menggunakan ReactMarkdown dan styling prose */}
            <div className="p-6 overflow-y-auto text-gray-600 leading-relaxed">
                <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-bold prose-headings:text-gray-800 prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-4 prose-li:my-1">
                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
                <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">Got it!</button>
            </div>
        </div>
    </div>
);

const HistoryLogModal = ({ onClose, fetchLogsByDate, loadingLogs, logsForSelectedDate, selectedDate, setSelectedDate }) => {
    // State untuk mengontrol bulan yang sedang dilihat di kalender
    const [currentView, setCurrentView] = useState(new Date(selectedDate));
    const today = new Date();

    // FIX BUG: Fungsi untuk format tanggal YYYY-MM-DD menggunakan komponen lokal
    const formatDate = (date) => {
        const year = date.getFullYear();
        // getMonth() is 0-indexed, so add 1
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fungsi untuk mendapatkan hari-hari dalam bulan yang sedang dilihat
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        
        // FIX BUG: Gunakan .setHours(12) untuk menghindari masalah DST/timezone
        const lastDayOfMonth = new Date(year, month + 1, 0); 
        lastDayOfMonth.setHours(12);

        // Dapatkan hari dalam seminggu untuk hari pertama (0=Minggu, 1=Senin, ...)
        const startDayOfWeek = firstDayOfMonth.getDay(); 

        const days = [];
        
        // Tambahkan placeholder untuk hari-hari sebelum tanggal 1
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: null, isCurrentMonth: false });
        }

        // Tambahkan hari-hari dalam bulan
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            // FIX BUG: Buat tanggal dengan jam 12 siang lokal untuk menghindari shift
            const dayDate = new Date(year, month, i);
            dayDate.setHours(12);

            days.push({ 
                date: formatDate(dayDate), 
                dayNum: i,
                isCurrentMonth: true 
            });
        }
        return days;
    };

    // Handler Navigasi Bulan
    const goToPreviousMonth = () => {
        setCurrentView(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            return newDate;
        });
    };

    const goToNextMonth = () => {
        setCurrentView(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            return newDate;
        });
    };
    
    // Render Kalender
    const CalendarGrid = () => {
        const days = getDaysInMonth(currentView);
        // Day Names: Minggu = 0, Sabtu = 6
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const todayISO = formatDate(today);
        
        // HITUNG INDEX HARI YANG DIPILIH (0=Minggu, 6=Sabtu)
        // Gunakan new Date() dari selectedDate, karena selectedDate adalah string ISO YYYY-MM-DD
        const selectedDateObject = new Date(selectedDate + 'T00:00:00'); 
        const selectedDayIndex = selectedDateObject.getDay();


        const handleDayClick = (dayDate) => {
            if (!dayDate) return;
            setSelectedDate(dayDate);
            fetchLogsByDate(dayDate);
        };
        
        const isCurrentMonthView = currentView.getMonth() === today.getMonth() && currentView.getFullYear() === today.getFullYear();
        
        // Cek apakah bulan yang ditampilkan adalah bulan di masa depan
        const isFutureMonth = currentView.getFullYear() > today.getFullYear() || 
                              (currentView.getFullYear() === today.getFullYear() && currentView.getMonth() > today.getMonth());

        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"> 
                {/* Header Navigasi Bulan */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition">
                        <ChevronLeft size={20} />
                    </button>
                    <h4 className="font-bold text-gray-900 text-lg">
                        {currentView.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button 
                        onClick={goToNextMonth} 
                        disabled={isFutureMonth}
                        className={`p-2 rounded-full transition ${isFutureMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Day Names (Min-Sab) - Perataan (Alignment Fix) dan Highlight Hari Terpilih */}
                <div className="grid grid-cols-7 text-center text-xs font-bold uppercase mb-2">
                    {dayNames.map((name, index) => (
                        <span 
                            key={index} 
                            className={`h-8 w-8 flex items-center justify-center mx-auto transition-colors ${
                                // FIX: Highlight nama hari yang sesuai dengan selectedDayIndex
                                index === selectedDayIndex ? 'text-brand-red' : 'text-gray-500'
                            }`}
                        >
                            {name}
                        </span>
                    ))}
                </div>

                {/* Days Grid - Mengubah ukuran tombol dan pewarnaan */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((day, index) => {
                        if (!day.isCurrentMonth) {
                            return <span key={index} className="h-8"></span>;
                        }

                        const isSelected = day.date === selectedDate;
                        const isToday = day.date === todayISO; 
                        
                        // Cek apakah hari yang ditampilkan adalah hari di masa depan
                        const isFuture = day.date > todayISO; 

                        return (
                            <button
                                key={index}
                                onClick={() => handleDayClick(day.date)}
                                disabled={isFuture}
                                // Ubah ukuran tombol dan styling untuk active day
                                className={`h-8 w-8 flex items-center justify-center text-sm font-medium transition-all duration-200 rounded-full mx-auto
                                    ${isFuture 
                                        ? 'text-gray-300 cursor-not-allowed' // Disabled/Future
                                        : isSelected // Selected Day
                                            ? 'bg-brand-red text-white shadow-lg shadow-red-500/30'
                                            : isToday // Current Day (if not selected)
                                                ? 'bg-red-100 text-brand-red border border-brand-red/50 hover:bg-red-200' 
                                                : 'text-gray-700 hover:bg-gray-100' // Normal Day
                                    }
                                `}
                            >
                                {day.dayNum}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };


    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space animate-fadeIn">
            {/* Menggunakan max-w-md agar modal lebih ramping */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border-2 border-brand-red/20 relative flex flex-col max-h-[90vh]"> 
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 text-brand-red">
                        <History size={28} />
                        <h3 className="text-2xl font-bold text-gray-900">Full Activity Log</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition"><X size={24} /></button>
                </div>
                
                {/* Custom Calendar Picker */}
                <div className="p-4 border-b border-gray-100"> {/* Mengurangi padding atas/bawah */}
                    <CalendarGrid />
                </div>

                <div className="p-6 overflow-y-auto bg-gray-50 space-y-3 flex-1">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Aktivitas pada {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>

                    {loadingLogs ? (
                        <p className="text-center text-gray-400 py-8 flex items-center justify-center gap-2">
                             <Loader2 size={24} className="animate-spin text-brand-red" /> Memuat log harian...
                        </p>
                    ) : logsForSelectedDate.length === 0 ? (
                        <div className="text-center text-gray-400 py-8 bg-white rounded-xl border border-dashed border-gray-200">
                             <Dumbbell className="mx-auto text-gray-300 mb-2" size={32} />
                            <p>Tidak ada aktivitas yang tercatat pada tanggal ini.</p>
                        </div>
                    ) : (
                        logsForSelectedDate.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:ring-1 hover:ring-brand-red/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-2 rounded-lg text-brand-red">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{log.exercise_name}</h4>
                                        <p className="text-xs text-gray-500 font-medium">Pukul: {log.date.split(' ')[1]}</p>
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
                <div className="p-6 pt-4 border-t border-gray-100 shrink-0 bg-white rounded-b-3xl">
                    <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg">TUTUP</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT (Memperbarui Logic State) ---

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  // State untuk menyimpan konten modal error secara dinamis
  const [failureModalContent, setFailureModalContent] = useState({ title: '', message: '' }); 
  
  // AI & Features States
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  
  // --- STATE BARU ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // Default to today's date in YYYY-MM-DD format (menggunakan fungsi Date object untuk inisialisasi)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0].slice(0, 10)); // Safe initialization
  const [logsForSelectedDate, setLogsForSelectedDate] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  // --------------------

  // Edit Data State
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- FUNGSI BARU: Mengambil Log Berdasarkan Tanggal dari Backend ---
  const fetchLogsByDate = async (dateParam) => {
    setLoadingLogs(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) { 
            navigate('/login'); 
            return; 
        }

        // Panggil endpoint baru di Backend
        const res = await axios.get(`${API_BASE_URL}/users/logs?date_str=${dateParam}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setLogsForSelectedDate(res.data);
    } catch (error) {
        console.error("Gagal mengambil log:", error);
        setLogsForSelectedDate([]);
        if (error.response?.status === 401) {
             navigate('/login'); 
        }
    } finally {
        setLoadingLogs(false);
    }
  };


  const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const res = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setUser(res.data);
        // Memastikan editData memiliki semua field yang diperlukan oleh backend
        setEditData({
            weight: res.data.weight,
            height: res.data.height,
            goal: res.data.goal,
            location: res.data.location,
            fitness_level: res.data.fitness_level,
            sessions_per_week: 3, // Default value, should be handled by backend or fetched if needed
            preferred_workout_time: 'Anytime',
            busy_times: [], // Placeholder for API requirement
            injuries: [] // Placeholder for API requirement
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
            // Tambahkan field yang mungkin hilang tapi dibutuhkan API PUT (UserUpdateInput)
            sessions_per_week: editData.sessions_per_week || 3,
            preferred_workout_time: editData.preferred_workout_time || 'Anytime',
            busy_times: editData.busy_times || [],
            injuries: editData.injuries || [],
        };
        await axios.put(`${API_BASE_URL}/users/me`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsEditing(false);
        fetchProfile();
        setShowSuccessModal(true);
    } catch (error) {
        // Ganti alert: Set konten dan tampilkan modal
        setFailureModalContent({
            title: "Update Profile Failed",
            message: error.response?.data?.detail || "Gagal memperbarui data profil. Cek input atau server."
        });
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
          // Ganti alert: Set konten dan tampilkan modal
          console.error("Gagal melakukan analisis:", error);
          setFailureModalContent({
              title: "AI Analysis Failed",
              message: error.response?.data?.detail || "Gagal terhubung ke server/Gemini API. Cek koneksi backend."
          });
          setShowFailureModal(true);
      } finally {
          setAnalyzing(false);
      }
  };

  // --- FUNGSI BARU: Untuk membuka modal dan inisialisasi tanggal/log ---
  const handleOpenHistoryModal = () => {
    // 1. Set default tanggal ke hari ini
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    
    setSelectedDate(todayISO);
    
    // 2. Muat log untuk hari ini
    fetchLogsByDate(todayISO);
    
    // 3. Buka modal
    setShowHistoryModal(true);
  };
  // ---------------------------------------------------------------------


  if (loading || !user) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-brand-red" size={48}/></div>;

  return (
    <div className="min-h-screen pb-20 font-space relative overflow-hidden">
      <Navbar />
      
      {/* MODALS */}
      {/* DIUPDATE: Menampilkan modal analisis dengan Markdown */}
      {suggestion && <AnalysisModal suggestion={suggestion} onClose={() => setSuggestion(null)} />}
      
      {/* MENGGUNAKAN HistoryLogModal BARU */}
      {showHistoryModal && (
        <HistoryLogModal 
            onClose={() => setShowHistoryModal(false)}
            fetchLogsByDate={fetchLogsByDate}
            loadingLogs={loadingLogs}
            logsForSelectedDate={logsForSelectedDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
        />
      )}

      {/* RENDER DYNAMIC FAILURE MODAL */}
      {showFailureModal && (
        <FailureModal 
            title={failureModalContent.title} 
            message={failureModalContent.message} 
            onClose={() => setShowFailureModal(false)} 
        />
      )}

      {showSuccessModal && <SuccessModal message="Profile updated successfully!" onClose={() => setShowSuccessModal(false)} />}
      

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
                    
                    {/* MODIFIED: Menggunakan ReactMarkdown untuk Weekly Summary */}
                    {/* Kita tambahkan custom styling untuk elemen markdown agar kontras dengan background gelap */}
                    <div className="text-gray-300 text-sm leading-relaxed relative z-10 italic">
                        <ReactMarkdown 
                            components={{
                                // Override styling agar bold text terlihat kuning terang (senada icon)
                                strong: ({node, ...props}) => <span className="text-yellow-400 font-bold" {...props} />,
                                // Pastikan paragraf punya margin bottom
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                // Styling untuk list jika AI memberikan poin-poin
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                                li: ({node, ...props}) => <li className="my-0.5" {...props} />
                            }}
                        >
                            {user.weekly_report_text}
                        </ReactMarkdown>
                    </div>
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
                            onClick={handleOpenHistoryModal}
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