#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# -------------------------------------------------------------------------------
# Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
# Focus: AI Engineering | Automation | Agentic Systems
# Copyright (c) 2026. All Rights Reserved.
# -------------------------------------------------------------------------------

import base64
import json
import os
import re
import secrets
import smtplib
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEV_VAULT = "/tmp/mosa-dev-vault"
os.makedirs(os.path.join(DEV_VAULT, "media"), exist_ok=True)


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


def kv_read(name, default):
    p = os.path.join(DEV_VAULT, f"{name}.json")
    if os.path.exists(p):
        try:
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return default


def kv_write(name, val):
    p = os.path.join(DEV_VAULT, f"{name}.json")
    if val is None:
        if os.path.exists(p):
            os.remove(p)
        return
    with open(p, "w", encoding="utf-8") as f:
        json.dump(val, f, ensure_ascii=False, indent=2)


def normalize_safari_terms(text, tgt):
    acc = str(text or "").strip()
    if not acc:
        return acc
    if tgt == "en":
        acc = re.sub(r"Beach Buggy", "ATV Quad", acc, flags=re.I)
        acc = re.sub(r"^Move\s+(\d{1,2}:\d{2})", r"Departs \1", acc, flags=re.I)
        acc = re.sub(r"(\d{1,2}:\d{2})\s*ص\b", r"\1 AM", acc)
        acc = re.sub(r"(\d{1,2}:\d{2})\s*م\b", r"\1 PM", acc)
    elif tgt == "it":
        acc = re.sub(r"Beach Buggy", "Quad ATV", acc, flags=re.I)
        acc = re.sub(r"^Spostati\s+(\d{1,2}:\d{2})", r"Partenza \1", acc, flags=re.I)
        acc = re.sub(r"(\d{1,2}:\d{2})\s*ص\b", r"\1 AM", acc)
        acc = re.sub(r"(\d{1,2}:\d{2})\s*م\b", r"\1 PM", acc)
    elif tgt == "ru":
        acc = re.sub(r"Beach Buggy", "квадроцикл ATV", acc, flags=re.I)
        acc = re.sub(r"^Двигаться\s+(\d{1,2}:\d{2})", r"Выезд \1", acc, flags=re.I)
        acc = re.sub(r"(\d{1,2}:\d{2})\s*[صم]\b", r"\1", acc)
    return acc.strip()


def translate_single_text(text, src, tgt):
    raw = str(text or "").strip()
    if not raw or re.fullmatch(r"[\d\s.,:%+\-–—$€★🕒🕓🕟🕠🕗🕣🕒🕞🕔🕠]+", raw):
        return raw
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx"
            f"&sl={urllib.parse.quote(src)}&tl={urllib.parse.quote(tgt)}&dt=t&q={urllib.parse.quote(raw)}"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "MosaSafariStudio/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode("utf-8"))
        if isinstance(data, list) and data and isinstance(data[0], list):
            acc = "".join(seg[0] for seg in data[0] if seg and seg[0]).strip()
            if acc:
                return normalize_safari_terms(acc, tgt)
    except Exception:
        pass
    return raw


def translate_batch_post(strings, src, tgt):
    if not strings:
        return []
    try:
        url = (
            "https://clients5.google.com/translate_a/t?client=dict-chrome-ex"
            f"&sl={urllib.parse.quote(src)}&tl={urllib.parse.quote(tgt)}"
        )
        body = "&".join(f"q={urllib.parse.quote(s)}" for s in strings).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "MosaSafariStudio/1.0",
            },
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        if isinstance(data, list) and len(data) == len(strings):
            res = []
            for idx, item in enumerate(data):
                txt = str(item[0] if isinstance(item, list) and item else item or "").strip()
                res.append(normalize_safari_terms(txt, tgt) if txt else strings[idx])
            return res
    except Exception:
        pass
    return [translate_single_text(one, src, tgt) for one in strings]


