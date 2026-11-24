#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------
# Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
# Focus: AI Engineering | Automation | Agentic Systems
# Copyright (c) 2026. All Rights Reserved.
# -------------------------------------------------------------------------------

import json
import os
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def load_dotenv(path=".env"):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


load_dotenv()


class MosaDevHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/public/config"):
            self.send_json_response(200, {
                "ok": True,
                "trips": None,
                "promos": [{"code": "MOSA20", "discount": 20}],
                "settings": {}
            })
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/track"):
            self.send_json_response(200, {"ok": True})
        elif self.path.startswith("/.netlify/functions/notify-booking") or self.path.startswith("/api/notify-booking"):
            self.handle_notify_booking()
        else:
            self.send_json_response(404, {"ok": False, "error": "Not Found"})

    def send_json_response(self, status, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_notify_booking(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            body = json.loads(raw_body)
            payload = body.get("payload") or {}
            subject = body.get("subject") or f"Booking Confirmation {payload.get('ref', '')}"
            text = body.get("text") or ""
            owner_message = body.get("ownerMessage") or text
            html = body.get("html") or f"<pre>{text}</pre>"
            whatsapp_sent = bool(body.get("whatsappAlreadySent"))
            email_sent = False

            green_url = os.environ.get("GREEN_API_URL", "https://7107.api.greenapi.com").rstrip("/")
            green_inst = os.environ.get("GREEN_ID_INSTANCE", "710722810425")
            green_token = os.environ.get("GREEN_API_TOKEN", "")
            owner_phones = os.environ.get("OWNER_WHATSAPP_PHONES", "201023355550").split(",")

            if not whatsapp_sent and green_token and owner_message:
                endpoint = f"{green_url}/waInstance{green_inst}/sendMessage/{green_token}"
                for phone in owner_phones:
                    digits = "".join(ch for ch in phone if ch.isdigit())
                    if not digits:
                        continue
                    wa_data = json.dumps({"chatId": f"{digits}@c.us", "message": owner_message}).encode("utf-8")
                    wa_req = urllib.request.Request(
                        endpoint,
                        data=wa_data,
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    try:
                        with urllib.request.urlopen(wa_req, timeout=8) as resp:
                            if 200 <= resp.status < 300:
                                whatsapp_sent = True
                    except Exception:
                        continue

            resend_key = os.environ.get("RESEND_API_KEY", "")
            to_email = payload.get("email", "")

            if resend_key and to_email:
                senders = [
                    os.environ.get("EMAIL_FROM", "Mosa Safari <bookings@mosasafari.com>"),
                    "Mosa Safari <onboarding@resend.dev>"
                ]
                for sender in senders:
                    req_data = json.dumps({
                        "from": sender,
                        "to": [to_email],
                        "subject": subject,
                        "html": html,
                        "text": text
                    }).encode("utf-8")
                    req = urllib.request.Request(
                        "https://api.resend.com/emails",
                        data=req_data,
                        headers={
                            "Authorization": f"Bearer {resend_key}",
                            "Content-Type": "application/json",
                            "User-Agent": "MosaSafariServer/1.2"
                        },
                        method="POST"
                    )
                    try:
                        with urllib.request.urlopen(req, timeout=8) as resp:
                            if 200 <= resp.status < 300:
                                email_sent = True
                                break
                    except urllib.error.HTTPError:
                        continue
                    except Exception:
                        continue

            self.send_json_response(200, {
                "ok": True,
                "managed": True,
                "whatsappSent": whatsapp_sent,
                "emailSent": email_sent
            })
        except Exception as exc:
            self.send_json_response(500, {"ok": False, "error": str(exc)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), MosaDevHandler)
    print(f"Mosa Safari Dev Server running at http://0.0.0.0:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
