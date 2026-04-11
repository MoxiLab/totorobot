import { makeWASocket, useMultiFileAuthState, Browsers } from "baileys";
import { TotoData } from "./utils/TotoData.js";
import { getCache } from "./utils/cache.js";
import { readdir } from "fs/promises";
import enquirer from "enquirer";
import { pino } from "pino";
import { startServer } from "./server/index.js";
import { loadSavedSubbots } from "./utils/SubbotManager.js";

process.loadEnvFile();

globalThis.commands = new TotoData();

let connectPromise;

export async function connect() {
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
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
    const code = await sock.requestPairingCode(phoneNumber, "TOTOPAIR");

    console.log(`\n Tu codigo de conexión es: ${code}`);
  }

  const folder = await readdir("./src/handlers");

  for (const file of folder) {
    const { default: handler } = await import(`./handlers/${file}`);
    if (typeof handler === "function") handler(sock);
  }

    sock.ev.on("call", ([{ id, from }]) => sock.rejectCall(id, from));
    sock.ev.on("creds.update", saveCreds);

    return sock;
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

startServer(process.env.PORT || 3000);
connect().then(loadSavedSubbots);

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
