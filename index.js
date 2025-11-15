// type: module required in package.json
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;        // e.g. testtoken123
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;    // Your access token (EAAX...)
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;  // Numeric phone number id

// Verification endpoint used by Meta when you click "Verify and save"
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// Receive messages from WhatsApp (Meta will POST here)
app.post("/webhook", async (req, res) => {
  try {
    // Acknowledge quickly
    res.sendStatus(200);

    console.log("Incoming webhook payload:", JSON.stringify(req.body, null, 2));

    // Navigate to the message object safely
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const from = message.from;                      // sender phone number
    const text = message.text?.body || "";

    console.log("Message from", from, "text:", text);

    // Send a simple reply "Hello from your bot!"
    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: from,
      text: { body: "Hello from your bot!" }
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const j = await resp.text();
    console.log("Send response:", resp.status, j);
  } catch (err) {
    console.error("Error handling webhook:", err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
