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
  Terminal // Imported for tab icon
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Problem Not Found</h1>
          <Link to="/problems" className="text-blue-400 hover:text-blue-300">
            &larr; Back to Problems
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
             toast('Code Executed (No validation available for this language)', { icon: '⚠️' });
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
      colors: ['#3B82F6', '#8B5CF6', '#EC4899'] // Blue, Purple, Pink
    });
  };

  const resetCode = () => {
    setCode(problem.starterCode[language]);
    setOutput(null);
    setTestResults(null);
    setActiveTab('testcases'); // Reset to test cases tab
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
      
      {/* NO NAVBAR HERE, as requested */}

      {/* Main Content Area (Full height) */}
      <div className="flex-1 h-screen flex flex-col relative z-0">
        
        {/* Ambient Glows (Background) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* --- Header Bar --- */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Link to="/problems" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-3">
                {problem.title}
                <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)} font-mono uppercase tracking-wider`}>
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
                    className="appearance-none bg-slate-800 border border-white/10 text-slate-300 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-700 transition-colors cursor-pointer font-medium"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Run Button */}
            <button 
              onClick={handleRunCode}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition-all duration-300
                ${isRunning 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transform hover:scale-105 active:scale-95'
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
                <Panel defaultSize={40} minSize={25} className="bg-slate-950/80 backdrop-blur-sm flex flex-col border-r border-white/10">
                    <div className="h-full overflow-y-auto custom-scrollbar p-6">
                        
                        {/* Description Text */}
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-400"><Cpu size={20} /></span>
                                Description
                            </h2>
                            <p className="text-slate-300 leading-relaxed mb-6">{problem.description.text}</p>
                            
                            {/* Notes */}
                            {problem.description.notes && problem.description.notes.length > 0 && (
                                <div className="bg-blue-500/5 border-l-4 border-blue-500/30 p-4 rounded-r-lg mb-6">
                                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                                        {problem.description.notes.map((note, i) => (
                                            <li key={i}>{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Examples */}
                            <h3 className="text-lg font-bold text-white mb-3 mt-8">Examples</h3>
                            <div className="space-y-4">
                                {problem.examples.map((ex, index) => (
                                    <div key={index} className="bg-slate-900 rounded-xl border border-white/5 p-4 shadow-sm hover:border-white/10 transition-colors">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example {index + 1}</div>
                                        <div className="space-y-2 font-mono text-sm">
                                            <div className="flex gap-3">
                                                <span className="text-slate-500 select-none w-12">Input:</span>
                                                <span className="text-slate-200">{ex.input}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-slate-500 select-none w-12">Output:</span>
                                                <span className="text-emerald-400">{ex.output}</span>
                                            </div>
                                            {ex.explanation && (
                                                <div className="flex gap-3 pt-1">
                                                    <span className="text-slate-500 select-none w-12">Note:</span>
                                                    <span className="text-slate-400 italic">{ex.explanation}</span>
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
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50"></span>
                                        {constraint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors cursor-col-resize flex items-center justify-center group z-20">
                    <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-white rounded-full" />
                </PanelResizeHandle>

                {/* --- Right Panel: Editor & Output --- */}
                <Panel defaultSize={60} minSize={25}>
                    <PanelGroup direction="vertical">
                        
                        {/* Editor Section */}
                        <Panel defaultSize={60} minSize={20} className="bg-[#1e1e1e] relative flex flex-col">
                            {/* Editor Toolbar */}
                            <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    Code Editor
                                </div>
                                <button 
                                    onClick={resetCode}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                    title="Reset Code"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                            
                            {/* Monaco Editor */}
                            <div className="flex-1 overflow-hidden pt-2">
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
                                    }}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors cursor-row-resize flex items-center justify-center group z-20">
                            <div className="w-8 h-0.5 bg-slate-700 group-hover:bg-white rounded-full" />
                        </PanelResizeHandle>

                        {/* Output Section */}
                        <Panel defaultSize={40} minSize={10} className="bg-slate-950 flex flex-col">
                            <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center justify-between px-2">
                                <div className="flex items-center h-full">
                                    <button
                                        onClick={() => setActiveTab('testcases')}
                                        className={`
                                            flex items-center gap-2 px-4 h-full text-xs font-bold uppercase tracking-wider border-b-2 transition-colors
                                            ${activeTab === 'testcases' 
                                                ? 'border-blue-500 text-blue-400 bg-white/5' 
                                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <CheckCircle size={14} /> Test Cases
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('output')}
                                        className={`
                                            flex items-center gap-2 px-4 h-full text-xs font-bold uppercase tracking-wider border-b-2 transition-colors
                                            ${activeTab === 'output' 
                                                ? 'border-emerald-500 text-emerald-400 bg-white/5' 
                                                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <Terminal size={14} /> Output
                                    </button>
                                </div>
                                {isSuccess && activeTab === 'output' && (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mr-2">
                                        <CheckCircle size={12} /> Passed
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
                                {/* TAB 1: TEST CASES (Always Visible) */}
                                {activeTab === 'testcases' && (
                                    <div className="space-y-4">
                                        {problem.examples.map((ex, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="text-xs font-bold text-slate-500 uppercase">Case {index + 1}</div>
                                                <div className="bg-slate-900 rounded-lg p-3 border border-white/5 space-y-2">
                                                    <div className="flex gap-2 text-slate-300">
                                                        <span className="w-16 text-slate-500 select-none">Input:</span>
                                                        <span className="font-mono break-all">{ex.input}</span>
                                                    </div>
                                                    <div className="flex gap-2 text-slate-300">
                                                        <span className="w-16 text-slate-500 select-none">Output:</span>
                                                        <span className="font-mono break-all">{ex.output}</span>
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
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                                <Play size={32} className="mb-2" />
                                                <p>Run your code to see output</p>
                                            </div>
                                        )}
                                        
                                        {/* Case 2: Running */}
                                        {isRunning && (
                                            <div className="h-full flex items-center justify-center text-blue-400 gap-2">
                                                <Loader2 className="animate-spin" />
                                                <span>Executing...</span>
                                            </div>
                                        )}

                                        {/* Case 3: Compilation/Runtime Error */}
                                        {output && output.type === 'error' && (
                                            <div className="w-full rounded-lg p-4 bg-red-500/10 border border-red-500/20 text-red-200">
                                                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                                    <AlertTriangle size={16} />
                                                    <span>Execution Error</span>
                                                </div>
                                                <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm overflow-x-auto">
                                                    {output.text}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Case 4: Test Results (Successful execution) */}
                                        {testResults && (
                                            <div className="space-y-3">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Case Results</div>
                                                {testResults.map((res, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`p-3 rounded-lg border ${res.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`font-bold ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                Test Case {res.testCase}
                                                            </span>
                                                            {res.passed ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                                                        </div>
                                                        
                                                        {!res.passed && (
                                                            <div className="mt-2 text-xs space-y-1 bg-slate-900/50 p-2 rounded">
                                                                <div className="flex gap-2">
                                                                    <span className="text-slate-500 w-16">Expected:</span>
                                                                    <span className="text-emerald-400 font-mono">{res.expected}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <span className="text-slate-500 w-16">Actual:</span>
                                                                    <span className="text-red-400 font-mono">{res.actual}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {res.passed && (
                                                            <div className="text-xs text-slate-500">Output matched expected result.</div>
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