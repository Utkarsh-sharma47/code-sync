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

  // 2. SAFETY CHECK: Convert to array or empty list to prevent .map() crashes
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30 relative overflow-hidden">
      
      <Navbar />
      <CreateSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="absolute top-0 left-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 pt-28 pb-12 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="p-2 bg-green-500/10 rounded-xl text-green-400"><Code2 size={32} /></span>
              Welcome back, <span className="text-green-400">{user?.firstName || 'Coder'}!</span>
            </h1>
            <p className="text-slate-400 ml-16">Ready to level up your coding skills?</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-slate-900 font-bold shadow-lg shadow-green-500/20 transition-all hover:scale-105"
          >
            <Plus size={20} /> Create Session
          </button>
        </motion.div>

        {/* Error State */}
        {activeError && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
            <AlertTriangle size={20} />
            <span><strong>System Error:</strong> The backend server is returning an error (500). Please check the backend terminal.</span>
          </div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Stats Column */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl h-[160px] flex flex-col justify-between">
                <div className="absolute top-4 right-4 p-2 bg-green-500/10 rounded-full text-green-400"><Users size={24} /></div>
                <div>
                  <div className="text-5xl font-black text-white mb-2">{loadingActive ? '...' : activeSessions.length}</div>
                  <div className="text-slate-400 font-medium">Active Sessions</div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl h-[160px] flex flex-col justify-between">
                <div className="absolute top-4 right-4 p-2 bg-blue-500/10 rounded-full text-blue-400"><Trophy size={24} /></div>
                <div>
                  <div className="text-5xl font-black text-white mb-2">{loadingRecent ? '...' : totalSessions}</div>
                  <div className="text-slate-400 font-medium">Total Sessions</div>
                </div>
              </motion.div>
            </div>

            {/* Live Sessions Panel */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-3xl p-6 min-h-[340px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="p-2 bg-green-500/10 rounded-lg text-green-400"><Zap size={24} /></span>
                <h2 className="text-xl font-bold">Live Sessions</h2>
              </div>

              <div className="flex-1 space-y-4">
                {loadingActive ? (
                  <div className="text-slate-500 text-center py-10">Loading...</div>
                ) : activeSessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl py-10">
                    <p>No active sessions.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-green-400 hover:underline mt-2">Start one now</button>
                  </div>
                ) : (
                  activeSessions.map(session => {
                    // --- SMART TITLE RESOLUTION ---
                    const problemDetails = PROBLEMS[session.problemId] || {};
                    // Check custom name -> Check DB title -> Check Local Data -> Default
                    const displayTitle = session.name || session.sessionName || session.problem || problemDetails.title || "Unknown Session";
                    const displayDiff = session.difficulty || problemDetails.difficulty || "Medium";
                    
                    const participantCount = 1 + (session.participant ? 1 : 0);
                    const isFull = participantCount >= 2;
                    const isHost = session.host?.clerkId === user?.id;

                    return (
                      <div key={session._id} className="bg-slate-950 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center font-bold text-xl">{problemDetails.title ? <Code2 /> : <Zap size={18}/>}</div>
                          <div>
                            {/* USE THE RESOLVED TITLE */}
                            <h3 className="font-bold text-lg">{displayTitle}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                              {/* USE THE RESOLVED DIFFICULTY */}
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 border border-slate-700">{displayDiff}</span>
                              <span className={`flex items-center gap-1 ${isFull ? 'text-red-400' : 'text-slate-400'}`}>
                                <Users size={14}/> 👤 {participantCount}/2
                              </span>
                              {isFull && <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20">FULL</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isHost && (
                                <button 
                                    onClick={() => endSessionMutation.mutate(session._id)} 
                                    className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                    title="End Session"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            {!isFull || isHost ? (
                               <button onClick={() => navigate(`/session/${session._id}`)} className="px-6 py-2 rounded-full bg-green-500 text-slate-900 font-bold hover:bg-green-400 transition-colors">Join</button>
                            ) : (
                               <button disabled className="px-6 py-2 rounded-full bg-slate-800 text-slate-500 font-bold cursor-not-allowed">Full</button>
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
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><Clock className="text-blue-400" /> Your Past Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSessions.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500 bg-slate-900/30 rounded-3xl border border-white/5">No session history yet.</div>
              ) : (
                recentSessions.map((session) => {
                  // --- SMART TITLE RESOLUTION FOR HISTORY ---
                  const problemDetails = PROBLEMS[session.problemId] || {};
                  const displayTitle = session.name || session.sessionName || session.problem || problemDetails.title || "Unknown Session";

                  return (
                    <motion.div key={session._id} variants={itemVariants} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:bg-slate-900/60 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Code2 size={24} /></div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                          {session.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      {/* USE THE RESOLVED TITLE */}
                      <h3 className="text-lg font-bold mb-1">{displayTitle}</h3>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-slate-500">
                        <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(session.createdAt || Date.now()).toLocaleDateString()}</div>
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
