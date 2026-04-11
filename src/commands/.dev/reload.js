import loadCommands from "../../handlers/commands.js";

export default {
  name: "reload",
  alias: ["r", "rl"],
  category: "dev",
  dev: true,
  description: "Recarga todos los comandos sin reiniciar el bot.",
  usage: "!reload",

  async run(sock, message, args) {
    try {
      await loadCommands({ force: true });

      await sock.sendMessage(message.key.remoteJid, {
        text: `Reload completado. Comandos activos: ${globalThis.commands.size}`,
      });
    } catch (error) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Error al hacer reload: ${error?.message || error}`,
      });
    }
  },
};
