import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Base URL Hardcoded (Ganti jika menggunakan instance axios terpusat)
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const ScheduleRouter = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            // Jika belum login, redirect ke /create (modal auth akan muncul di sana)
            navigate('/create', { replace: true }); 
            return;
        }

        const fetchScheduleExistence = async () => {
            try {
                // Cek apakah ada jadwal aktif (jika 200 OK -> jadwal ada)
                await axios.get(`${API_BASE_URL}/schedules/my-schedule`, {
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
                // Error lainnya
                else {
                    console.error("Error fetching schedule:", error.response || error);
                    alert("Gagal terhubung ke server untuk cek jadwal.");
                    navigate('/', { replace: true });
                }
            }
        };

        fetchScheduleExistence();
    }, [token, navigate]);

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