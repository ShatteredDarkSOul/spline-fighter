// =====================================================
// Spline Fighter — client networking layer
// =====================================================
// Vite-bundled ES module. Wraps socket.io-client and exposes a tiny, null-safe
// `window.SplineNet` API that the (inline, non-module) game script in index.html
// calls. The game treats SplineNet as optional: if this module fails to load,
// `window.SplineNet` is simply undefined and the local-only build is unaffected.
//
// Foundation scope: connect to a manually entered Server URL, create/join a
// room by code, relay input-intent objects to the peer. Non-authoritative.

import { io } from 'socket.io-client';

// Canonical action set relayed over the wire. Mirrors the keys the game's
// getInput()/netInput use. (Cycle-shot / enhance one-shots are intentionally
// not relayed in the foundation.)
const INTENT_KEYS = ['left', 'right', 'jump', 'attack', 'dash', 'projectile', 'guard'];

// Room codes are always 4 uppercase alphanumerics (server-generated). Validate
// any server-supplied code before storing it — a malicious server must not be
// able to push arbitrary strings into the UI / game state.
const VALID_CODE = /^[A-Z0-9]{4}$/;
function cleanCode(c) {
  const s = String(c || '').toUpperCase();
  return VALID_CODE.test(s) ? s : null;
}

const SplineNet = {
  socket: null,

  // Snapshot of connection/room status, polled by the game + overlay UI.
  state: {
    status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error'
    url: null,
    room: null,             // room code once created/joined
    slot: null,             // 'p1' (host) | 'p2' (guest)
    peerPresent: false,     // is the other player paired in?
    latency: null,          // ms, from net-ping roundtrip
    lastError: null,
  },

  // Latest input intent received from the peer. The game copies this into the
  // remote player's netInput each frame.
  remoteInput: blankIntent(),

  // Optional single callback the game registers to react to lifecycle events:
  //   onEvent(type, payload) with type in:
  //   'connected' | 'disconnected' | 'connect-error' |
  //   'room-created' | 'room-joined' | 'join-error' |
  //   'peer-joined' | 'peer-left'
  onEvent: null,

  _pingTimer: null,

  isConnected() {
    return !!(this.socket && this.socket.connected);
  },

  // Connect to a Socket.IO server at `url`. Resolves on connect, rejects on
  // connect_error/timeout. Safe to call again to switch servers.
  connect(url) {
    const target = String(url || '').trim();
    if (!target) return Promise.reject(new Error('empty-url'));

    // Tear down any existing connection first.
    this.disconnect();

    this.state.status = 'connecting';
    this.state.url = target;
    this.state.lastError = null;

    return new Promise((resolve, reject) => {
      let settled = false;
      const socket = io(target, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 8000,
        forceNew: true,
      });
      this.socket = socket;

      socket.on('connect', () => {
        this.state.status = 'connected';
        this._startPing();
        this._emitEvent('connected', {});
        if (!settled) { settled = true; resolve(); }
      });

      socket.on('connect_error', (err) => {
        this.state.status = 'error';
        this.state.lastError = err && err.message ? err.message : 'connect-error';
        this._emitEvent('connect-error', { message: this.state.lastError });
        if (!settled) { settled = true; reject(err); }
      });

      socket.on('disconnect', () => {
        this.state.status = 'disconnected';
        this.state.peerPresent = false;
        this._stopPing();
        this._emitEvent('disconnected', {});
      });

      // ----- room lifecycle -----
      socket.on('room-created', ({ code, slot }) => {
        const clean = cleanCode(code);
        if (!clean) { this.state.lastError = 'Invalid room code from server.'; this._emitEvent('join-error', { reason: this.state.lastError }); return; }
        this.state.room = clean;
        this.state.slot = slot;
        this.state.peerPresent = false;
        this._emitEvent('room-created', { code: clean, slot });
      });

      socket.on('room-joined', ({ code, slot }) => {
        const clean = cleanCode(code);
        if (!clean) { this.state.lastError = 'Invalid room code from server.'; this._emitEvent('join-error', { reason: this.state.lastError }); return; }
        this.state.room = clean;
        this.state.slot = slot;
        this._emitEvent('room-joined', { code: clean, slot });
      });

      socket.on('join-error', ({ reason }) => {
        const msg = reason === 'no-such-room' ? 'No such room.'
                  : reason === 'room-full'    ? 'Room is full.'
                  : 'Could not join room.';
        this.state.lastError = msg;
        this._emitEvent('join-error', { reason: msg });
      });

      socket.on('peer-joined', ({ code }) => {
        const clean = cleanCode(code);
        if (clean) this.state.room = clean;
        if (!this.state.room) return; // refuse to start a match from a garbage/missing code
        this.state.peerPresent = true;
        this.remoteInput = blankIntent();
        this._emitEvent('peer-joined', { code: this.state.room, slot: this.state.slot });
      });

      socket.on('peer-left', () => {
        this.state.peerPresent = false;
        this.remoteInput = blankIntent();
        this._emitEvent('peer-left', {});
      });

      // ----- input relay -----
      socket.on('peer-input', ({ intent }) => {
        this.remoteInput = sanitizeIntent(intent);
      });

      // ----- latency -----
      socket.on('net-pong', ({ t }) => {
        if (typeof t === 'number') this.state.latency = Math.max(0, Math.round(performance.now() - t));
      });
    });
  },

  createRoom() {
    if (this.isConnected()) this.socket.emit('create-room');
  },

  joinRoom(code) {
    const key = String(code || '').toUpperCase().trim();
    if (this.isConnected() && key) this.socket.emit('join-room', { code: key });
  },

  // Send the local player's input intent to the peer. `intent` is an object
  // with any of INTENT_KEYS as booleans.
  sendInput(intent) {
    if (this.isConnected() && this.state.peerPresent) {
      this.socket.emit('input', { intent: sanitizeIntent(intent) });
    }
  },

  leaveRoom() {
    if (this.isConnected()) this.socket.emit('leave-room');
    this.state.room = null;
    this.state.slot = null;
    this.state.peerPresent = false;
    this.remoteInput = blankIntent();
  },

  disconnect() {
    this._stopPing();
    if (this.socket) {
      try { this.socket.removeAllListeners(); this.socket.disconnect(); } catch (_) {}
      this.socket = null;
    }
    this.state.status = 'disconnected';
    this.state.room = null;
    this.state.slot = null;
    this.state.peerPresent = false;
    this.remoteInput = blankIntent();
  },

  _startPing() {
    this._stopPing();
    this._pingTimer = setInterval(() => {
      if (this.isConnected()) this.socket.emit('net-ping', { t: performance.now() });
    }, 2000);
  },

  _stopPing() {
    if (this._pingTimer) { clearInterval(this._pingTimer); this._pingTimer = null; }
  },

  _emitEvent(type, payload) {
    if (typeof this.onEvent === 'function') {
      try { this.onEvent(type, payload); } catch (e) { console.error('SplineNet.onEvent error', e); }
    }
  },
};

function blankIntent() {
  const o = {};
  for (const k of INTENT_KEYS) o[k] = false;
  return o;
}

// Coerce an incoming/outgoing intent to a clean boolean-only object so a
// malformed peer can't inject arbitrary keys.
function sanitizeIntent(intent) {
  const o = blankIntent();
  if (intent && typeof intent === 'object') {
    for (const k of INTENT_KEYS) o[k] = !!intent[k];
  }
  return o;
}

window.SplineNet = SplineNet;
