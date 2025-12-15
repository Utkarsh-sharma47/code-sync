import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PROBLEMS } from '../data/problem';
import { getDifficultyBadgeClass } from '../lib/utils';
import Navbar from '../components/Navbar';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProblemPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Total');
  const problemList = Object.values(PROBLEMS);

  // Filter Logic
  const filteredProblems = selectedDifficulty === 'Total' 
    ? problemList 
    : problemList.filter(p => p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

  // Calculate Stats
  const totalProblems = problemList.length;
  const easyCount = problemList.filter(p => p.difficulty.toLowerCase() === 'easy').length;
  const mediumCount = problemList.filter(p => p.difficulty.toLowerCase() === 'medium').length;
  const hardCount = problemList.filter(p => p.difficulty.toLowerCase() === 'hard').length;

  // Stats Configuration
  const stats = [
    { 
        id: 'Total', 
        label: 'Total', 
        value: totalProblems, 
        color: 'text-white', 
        baseBorder: 'border-white/10',
        activeBorder: 'border-white ring-1 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        bg: 'bg-white/5' 
    },
    { 
        id: 'Easy', 
        label: 'Easy', 
        value: easyCount, 
        color: 'text-emerald-400', 
        baseBorder: 'border-emerald-500/20',
        activeBorder: 'border-emerald-500 ring-1 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        bg: 'bg-emerald-500/10' 
    },
    { 
        id: 'Medium', 
        label: 'Medium', 
        value: mediumCount, 
        color: 'text-yellow-400', 
        baseBorder: 'border-yellow-500/20',
        activeBorder: 'border-yellow-500 ring-1 ring-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
        bg: 'bg-yellow-500/10' 
    },
    { 
        id: 'Hard', 
        label: 'Hard', 
        value: hardCount, 
        color: 'text-red-400', 
        baseBorder: 'border-red-500/20',
        activeBorder: 'border-red-500 ring-1 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        bg: 'bg-red-500/10' 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30 relative overflow-hidden">
      
      <Navbar />

      {/* --- Background Ambient Glow Effects --- */}
      <div className="absolute top-0 left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-700" />

      <div className="relative z-10 pt-24 md:pt-32 pb-12 px-4 md:px-6 max-w-6xl mx-auto">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12 text-center md:text-left"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-purple-200 to-pink-200">
              Practice Problems
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
            Sharpen your coding skills with these curated challenges. Select a category below to filter.
          </p>
        </motion.div>

        {/* --- Stats Grid (Filters) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12"
        >
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => setSelectedDifficulty(stat.id)}
                    className={`
                        relative rounded-2xl p-4 md:p-6 backdrop-blur-sm text-center transition-all duration-300
                        ${stat.bg}
                        border
                        ${selectedDifficulty === stat.id ? stat.activeBorder : `${stat.baseBorder} hover:border-opacity-50`}
                        ${selectedDifficulty === stat.id ? 'scale-105' : 'hover:scale-105'}
                    `}
                >
                    <div className={`text-2xl md:text-3xl font-black ${stat.color} mb-1`}>
                        {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest">
                        {stat.label}
                    </div>
                </button>
            ))}
        </motion.div>

        {/* --- Problems List --- */}
        <motion.div 
          layout // Enables smooth layout animations when filtering
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProblems.map((problem) => (
                <motion.div 
                key={problem.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group"
                >
                <Link to={`/problem/${problem.id}`} className="block">
                    {/* Card Container */}
                    <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 md:p-6 transition-all duration-300 group-hover:border-pink-500/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                    
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Left: Content */}
                        <div className="flex items-start gap-4">
                            {/* Icon Box */}
                            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors duration-300 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>

                            <div className="min-w-0"> {/* min-w-0 ensures text truncation works if needed */}
                                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300 mb-2 truncate">
                                    {problem.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-400">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        problem.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                        problem.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                        'border-red-500/30 text-red-400 bg-red-500/10'
                                    }`}>
                                        {problem.difficulty}
                                    </span>
                                    <span className="hidden xs:inline text-slate-600">•</span>
                                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors text-xs md:text-sm">{problem.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Action Button */}
                        <div className="flex items-center justify-start md:justify-end mt-2 md:mt-0">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 border border-white/10 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-500 transition-all duration-300 text-sm font-semibold tracking-wide w-full md:w-auto justify-center md:justify-start">
                                Solve Problem
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                    </div>
                    </div>
                </Link>
                </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredProblems.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-slate-500"
            >
                No problems found for this difficulty.
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default ProblemPage;