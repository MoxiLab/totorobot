import { makeWASocket, useMultiFileAuthState, Browsers } from "baileys";
import { getCache } from "./cache.js";
import { pino } from "pino";
import loadEvents from "../handlers/events.js";
import { rm, readdir, mkdir } from "fs/promises";

export const activeSubbots = new Map();

export async function createSubbot(id, isPhone = false) {
  if (activeSubbots.has(id)) return { error: "Already active" };

  const sessionPath = `sessions/subbots/${id}`;
  await mkdir(sessionPath, { recursive: true }).catch(() => {});

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    cachedGroupMetadata: async (jid) => await getCache(jid),
    browser: Browsers.appropriate("chrome"),
    logger: pino({ level: "silent" }),
    version: [2, 3000, 1033916097],
    auth: state,
  });

  sock.isSubbot = true;
  sock.subbotId = id;

  activeSubbots.set(id, sock);
  await loadEvents(sock);
  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    return new Promise((resolve) => {
      const authListener = async (update) => {
        const { qr, connection } = update;

        if (connection === "close") {
          sock.ev.off("connection.update", authListener);
          activeSubbots.delete(id);
          resolve({ error: "Connection closed" });
        }

        if (qr) {
          if (!isPhone) {
            sock.ev.off("connection.update", authListener);
            resolve({ qr, id });
          } else {
            try {
              const code = await sock.requestPairingCode(id, "TOTOPAIR");
              sock.ev.off("connection.update", authListener);
              resolve({ code, id });
            } catch (e) {
              sock.ev.off("connection.update", authListener);
              activeSubbots.delete(id);
              resolve({ error: "Failed to get pairing code" });
            }
          }
        }

        if (connection === "open") {
          sock.ev.off("connection.update", authListener);
          resolve({ connected: true, id });
        }
      };

      sock.ev.on("connection.update", authListener);
    });
  }

  return { connected: true, id };
}

export async function deleteSubbot(id) {
  const sock = activeSubbots.get(id);

  if (sock) {
    try {
      if (sock.ws && sock.ws.readyState === 1) {
        await sock.logout();
      }
    } catch {}
    activeSubbots.delete(id);
  }

  await rm(`sessions/subbots/${id}`, { recursive: true, force: true }).catch(() => {});
}

export async function loadSavedSubbots() {
  try {
    const folders = await readdir("sessions/subbots");
    for (const folder of folders) {
      createSubbot(folder, true).catch(() => {});
    }
  } catch {}
}
