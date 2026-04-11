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

    const command = globalThis.commands.find((cmd) => {
      return cmd.name === label || cmd.alias?.includes(label);
    });

    if (!command) return;

    const devModeEnabled = String(process.env.DEV_MODE || "false") === "true";

    if (command.dev && !devModeEnabled) {
      return;
    }

    message.quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    command.run(sock, message, args);
  },
};
