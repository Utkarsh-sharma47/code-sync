import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PROBLEMS } from '../data/problem';
import Navbar from '../components/Navbar';
import { Code2, Zap, Trophy, Activity, Flame, Layers } from 'lucide-react';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
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

  // Stats Configuration (Colors Preserved)
  const stats = [
    { 
        id: 'Total', 
        label: 'Total', 
        value: totalProblems, 
        icon: <Layers size={18} />,
        color: 'text-white', 
        bg: 'bg-white/5',
        border: 'border-white/10',
        activeBorder: 'border-white ring-1 ring-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    { 
        id: 'Easy', 
        label: 'Easy', 
        value: easyCount, 
        icon: <Zap size={18} />,
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/20',
        activeBorder: 'border-emerald-500 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    },
    { 
        id: 'Medium', 
        label: 'Medium', 
        value: mediumCount, 
        icon: <Activity size={18} />,
        color: 'text-yellow-400', 
        bg: 'bg-yellow-500/5',
        border: 'border-yellow-500/20',
        activeBorder: 'border-yellow-500 ring-1 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
    },
    { 
        id: 'Hard', 
        label: 'Hard', 
        value: hardCount, 
        icon: <Flame size={18} />,
        color: 'text-red-400', 
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        activeBorder: 'border-red-500 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
    }
  ];

  return (
    // MAIN CONTAINER: Deep Black Background
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500/30 relative overflow-hidden">
      
      <Navbar />

      {/* --- NEON AMBIENT BACKGROUNDS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
              Practice Problems
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto md:mx-0">
            Sharpen your coding skills with these curated challenges.
          </p>
        </motion.div>

        {/* --- Stats Grid (Filters) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => setSelectedDifficulty(stat.id)}
                    className={`
                        relative rounded-2xl p-5 backdrop-blur-md text-center transition-all duration-300
                        border flex flex-col items-center justify-center gap-2 group
                        ${stat.bg}
                        ${selectedDifficulty === stat.id ? stat.activeBorder : `${stat.border} hover:border-opacity-100 hover:scale-[1.02]`}
                    `}
                >
                    <div className={`p-2 rounded-full ${stat.bg} ${stat.color} border ${stat.border}`}>
                        {stat.icon}
                    </div>
                    <div>
                        <div className={`text-3xl font-black ${stat.color} leading-none`}>
                            {stat.value}
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {stat.label}
                        </div>
                    </div>
                </button>
            ))}
        </motion.div>

        {/* --- Problems List --- */}
        <motion.div 
          layout 
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="group"
                >
                <Link to={`/problem/${problem.id}`} className="block">
                    {/* Card Container */}
                    <div className="
                        relative overflow-hidden bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 md:p-6 
                        transition-all duration-300 
                        hover:bg-[#0A0A0A]/80 hover:border-pink-500/50 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.2)]
                    ">
                    
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Left: Content */}
                            <div className="flex items-start gap-4">
                                {/* Icon Box */}
                                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-slate-400 border border-white/5 group-hover:bg-pink-500/10 group-hover:text-pink-400 group-hover:border-pink-500/20 transition-all duration-300 flex-shrink-0">
                                    <Code2 size={24} />
                                </div>

                                <div className="min-w-0"> 
                                    <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300 mb-2 truncate">
                                        {problem.title}
                                    </h3>
                                    
                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                        {/* Difficulty Badge (Preserving Colors) */}
                                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide ${
                                            problem.difficulty === 'Easy' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' :
                                            problem.difficulty === 'Medium' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10' :
                                            'border-red-500/20 text-red-400 bg-red-500/10'
                                        }`}>
                                            {problem.difficulty}
                                        </span>
                                        
                                        <span className="hidden xs:inline text-slate-700">•</span>
                                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{problem.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action Button */}
                            <div className="flex items-center justify-start md:justify-end mt-2 md:mt-0">
                                <button className="
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide w-full md:w-auto justify-center md:justify-start
                                    bg-white/5 text-slate-300 border border-white/5 
                                    group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-500 group-hover:shadow-lg group-hover:shadow-pink-500/20
                                    transition-all duration-300
                                ">
                                    Solve Problem
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
                className="text-center py-20 text-slate-500 bg-[#0A0A0A]/40 rounded-3xl border border-dashed border-white/5"
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