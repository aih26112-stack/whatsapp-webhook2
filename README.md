WhatsApp webhook example (Express)

ENV REQUIRED:
- VERIFY_TOKEN (string you will use in Facebook dev console)
- WHATSAPP_TOKEN (your access token)
- PHONE_NUMBER_ID (WhatsApp phone number id)

Endpoints:
GET /webhook  -> verification
POST /webhook -> incoming messages
