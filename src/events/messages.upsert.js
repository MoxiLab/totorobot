export default {
  name: "messages.upsert",

  async run(msg, sock) {
    if (msg.type !== "notify") return;

    const message = msg.messages[0];

    if (!message.message || !message.key || message.key.fromMe) return;

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

    const entry = Array.from(globalThis.commands).find(([name, data]) => {
      return name === label || data.alias?.includes(label);
    });

    const command = entry?.[1];

    if (!command || (command.dev && !dev)) return;

    message.quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    command.run(sock, message, args);
  },
};
