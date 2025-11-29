import React from 'react';
import Navbar from '../components/Navbar';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Clock, Flame } from 'lucide-react';

export default function ScheduleResult() {
  const location = useLocation();
  const result = location.state?.result; // Ambil data dari state navigasi

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">No Data Found</h2>
        <Link to="/create" className="text-blue-500 underline">Create Schedule First</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header Motivation */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full text-green-600 mb-4">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Schedule Ready!</h1>
          <p className="text-lg text-gray-600 italic">"{result.motivation}"</p>
        </div>

        {/* List Jadwal */}
        <div className="space-y-4">
          {result.schedule.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border-l-4 border-brand-red shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-gray-400">{item.day}</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{item.muscle_group}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.exercise_name}</h3>
              
              <div className="flex gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={16} /> {item.time} ({item.duration} mins)
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={16} /> Moderate Intensity
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                <strong>💡 AI Tip:</strong> {item.tips}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
           <Link to="/create" className="text-gray-500 hover:text-gray-900 font-medium">Generate Again</Link>
        </div>
      </div>
    </div>
  );
}
