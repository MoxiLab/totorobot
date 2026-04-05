import { readdir } from "fs/promises";
import { resolve } from "path";

const CMD_PATH = resolve("src", "commands");

export default async function () {
  if (globalThis.commands.size) return;

  const directory = await readdir(CMD_PATH);

  for (const folder of directory) {
    const files = await readdir(resolve(CMD_PATH, folder));

    for (const file of files) {
      const { default: command } = await import(`../commands/${folder}/${file}`);
      globalThis.commands.set(command.name, command);
    }
  }

  console.log(`Comandos cargados:`, globalThis.commands.size);
}
