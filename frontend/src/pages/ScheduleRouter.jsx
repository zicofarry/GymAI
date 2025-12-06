import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Tambahkan Link
import { api } from '../config/api';
import { Loader2, AlertTriangle, X } from 'lucide-react'; // Tambahkan AlertTriangle dan X


// --- MODAL KEGAGALAN/INFO (REUSABLE, DIADAPTASI) ---
const FailureModal = ({ title, message, onClose, actionButton, actionLink }) => (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-space transition-opacity duration-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center border-2 border-red-200 ring-4 ring-red-500/20 transform scale-105">
            <AlertTriangle size={48} className="text-brand-red mx-auto mb-4" strokeWidth={2.5}/>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {actionButton && (
                <Link 
                    to={actionLink || '/'}
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


const ScheduleRouter = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    // State baru untuk mengontrol modal error
    const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '', actionLink: null }); 

    // Handler umum untuk error, sekaligus mengarahkan ke Home
    const handleGeneralError = () => {
        setErrorModal({ show: false, title: '', message: '', actionLink: null });
        navigate('/', { replace: true });
    }

    useEffect(() => {
        if (!token) {
            // Jika belum login, redirect ke /create (modal auth akan muncul di sana)
            navigate('/create', { replace: true }); 
            return;
        }

        const fetchScheduleExistence = async () => {
            try {
                // Cek apakah ada jadwal aktif (jika 200 OK -> jadwal ada)
                await api.get(`/schedules/my-schedule`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Jadwal Ditemukan -> Langsung tampilkan hasil
                navigate('/result', { replace: true });

            } catch (error) {
                // 404: Jadwal belum ada -> Arahkan ke buat jadwal
                if (error.response && error.response.status === 404) {
                    navigate('/create', { replace: true });
                } 
                // 401: Token invalid/expired -> Login
                else if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/login', { replace: true });
                }
                // Error lainnya -> Ganti alert dengan modal
                else {
                    console.error("Error fetching schedule:", error.response || error);
                    
                    setErrorModal({
                        show: true,
                        title: "Server Connection Error",
                        message: "Gagal terhubung ke server untuk cek jadwal. Pastikan backend berjalan dan coba lagi.",
                        actionLink: "/"
                    });
                }
            }
        };

        fetchScheduleExistence();
    }, [token, navigate]);

    // Render Modal jika ada Error umum
    if (errorModal.show) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <FailureModal 
                    title={errorModal.title}
                    message={errorModal.message}
                    onClose={handleGeneralError} // Gunakan handler yang akan navigate ke home
                    actionButton="Go Home"
                    actionLink={errorModal.actionLink}
                />
            </div>
        );
    }

    // Tampilan loading minimalis yang cepat
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-space">
            <div className="flex items-center text-gray-700 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <Loader2 className="animate-spin text-brand-red h-5 w-5 mr-2" />
                <p>Checking your active plan...</p>
            </div>
        </div>
    );
};

export default ScheduleRouter;