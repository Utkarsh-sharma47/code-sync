import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Code2, Plus } from 'lucide-react';
import { PROBLEMS } from '../data/problem';
import { useCreateSession } from '../hooks/useSessions'; 
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateSessionModal = ({ isOpen, onClose }) => {
  const [selectedProblemId, setSelectedProblemId] = useState('two-sum'); 
  const [sessionName, setSessionName] = useState('');
  const { mutate: createSession, isPending } = useCreateSession();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!selectedProblemId) return;

    const problemDetails = PROBLEMS[selectedProblemId];

    if (!problemDetails) {
        console.error("Problem details not found");
        return;
    }

    createSession(
      { 
        // FIX: The backend expects 'problem', not 'title'
        problem: problemDetails.title,  
        difficulty: problemDetails.difficulty,
        problemId: selectedProblemId, // Optional: keep sending ID if you add support for it later
        name: sessionName?.trim() || undefined,
      }, 
      {
        onSuccess: (data) => {
          console.log("CreateSession onSuccess data:", data);
          const sessionId = data?.session?._id;
          if (!sessionId) {
            console.error("CreateSession: sessionId missing in response", data);
            toast.error("Failed to create session on server. Please check backend logs.");
            return;
          }
          onClose();
          navigate(`/session/${sessionId}`);
        },
        onError: (error) => {
          console.error("Creation Failed:", error);
          toast.error(error?.response?.data?.message || "Failed to create session");
        }
      }
    );
  };

  const selectedProblem = PROBLEMS[selectedProblemId] || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-[#141619] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Plus size={18} /></span>
                    Create New Session
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors hover:bg-white/10 p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">
                    Session Name <span className="text-slate-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Mock Interview"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Select Problem <span className="text-blue-500">*</span></label>
                  <div className="relative">
                    <select
                      value={selectedProblemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(PROBLEMS).map((p) => (
                        <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>

                {/* Room Summary - Blue Theme */}
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-xl p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 text-blue-300">Room Summary:</div>
                  <div className="flex items-center gap-2 font-bold text-lg text-white">
                    <Code2 size={20} className="text-blue-400" />
                    {selectedProblem.title}
                  </div>
                  <div className="text-sm font-medium mt-1 opacity-70">
                    Max Participants: 2 (1-on-1 session)
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
                >
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Create Room
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateSessionModal;