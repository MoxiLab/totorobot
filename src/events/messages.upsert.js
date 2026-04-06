export default {
  name: "messages.upsert",

  async run(msg, sock) {
    if (msg.type !== "notify") return;

    const message = msg.messages[0];

    if (!message.message || !message.key) return;

    const isDevEnabled =
      String(process.env.DEV_MODE || "false") === "true" || Boolean(message.key.fromMe);

    const body =
      message.message?.extendedTextMessage?.text ||
      message.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      message.message?.conversation ||
      message.messageinfo?.imageMessage?.caption ||
      message.messageinfo?.videoMessage?.caption ||
      message.messageinfo?.documentMessage?.caption ||
      "";

    if (!body || body.length <= 1 || body[0] !== "!") return;

    const args = body.slice(1).split(/ +/);
    const label = args.shift().toLowerCase();

    const command = globalThis.commands.find((cmd) => {
      return cmd.name === label || cmd.alias?.includes(label);
    });

    if (!command) return;

    if (command.dev && !isDevEnabled) {
      return sock.sendMessage(message.key.remoteJid, {
        text: "Comando dev bloqueado. Activa DEV_MODE=true en tu .env para usarlo.",
      });
    }

    message.quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    await command.run(sock, message, args);
  },
};
