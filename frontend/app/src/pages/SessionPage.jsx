import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Loader2, ChevronLeft, Cpu, AlertTriangle, LogOut } from "lucide-react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

// Hooks & Data
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problem";
import { executeCode } from "../lib/piston";
import useStreamClient from "../hooks/useStreamClient";

// Components
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useUser();
  
  const [output, setOutput] = useState(null);
  const [testResults, setTestResults] = useState(null); // New state for Test Cases
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(sessionId);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session || sessionData;

  // Compare Clerk IDs only to avoid mismatched Mongo IDs
  const isHost = session?.host?.clerkId === user?.id; 
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { 
    call, 
    channel, 
    chatClient, 
    isInitializingCall, 
    streamClient, 
    connectionError, // <--- FIX: Added this so the error screen works
    retryConnection
  } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // --- PROBLEM DATA LOOKUP (Robust) ---
  const problemData = (() => {
    if (!session) return PROBLEMS["two-sum"];

    const byKey = session.problemId && PROBLEMS[session.problemId];
    if (byKey) return byKey;

    const byIdField = session.problemId && Object.values(PROBLEMS).find((p) => p.id === session.problemId);
    if (byIdField) return byIdField;

    const byTitle = Object.values(PROBLEMS).find(
      (p) => p.title === session.problem || p.title === session.problemId
    );
    return byTitle || PROBLEMS["two-sum"];
  })();

  // Initialize Code
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage] && !code) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  // Auto-Join Logic
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (!isHost && !isParticipant && session.status !== 'completed') {
        joinSessionMutation.mutate(sessionId, { onSuccess: refetch });
    }
  }, [session, user, loadingSession, isHost, isParticipant, sessionId]);

  // --- RUN CODE LOGIC (With Test Cases) ---
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);

    try {
        const result = await executeCode(selectedLanguage, code);
        
        if (result.success) {
            // Check Test Cases
            const actualOutput = result.output.trim().split('\n');
            const expectedOutputRaw = problemData.expectedOutput?.[selectedLanguage]?.trim();
            
            if (expectedOutputRaw) {
                const expectedOutput = expectedOutputRaw.split('\n');
                const results = expectedOutput.map((expected, index) => {
                    const actual = actualOutput[index] || "";
                    return {
                        testCase: index + 1,
                        passed: actual.trim() === expected.trim(),
                        expected: expected.trim(),
                        actual: actual.trim()
                    };
                });
                
                setTestResults(results);
                
                if (results.every(r => r.passed)) {
                    toast.success("All Test Cases Passed!");
                    confetti({ spread: 70, origin: { y: 0.6 } });
                } else {
                    toast.error("Some Test Cases Failed");
                }
            } else {
                // No expected output defined, just show raw output
                setOutput({ output: result.output });
            }
        } else {
            setOutput({ error: result.error });
        }
    } catch (err) {
        setOutput({ error: "Execution failed. Check your internet connection." });
    } finally {
        setIsRunning(false);
    }
  };

  if (loadingSession || isInitializingCall) {
    return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse">Entering Session...</p>
        </div>
    );
  }

  if (!session) {
      return (
          <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-white mb-4">Session Not Found</h1>
              <Link to="/dashboard" className="text-blue-400 hover:underline">Return to Dashboard</Link>
          </div>
      );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
      {/* Navbar */}
      <div className="h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 z-50">
         <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                <ChevronLeft size={20} />
            </Link>
            <div>
                <h1 className="font-bold text-sm flex items-center gap-2">
                    {session.sessionName || session.problem}
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                        {session.difficulty || 'Medium'}
                    </span>
                </h1>
            </div>
         </div>
         {isHost && (
             <button 
                onClick={() => { if(confirm("End this session?")) endSessionMutation.mutate(sessionId, { onSuccess: () => navigate('/dashboard')}); }}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-lg border border-red-500/20 transition-all"
             >
                <LogOut size={14} /> End
             </button>
         )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal">
            
            {/* LEFT: Problem & Code */}
            <Panel defaultSize={55} minSize={30} className="flex flex-col">
                <PanelGroup direction="vertical">
                    
                    {/* Description Panel */}
                    <Panel defaultSize={40} minSize={20} className="bg-slate-900/50 backdrop-blur-sm border-r border-b border-white/10">
                        <div className="h-full overflow-y-auto custom-scrollbar p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Cpu size={20} className="text-blue-400"/> Description
                            </h2>
                            <div className="prose prose-invert max-w-none text-sm text-slate-300">
                                <p>{problemData?.description?.text}</p>
                                
                                {problemData?.examples && (
                                    <div className="mt-6 space-y-4">
                                        <h3 className="font-bold text-white">Examples</h3>
                                        {problemData.examples.map((ex, i) => (
                                            <div key={i} className="bg-slate-950 rounded-lg p-3 border border-white/5">
                                                <div className="text-xs font-bold text-slate-500 mb-1">Example {i+1}</div>
                                                <div className="font-mono text-xs">
                                                    <div className="flex gap-2"><span className="text-slate-500 w-12">Input:</span> <span>{ex.input}</span></div>
                                                    <div className="flex gap-2"><span className="text-slate-500 w-12">Output:</span> <span className="text-emerald-400">{ex.output}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="h-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors" />

                    {/* Editor & Output */}
                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={60} minSize={30} className="border-r border-white/10">
                                <CodeEditorPanel 
                                    selectedLanguage={selectedLanguage}
                                    onLanguageChange={(e) => setSelectedLanguage(e.target.value)}
                                    code={code}
                                    onCodeChange={setCode}
                                    onRunCode={handleRunCode}
                                    isRunning={isRunning}
                                />
                            </Panel>
                            <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors" />
                            <Panel defaultSize={40} minSize={20}>
                                <OutputPanel output={output} testResults={testResults} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </Panel>

            <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors z-50" />

            {/* RIGHT: Video & Chat */}
            <Panel defaultSize={45} minSize={25} className="bg-black relative">
                
                {/* 1. INITIALIZING STATE */}
                {isInitializingCall ? (
                    <div className="h-full flex flex-col items-center justify-center text-blue-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm font-medium animate-pulse">Connecting to Secure Room...</p>
                    </div>
                ) 
                
                /* 2. SUCCESS STATE */
                : streamClient && call ? (
                    <StreamVideo client={streamClient}>
                        <StreamCall call={call}>
                            <VideoCallUI chatClient={chatClient} channel={channel} />
                        </StreamCall>
                    </StreamVideo>
                ) 
                
                /* 3. ERROR STATE */
                : connectionError ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 p-6 text-center">
                        <div className="bg-red-500/10 p-4 rounded-full mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Connection Failed</h3>
                        <p className="text-sm opacity-80 mb-6">{connectionError}</p>
                        <button 
                            onClick={retryConnection} 
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                )

                /* 4. FALLBACK STATE */
                : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                        <p>Waiting for connection...</p>
                    </div>
                )}
            </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;