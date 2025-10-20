import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Typography,
  Chip,
  Stack,
  TextField,
  Divider,
} from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, ScreenShare, CallEnd } from '@mui/icons-material';
import { getSession, updateSession } from '../services/sessionService';
import webrtcService from '../services/webrtcService';
import socketService from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

const isHttpUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const SessionRoom = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deviceOk, setDeviceOk] = useState(false);
  const [joining, setJoining] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [connState, setConnState] = useState('new');
  const [participants, setParticipants] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [inCall, setInCall] = useState(false);

  const participantNames = useMemo(() => {
    if (!session) return {};
    return {
      [session.teacher._id]: session.teacher.name,
      [session.learner._id]: session.learner.name,
    };
  }, [session]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSession(sessionId);
        if (!mounted) return;
        setSession(s);
        setLoading(false);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load session');
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    // Device test
    (async () => {
      const result = await webrtcService.testDevices();
      setDeviceOk(result.ok);
      if (!result.ok) {
        setError('Camera or microphone access is blocked. Please enable permissions in your browser settings.');
      }
    })();
  }, [session]);

  useEffect(() => {
    // Attach remote stream handler
    const onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    const onConnectionStateChange = (state) => setConnState(state);
    const onParticipants = (p) => {
      setParticipants(p);
      // Decide offerer deterministically to avoid glare
      if (p.length >= 2 && user?._id) {
        const sorted = [...p].sort();
        const offerer = sorted[0];
        if (offerer === user._id) {
          // Initiate offer if connection not established
          if (webrtcService.pc && webrtcService.pc.signalingState === 'stable' && webrtcService.pc.connectionState !== 'connected') {
            webrtcService.makeOffer();
          }
        }
      }
    };
    const onChatMessage = (payload) => setChatMessages((msgs) => [...msgs, payload]);

    webrtcService.init(sessionId, { onRemoteStream, onConnectionStateChange, onParticipants, onChatMessage });

    // Participant joined trigger
    const handleParticipantJoined = async () => {
      // Offerer selection happens on participants event
    };

    socketService.socket?.on('session:participant-joined', handleParticipantJoined);

    const handleReconnect = () => {
      if (inCall) {
        webrtcService.joinSession();
      }
    };
    socketService.socket?.on('connect', handleReconnect);

    return () => {
      socketService.socket?.off('session:participant-joined', handleParticipantJoined);
      socketService.socket?.off('connect', handleReconnect);
    };
  }, [sessionId, user?._id, inCall]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      // Start local media
      const local = await webrtcService.startLocalMedia();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = local;
      }
      // Join
      await webrtcService.joinSession();
      setInCall(true);
      // Update status in-progress
      try { await updateSession(sessionId, { status: 'in-progress' }); } catch (_) {}
    } catch (e) {
      setError(e?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    await webrtcService.leave();
    setInCall(false);
    try { await updateSession(sessionId, { status: 'completed' }); } catch (_) {}
    navigate('/dashboard');
  };

  const handleToggleMute = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    await webrtcService.toggleMute(newMuted);
  };

  const handleToggleCamera = async () => {
    const newOff = !cameraOff;
    setCameraOff(newOff);
    await webrtcService.toggleCamera(newOff);
  };

  const handleScreenShare = async () => {
    try {
      await webrtcService.startScreenShare();
    } catch (e) {
      setError('Failed to start screen share');
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    webrtcService.sendChat(chatInput.trim());
    setChatInput('');
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography>Loading session...</Typography>
    </Container>
  );

  if (error && !deviceOk) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>Video Setup Required</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
        {session?.location && isHttpUrl(session.location) && (
          <Button variant="outlined" href={session.location} target="_blank" rel="noreferrer">
            Open External Call Link
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ p: 1, position: 'relative', bgcolor: '#000' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '65vh', background: '#000' }} />
            <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: 12, right: 12, width: 200, height: 120, background: '#000', borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)' }} />
          </Paper>

          <Paper elevation={2} sx={{ p: 2, mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`Connection: ${connState}`} size="small" />
              <Chip label={`Participants: ${participants.length}`} size="small" />
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton color={muted ? 'error' : 'primary'} onClick={handleToggleMute}>
                {muted ? <MicOff /> : <Mic />}
              </IconButton>
              <IconButton color={cameraOff ? 'error' : 'primary'} onClick={handleToggleCamera}>
                {cameraOff ? <VideocamOff /> : <Videocam />}
              </IconButton>
              <IconButton color="primary" onClick={handleScreenShare}>
                <ScreenShare />
              </IconButton>
              <IconButton color="error" onClick={handleLeave}>
                <CallEnd />
              </IconButton>
              {!joining && (
                <Button variant="contained" onClick={handleJoin} disabled={!deviceOk}>
                  {participants.includes(user?._id) ? 'Rejoin' : 'Join'}
                </Button>
              )}
            </Stack>
          </Paper>
        </Box>

        <Paper elevation={2} sx={{ width: { xs: '100%', md: 350 }, p: 2 }}>
          <Typography variant="h6">Session Chat</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ height: '50vh', overflowY: 'auto', mb: 1 }}>
            {chatMessages.length === 0 ? (
              <Typography color="text.secondary">No messages yet</Typography>
            ) : (
              chatMessages.map((m, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {participantNames[m.from] || 'Unknown'} • {new Date(m.at).toLocaleTimeString()}
                  </Typography>
                  <Typography>{m.message}</Typography>
                </Box>
              ))
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
            />
            <Button variant="contained" onClick={sendChat}>Send</Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Participants</Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {participants.map((pid) => (
              <Typography key={pid}>• {participantNames[pid] || pid}</Typography>
            ))}
          </Stack>
          {session?.location && isHttpUrl(session.location) && (
            <Box sx={{ mt: 2 }}>
              <Button fullWidth variant="outlined" href={session.location} target="_blank" rel="noreferrer">
                Open External Link
              </Button>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default SessionRoom;
