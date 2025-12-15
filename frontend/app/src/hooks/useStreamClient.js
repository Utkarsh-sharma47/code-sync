import { useState, useEffect, useRef, useCallback } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  
  const [isInitializingCall, setIsInitializingCall] = useState(false);
  const [connectionError, setConnectionError] = useState(null); // New Error State

  const initAttempted = useRef(false);
  const videoCallRef = useRef(null);
  const chatClientRef = useRef(null);

  const initCall = useCallback(async () => {
    // Prevent double init
    if (initAttempted.current) return;

    // Validation (allow active sessions even if participant flag is slightly stale)
    if (!session || loadingSession) return;
    if (!session.callId || session.status === "completed") return;
    if (!isHost && !isParticipant && session.status !== "active") return;

    setIsInitializingCall(true);
    setConnectionError(null);
    initAttempted.current = true;

    let videoCall = null;
    let chatClientInstance = null;

    try {
      // 1. Get Token & user profile (Clerk ID)
      const tokenPayload = await sessionApi.getStreamToken();
      const { token, userId, userName, userImage } = tokenPayload || {};
      if (!token || !userId) throw new Error("Failed to fetch Stream token from backend");

      // 2. Init Video Client
      const client = await initializeStreamClient(
        { id: userId, name: userName, image: userImage },
        token
      );
      setStreamClient(client);

      // 3. Join Call
      videoCall = client.call("default", session.callId);
      await videoCall.join({ create: true });
      videoCallRef.current = videoCall;
      setCall(videoCall);

      // 4. Init Chat Client
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      if (!apiKey) throw new Error("Stream API Key is missing in .env");
      
      chatClientInstance = StreamChat.getInstance(apiKey);
      await chatClientInstance.connectUser(
        { id: userId, name: userName, image: userImage },
        token
      );
      chatClientRef.current = chatClientInstance;
      setChatClient(chatClientInstance);

      // 5. Watch Channel
      const chatChannel = chatClientInstance.channel("messaging", session.callId);
      try {
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (watchError) {
        console.error("Channel watch failed, retrying once:", watchError);
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await chatChannel.watch();
          setChannel(chatChannel);
        } catch (retryError) {
          console.error("Channel watch retry failed:", retryError);
          throw retryError;
        }
      }

    } catch (error) {
      console.error("Stream Connection Error:", error);
      setConnectionError(error.message || "Connection failed. Please retry.");
      toast.error("Video connection failed");
      initAttempted.current = false; // Allow retry
    } finally {
      setIsInitializingCall(false);
    }
  }, [session, loadingSession, isHost, isParticipant]);

  useEffect(() => {
    if (session && !loadingSession) {
      initCall();
    }

    // Cleanup
    return () => {
      initAttempted.current = false;
      (async () => {
        try {
          if (videoCallRef.current) await videoCallRef.current.leave();
          if (chatClientRef.current) await chatClientRef.current.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
      setStreamClient(null);
      setCall(null);
      setChatClient(null);
      setChannel(null);
    };
  }, [session, loadingSession, initCall]);

  const retryConnection = async () => {
    initAttempted.current = false;
    await initCall();
  };

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
    connectionError, // Exported this
    retryConnection,
  };
}

export default useStreamClient;