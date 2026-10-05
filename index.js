const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
app.use(cors());
let sock;
async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        browser: ["Habibti MD", "Chrome", "1.0.0"]
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { if (u.connection === 'close') setTimeout(startSock, 3000); });
}
startSock();
app.get('/', (req, res) => res.send('<h1>HABIBTI MD ONLINE</h1><p>Owner @sataima_got_banned_at_night</p><p>Use /pair?number=234xxx</p>'));
app.get('/pair', async (req, res) => {
    let number = req.query.number?.replace(/[^0-9]/g, '');
    if (!number) return res.json({ error: "Need number" });
    if (!sock) return res.json({ code: "FAILED", error: "Starting wait 10s" });
    try { const code = await sock.requestPairingCode(number); return res.json({ code }); }
    catch (e) { return res.json({ code: "FAILED", error: e.message }); }
});
app.listen(process.env.PORT || 3000);
