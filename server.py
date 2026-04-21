#!/usr/bin/env python3
"""
Arcus M Checkliste – Lokaler PWA-Server
========================================
Startet einen HTTPS-fähigen lokalen Server auf Port 8443 (oder HTTP auf 8080),
damit der Service Worker korrekt funktioniert.

Verwendung:
  python3 server.py

Dann im Handy-Browser aufrufen:
  http://DEINE-IP:8080

Für HTTPS (empfohlen, für vollständige PWA-Features):
  pip install cryptography
  python3 server.py --https

Dann aufrufen:
  https://DEINE-IP:8443
  (Zertifikatswarnung akzeptieren – es ist selbstsigniert)
"""
import argparse
import http.server
import socket
import ssl
import os
import sys
import threading

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTTP_PORT  = 8080
HTTPS_PORT = 8443

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SCRIPT_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} – {fmt % args}")


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def generate_selfsigned_cert(certfile, keyfile):
    """Generate a self-signed cert using cryptography library."""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        import datetime

        ip = get_local_ip()
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, ip),
        ])
        cert = (
            x509.CertificateBuilder()
            .subject_name(subject)
            .issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(datetime.datetime.utcnow())
            .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365))
            .add_extension(
                x509.SubjectAlternativeName([
                    x509.DNSName("localhost"),
                    x509.IPAddress(__import__("ipaddress").ip_address(ip)),
                ]), critical=False,
            )
            .sign(key, hashes.SHA256())
        )
        with open(certfile, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        with open(keyfile, "wb") as f:
            f.write(key.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.TraditionalOpenSSL,
                serialization.NoEncryption(),
            ))
        return True
    except ImportError:
        return False


def run_server(port, use_https=False):
    ip = get_local_ip()
    server = http.server.HTTPServer(("0.0.0.0", port), CORSHandler)

    if use_https:
        certfile = os.path.join(SCRIPT_DIR, "cert.pem")
        keyfile  = os.path.join(SCRIPT_DIR, "key.pem")
        if not (os.path.exists(certfile) and os.path.exists(keyfile)):
            print("  Generating self-signed certificate …")
            if not generate_selfsigned_cert(certfile, keyfile):
                print("  ✗ 'cryptography' not installed. Run:  pip install cryptography")
                print("  Falling back to HTTP on port", HTTP_PORT)
                use_https = False
        if use_https:
            ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            ctx.load_cert_chain(certfile, keyfile)
            server.socket = ctx.wrap_socket(server.socket, server_side=True)

    proto = "https" if use_https else "http"
    print(f"\n  ✈  Arcus M Checkliste – Lokaler Server gestartet")
    print(f"  ─────────────────────────────────────────────────")
    print(f"  Lokal:   {proto}://localhost:{port}")
    print(f"  Handy:   {proto}://{ip}:{port}")
    print(f"\n  → Im Browser öffnen, dann 'Zum Startbildschirm hinzufügen'")
    if use_https:
        print(f"  → Zertifikatswarnung einmalig akzeptieren (selbstsigniert)")
    print(f"\n  Strg+C zum Beenden\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server gestoppt.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--https", action="store_true", help="Use HTTPS (requires cryptography)")
    parser.add_argument("--port", type=int, default=None)
    args = parser.parse_args()

    if args.https:
        port = args.port or HTTPS_PORT
        run_server(port, use_https=True)
    else:
        port = args.port or HTTP_PORT
        run_server(port, use_https=False)