def translate_tour_items(src, targets, items):
    unique = []
    idx_map = {}

    def reg(v):
        s = str(v or "").strip()
        if not s or re.fullmatch(r"[\d\s.,:%+\-–—$€★🕒🕓🕟🕠🕗🕣🕒🕞🕔🕠]+", s):
            return
        if s not in idx_map:
            idx_map[s] = len(unique)
            unique.append(s)

    for k in ["title", "badge", "duration", "departureWindow", "subtitle", "desc", "seoTitle", "seoDesc"]:
        reg(items.get(k, ""))
    for ak in ["highlights", "includes", "excludes", "bring", "routeLabels"]:
        for v in (items.get(ak) or []):
            reg(v)
    for st in (items.get("itinerary") or []):
        if isinstance(st, dict):
            reg(st.get("time", ""))
            reg(st.get("title", ""))
            reg(st.get("desc", ""))

    valid_targets = [tl for tl in targets if tl != src and tl in ["ar", "en", "it", "ru"]]

    def run_lang(tl):
        tr_list = []
        for i in range(0, len(unique), 30):
            tr_list.extend(translate_batch_post(unique[i:i + 30], src, tl))
        return tl, tr_list

    lang_lists = {}
    if valid_targets:
        with ThreadPoolExecutor(max_workers=min(3, len(valid_targets))) as pool:
            for tl, tr_list in pool.map(run_lang, valid_targets):
                lang_lists[tl] = tr_list

    out = {}
    for tl in valid_targets:
        tr_list = lang_lists.get(tl, [])

        def lk(val):
            s = str(val or "").strip()
            if not s:
                return ""
            return tr_list[idx_map[s]] if s in idx_map else s

        out[tl] = {
            "title": lk(items.get("title", "")),
            "badge": lk(items.get("badge", "")),
            "duration": lk(items.get("duration", "")),
            "departureWindow": lk(items.get("departureWindow", "")),
            "subtitle": lk(items.get("subtitle", "")),
            "desc": lk(items.get("desc", "")),
            "seoTitle": lk(items.get("seoTitle", "")),
            "seoDesc": lk(items.get("seoDesc", "")),
            "highlights": [x for x in (lk(v) for v in (items.get("highlights") or [])) if x],
            "includes": [x for x in (lk(v) for v in (items.get("includes") or [])) if x],
            "excludes": [x for x in (lk(v) for v in (items.get("excludes") or [])) if x],
            "bring": [x for x in (lk(v) for v in (items.get("bring") or [])) if x],
            "routeLabels": [lk(v) for v in (items.get("routeLabels") or [])],
            "itinerary": [
                {
                    "step": str(st.get("step") or str(idx + 1).zfill(2)),
                    "time": lk(st.get("time", "")),
                    "title": lk(st.get("title", "")),
                    "desc": lk(st.get("desc", ""))
                }
                for idx, st in enumerate(items.get("itinerary") or [])
            ]
        }
    return out


load_dotenv()


