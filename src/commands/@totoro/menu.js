export default {
  name: "menu",
  alias: ["help", "h", "m", "commands"],
  category: "Totoro 🤖",

  run(sock, msg) {
    const commands = globalThis.commands.filter(({ dev }) => !dev);

    const categories = {};

    for (const [name, data] of commands) {
      const cat = data.category || "Otros";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let text = `👋 Hola *${msg.pushName || "amigo"}*!\n\n`;
    text += `📌 Tengo un total de *${commands.size}* comandos disponibles.\n`;
    text += `💠 Prefijo: *!*\n\n`;

    for (const cat of Object.keys(categories).sort()) {
      text += `*${cat}*\n`;

      for (const cmd of categories[cat].sort()) {
        text += `- ${cmd}\n`;
      }

      text += `\n`;
    }

    text += `💡 Usa los comandos con cuidado y diviértete!`;

    sock.sendMessage(msg.key.remoteJid, { text });
  },
};
