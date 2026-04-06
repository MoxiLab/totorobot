export default {
  name: "menu",
  alias: ["help", "h", "m", "commands"],
  category: "Totoro 🤖",
  description: "Muestra ayuda resumida o detalle individual de un comando.",
  usage: "!menu [comando]",

  run(sock, msg, args = []) {
    const isDevEnabled =
      String(process.env.DEV_MODE || "false") === "true" || Boolean(msg.key?.fromMe);

    const query = (args[0] || "").toLowerCase().trim();

    const commands = globalThis.commands.filter(({ dev }) => {
      if (!dev) return true;
      return isDevEnabled;
    });

    if (query) {
      const command = commands.find((cmd, key) => {
        return key === query || cmd.name === query || cmd.alias?.includes(query);
      });

      if (!command) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: `No encontré el comando *${query}*.\nUsa *!menu* para ver la lista.`,
        });
      }

      const aliases = command.alias?.length ? command.alias.join(", ") : "Sin alias";
      const category = command.category || "Otros";
      const description = command.description || "Sin descripción";
      const usage = command.usage || `!${command.name}`;
      const usageLines = usage.split("|").map((part) => part.trim());

      let text = `⋆ ˚｡⋆୨୧˚ AYUDA TOTORO ˚୨୧⋆｡˚ ⋆\n`;
      text += `───────────────\n`;
      text += `✦ *Comando:* !${command.name}\n`;
      text += `✦ *Categoria:* ${category}\n`;
      text += `✦ *Alias:* ${aliases}\n\n`;
      text += `♡ *Descripcion*\n`;
      text += `${description}\n\n`;
      text += `✧ *Como usarlo*\n`;

      for (const line of usageLines) {
        text += `> *${line}*\n`;
      }

      text += `\n﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n`;
      text += `*Tip:* escribe *!menu* para volver al listado.`;

      return sock.sendMessage(msg.key.remoteJid, { text });
    }

    const categories = {};

    for (const [name, data] of commands) {
      const cat = data.category || "Otros";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let text = `⋆ ˚｡⋆୨୧˚ MENU TOTORO ˚୨୧⋆｡˚ ⋆\n`;
    text += `Hola *${msg.pushName || "amigo"}* ♡\n`;
    text += `Tienes *${commands.size}* comandos disponibles\n`;
    text += `Ver detalle: *!menu <comando>*\n\n`;

    for (const cat of Object.keys(categories).sort()) {
      text += `✦ *${cat}*\n`;

      for (const cmd of categories[cat].sort()) {
        text += `  ୨୧ !${cmd}\n`;
      }

      text += `\n`;
    }

    text += `───────────────\n`;
    text += `Ejemplo rapido: *!menu ping*`;

    return sock.sendMessage(msg.key.remoteJid, { text });
  },
};
