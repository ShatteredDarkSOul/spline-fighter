# Spline Fighter — Self-Hosted Multiplayer Server

A tiny Socket.IO **relay + room-code pairing** server for the online (VS ONLINE) mode.
It runs on your own machine — no paid backend, no cloud account.

> **Foundation scope:** this server only pairs two players into a room and forwards
> each player's input intents to the other. It is **not authoritative** — it does not
> run the game simulation. Movement will be jittery; full state-sync is a later milestone.

## Run it

```bash
cd server
npm install
npm start
```

You should see:

```
Spline Fighter server listening on :3000
```

For a quick local sanity check, open <http://localhost:3000> — it replies
`Spline Fighter multiplayer server is running.`

## Expose it to the internet

The browser frontend (especially the live GitHub Pages site, which is HTTPS) needs a
**public HTTPS URL**. Use either tool — both are free:

**ngrok**
```bash
ngrok http 3000
```
Copy the `https://....ngrok-free.app` URL it prints.

**Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:3000
```
Copy the `https://....trycloudflare.com` URL it prints.

## Connect from the game

1. In the game, open the menu (Esc) → **VS ONLINE**.
2. Paste the **Server URL**:
   - Testing the local Vite preview? Use `http://localhost:3000`.
   - Playing from the live site or another device? Use the **HTTPS tunnel URL**.
3. Click **Connect**.
4. One player clicks **Create Room** and reads out the 4-character code.
5. The other player types the code and clicks **Join**.
6. The match starts as soon as both are paired.

### Important: HTTPS / mixed content

The live site is served over HTTPS, and browsers block an HTTPS page from talking to a
plain `http://` server (mixed content). So from the live site you **must** use the
`https://` tunnel URL. `http://localhost:3000` only works when you opened the frontend
itself over `http://localhost` (the Vite dev server or preview).

## Controls in online mode

The host plays as **P1** with the P1 keys (A/D move, W jump, F attack, G dash, H projectile, S guard);
the guest plays as **P2** with the P2 keys (arrows move/jump, K attack, L dash, `;` projectile, ArrowDown guard).
Shot-cycle / enhance one-shots are not relayed yet (a known foundation limitation).
