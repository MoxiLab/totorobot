export default {
  name: "ping",
  category: "Totoro 🤖",
  description: "Mide el tiempo de respuesta del bot.",
  usage: "!ping",

  async run(sock, msg) {
    const start = Date.now();

    const sent = await sock.sendMessage(msg.key.remoteJid, {
      text: "PONG",
    });

    const end = Date.now();

    sock.sendMessage(msg.key.remoteJid, {
      text: end - start + "ms",
      edit: sent.key,
    });
  },
};
