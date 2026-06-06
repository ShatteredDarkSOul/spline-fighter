// =====================================================
// Spline Fighter — self-hosted multiplayer server
// =====================================================
// Foundation scope: connection + room-code 1v1 pairing + live INPUT RELAY.
// This server is intentionally NOT authoritative — it does not run the game
// simulation. It only pairs two sockets into a room and forwards each peer's
// input-intent object to the other. Full state-sync / rollback is deferred.
//
// Run:   npm install && npm start
// Expose: ngrok http 3000   (or)   cloudflared tunnel --url http://localhost:3000
// Then paste the resulting HTTPS URL into the game's "Server URL" field.

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

// Bare HTTP server with a tiny health/landing response so visiting the URL in a
// browser shows something friendly instead of "Cannot GET /".
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Spline Fighter multiplayer server is running.\n');
});

// Explicit origin allowlist (defense-in-depth before public tunnel testing).
// Only known frontend origins may make browser (cross-origin) connections.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:4175',
  'https://shattereddarksoul.github.io',
]);

// Socket.IO CORS origin callback. `origin` is undefined for same-origin and for
// non-browser clients (curl, CLI test tools) — those are allowed. Browser
// requests carry an Origin header and must be on the allowlist.
function corsOrigin(origin, callback) {
  if (!origin || ALLOWED_ORIGINS.has(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Origin not allowed: ' + origin), false);
  }
}

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
});

// In-memory room table. code -> { code, host, guest }
// host/guest are socket ids (or null). No persistence; rooms vanish on restart.
const rooms = new Map();

// Unambiguous 4-char codes (no 0/O/1/I) so they're easy to read aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeRoomCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  } while (rooms.has(code));
  return code;
}

// Find the room a socket belongs to (host or guest), or null.
function roomOfSocket(socket) {
  const code = socket.data.roomCode;
  if (!code) return null;
  return rooms.get(code) || null;
}

// The other socket id in a room, relative to a given socket.
function peerId(room, socketId) {
  if (!room) return null;
  return room.host === socketId ? room.guest : room.host;
}

io.on('connection', (socket) => {
  console.log(`[+] connect ${socket.id}`);

  // ----- create a room (this socket becomes the host / p1) -----
  socket.on('create-room', () => {
    // Leave any previous room first.
    cleanupSocketRoom(socket, /*notifyPeer=*/true);
    const code = makeRoomCode();
    rooms.set(code, { code, host: socket.id, guest: null });
    socket.data.roomCode = code;
    socket.join(code);
    console.log(`[room] ${socket.id} created ${code}`);
    socket.emit('room-created', { code, slot: 'p1' });
  });

  // ----- join an existing room (this socket becomes the guest / p2) -----
  socket.on('join-room', ({ code } = {}) => {
    const key = String(code || '').toUpperCase().trim();
    const room = rooms.get(key);
    if (!room) {
      socket.emit('join-error', { reason: 'no-such-room' });
      return;
    }
    if (room.guest) {
      socket.emit('join-error', { reason: 'room-full' });
      return;
    }
    cleanupSocketRoom(socket, /*notifyPeer=*/true);
    room.guest = socket.id;
    socket.data.roomCode = key;
    socket.join(key);
    console.log(`[room] ${socket.id} joined ${key}`);
    socket.emit('room-joined', { code: key, slot: 'p2' });
    // Tell BOTH sockets the pairing is complete so each can start the match.
    io.to(key).emit('peer-joined', { code: key });
  });

  // ----- relay an input-intent object to the peer -----
  socket.on('input', ({ intent } = {}) => {
    const room = roomOfSocket(socket);
    if (!room) return;
    const target = peerId(room, socket.id);
    if (target) io.to(target).emit('peer-input', { intent: intent || {} });
  });

  // ----- latency probe -----
  socket.on('net-ping', ({ t } = {}) => {
    socket.emit('net-pong', { t });
  });

  // ----- explicit leave (e.g. user closes the overlay / match) -----
  socket.on('leave-room', () => {
    cleanupSocketRoom(socket, /*notifyPeer=*/true);
  });

  socket.on('disconnect', () => {
    console.log(`[-] disconnect ${socket.id}`);
    cleanupSocketRoom(socket, /*notifyPeer=*/true);
  });
});

// Remove a socket from its room; optionally notify the remaining peer and drop
// the room. If the host leaves, the room is destroyed; if the guest leaves, the
// slot reopens so the host can wait for a new joiner.
function cleanupSocketRoom(socket, notifyPeer) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.data.roomCode = null;
  socket.leave(code);
  if (!room) return;

  const other = peerId(room, socket.id);
  if (notifyPeer && other) io.to(other).emit('peer-left', { code });

  if (room.host === socket.id) {
    // Host left — tear the room down entirely.
    rooms.delete(code);
    console.log(`[room] ${code} closed (host left)`);
  } else if (room.guest === socket.id) {
    // Guest left — reopen the slot.
    room.guest = null;
    console.log(`[room] ${code} guest slot reopened`);
  }
}

httpServer.listen(PORT, () => {
  console.log(`Spline Fighter server listening on :${PORT}`);
});