class MosaDevHandler(SimpleHTTPRequestHandler):
    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        return json.loads(raw)

    def do_GET(self):
        if self.path.startswith("/api/public/config"):
            self.send_json_response(200, {
                "ok": True,
                "trips": kv_read("trips", None),
                "promos": kv_read("promos", [{"code": "MOSA20", "discount": 20, "active": True}]),
                "settings": kv_read("settings", {})
            })
            return

        if self.path.startswith("/api/admin/session"):
            self.send_json_response(200, {"ok": True, "csrfToken": "dev-csrf-token", "expiresAt": 9999999999})
            return

        if self.path.startswith("/api/admin/overview"):
            self.send_json_response(200, {
                "ok": True,
                "bookings": kv_read("bookings", []),
                "trips": kv_read("trips", None),
                "promos": kv_read("promos", [{"code": "MOSA20", "discount": 20, "active": True, "uses": 0, "maxUses": 0, "expiresAt": "2026-12-31"}]),
                "settings": kv_read("settings", {"groupDiscountMin": 5, "groupDiscountPct": 10}),
                "mailConfig": {"connected": False, "provider": "gmail_smtp"},
                "analytics": kv_read("analytics", {"totalViews": 12, "uniqueSessions": 4, "modalOpens": 2, "bookingsCompleted": 0, "byLang": {"ar": 8, "en": 4}, "byCurrency": {"USD": 12}, "byDevice": {"desktop": 8, "mobile": 4}, "tourClicks": {}, "daily": {}}),
                "auditLog": kv_read("audit", []),
                "health": {"isolatedWorker": False, "httpOnlyCookie": True, "csrfProtected": True, "kvBound": True}
            })
            return

        if self.path.startswith("/api/admin/media"):
            self.send_json_response(200, {"ok": True, "media": kv_read("media_index", [])})
            return

        m_media = re.match(r"^/api/media/([a-zA-Z0-9_.\-]+)$", self.path)
        if m_media:
            fid = m_media.group(1)
            fpath = os.path.join(DEV_VAULT, "media", fid)
            if not os.path.isfile(fpath):
                self.send_json_response(404, {"ok": False})
                return
            mime = "image/png" if fid.endswith(".png") else ("image/webp" if fid.endswith(".webp") else "image/jpeg")
            with open(fpath, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if re.match(r"^/tour(/[a-zA-Z0-9_-]+)?/?(\?.*)?$", self.path):
            self.path = "/tour.html"
        super().do_GET()

    def do_PUT(self):
        if self.path.startswith("/api/admin/trips"):
            body = self.read_json()
            trips = body.get("trips")
            kv_write("trips", trips)
            self.send_json_response(200, {"ok": True, "trips": trips})
            return
        if self.path.startswith("/api/admin/promos"):
            body = self.read_json()
            promos = body.get("promos", [])
            kv_write("promos", promos)
            self.send_json_response(200, {"ok": True, "promos": promos})
            return
        if self.path.startswith("/api/admin/settings"):
            body = self.read_json()
            settings = body.get("settings", {})
            kv_write("settings", settings)
            self.send_json_response(200, {"ok": True, "settings": settings})
            return
        self.send_json_response(404, {"ok": False, "error": "Not Found"})

    def do_DELETE(self):
        m_del = re.match(r"^/api/admin/media/([a-zA-Z0-9_.\-]+)$", self.path)
        if m_del:
            fid = m_del.group(1)
            fpath = os.path.join(DEV_VAULT, "media", fid)
            if os.path.exists(fpath):
                os.remove(fpath)
            cur = [x for x in kv_read("media_index", []) if x.get("id") != fid]
            kv_write("media_index", cur)
            self.send_json_response(200, {"ok": True})
            return
        self.send_json_response(404, {"ok": False})

    def do_POST(self):
        if self.path.startswith("/api/admin/login"):
            self.send_json_response(200, {"ok": True, "csrfToken": "dev-csrf-token", "expiresIn": 43200})
        elif self.path.startswith("/api/admin/logout"):
            self.send_json_response(200, {"ok": True})
        elif self.path.startswith("/api/admin/translate"):
            body = self.read_json()
            tr = translate_tour_items(body.get("sourceLang", "ar"), body.get("targetLangs", ["ar", "en", "it", "ru"]), body.get("items", {}))
            self.send_json_response(200, {"ok": True, "translations": tr})
        elif self.path.startswith("/api/admin/media"):
            body = self.read_json()
            mime = body.get("mimeType", "image/jpeg")
            ext = "png" if mime == "image/png" else ("webp" if mime == "image/webp" else "jpg")
            raw_b64 = re.sub(r"^data:[^;]+;base64,", "", str(body.get("dataBase64", ""))).strip()
            raw_bytes = base64.b64decode(raw_b64)
            fid = f"img-{secrets.token_hex(4)}.{ext}"
            with open(os.path.join(DEV_VAULT, "media", fid), "wb") as f:
                f.write(raw_bytes)
            rec = {
                "id": fid,
                "url": f"/api/media/{fid}",
                "filename": body.get("filename", fid),
                "mimeType": mime,
                "size": len(raw_bytes),
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            cur = [rec] + kv_read("media_index", [])
            kv_write("media_index", cur[:100])
            self.send_json_response(200, {"ok": True, "id": fid, "url": rec["url"], "media": rec})
        elif self.path.startswith("/api/track"):
            self.send_json_response(200, {"ok": True})
        elif self.path.startswith("/.netlify/functions/notify-booking") or self.path.startswith("/api/notify-booking"):
            self.handle_notify_booking()
        else:
            self.send_json_response(404, {"ok": False, "error": "Not Found"})

    def send_json_response(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_notify_booking(self):
        try:
            body = self.read_json()
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
                    wa_req = urllib.request.Request(endpoint, data=wa_data, headers={"Content-Type": "application/json"}, method="POST")
                    try:
                        with urllib.request.urlopen(wa_req, timeout=8) as resp:
                            if 200 <= resp.status < 300:
                                whatsapp_sent = True
                    except Exception:
                        continue

            resend_key = os.environ.get("RESEND_API_KEY", "")
            gmail_user = os.environ.get("GMAIL_ADDRESS", "").strip()
            gmail_pass = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
            to_email = payload.get("email", "")

            if gmail_user and gmail_pass and to_email:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = subject
                    msg["From"] = f"Mosa Safari <{gmail_user}>"
                    msg["To"] = to_email
                    msg.attach(MIMEText(text or subject, "plain", "utf-8"))
                    msg.attach(MIMEText(html or text, "html", "utf-8"))
                    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as srv:
                        srv.login(gmail_user, gmail_pass)
                        srv.sendmail(gmail_user, [to_email], msg.as_string())
                    email_sent = True
                except Exception:
                    pass

            if not email_sent and resend_key and to_email:
                for sender in [os.environ.get("EMAIL_FROM", "Mosa Safari <bookings@mosasafari.com>"), "Mosa Safari <onboarding@resend.dev>"]:
                    req_data = json.dumps({"from": sender, "to": [to_email], "subject": subject, "html": html, "text": text}).encode("utf-8")
                    req = urllib.request.Request("https://api.resend.com/emails", data=req_data, headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json", "User-Agent": "MosaSafariServer/1.2"}, method="POST")
                    try:
                        with urllib.request.urlopen(req, timeout=8) as resp:
                            if 200 <= resp.status < 300:
                                email_sent = True
                                break
                    except Exception:
                        continue

            self.send_json_response(200, {"ok": True, "managed": True, "whatsappSent": whatsapp_sent, "emailSent": email_sent})
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
