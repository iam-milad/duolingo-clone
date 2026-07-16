import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamVideoClient, Call } from '@stream-io/video-react-native-sdk';

import { getApiBaseUrl } from '@/lib/stream';

export type CallStatus = 'connecting' | 'joined' | 'error' | 'ended';
export type AgentStatus = 'idle' | 'connecting' | 'connected' | 'failed';

interface UseStreamCallOptions {
  userId: string;
  userName?: string;
  userImageUrl?: string;
  lessonId: string;
  languageCode: string;
}

interface UseStreamCallResult {
  callStatus: CallStatus;
  agentStatus: AgentStatus;
  isMuted: boolean;
  errorMessage: string | null;
  toggleMute: () => Promise<void>;
  endCall: () => Promise<void>;
  retryJoin: () => void;
}

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export function useStreamCall({
  userId,
  userName,
  userImageUrl,
  lessonId,
  languageCode,
}: UseStreamCallOptions): UseStreamCallResult {
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const callIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const stopAgent = useCallback(async () => {
    const callId = callIdRef.current;
    const sessionId = sessionIdRef.current;
    if (!callId || !sessionId) return;
    sessionIdRef.current = null;
    try {
      await fetch(
        `${getApiBaseUrl()}/api/agent-session?callId=${encodeURIComponent(callId)}&sessionId=${encodeURIComponent(sessionId)}`,
        { method: 'DELETE' },
      );
    } catch {
      // non-fatal — agent will auto-exit when the call ends
    }
  }, []);

  const cleanup = useCallback(async () => {
    await stopAgent();
    try {
      if (callRef.current) {
        await callRef.current.microphone.disable();
        await callRef.current.leave();
        callRef.current = null;
      }
    } catch {
      // ignore leave errors on cleanup
    }
    try {
      if (clientRef.current) {
        await clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    } catch {
      // ignore disconnect errors on cleanup
    }
  }, [stopAgent]);

  useEffect(() => {
    let cancelled = false;

    const joinCall = async () => {
      setCallStatus('connecting');
      setAgentStatus('idle');
      setErrorMessage(null);

      try {
        // Step 1: get Stream token + callId (also creates the call with lesson context)
        const response = await fetch(`${getApiBaseUrl()}/api/stream-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, userName, lessonId, languageCode }),
        });

        if (!response.ok) throw new Error('Could not reach the lesson server.');

        const { token, callId } = await response.json() as { token: string; callId: string };
        if (cancelled) return;

        callIdRef.current = callId;

        // Step 2: join the Stream call
        const client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: { id: userId, name: userName ?? userId, image: userImageUrl },
          token,
        });
        clientRef.current = client;

        const call = client.call('default', callId);
        callRef.current = call;

        await call.join({ create: true });
        if (cancelled) { await cleanup(); return; }

        // Audio-only: camera off, mic on
        await call.camera.disable();
        await call.microphone.enable();

        setCallStatus('joined');
        setIsMuted(false);

        // Step 3: spawn the AI teacher (non-fatal if agent server is down)
        setAgentStatus('connecting');
        try {
          const agentRes = await fetch(`${getApiBaseUrl()}/api/agent-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId, callType: 'default' }),
          });
          if (cancelled) return;
          if (agentRes.ok) {
            const { session_id } = await agentRes.json() as { session_id: string };
            sessionIdRef.current = session_id;
            setAgentStatus('connected');
          } else {
            setAgentStatus('failed');
          }
        } catch {
          if (!cancelled) setAgentStatus('failed');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to join the audio session.';
        setErrorMessage(msg);
        setCallStatus('error');
      }
    };

    joinCall();

    return () => {
      cancelled = true;
      cleanup();
    };
    // retryKey triggers a fresh join attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const toggleMute = useCallback(async () => {
    if (!callRef.current) return;
    try {
      if (isMuted) {
        await callRef.current.microphone.enable();
      } else {
        await callRef.current.microphone.disable();
      }
      setIsMuted((prev) => !prev);
    } catch {
      // ignore mic toggle errors
    }
  }, [isMuted]);

  const endCall = useCallback(async () => {
    await cleanup();
    setCallStatus('ended');
    setAgentStatus('idle');
  }, [cleanup]);

  const retryJoin = useCallback(() => {
    cleanup().then(() => {
      callIdRef.current = null;
      sessionIdRef.current = null;
      setRetryKey((k) => k + 1);
    });
  }, [cleanup]);

  return { callStatus, agentStatus, isMuted, errorMessage, toggleMute, endCall, retryJoin };
}
