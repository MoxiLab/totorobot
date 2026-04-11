import loadCommands from "../../handlers/commands.js";
import loadEvents from "../../handlers/events.js";

export default {
  name: "reload",
  alias: ["r", "rl"],
  category: "dev",
  dev: true,
  description: "Recarga comandos y eventos sin reiniciar el bot.",
  usage: "!reload",

  async run(sock, message, args) {
    try {
      await loadCommands({ force: true });
      await loadEvents(sock, { force: true });

      await sock.sendMessage(message.key.remoteJid, {
        text: `Reload completado. Comandos activos: ${globalThis.commands.size}. Eventos recargados.`,
      });
    } catch (error) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Error al hacer reload: ${error?.message || error}`,
      });
    }
  },
};
