import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { 
  Play, 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Cpu,
  Loader2,
  AlertTriangle,
  Terminal,
  Users
} from 'lucide-react';

// Import Data & Hooks
import { PROBLEMS, LANGUAGE_CONFIG } from '../data/problem'; 
import { executeCode } from '../lib/piston'; 
import { useSessionById } from '../hooks/useSessions';

const SessionPage = () => {
  const { sessionId } = useParams();
  const { data: session, isLoading: isSessionLoading } = useSessionById(sessionId);
  
  // We won't have the problem immediately, so we default to null until session loads
  const problem = session ? PROBLEMS[session.problemId] : null;

  // State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Loading...');
  const [output, setOutput] = useState(null); 
  const [testResults, setTestResults] = useState(null); 
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases');
  const [layoutDirection, setLayoutDirection] = useState('horizontal');

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setLayoutDirection(window.innerWidth < 768 ? 'vertical' : 'horizontal');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update code when session loads
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem, session]);

  // Loading State
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  // Error State
  if (!session || !problem) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Session Not Found</h1>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Execution Logic (Same as Problem.jsx) ---
  const handleRunCode = async () => {
    setActiveTab('output');
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);
    setIsSuccess(false);

    try {
      const result = await executeCode(language, code);
      setIsRunning(false);
      
      if (result.success) {
        const actualOutput = result.output.trim().split('\n');
        const expectedOutputRaw = problem.expectedOutput?.[language]?.trim();
        
        if (!expectedOutputRaw) {
             setOutput({ type: 'success', text: result.output });
             toast('Code Executed', { icon: '⚠️' });
             return;
        }

        const expectedOutput = expectedOutputRaw.split('\n');
        const results = expectedOutput.map((expected, index) => {
            const actual = actualOutput[index] || ""; 
            const passed = actual.trim() === expected.trim();
            return { testCase: index + 1, passed, expected: expected.trim(), actual: actual.trim() };
        });

        setTestResults(results);
        if (results.every(r => r.passed)) {
          setIsSuccess(true);
          toast.success("All Test Cases Passed!");
          triggerConfetti();
        } else {
          toast.error("Some Test Cases Failed");
        }
      } else {
        setOutput({ type: 'error', text: result.error });
        toast.error("Execution Error");
      }
    } catch (err) {
      setIsRunning(false);
      setOutput({ type: 'error', text: "Unexpected error" });
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#3B82F6', '#8B5CF6', '#EC4899'] });
  };

  const resetCode = () => {
    setCode(problem.starterCode[language]);
    setOutput(null);
    setTestResults(null);
    toast("Code Reset", { icon: '🔄' });
  };

  const getDifficultyColor = (diff) => {
    switch(diff.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30 flex flex-col overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Header Bar --- */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm md:text-lg font-bold flex items-center gap-3">
              {problem.title}
              <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)} font-mono uppercase tracking-wider`}>
                {problem.difficulty}
              </span>
            </h1>
            {/* Session Info Badge */}
            <div className="flex items-center gap-2 text-xs text-blue-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Live Session
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Participants (Visual Only for now) */}
          <div className="hidden md:flex items-center -space-x-2 mr-2">
             {session.participants?.map((p, i) => (
                 <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold" title={p.userId}>
                    {p.userId?.[0]?.toUpperCase() || "U"}
                 </div>
             ))}
          </div>

          <div className="relative group">
              <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-slate-800 border border-white/10 text-slate-300 text-xs md:text-sm rounded-lg px-2 md:px-4 py-2 pr-6 md:pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-700 transition-colors cursor-pointer font-medium"
              >
                  <option value="javascript">JS</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
              </select>
          </div>

          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className={`
              flex items-center gap-2 px-3 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition-all duration-300
              ${isRunning ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'}
            `}
          >
            {isRunning ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
            <span className="hidden md:inline">{isRunning ? 'Running...' : 'Run Code'}</span>
            <span className="md:hidden">{isRunning ? '...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* --- Resizable Panels (Same Layout as Problem.jsx) --- */}
      <div className="flex-1 overflow-hidden relative">
          <PanelGroup direction={layoutDirection} className="h-full" key={layoutDirection}>
              
              {/* Left: Description */}
              <Panel defaultSize={40} minSize={25} className={`bg-slate-950/80 backdrop-blur-sm flex flex-col ${layoutDirection === 'horizontal' ? 'border-r' : 'border-b'} border-white/10`}>
                  <div className="h-full overflow-y-auto custom-scrollbar p-6">
                      <div className="prose prose-invert max-w-none">
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-400"><Cpu size={20} /></span>
                              Description
                          </h2>
                          <p className="text-slate-300 leading-relaxed mb-6">{problem.description.text}</p>
                          <h3 className="text-lg font-bold text-white mb-3 mt-8">Examples</h3>
                          <div className="space-y-4">
                              {problem.examples.map((ex, index) => (
                                  <div key={index} className="bg-slate-900 rounded-xl border border-white/5 p-4 shadow-sm">
                                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example {index + 1}</div>
                                      <div className="space-y-2 font-mono text-sm">
                                          <div className="flex gap-3"><span className="text-slate-500 w-12">Input:</span><span className="text-slate-200">{ex.input}</span></div>
                                          <div className="flex gap-3"><span className="text-slate-500 w-12">Output:</span><span className="text-emerald-400">{ex.output}</span></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </Panel>

              <PanelResizeHandle className={`bg-slate-900 hover:bg-blue-500/50 transition-colors flex items-center justify-center z-20 ${layoutDirection === 'horizontal' ? 'w-1.5 h-full' : 'h-1.5 w-full'}`} />

              {/* Right: Editor & Output */}
              <Panel defaultSize={60} minSize={25}>
                  <PanelGroup direction="vertical">
                      <Panel defaultSize={60} minSize={20} className="bg-[#1e1e1e] relative flex flex-col">
                          <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4">
                              <span className="text-xs font-bold text-slate-500 uppercase">Code Editor</span>
                              <button onClick={resetCode} className="p-1.5 text-slate-400 hover:text-white"><RotateCcw size={14} /></button>
                          </div>
                          <div className="flex-1 overflow-hidden pt-2">
                              <Editor
                                  height="100%"
                                  theme="vs-dark"
                                  language={LANGUAGE_CONFIG[language].monacoLang}
                                  value={code}
                                  onChange={(value) => setCode(value)}
                                  options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, fontFamily: "'JetBrains Mono', monospace" }}
                              />
                          </div>
                      </Panel>
                      
                      <PanelResizeHandle className="h-1.5 bg-slate-900 hover:bg-blue-500/50" />

                      <Panel defaultSize={40} minSize={10} className="bg-slate-950 flex flex-col">
                          <div className="h-10 bg-slate-900 border-b border-white/5 flex px-2 items-center">
                              <button onClick={() => setActiveTab('testcases')} className={`px-4 h-full text-xs font-bold uppercase border-b-2 ${activeTab === 'testcases' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}>Test Cases</button>
                              <button onClick={() => setActiveTab('output')} className={`px-4 h-full text-xs font-bold uppercase border-b-2 ${activeTab === 'output' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500'}`}>Output</button>
                          </div>
                          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
                              {activeTab === 'testcases' ? (
                                  <div className="space-y-4">
                                      {problem.examples.map((ex, index) => (
                                          <div key={index} className="space-y-2">
                                              <div className="text-xs font-bold text-slate-500 uppercase">Case {index + 1}</div>
                                              <div className="bg-slate-900 rounded-lg p-3 border border-white/5 space-y-1 text-xs">
                                                  <div className="text-slate-300">In: {ex.input}</div>
                                                  <div className="text-slate-300">Out: {ex.output}</div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <>
                                      {!output && !testResults && <div className="text-slate-600 opacity-50 text-center mt-10">Run code to see results</div>}
                                      {output?.type === 'error' && <div className="text-red-200 bg-red-500/10 p-4 rounded-lg border border-red-500/20">{output.text}</div>}
                                      {testResults && testResults.map((res, i) => (
                                          <div key={i} className={`p-3 mb-2 rounded-lg border ${res.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                              <div className="flex justify-between text-xs font-bold mb-1">
                                                  <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>Case {res.testCase}</span>
                                                  {res.passed ? <CheckCircle size={14} className="text-emerald-500"/> : <XCircle size={14} className="text-red-500"/>}
                                              </div>
                                              {!res.passed && <div className="text-xs text-slate-400">Exp: {res.expected} / Act: {res.actual}</div>}
                                          </div>
                                      ))}
                                  </>
                              )}
                          </div>
                      </Panel>
                  </PanelGroup>
              </Panel>
          </PanelGroup>
      </div>
    </div>
  );
};

export default SessionPage;