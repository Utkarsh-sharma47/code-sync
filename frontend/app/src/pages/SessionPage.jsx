import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Loader2, ChevronLeft, Cpu, AlertTriangle, LogOut, Link2, Code2, Layers, CheckCircle } from "lucide-react";
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
  const hasJoined = useRef(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const { data: sessionData, isLoading: loadingSession, isError, error, refetch } = useSessionById(sessionId);
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
    connectionError, 
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
    if (!problemData?.starterCode) return;
    const starter = problemData.starterCode[selectedLanguage];
    if (!starter) return;
    setCode(starter);
  }, [problemData, selectedLanguage]);

  // Auto-Join Logic
  useEffect(() => {
    hasJoined.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (session.status === 'completed') return;
    if (hasJoined.current) return;
    if (joinSessionMutation.isPending) return;

    // If the backend or join endpoint reported the session as full, stop.
    if (accessDenied) return;

    if (!isHost && !isParticipant) {
      hasJoined.current = true;
      joinSessionMutation.mutate(sessionId, {
        onSuccess: () => {
          setAccessDenied(false);
          refetch();
        },
        onError: (err) => {
          const status = err?.response?.status;
          const msg = err?.response?.data?.message || "";
          if (status === 403 || msg.toLowerCase().includes("full")) {
            setAccessDenied(true);
          }
        },
      });
    }
  }, [session, user, loadingSession, isHost, isParticipant, sessionId, refetch, joinSessionMutation, accessDenied]);

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
                    toast.success("All Test Cases Passed!", {
                        style: { background: '#10B981', color: '#fff' },
                        iconTheme: { primary: '#fff', secondary: '#10B981' },
                    });
                    confetti({ spread: 70, origin: { y: 0.6 }, colors: ['#3B82F6', '#EC4899'] });
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

  const [isChatOpen, setIsChatOpen] = useState(false); 
  useEffect(() => {
    console.log("Session Data:", session);
  }, [session]);

  const getDifficultyColor = (diff) => {
    switch(diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  // --- ACCESS DENIED STATE ---
  if (accessDenied) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 bg-[#0A0A0A] p-8 rounded-2xl border border-red-500/20 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-6 max-w-md">
              This interview session is full (2/2 participants).<br/>Please ask the host to invite you to a new room.
            </p>
            <Link to="/dashboard" className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors">
              Return to Dashboard
            </Link>
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (loadingSession || isInitializingCall) {
    return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-blue-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse font-medium tracking-wide">Establishing Secure Connection...</p>
        </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (!session) {
      return (
          <div className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              <h1 className="text-3xl font-bold text-white mb-4 relative z-10">Session Not Found</h1>
              <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 underline relative z-10">Return to Dashboard</Link>
          </div>
      );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="h-screen flex flex-col bg-[#050505] text-white overflow-hidden font-sans selection:bg-pink-500/30 relative">
        
        {/* Ambient Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Top Navigation Bar */}
        <div className="h-16 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white border border-transparent hover:border-white/5">
                    <ChevronLeft size={20} />
                </Link>
                <div className="flex flex-col">
                    <h1 className="font-bold text-base text-white flex items-center gap-2">
                        {problemData.title}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getDifficultyColor(problemData.difficulty)}`}>
                            {problemData.difficulty}
                        </span>
                    </h1>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Session • ID: {sessionId?.slice(0, 8)}...
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 {/* COPY LINK BUTTON */}
                 <button 
                    onClick={async () => {
                        const inviteUrl = `${window.location.origin}/session/${sessionId}`;
                        try {
                          await navigator.clipboard.writeText(inviteUrl);
                          toast.success("Link copied to clipboard!");
                        } catch {
                          toast.error("Failed to copy link");
                        }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-white/5 hover:border-white/10 transition-all active:scale-95"
                 >
                    <Link2 size={14} />
                    <span>Invite</span>
                 </button>

                 {/* END SESSION BUTTON */}
                 {isHost && (
                    <button 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to end this session?")) {
                                endSessionMutation.mutate(sessionId, {
                                    onSuccess: () => navigate("/dashboard")
                                });
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-all"
                    >
                        <LogOut size={14} />
                        <span>End</span>
                    </button>
                 )}
                 
                 {/* User Avatar */}
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-900/20 border border-white/10">
                    {user?.firstName?.charAt(0) || "U"}
                 </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA: SPLIT LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative z-10">
            
            {/* LEFT PANEL: CODE EDITOR & OUTPUT (Always 50% or Resizable) */}
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup direction="vertical">
                         {/* TOP LEFT: PROBLEM DESCRIPTION */}
                         <Panel defaultSize={35} minSize={20} className="bg-[#0A0A0A]/50 backdrop-blur-sm border-b border-white/5">
                            <div className="h-full overflow-y-auto custom-scrollbar p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                    <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Cpu size={18} /></span>
                                    Problem Description
                                </h2>
                                <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed">
                                    <p>{problemData?.description?.text || "No description available."}</p>
                                    
                                    {Array.isArray(problemData?.examples) && problemData.examples.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <Layers size={16} className="text-purple-400"/> Examples
                                            </h3>
                                            {problemData.examples.map((ex, i) => (
                                                <div key={i} className="bg-[#050505] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Example {i+1}</div>
                                                    <div className="font-mono text-xs space-y-2">
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-12 uppercase text-[10px] pt-0.5">Input:</span> 
                                                            <span className="text-slate-200 bg-white/5 px-1.5 py-0.5 rounded">{ex.input}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-12 uppercase text-[10px] pt-0.5">Output:</span> 
                                                            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{ex.output}</span>
                                                        </div>
                                                        {ex.explanation && <div className="mt-2 text-slate-500 italic pl-14">{ex.explanation}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                         </Panel>
                         
                         <PanelResizeHandle className="h-1 bg-[#050505] hover:bg-blue-600 transition-colors cursor-row-resize flex justify-center items-center group">
                            <div className="w-8 h-0.5 bg-slate-700 group-hover:bg-white rounded-full" />
                         </PanelResizeHandle>

                         {/* MIDDLE LEFT: CODE EDITOR */}
                         <Panel defaultSize={45} minSize={25} className="flex flex-col bg-[#1e1e1e]">
                            <CodeEditorPanel 
                                selectedLanguage={selectedLanguage}
                                onLanguageChange={(e) => setSelectedLanguage(e.target.value)}
                                code={code}
                                onCodeChange={setCode}
                                onRunCode={handleRunCode}
                                isRunning={isRunning}
                                sessionId={sessionId}
                                isReadOnly={false}
                            />
                         </Panel>

                         <PanelResizeHandle className="h-1 bg-[#050505] hover:bg-blue-600 transition-colors cursor-row-resize flex justify-center items-center group">
                            <div className="w-8 h-0.5 bg-slate-700 group-hover:bg-white rounded-full" />
                         </PanelResizeHandle>

                         {/* BOTTOM LEFT: OUTPUT */}
                         <Panel defaultSize={20} minSize={10} className="bg-[#0A0A0A]">
                            <OutputPanel output={output} testResults={testResults} />
                         </Panel>
                    </PanelGroup>
                </Panel>
                
                <PanelResizeHandle className="w-1 bg-[#050505] hover:bg-blue-600 transition-colors cursor-col-resize flex justify-center items-center group">
                    <div className="h-8 w-0.5 bg-slate-700 group-hover:bg-white rounded-full" />
                </PanelResizeHandle>

                {/* RIGHT PANEL: VIDEO + CHAT */}
                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full bg-black relative flex flex-col">
                         {isInitializingCall ? (
                            <div className="h-full flex flex-col items-center justify-center text-blue-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                <p className="text-sm font-medium animate-pulse tracking-wide">Connecting to Secure Room...</p>
                            </div>
                         ) : streamClient && call ? (
                            <StreamVideo client={streamClient}>
                                <StreamCall call={call}>
                                    <VideoCallUI 
                                        chatClient={chatClient} 
                                        channel={channel} 
                                        isChatOpen={isChatOpen}
                                        setIsChatOpen={setIsChatOpen}
                                    />
                                </StreamCall>
                            </StreamVideo>
                         ) : connectionError ? (
                            <div className="h-full flex flex-col items-center justify-center text-red-400 p-6 text-center">
                                <AlertTriangle className="w-8 h-8 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Connection Failed</h3>
                                <p className="text-sm opacity-80 mb-6">{connectionError}</p>
                                <button onClick={retryConnection} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors">
                                    Retry Connection
                                </button>
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                                <p className="text-sm">Waiting for connection...</p>
                            </div>
                         )}
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    </div>
  );
}

export default SessionPage;