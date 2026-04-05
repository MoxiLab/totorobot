import { makeWASocket, useMultiFileAuthState, Browsers } from "baileys";
import { TotoData } from "./utils/TotoData.js";
import { getCache } from "./utils/cache.js";
import { readdir } from "fs/promises";
import enquirer from "enquirer";
import { pino } from "pino";

process.loadEnvFile();

globalThis.commands = new TotoData();

export async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState("sessions/totoro");

  const sock = makeWASocket({
    cachedGroupMetadata: (jid) => getCache(jid),
    browser: Browsers.appropriate("chrome"),
    logger: pino({ level: "silent" }),
    version: [2, 3000, 1033916097],
    auth: state,
  });

  if (!sock.authState.creds.registered) {
    const response = await enquirer.prompt({
      type: "input",
      name: "phoneNumber",
      message: "Ingresa un número de teléfono:",
    });

    const phoneNumber = response.phoneNumber.replace(/\D+/g, "");

    const code = await sock.requestPairingCode(phoneNumber);

    console.log(`Tu codigo de conexión es: ${code}`);
  }

  const folder = await readdir("./src/handlers");

  for (const file of folder) {
    const { default: handler } = await import(`./handlers/${file}`);
    if (typeof handler === "function") handler(sock);
  }

  sock.ev.on("call", ([{ id, from }]) => sock.rejectCall(id, from));

  sock.ev.on("creds.update", saveCreds);
}

connect();

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
