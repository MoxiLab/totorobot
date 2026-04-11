import express from "express";
import { createSubbot, activeSubbots } from "../utils/SubbotManager.js";
import { resolve } from "path";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

const app = express();
app.use(express.json());
app.use(express.static(resolve("public")));

app.post("/api/link", async (req, res) => {
  const { type, phone } = req.body;

  try {
    if (type === "code") {
      if (!phone) return res.status(400).json({ error: "Missing phone" });
      const parsedPhone = phone.replace(/\D+/g, "");

      if (activeSubbots.has(parsedPhone)) {
        return res.status(400).json({ error: "Subbot already exists" });
      }

      const data = await createSubbot(parsedPhone, true);
      return res.json(data);
    }

    if (type === "qr") {
      const id = randomBytes(4).toString("hex");
      const data = await createSubbot(id, false);

      if (data.qr) {
        const qrImage = await QRCode.toDataURL(data.qr);
        return res.json({ qr: qrImage, id });
      }

      return res.json(data);
    }

    res.status(400).json({ error: "Invalid method" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    active: activeSubbots.size,
    subbots: Array.from(activeSubbots.keys()),
  });
});

export function startServer(port = 3000) {
  app.listen(port, () => {
    console.log(`Servidor web corriendo en http://${process.env.HOST}:${port}`);
  });
}
