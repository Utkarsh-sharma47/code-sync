import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { LANGUAGE_CONFIG } from '../data/problem';
import { Play, Loader2, RotateCcw } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_EVENTS = {
  JOIN_ROOM: "join-room",
  CODE_CHANGE: "code-change",
  CODE_UPDATE: "code-update",
};

const CodeEditorPanel = ({ 
  selectedLanguage, 
  onLanguageChange, 
  code, 
  onCodeChange, 
  onRunCode, 
  isRunning,
  sessionId,
  isReadOnly = false,
}) => {
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const currentCodeRef = useRef(code);

  useEffect(() => {
    currentCodeRef.current = code;
  }, [code]);

  // Setup Socket.io for real-time code sync
  useEffect(() => {
    if (!sessionId || isReadOnly) return;

    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");
    console.log("[CodeSync] socket target:", socketUrl);
    const socket = io(socketUrl, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[CodeSync] connect:", socket.id);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: sessionId, userId: "client" });
      console.log("[CodeSync] emit join-room:", { roomId: sessionId });
    });

    const handleCodeUpdate = (incomingCode) => {
      const next = incomingCode ?? "";
      console.log("[CodeSync] recv code-update:", { length: next.length });
      // Prevent echo loop: only update when content differs, and mark as remote
      if (next !== currentCodeRef.current) {
        isRemoteUpdate.current = true;
        onCodeChange(next);
      }
    };
    socket.on(SOCKET_EVENTS.CODE_UPDATE, handleCodeUpdate);

    socket.on("disconnect", () => {
      console.log("[CodeSync] disconnect");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SOCKET_EVENTS.CODE_UPDATE, handleCodeUpdate);
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionId, isReadOnly]);

  const handleCodeChange = (value) => {
    const newValue = value ?? "";
    // If this change came from a remote update we just applied, do not emit back
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      console.log("[CodeSync] skip emit (remote update applied)");
      onCodeChange(newValue); // still update local state in case Monaco fires onChange after set
      return;
    }
    onCodeChange(newValue);

    if (socketRef.current && sessionId && !isReadOnly) {
      const payload = {
        sessionId,
        code: newValue,
      };
      console.log("[CodeSync] emit code-change:", { length: newValue.length });
      socketRef.current.emit(SOCKET_EVENTS.CODE_CHANGE, payload);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] relative">
      {/* Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Editor</span>
          </div>
          <select 
            value={selectedLanguage}
            onChange={onLanguageChange}
            className="bg-slate-800 text-slate-300 text-xs border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <button 
          onClick={onRunCode}
          disabled={isRunning}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all
            ${isRunning 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
            }
          `}
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          Run
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden pt-2">
        <Editor
          height="100%"
          theme="vs-dark"
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || 'javascript'}
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10 },
            fontFamily: "'JetBrains Mono', monospace",
            renderWhitespace: "selection",
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
