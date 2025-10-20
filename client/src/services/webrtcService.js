import socketService from './socketService';
import { ICE_SERVERS } from '../utils/constants';
import { getStoredToken } from './authService';

class WebRTCService {
  constructor() {
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.sessionId = null;
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onParticipants = null;
    this.onChatMessage = null;
  }

  async init(sessionId, callbacks = {}) {
    this.sessionId = sessionId;
    this.onRemoteStream = callbacks.onRemoteStream;
    this.onConnectionStateChange = callbacks.onConnectionStateChange;
    this.onParticipants = callbacks.onParticipants;
    this.onChatMessage = callbacks.onChatMessage;

    this.pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      bundlePolicy: 'balanced',
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.socket?.emit('webrtc:ice-candidate', {
          sessionId: this.sessionId,
          candidate: event.candidate,
        });
      }
    };

    this.pc.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.pc.connectionState);
      }
    };

    // Socket listeners
    socketService.socket?.on('webrtc:offer', async ({ sdp }) => {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      socketService.socket?.emit('webrtc:answer', {
        sessionId: this.sessionId,
        sdp: this.pc.localDescription,
      });
    });

    socketService.socket?.on('webrtc:answer', async ({ sdp }) => {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketService.socket?.on('webrtc:ice-candidate', async ({ candidate }) => {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ice candidate', e);
      }
    });

    socketService.socket?.on('session:participants', (participants) => {
      if (this.onParticipants) this.onParticipants(participants);
    });

    socketService.socket?.on('session:chat', (payload) => {
      if (this.onChatMessage) this.onChatMessage(payload);
    });
  }

  async testDevices(constraints = { audio: true, video: { width: 1280, height: 720, frameRate: 30 } }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const devices = await navigator.mediaDevices.enumerateDevices();
      stream.getTracks().forEach((t) => t.stop());
      return { ok: true, devices };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async startLocalMedia(constraints = { audio: true, video: { width: 1280, height: 720, frameRate: { ideal: 24 } } }) {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.localStream.getTracks().forEach((track) => this.pc.addTrack(track, this.localStream));
    // Attempt bandwidth adaptation
    try {
      const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (sender) {
        const params = sender.getParameters();
        params.degradationPreference = 'balanced';
        await sender.setParameters(params);
      }
    } catch (_) {}
    return this.localStream;
  }

  async joinSession() {
    const token = getStoredToken();
    socketService.socket?.emit('session:join', { sessionId: this.sessionId, token });
  }

  async makeOffer() {
    const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await this.pc.setLocalDescription(offer);
    socketService.socket?.emit('webrtc:offer', {
      sessionId: this.sessionId,
      sdp: this.pc.localDescription,
    });
  }

  async toggleMute(muted) {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  async toggleCamera(off) {
    if (!this.localStream) return;
    this.localStream.getVideoTracks().forEach((t) => (t.enabled = !off));
  }

  async startScreenShare() {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }
      screenTrack.onended = async () => {
        // revert to camera
        const camTrack = this.localStream?.getVideoTracks()[0];
        if (camTrack && sender) {
          await sender.replaceTrack(camTrack);
        }
      };
      return displayStream;
    } catch (e) {
      console.error('Screen share error', e);
      throw e;
    }
  }

  sendChat(message) {
    socketService.socket?.emit('session:chat', { sessionId: this.sessionId, message });
  }

  async leave() {
    try {
      socketService.socket?.emit('session:leave', { sessionId: this.sessionId });
    } catch (_) {}
    try {
      this.pc?.getSenders().forEach((s) => s.track && s.track.stop());
      this.localStream?.getTracks().forEach((t) => t.stop());
      this.remoteStream?.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    try {
      this.pc?.close();
    } catch (_) {}
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}

export default new WebRTCService();
