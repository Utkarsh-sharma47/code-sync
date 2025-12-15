import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  return useMutation({
    mutationFn: sessionApi.createSession,
    onSuccess: (data) => {
      console.log("CreateSession success payload:", data);
      if (!data?.session?._id) {
        console.warn("CreateSession: missing session._id in response", data);
        toast.error("Session created, but server did not return an ID. Please try again or contact support.");
        return;
      }
      toast.success("Session created successfully!");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create session"),
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
    retry: 1, 
  });
};

export const useMyRecentSessions = () => {
  return useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
    retry: 1,
  });
};

export const useSessionById = (id) => {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5s to check for updates (like status changes)
  });
};

// --- THESE WERE MISSING ---

export const useJoinSession = () => {
  return useMutation({
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });
};

export const useEndSession = () => {
  return useMutation({
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });
};