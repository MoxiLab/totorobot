import { DisconnectReason } from "baileys";
import { connect } from "../index.js";
import { Boom } from "@hapi/boom";

export default {
  name: "connection.update",

  async run(update) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const error = lastDisconnect?.error;

      const status = error instanceof Boom ? error.output?.statusCode : null;
      const isLoggedOut = status === DisconnectReason.loggedOut;

      console.error("Conexión cerrada. Razón:", error?.message || error);

      if (!isLoggedOut) {
        console.log("Intentando reconectar...");

        try {
          await connect();
        } catch (error) {
          console.error("Error al intentar reconectar:", error);

          setTimeout(() => {
            this.run({ connection: "close", lastDisconnect: { error } });
          }, 5000);
        }
      } else {
        console.log("Se cerró sesión.");
      }
    } else if (connection === "open") {
      console.log("Conexión establecida correctamente.");
    }
  },
};