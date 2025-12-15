import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Code2, Plus } from 'lucide-react';
import { PROBLEMS } from '../data/problem';
import { useCreateSession } from '../hooks/useSessions'; 
import { useNavigate } from 'react-router-dom';

const CreateSessionModal = ({ isOpen, onClose }) => {
  const [selectedProblemId, setSelectedProblemId] = useState('two-sum'); 
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
        problemId: selectedProblemId // Optional: keep sending ID if you add support for it later
      }, 
      {
        onSuccess: (data) => {
          onClose();
          navigate(`/session/${data.session._id}`); // Ensure your API returns 'session' object
        },
        onError: (error) => {
            console.error("Creation Failed:", error);
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
            className="relative w-full max-w-lg bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Create New Session</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Select Problem <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={selectedProblemId}
                      onChange={(e) => setSelectedProblemId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                    >
                      {Object.values(PROBLEMS).map((p) => (
                        <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>

                <div className="bg-emerald-500 text-slate-900 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Room Summary:</div>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Code2 size={20} />
                    Problem: {selectedProblem.title}
                  </div>
                  <div className="text-sm font-medium mt-1 opacity-90">
                    Max Participants: 2 (1-on-1 session)
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-slate-300 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition-all shadow-lg shadow-emerald-500/20"
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