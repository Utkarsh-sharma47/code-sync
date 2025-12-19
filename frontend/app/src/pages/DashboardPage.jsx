import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { 
  Plus, Users, Clock, Zap, Code2, Trophy, Calendar, AlertTriangle, Trash2
} from 'lucide-react';

// Ensure this matches your actual filename (plural 'useSessions')
import { useActiveSessions, useMyRecentSessions, useEndSession } from '../hooks/useSessions';
import { PROBLEMS } from '../data/problem';
import Navbar from '../components/Navbar';
import CreateSessionModal from '../components/CreateSessionModal';

const DashboardPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Data
  const { data: activeSessionsData, isLoading: loadingActive, isError: activeError } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecent } = useMyRecentSessions();
  const endSessionMutation = useEndSession();

  // 2. SAFETY CHECK
  const activeSessions = Array.isArray(activeSessionsData) ? activeSessionsData : [];
  const recentSessions = Array.isArray(recentSessionsData) ? recentSessionsData : [];
  const totalSessions = activeSessions.length + recentSessions.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Shared hover class for that premium pink glow effect
  const premiumHoverClass = "transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_25px_-5px_rgba(236,72,153,0.3)] group";

  return (
    // MAIN CONTAINER: Deep Black Background
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden selection:bg-pink-500/30">
      
      <Navbar />
      <CreateSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --- NEON AMBIENT BACKGROUNDS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="p-3 bg-white/5 rounded-xl border border-white/10 text-blue-400 backdrop-blur-md">
                <Code2 size={32} />
              </span>
              Welcome back, 
              {/* Gradient Text Name */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
                {user?.firstName || 'Coder'}!
              </span>
            </h1>
            <p className="text-slate-400 ml-16">Ready to level up your coding skills?</p>
          </div>
          
          {/* Create Session Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold 
                bg-gradient-to-r from-blue-600 to-blue-500 text-white border border-white/10
                shadow-lg shadow-blue-900/20 hover:scale-105
                ${premiumHoverClass}
            `}
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90" /> 
            Create Session
          </button>
        </motion.div>

        {/* Error State */}
        {activeError && (
          <div className="mb-8 p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 flex items-center gap-3 backdrop-blur-sm">
            <AlertTriangle size={20} />
            <span><strong>System Error:</strong> Check backend terminal.</span>
          </div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Stats Column */}
            <div className="space-y-6">
              {/* Active Sessions Stat Card */}
              <motion.div variants={itemVariants} className={`
                relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl h-40 flex flex-col justify-between
                ${premiumHoverClass}
              `}>
                <div className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Users size={24} />
                </div>
                <div>
                  <div className="text-5xl font-black text-white mb-2 shadow-black drop-shadow-lg">
                    {loadingActive ? '...' : activeSessions.length}
                  </div>
                  <div className="text-slate-400 font-medium">Active Sessions</div>
                </div>
              </motion.div>
              
              {/* Total Sessions Stat Card */}
              <motion.div variants={itemVariants} className={`
                relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl h-40 flex flex-col justify-between
                ${premiumHoverClass}
              `}>
                <div className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                    <Trophy size={24} />
                </div>
                <div>
                  <div className="text-5xl font-black text-white mb-2 shadow-black drop-shadow-lg">
                    {loadingRecent ? '...' : totalSessions}
                  </div>
                  <div className="text-slate-400 font-medium">Total Sessions</div>
                </div>
              </motion.div>
            </div>

            {/* Live Sessions Panel */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 min-h-85 flex flex-col shadow-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Zap size={24} /></span>
                <h2 className="text-xl font-bold text-white">Live Rooms</h2>
              </div>

              <div className="flex-1 space-y-4">
                {loadingActive ? (
                  <div className="text-slate-500 text-center py-10">Loading...</div>
                ) : activeSessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl py-10 hover:border-white/10 transition-colors">
                    <p>No active sessions.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-blue-400 font-bold hover:text-pink-400 hover:underline mt-2 transition-colors">Start one now</button>
                  </div>
                ) : (
                  activeSessions.map(session => {
                    const problemDetails = PROBLEMS[session.problemId] || {};
                    const displayTitle = session.name || session.sessionName || session.problem || problemDetails.title || "Unknown Session";
                    const displayDiff = session.difficulty || problemDetails.difficulty || "Medium";
                    const participantCount = 1 + (session.participant ? 1 : 0);
                    const isFull = participantCount >= 2;
                    const isHost = session.host?.clerkId === user?.id;

                    return (
                      <div key={session._id} className={`
                        relative bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4
                        hover:bg-[#0A0A0A]/80
                        ${premiumHoverClass}
                      `}>
                        
                        <div className="relative z-10 flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center font-bold text-xl text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                            {problemDetails.title ? <Code2 /> : <Zap size={18}/>}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white transition-colors">{displayTitle}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-colors">{displayDiff}</span>
                              <span className={`flex items-center gap-1 ${isFull ? 'text-red-400' : ''}`}>
                                <Users size={14}/> 👤 {participantCount}/2
                              </span>
                              {isFull && <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20">FULL</span>}
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto justify-end">
                            {isHost && (
                                <button 
                                    onClick={() => endSessionMutation.mutate(session._id)} 
                                    className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
                                    title="End Session"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            {!isFull || isHost ? (
                               <button 
                                 onClick={() => navigate(`/session/${session._id}`)} 
                                 className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-pink-600 hover:text-white transition-all shadow-md hover:shadow-pink-500/40"
                               >
                                 Join
                               </button>
                            ) : (
                               <button 
                                 disabled 
                                 className="px-6 py-2 rounded-full bg-white/5 text-slate-600 font-bold cursor-not-allowed"
                               >
                                 Full
                               </button>
                            )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Past Sessions */}
          <div className="pt-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-white"><Clock className="text-pink-400" /> Your Past Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSessions.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">No session history yet.</div>
              ) : (
                recentSessions.map((session) => {
                  const problemDetails = PROBLEMS[session.problemId] || {};
                  const displayTitle = session.name || session.sessionName || session.problem || problemDetails.title || "Unknown Session";

                  return (
                    <motion.div 
                      key={session._id} 
                      variants={itemVariants} 
                      className={`
                        relative bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl 
                        hover:bg-[#0A0A0A]/90 hover:-translate-y-1
                        ${premiumHoverClass}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-pink-500/10 group-hover:text-pink-400 text-slate-400 transition-colors">
                            <Code2 size={24} />
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border border-transparent ${
                          session.status === 'completed' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-white/5 text-slate-500'
                        }`}>
                          {session.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 text-white transition-colors">{displayTitle}</h3>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-slate-500 group-hover:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} /> 
                          {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Just now'}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;