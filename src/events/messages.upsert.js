export default {
  name: "messages.upsert",

  async run(msg, sock) {
    if (msg.type !== "notify") return;

    const message = msg.messages[0];

    if (!message.message || !message.key || message.key.fromMe) return;

    // Baileys puede emitir el mismo mensaje más de una vez (retries/sync).
    // Dedupe simple por message.key.id para evitar ejecutar comandos duplicados.
    const messageId = message.key?.id;
    if (!globalThis.__toto_seenMessageIds) {
      globalThis.__toto_seenMessageIds = new Map();
    }

    if (messageId) {
      const seen = globalThis.__toto_seenMessageIds;
      const now = Date.now();
      const last = seen.get(messageId);

      if (last && now - last < 60_000) return;

      seen.set(messageId, now);

      if (seen.size > 1000) {
        for (const [id, ts] of seen) {
          if (now - ts > 120_000) seen.delete(id);
        }
      }
    }

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
