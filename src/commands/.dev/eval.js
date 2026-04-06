import { inspect } from "util";

export default {
  name: "eval",
  dev: true,

  async run(sock, msg, args) {
    try {
      if (!args || args.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: "❌ Debes escribir algo para evaluar.",
        });
      }

      const code = args.join(" ");
      let evaled = eval(code);

      if (evaled instanceof Promise) evaled = await evaled;

      evaled = typeof evaled === "string" ? evaled : inspect(evaled);

      sock.sendMessage(msg.key.remoteJid, { text: `✅ Resultado:\n${evaled}` });
    } catch (error) {
      sock.sendMessage(msg.key.remoteJid, { text: `❌ Error:\n${error}` });
    }
  },
};