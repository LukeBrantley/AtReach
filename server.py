"""Local-only AtReach prototype. Uses synthetic data and Python's standard library."""
from __future__ import annotations

import json
import random
import sqlite3
from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
DATA_DIR = ROOT / ".atreach"
DB_PATH = DATA_DIR / "prototype.sqlite3"
PORT = 8000

SCHEMA = """
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY, mrn TEXT UNIQUE NOT NULL, first_name TEXT NOT NULL,
  last_name TEXT NOT NULL, dob TEXT NOT NULL, payer TEXT NOT NULL,
  payer_pcp TEXT NOT NULL, payer_pcp_network TEXT NOT NULL,
  utilized_pcp TEXT NOT NULL, utilized_pcp_network TEXT NOT NULL,
  visits_12m INTEGER NOT NULL, last_visit TEXT NOT NULL,
  preferred_contact TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
  mismatch_type TEXT NOT NULL, eligible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS outreach (
  id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL REFERENCES patients(id),
  contacted_on TEXT NOT NULL, channel TEXT NOT NULL, outcome TEXT NOT NULL,
  provider_confirmation TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'Local prototype user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_outreach_patient ON outreach(patient_id, id DESC);
"""


def connect():
    DATA_DIR.mkdir(exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def seed(db):
    if db.execute("SELECT COUNT(*) FROM patients").fetchone()[0]:
        return
    rng = random.Random(42)
    first = ["Alex", "Jamie", "Morgan", "Taylor", "Riley", "Casey", "Jordan", "Avery", "Sam", "Cameron", "Drew", "Robin"]
    last = ["Rivera", "Kim", "Patel", "Brooks", "Nguyen", "Santos", "Reed", "Morgan", "Price", "Bennett", "Cole", "Diaz"]
    payers = ["Community Health Plan", "Metro Family Health", "Evergreen Medicaid", "Unity Care"]
    clinics = ["Northside Family Clinic", "Harbor Community Health", "Cedar Primary Care", "Lakeside Health Center"]
    outside = ["Dr. Quinn Harper", "Dr. Ellis Morgan", "Dr. Skyler James", "No PCP selected"]
    today = date.today()
    for i in range(36):
        aco_to_payer = i % 5 != 0
        payer_in = not aco_to_payer
        utilized_in = aco_to_payer
        # Include both mismatch directions and a few zero-use records for exclusion.
        if i % 7 == 0:
            payer_in, utilized_in = True, False
        visits = 0 if i % 11 == 0 else rng.randint(1, 8)
        if visits == 0:
            utilized_in = True  # No utilization is excluded regardless of attribution.
        clinic = clinics[i % len(clinics)]
        pcp = outside[i % len(outside)]
        mismatch = "payer_outside_aco" if not payer_in and utilized_in else "utilization_outside_aco"
        db.execute("""INSERT INTO patients
          (mrn,first_name,last_name,dob,payer,payer_pcp,payer_pcp_network,utilized_pcp,utilized_pcp_network,visits_12m,last_visit,preferred_contact,phone,email,mismatch_type,eligible)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
          (f"SYN-{i+1:05d}", first[i % len(first)], last[(i * 5) % len(last)],
           date(1948 + i % 48, 1 + i % 12, 1 + i % 27).isoformat(), payers[i % len(payers)],
           clinic if payer_in else pcp, "ACO" if payer_in else "Outside ACO",
           clinic if utilized_in else pcp, "ACO" if utilized_in else "Outside ACO",
           visits, (today - timedelta(days=rng.randint(3, 300))).isoformat(),
           ["Phone", "Email", "Phone", "MyChart"][i % 4],
           f"(212) 555-{1000+i:04d}", f"member{i+1:02d}@example.test", mismatch,
           1 if visits > 0 and payer_in != utilized_in else 0))
    db.commit()


def status_for(db, patient_id):
    row = db.execute("SELECT outcome FROM outreach WHERE patient_id=? ORDER BY id DESC LIMIT 1", (patient_id,)).fetchone()
    if not row:
        return "Identified"
    return {
        "Left voicemail": "Outreached", "No answer": "Outreached", "Wrong contact details": "Outreached",
        "Reached — no decision": "Engaged", "Patient will update PCP": "Committed",
        "Appointment scheduled": "Committed", "Appointment completed": "Converted",
        "Payer file updated": "Payer Recognized", "Patient prefers outside provider": "Needs review",
        "Declined": "Needs review",
    }.get(row["outcome"], "Outreached")


def patient_dict(db, row):
    p = dict(row)
    p["status"] = status_for(db, p["id"])
    p["outreach_count"] = db.execute("SELECT COUNT(*) FROM outreach WHERE patient_id=?", (p["id"],)).fetchone()[0]
    return p


def json_bytes(value):
    return json.dumps(value, ensure_ascii=False).encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "AtReachPrototype/0.1"

    def respond(self, code, value, content_type="application/json; charset=utf-8"):
        body = value if isinstance(value, bytes) else json_bytes(value)
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        db = connect()
        try:
            seed(db)
            if url.path == "/api/patients":
                q = parse_qs(url.query)
                search = q.get("q", [""])[0].strip()
                status = q.get("status", [""])[0]
                payer = q.get("payer", [""])[0]
                rows = db.execute("SELECT * FROM patients WHERE eligible=1 ORDER BY last_name,first_name").fetchall()
                patients = [patient_dict(db, r) for r in rows]
                if search:
                    s = search.casefold()
                    patients = [p for p in patients if s in (p["first_name"]+" "+p["last_name"]+" "+p["mrn"]+" "+p["payer"]).casefold()]
                if status:
                    patients = [p for p in patients if p["status"] == status]
                if payer:
                    patients = [p for p in patients if p["payer"] == payer]
                return self.respond(200, patients)
            if url.path.startswith("/api/patients/"):
                pid = int(url.path.rsplit("/", 1)[1])
                row = db.execute("SELECT * FROM patients WHERE id=?", (pid,)).fetchone()
                if not row:
                    return self.respond(404, {"error": "Patient not found"})
                p = patient_dict(db, row)
                p["outreach"] = [dict(r) for r in db.execute("SELECT * FROM outreach WHERE patient_id=? ORDER BY id DESC", (pid,))]
                return self.respond(200, p)
            if url.path == "/api/metrics":
                rows = [patient_dict(db, r) for r in db.execute("SELECT * FROM patients WHERE eligible=1")]
                total = len(rows)
                reached = sum(p["status"] in ("Engaged", "Committed", "Converted", "Payer Recognized") for p in rows)
                committed = sum(p["status"] in ("Committed", "Converted", "Payer Recognized") for p in rows)
                converted = sum(p["status"] in ("Converted", "Payer Recognized") for p in rows)
                outreaches = db.execute("SELECT COUNT(*) FROM outreach").fetchone()[0]
                return self.respond(200, {"eligible": total, "identified": sum(p["status"]=="Identified" for p in rows),
                    "outreached": sum(p["outreach_count"]>0 for p in rows), "engaged": reached, "committed": committed,
                    "converted": converted, "payer_recognized": sum(p["status"]=="Payer Recognized" for p in rows),
                    "outreach_attempts": outreaches, "engagement_rate": round(reached*100/outreaches) if outreaches else 0,
                    "leading_conversion_rate": round(committed*100/outreaches) if outreaches else 0,
                    "conversion_rate": round(converted*100/outreaches) if outreaches else 0,
                    "excluded_zero_use": db.execute("SELECT COUNT(*) FROM patients WHERE visits_12m=0").fetchone()[0]})
            if url.path == "/api/options":
                return self.respond(200, {"payers": [r[0] for r in db.execute("SELECT DISTINCT payer FROM patients ORDER BY payer")]})
            path = (WEB / unquote(url.path.lstrip("/"))).resolve() if url.path != "/" else WEB / "index.html"
            if WEB.resolve() not in path.parents and path != WEB / "index.html":
                return self.respond(403, {"error": "Forbidden"})
            if not path.exists() or path.is_dir():
                return self.respond(404, {"error": "Not found"})
            content_type = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8"}.get(path.suffix, "application/octet-stream")
            return self.respond(200, path.read_bytes(), content_type)
        except (ValueError, sqlite3.Error) as exc:
            return self.respond(400, {"error": str(exc)})
        finally:
            db.close()

    def do_POST(self):
        if not self.path.startswith("/api/patients/") or not self.path.endswith("/outreach"):
            return self.respond(404, {"error": "Not found"})
        try:
            pid = int(self.path.split("/")[3])
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
            required = ("contacted_on", "channel", "outcome", "provider_confirmation")
            if any(not str(body.get(k, "")).strip() for k in required):
                return self.respond(400, {"error": "Date, channel, outcome, and provider confirmation are required."})
            db = connect()
            try:
                if not db.execute("SELECT 1 FROM patients WHERE id=? AND eligible=1", (pid,)).fetchone():
                    return self.respond(404, {"error": "Eligible patient not found"})
                db.execute("INSERT INTO outreach(patient_id,contacted_on,channel,outcome,provider_confirmation,notes) VALUES(?,?,?,?,?,?)",
                    (pid, body["contacted_on"], body["channel"], body["outcome"], body["provider_confirmation"], str(body.get("notes", "")).strip()[:1000]))
                db.commit()
            finally:
                db.close()
            return self.respond(201, {"ok": True})
        except (ValueError, KeyError, json.JSONDecodeError, sqlite3.Error) as exc:
            return self.respond(400, {"error": str(exc)})

    def log_message(self, fmt, *args):
        print(f"{self.log_date_time_string()} {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    db = connect()
    try:
        db.executescript(SCHEMA)
        seed(db)
    finally:
        db.close()
    print(f"AtReach prototype is available at http://127.0.0.1:{PORT}")
    print("Synthetic data only. The server is bound to this computer.")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
