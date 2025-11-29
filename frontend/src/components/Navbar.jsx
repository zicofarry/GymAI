import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-brand-red p-2 rounded-lg text-white">
          <Dumbbell size={24} />
        </div>
        <span className="text-2xl font-bold italic tracking-tighter text-gray-800">
          GYM<span className="text-brand-red">AI</span>
        </span>
      </Link>
      
      <div className="hidden md:flex gap-8 font-medium text-gray-600">
        <Link to="/" className="hover:text-brand-red transition">Home</Link>
        <Link to="/create" className="hover:text-brand-red transition">Schedule</Link>
        <Link to="#" className="hover:text-brand-red transition">Progress</Link>
      </div>
    </nav>
  );
}
