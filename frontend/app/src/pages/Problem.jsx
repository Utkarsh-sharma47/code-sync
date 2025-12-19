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
  Code2,
  Layers
} from 'lucide-react';

// Import your data and helper functions
import { PROBLEMS, LANGUAGE_CONFIG } from '../data/problem'; 
import { executeCode } from '../lib/piston'; 

const Problem = () => {
  const { id } = useParams();
  const problem = PROBLEMS[id];
  
  // State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(problem?.starterCode?.javascript || '// Start coding...');
  const [output, setOutput] = useState(null); // Stores the raw text output
  const [testResults, setTestResults] = useState(null); // Stores structured pass/fail data
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases'); // New state for tab control

  // Update code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">Problem Not Found</h1>
          <Link to="/problems" className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ChevronLeft size={20} /> Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const handleRunCode = async () => {
    setActiveTab('output'); // Switch to output tab on run
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);
    setIsSuccess(false);

    try {
      const result = await executeCode(language, code);
      setIsRunning(false);
      
      if (result.success) {
        // 1. Code ran successfully (no crash), now analyze logic correctness
        const actualOutput = result.output.trim().split('\n');
        const expectedOutputRaw = problem.expectedOutput?.[language]?.trim();
        
        // Handle cases where expected output might be missing for a language
        if (!expectedOutputRaw) {
             setOutput({ type: 'success', text: result.output });
             toast('Code Executed (No validation available)', { icon: '⚠️' });
             return;
        }

        const expectedOutput = expectedOutputRaw.split('\n');
        
        // Compare outputs line by line
        const results = expectedOutput.map((expected, index) => {
            const actual = actualOutput[index] || ""; // Handle missing lines
            const passed = actual.trim() === expected.trim();
            return {
                testCase: index + 1,
                passed,
                expected: expected.trim(),
                actual: actual.trim()
            };
        });

        setTestResults(results);
        
        // Determine overall success
        const allPassed = results.every(r => r.passed);
        if (allPassed) {
          setIsSuccess(true);
          toast.success("All Test Cases Passed!", {
              style: { background: '#10B981', color: '#fff' },
              iconTheme: { primary: '#fff', secondary: '#10B981' },
          });
          triggerConfetti();
        } else {
          toast.error("Some Test Cases Failed");
        }

      } else {
        // 2. Compilation or Runtime Error
        setOutput({ type: 'error', text: result.error });
        toast.error("Execution Error");
      }
    } catch (err) {
      setIsRunning(false);
      setOutput({ type: 'error', text: "An unexpected error occurred." });
      console.error(err);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#EC4899', '#10B981'] // Blue, Pink, Emerald
    });
  };

  const resetCode = () => {
    setCode(problem.starterCode[language]);
    setOutput(null);
    setTestResults(null);
    setActiveTab('testcases'); // Reset to test cases tab
    toast("Code Reset", { icon: '🔄', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
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
    // MAIN CONTAINER: Deep Black Background with Cyberpunk Ambient
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500/30 flex flex-col overflow-hidden relative">
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Main Content Area (Full height) */}
      <div className="flex-1 h-screen flex flex-col relative z-10">
        
        {/* --- Header Bar --- */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <Link to="/problems" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white group border border-transparent hover:border-white/5">
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-3 text-white">
                <span className="p-1 bg-white/5 rounded-lg text-blue-400"><Code2 size={18} /></span>
                {problem.title}
                <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)} font-mono uppercase tracking-wider`}>
                  {problem.difficulty}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative group">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="
                        appearance-none bg-[#050505] border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2 pr-10 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer font-medium
                    "
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Run Button (Constant Blue) */}
            <button 
              onClick={handleRunCode}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
                ${isRunning 
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] border border-blue-500/50'
                }
              `}
            >
              {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* --- Resizable Panels --- */}
        <div className="flex-1 overflow-hidden relative">
            <PanelGroup direction="horizontal" className="h-full">
                
                {/* --- Left Panel: Description --- */}
                <Panel defaultSize={40} minSize={25} className="bg-[#0A0A0A]/40 backdrop-blur-sm flex flex-col border-r border-white/5">
                    <div className="h-full overflow-y-auto custom-scrollbar p-6">
                        
                        {/* Description Text */}
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/5">
                                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Cpu size={20} /></span>
                                Problem Description
                            </h2>
                            <p className="text-slate-300 leading-relaxed mb-6 text-sm md:text-base">{problem.description.text}</p>
                            
                            {/* Notes */}
                            {problem.description.notes && problem.description.notes.length > 0 && (
                                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl mb-6">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><AlertTriangle size={12}/> Notes</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                                        {problem.description.notes.map((note, i) => (
                                            <li key={i}>{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Examples */}
                            <h3 className="text-lg font-bold text-white mb-4 mt-8 flex items-center gap-2">
                                <span className="p-1 rounded-md bg-purple-500/10 text-purple-400"><Layers size={16} /></span> Examples
                            </h3>
                            <div className="space-y-4">
                                {problem.examples.map((ex, index) => (
                                    <div key={index} className="bg-[#050505] rounded-xl border border-white/5 p-4 transition-colors hover:border-white/10">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Example {index + 1}</div>
                                        <div className="space-y-3 font-mono text-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-500 text-xs uppercase">Input</span>
                                                <span className="text-slate-200 bg-white/5 p-2 rounded-lg border border-white/5">{ex.input}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-500 text-xs uppercase">Output</span>
                                                <span className="text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">{ex.output}</span>
                                            </div>
                                            {ex.explanation && (
                                                <div className="flex flex-col gap-1 pt-1">
                                                    <span className="text-slate-500 text-xs uppercase">Explanation</span>
                                                    <span className="text-slate-400 italic pl-1">{ex.explanation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Constraints */}
                            <h3 className="text-lg font-bold text-white mb-3 mt-8">Constraints</h3>
                            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-400 font-mono">
                                {problem.constraints.map((constraint, i) => (
                                    <li key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]"></span>
                                        {constraint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-[#050505] hover:bg-blue-500/50 transition-colors cursor-col-resize flex items-center justify-center group z-20 border-l border-r border-white/5">
                    <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-white rounded-full transition-colors" />
                </PanelResizeHandle>

                {/* --- Right Panel: Editor & Output --- */}
                <Panel defaultSize={60} minSize={25}>
                    <PanelGroup direction="vertical">
                        
                        {/* Editor Section */}
                        <Panel defaultSize={60} minSize={20} className="bg-[#1e1e1e] relative flex flex-col">
                            {/* Editor Toolbar */}
                            <div className="h-10 bg-[#1e1e1e] border-b border-white/5 flex items-center justify-between px-4 select-none">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Code2 size={14} className="text-blue-500" />
                                    Code Editor
                                </div>
                                <button 
                                    onClick={resetCode}
                                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                                    title="Reset Code"
                                >
                                    <RotateCcw size={12} /> Reset
                                </button>
                            </div>
                            
                            {/* Monaco Editor */}
                            <div className="flex-1 overflow-hidden pt-2 bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={LANGUAGE_CONFIG[language].monacoLang}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 10 },
                                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                        renderLineHighlight: "none", // Cleaner look
                                    }}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-[#050505] hover:bg-blue-500/50 transition-colors cursor-row-resize flex items-center justify-center group z-20 border-t border-b border-white/5">
                            <div className="w-8 h-0.5 bg-slate-700 group-hover:bg-white rounded-full transition-colors" />
                        </PanelResizeHandle>

                        {/* Output Section */}
                        <Panel defaultSize={40} minSize={10} className="bg-[#0A0A0A] flex flex-col">
                            {/* Output Toolbar / Tabs */}
                            <div className="h-10 bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-2">
                                <div className="flex items-center h-full gap-1">
                                    <button
                                        onClick={() => setActiveTab('testcases')}
                                        className={`
                                            flex items-center gap-2 px-4 h-full text-xs font-bold uppercase tracking-wider border-b-2 transition-all
                                            ${activeTab === 'testcases' 
                                                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <CheckCircle size={14} /> Test Cases
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('output')}
                                        className={`
                                            flex items-center gap-2 px-4 h-full text-xs font-bold uppercase tracking-wider border-b-2 transition-all
                                            ${activeTab === 'output' 
                                                ? 'border-pink-500 text-pink-400 bg-pink-500/5' 
                                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <Terminal size={14} /> Output
                                    </button>
                                </div>
                                {isSuccess && activeTab === 'output' && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mr-2 animate-pulse">
                                        <CheckCircle size={12} /> ALL PASSED
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#0A0A0A]">
                                {/* TAB 1: TEST CASES (Always Visible) */}
                                {activeTab === 'testcases' && (
                                    <div className="space-y-4">
                                        {problem.examples.map((ex, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                                    Case {index + 1}
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-2 hover:border-white/10 transition-colors">
                                                    <div className="flex gap-2 text-slate-300">
                                                        <span className="w-16 text-slate-500 select-none text-xs uppercase pt-0.5">Input:</span>
                                                        <span className="font-mono break-all text-slate-200">{ex.input}</span>
                                                    </div>
                                                    <div className="flex gap-2 text-slate-300">
                                                        <span className="w-16 text-slate-500 select-none text-xs uppercase pt-0.5">Output:</span>
                                                        <span className="font-mono break-all text-emerald-400">{ex.output}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB 2: OUTPUT (Results) */}
                                {activeTab === 'output' && (
                                    <>
                                        {/* Case 1: Initial State */}
                                        {!output && !testResults && !isRunning && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 gap-3">
                                                <Terminal size={32} strokeWidth={1.5} />
                                                <p className="text-xs uppercase tracking-widest font-semibold">Ready to Execute</p>
                                            </div>
                                        )}
                                        
                                        {/* Case 2: Running */}
                                        {isRunning && (
                                            <div className="h-full flex flex-col items-center justify-center text-blue-400 gap-3">
                                                <Loader2 className="animate-spin" size={32} />
                                                <span className="text-xs uppercase tracking-widest font-bold animate-pulse">Compiling & Running...</span>
                                            </div>
                                        )}

                                        {/* Case 3: Compilation/Runtime Error */}
                                        {output && output.type === 'error' && (
                                            <div className="w-full rounded-xl p-4 bg-red-500/5 border border-red-500/20 text-red-200">
                                                <div className="flex items-center gap-2 text-red-400 font-bold mb-3 border-b border-red-500/10 pb-2">
                                                    <AlertTriangle size={16} />
                                                    <span>Execution Error</span>
                                                </div>
                                                <pre className="whitespace-pre-wrap font-mono text-xs text-red-300/90 overflow-x-auto leading-relaxed">
                                                    {output.text}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Case 4: Test Results (Successful execution) */}
                                        {testResults && (
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                    <span>Results Summary</span>
                                                    <span className="text-slate-600">{testResults.filter(r => r.passed).length} / {testResults.length} Passed</span>
                                                </div>
                                                
                                                {testResults.map((res, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`
                                                            p-3 rounded-xl border transition-all duration-300
                                                            ${res.passed 
                                                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' 
                                                                : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`font-bold text-sm ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                Test Case {res.testCase}
                                                            </span>
                                                            {res.passed 
                                                                ? <CheckCircle size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
                                                                : <XCircle size={16} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                            }
                                                        </div>
                                                        
                                                        {!res.passed && (
                                                            <div className="mt-2 text-xs space-y-1 bg-[#050505] p-2 rounded-lg border border-white/5">
                                                                <div className="flex gap-2">
                                                                    <span className="text-slate-500 w-16 uppercase text-[10px] pt-0.5">Expected:</span>
                                                                    <span className="text-emerald-400 font-mono bg-emerald-500/5 px-1 rounded">{res.expected}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <span className="text-slate-500 w-16 uppercase text-[10px] pt-0.5">Actual:</span>
                                                                    <span className="text-red-400 font-mono bg-red-500/5 px-1 rounded">{res.actual}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {res.passed && (
                                                            <div className="text-[10px] text-slate-500 font-medium">Output matched expected result.</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default Problem;