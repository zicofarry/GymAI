import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-[#FAFAFA] font-space overflow-hidden flex flex-col items-center justify-center selection:bg-brand-red selection:text-white">
      
      {/* --- BACKGROUND LAYER --- */}
      
      {/* 1. Static Noise */}
      <div className="bg-noise z-0"></div>

      {/* 2. Aurora Blobs (Lebih Vivid & Besar) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
      <div className="absolute top-[10%] right-[-20%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[50vw] h-[50vw] bg-red-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>

      {/* 3. MOVING GRID (No Spotlight, Just Flow) */}
      {/* Grid ini bergerak diagonal pelan-pelan selamanya */}
      <div className="absolute inset-0 bg-animated-grid animate-grid-flow z-0 pointer-events-none" />

      {/* Fade out grid di bagian bawah agar smooth ke footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-0 pointer-events-none" />


      {/* --- CONTENT LAYER --- */}
      <Navbar />
      
      <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto mt-8">
        
        {/* Floating Icons: FLAT & CLEAN (No Tilt) */}
        <div className="absolute top-0 -left-12 md:-left-32 animate-float hidden md:block">
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
                <Zap size={32} className="text-yellow-500 fill-yellow-500/20" />
            </div>
        </div>
        <div className="absolute bottom-20 -right-12 md:-right-32 animate-float-delayed hidden md:block">
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
                <Target size={32} className="text-brand-red" />
            </div>
        </div>

        {/* HEADLINE */}
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-[1.05] mb-8 drop-shadow-sm">
          Smart Workouts,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-red-500 to-purple-600 animate-text-shimmer bg-[length:200%_auto]">
            Simpler Life.
          </span>
        </h1>

        <p className="text-base md:text-xl text-gray-500 max-w-xl font-normal leading-relaxed mb-12">
          GymAI builds your perfect schedule instantly based on your body profile and goals. <span className="text-gray-900 font-medium">No guessing, just results.</span>
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
                to="/create"
                className="group relative bg-gray-900 text-white text-base font-bold py-4 px-10 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-gray-900/20"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <div className="flex items-center gap-2 relative z-10">
                    Generate Plan <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
            
            <button className="px-10 py-4 rounded-full text-gray-600 font-bold border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-all bg-white/50 hover:bg-white text-base">
                View Demo
            </button>
        </div>

      </main>

      {/* Footer Minimalis */}
      <div className="absolute bottom-8 flex flex-col items-center gap-3 opacity-40">
         <div className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase cursor-default select-none">
            Scroll Less • Lift More
         </div>
      </div>
    </div>
  );
}