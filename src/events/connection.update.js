import { DisconnectReason } from "baileys";
import { connect } from "../index.js";
import { createSubbot, deleteSubbot, activeSubbots } from "../utils/SubbotManager.js";
import { Boom } from "@hapi/boom";

export default {
  name: "connection.update",

  async run(update, sock) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const error = lastDisconnect?.error;
      const status = error instanceof Boom ? error.output?.statusCode : null;
      const isLoggedOut = status === DisconnectReason.loggedOut;

      if (sock.isSubbot) {
        if (isLoggedOut) {
          await deleteSubbot(sock.subbotId);
        } else {
          activeSubbots.delete(sock.subbotId);
          setTimeout(() => createSubbot(sock.subbotId, true).catch(() => {}), 5000);
        }
        return;
      }

      console.error("Conexión cerrada. Razón:", error?.message || error);

      if (!isLoggedOut) {
        console.log("Intentando reconectar...");

        try {
          await connect();
        } catch (error) {
          console.error("Error al intentar reconectar:", error);
          setTimeout(() => {
            this.run({ connection: "close", lastDisconnect: { error } }, sock);
          }, 5000);
        }
      } else {
        console.log("Se cerró sesión.");
      }
    } else if (connection === "open") {
      console.log(
        `Conexión establecida ${sock.isSubbot ? `[Subbot: ${sock.subbotId}]` : "[Bot Principal]"}`,
      );
    }
  },
};
