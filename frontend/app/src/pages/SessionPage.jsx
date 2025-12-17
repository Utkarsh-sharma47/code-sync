import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Loader2, ChevronLeft, Cpu, AlertTriangle, LogOut, Link2 } from "lucide-react";
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
    if (!problemData?.starterCode) return;
    const starter = problemData.starterCode[selectedLanguage];
    if (!starter) return;
    setCode(starter);
  }, [problemData, selectedLanguage]);

  // Auto-Join Logic
  // reset guard when session id changes
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

  const [isChatOpen, setIsChatOpen] = useState(false); // State for chat toggle
  useEffect(() => {
    console.log("Session Data:", session);
  }, [session]);

  if (accessDenied) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-400 mb-4 max-w-md">
          This interview session already has two participants. Ask the host to create a new private room for you.
        </p>
        <Link
          to="/dashboard"
          className="text-blue-400 hover:underline text-sm font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

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

  // --- LAYOUT RENDERING ---
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
        {/* Top Navigation Bar */}
        <div className="h-14 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <ChevronLeft size={20} />
                </Link>
                <div className="flex flex-col">
                    <h1 className="font-bold text-sm text-white flex items-center gap-2">
                        {problemData.title}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                            {problemData.difficulty}
                        </span>
                    </h1>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Cpu size={10} /> Session ID: {sessionId?.slice(0, 8)}...
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-white/5 transition-all active:scale-95"
                 >
                    <Link2 size={14} />
                    <span>Copy Link</span>
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
                        <span>End Session</span>
                    </button>
                 )}
                 
                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
                    {user?.firstName?.charAt(0) || "U"}
                 </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA: SPLIT LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* LEFT PANEL: CODE EDITOR & OUTPUT (Always 50% or Resizable) */}
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup direction="vertical">
                         <Panel defaultSize={35} minSize={20} className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10">
                            <div className="h-full overflow-y-auto custom-scrollbar p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Cpu size={20} className="text-blue-400"/> Description
                                </h2>
                                <div className="prose prose-invert max-w-none text-sm text-slate-300">
                                    <p>{problemData?.description?.text || "No description available."}</p>
                                    
                                    {Array.isArray(problemData?.examples) && problemData.examples.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            <h3 className="font-bold text-white">Examples</h3>
                                            {problemData.examples.map((ex, i) => (
                                                <div key={i} className="bg-slate-950 rounded-lg p-3 border border-white/5">
                                                    <div className="text-xs font-bold text-slate-500 mb-1">Example {i+1}</div>
                                                    <div className="font-mono text-xs">
                                                        <div className="flex gap-2"><span className="text-slate-500 w-12">Input:</span> <span>{ex.input}</span></div>
                                                        <div className="flex gap-2"><span className="text-slate-500 w-12">Output:</span> <span className="text-emerald-400">{ex.output}</span></div>
                                                        {ex.explanation && <div className="mt-1 text-slate-500">{ex.explanation}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                         </Panel>
                         <PanelResizeHandle className="h-1 bg-slate-800 hover:bg-blue-500 transition-colors cursor-row-resize z-50" />
                         <Panel defaultSize={45} minSize={25} className="flex flex-col">
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
                         <PanelResizeHandle className="h-1 bg-slate-800 hover:bg-blue-500 transition-colors cursor-row-resize z-50" />
                         <Panel defaultSize={20} minSize={10}>
                            <OutputPanel output={output} testResults={testResults} />
                         </Panel>
                    </PanelGroup>
                </Panel>
                
                <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-blue-500 transition-colors cursor-col-resize z-50" />

                {/* RIGHT PANEL: VIDEO + CHAT */}
                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full bg-black relative">
                         {isInitializingCall ? (
                            <div className="h-full flex flex-col items-center justify-center text-blue-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                <p className="text-sm font-medium animate-pulse">Connecting to Secure Room...</p>
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
                                <button onClick={retryConnection} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm">Retry</button>
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                                <p>Waiting for connection...</p>
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
