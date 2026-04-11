import { DisconnectReason } from "baileys";
import { connect } from "../index.js";
import { createSubbot, deleteSubbot, activeSubbots } from "../utils/SubbotManager.js";
import { Boom } from "@hapi/boom";

let reconnecting = false;
let reconnectTimer;

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
        if (reconnecting) return;
        reconnecting = true;

        console.log("Intentando reconectar...");

        try {
          await connect();
          reconnecting = false;
        } catch (error) {
          console.error("Error al intentar reconectar:", error);
          reconnecting = false;

          if (!reconnectTimer) {
            reconnectTimer = setTimeout(async () => {
              reconnectTimer = undefined;
              if (reconnecting) return;
              reconnecting = true;

              try {
                await connect();
              } catch (e) {
                console.error("Error al intentar reconectar:", e);
              } finally {
                reconnecting = false;
              }
            }, 5000);
          }
        }
      } else {
        console.log("Se cerró sesión.");
      }
    } else if (connection === "open") {
      if (!sock.isSubbot) {
        reconnecting = false;
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = undefined;
        }
      }

      console.log(
        `Conexión establecida ${sock.isSubbot ? `[Subbot: ${sock.subbotId}]` : "[Bot Principal]"}`,
      );
    }
  },
};
