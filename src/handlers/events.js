import { readdir } from "fs/promises";
import { resolve } from "path";

const EVENTS_PATH = resolve("src", "events");

const EVENTS_LOADED = Symbol.for("totorobot.eventsLoaded");
const MAIN_EVENTS_LOGGED = Symbol.for("totorobot.eventsLoadedLogged.main");

export default async function (sock, context = {}) {
  if (sock?.[EVENTS_LOADED]) return;
  if (sock) sock[EVENTS_LOADED] = true;

  const folder = await readdir(EVENTS_PATH);

  if (!folder.length) return;

  let eventsCount = 0;

  for (const file of folder) {
    const { default: event } = await import(`../events/${file}`);

    const method = event.once ? "once" : "on";

    sock.ev[method](event.name, (...args) => event.run(...args, sock, context));

    eventsCount++;
  }

  const logSubbots = String(process.env.LOG_SUBBOT_EVENTS || "false") === "true";

  if (sock?.isSubbot) {
    if (logSubbots) console.log("Eventos cargados:", eventsCount);
    return;
  }

  if (!globalThis[MAIN_EVENTS_LOGGED]) {
    globalThis[MAIN_EVENTS_LOGGED] = true;
    console.log("Eventos cargados:", eventsCount);
  }
}
