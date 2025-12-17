import React, { useState } from "react";
import {
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import {
  MessageSquare,
  LayoutGrid,
  Maximize2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
} from "lucide-react";

const VideoCallUI = ({ chatClient, channel, isChatOpen, setIsChatOpen }) => {
  const { useCallCallingState, useParticipantCount, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const participants = useParticipants ? useParticipants() : [];

  const [layout, setLayout] = useState("grid");

  // --- Helpers for Custom Controls ---
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { isMute: isCamMuted } = useCameraState();

  const toggleMic = async () => await call?.microphone.toggle();
  const toggleCam = async () => await call?.camera.toggle();

  if (callingState !== "joined") {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
          <span className="font-medium tracking-wide animate-pulse">
            JOINING SECURE ROOM...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-full bg-slate-950 overflow-hidden flex-col">
      {/* VIDEO AREA */}
      <div className={`relative flex-1 bg-black overflow-hidden transition-all duration-300 ${isChatOpen ? 'h-[50%]' : 'h-full'}`}>
        
        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/5 text-xs font-medium text-slate-300">
            <Users size={14} className="text-blue-400" />
            <span>{participantCount} Online</span>
          </div>
        </div>
        {/* Names Overlay */}
        {Array.isArray(participants) && participants.length > 0 && (
          <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 max-w-[40%] justify-end">
            {participants.map((p) => (
              <span key={p.sessionId || p.userId || p.id} className="px-2 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/5 text-[11px] text-slate-200">
                {p.name || p.userId || "User"}
              </span>
            ))}
          </div>
        )}

        {/* Stream Layout */}
        <div className="w-full h-full">
          {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}
          
          {/* Connection Quality Indicator Override */}
          {/* <style>
            {`
              .str-video__connection-quality-indicator {
                bottom: 6.5rem !important;
                right: 1rem !important;
                background: rgba(15, 23, 42, 0.8) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 9999px !important;
                padding: 4px 12px !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0) !important;
              }
            `}
          </style> */}
        </div>

        {/* FLOATING CONTROLS (Only visible when chat is closed or adjusted when open) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-fit">
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all hover:bg-slate-900/90">
            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isMicMuted
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleCam}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isCamMuted
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isCamMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1 sm:mx-2" />

            {/* Layout Switch */}
            <button
              onClick={() => setLayout(layout === "grid" ? "speaker" : "grid")}
              className="p-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              title="Change Layout"
            >
              <LayoutGrid size={20} />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 rounded-xl transition-all relative ${
                isChatOpen
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare size={20} />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1 sm:mx-2" />

            {/* Leave Call */}
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-red-600/20"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* CHAT AREA (Split Vertical) */}
      {isChatOpen && chatClient && channel && (
        <div className="h-[50%] flex flex-col bg-slate-950 border-t border-white/10 min-h-0">
            <Chat client={chatClient} theme="str-chat__theme-dark">
              <Channel channel={channel}>
                <Window>
                  {/* Chat Header */}
                  <div className="h-10 flex items-center justify-between px-4 border-b border-white/10 bg-slate-950">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-blue-400" />
                      <span className="text-xs font-bold text-white tracking-wide">LIVE CHAT</span>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded">
                        <Maximize2 size={14} className="text-slate-400"/>
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 min-h-0 bg-slate-950/50">
                    <MessageList />
                  </div>

                  {/* Input Area */}
                  <div className="p-2 bg-slate-950 border-t border-white/10">
                    <MessageInput />
                  </div>
                </Window>
              </Channel>
            </Chat>
        </div>
      )}
    </div>
  );
};

export default VideoCallUI;
