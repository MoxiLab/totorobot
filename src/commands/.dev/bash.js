import { exec } from "child_process";

export default {
  name: "bash",
  dev: true,

  async run(sock, msg, args) {
    if (!args.length) return;

    const commands = args.join(" ");

    exec(commands, async (error, stdout, stderr) => {
      if (error) return sock.sendMessage(msg.key.remoteJid, { text: error.message + "" });

      if (stdout.trim() && stderr.trim()) {
        await sock.sendMessage(msg.key.remoteJid, { text: stderr });
        return sock.sendMessage(msg.key.remoteJid, { text: stdout });
      }

      if (stderr.trim()) return sock.sendMessage(msg.key.remoteJid, { text: stderr });

      sock.sendMessage(msg.key.remoteJid, { text: stdout });
    });
  },
};