import { readdir } from "fs/promises";
import { resolve } from "path";

const EVENTS_PATH = resolve("src", "events");

let eventsCount = 0;

export default async function (sock, context = {}) {
  const folder = await readdir(EVENTS_PATH);

  if (!folder.length) return;

  for (const file of folder) {
    const { default: event } = await import(`../events/${file}`);

    const method = event.once ? "once" : "on";

    sock.ev[method](event.name, (...args) => event.run(...args, sock, context));

    eventsCount++;
  }

  console.log("Eventos cargados:", eventsCount);
}
