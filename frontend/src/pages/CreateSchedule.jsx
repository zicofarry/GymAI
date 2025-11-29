import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-50px]">
        {/* Badge */}
        <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
          <Rocket size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold tracking-wide">AI-POWERED SCHEDULER</span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-2 tracking-tight">
          GYM<span className="text-brand-red">AI</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl font-light leading-relaxed mb-10">
          Stop guessing your workouts. Input your details and let AI build the 
          <span className="font-semibold text-gray-800"> perfect schedule</span> for you.
        </p>

        {/* CTA Button */}
        <Link 
          to="/create"
          className="bg-brand-blueSolid hover:bg-blue-400 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-2"
        >
          GENERATE PLAN ➜
        </Link>
      </main>
    </div>
  );
}
