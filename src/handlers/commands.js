import { readdir } from "fs/promises";
import { resolve } from "path";

const CMD_PATH = resolve("src", "commands");

export default async function (options = {}) {
  const { force = false } = options;

  if (globalThis.commands.size && !force) return;

  if (force) {
    globalThis.commands.clear();
  }

  const cacheSuffix = force ? `?reload=${Date.now()}` : "";

  const directory = await readdir(CMD_PATH);

  for (const folder of directory) {
    const files = await readdir(resolve(CMD_PATH, folder));

    for (const file of files) {
      const { default: command } = await import(`../commands/${folder}/${file}${cacheSuffix}`);
      globalThis.commands.set(command.name, command);
    }
  }

  console.log(force ? "Comandos recargados:" : "Comandos cargados:", globalThis.commands.size);
}
