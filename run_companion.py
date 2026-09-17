import os
import sys
import subprocess
import time
import webbrowser
import signal

print("=" * 60)
print(f"🚀 Launching AI Study Companion (Python {sys.version.split()[0]} Runner)")
print("   - AI Engine: Google Gemini 3.1 (gemini-3.1-pro-preview)")
print("   - Frontend: React + JavaScript (Vite)")
print("   - Backend: Node.js Express API")
print("=" * 60)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BASE_DIR, "server")
CLIENT_DIR = os.path.join(BASE_DIR, "client")

# Start Server
print("\n[1/3] Starting Backend API Server (Port 4000)...")
server_proc = subprocess.Popen(
    ["node", "index.js"],
    cwd=SERVER_DIR,
    shell=True
)

# Wait briefly for server boot
time.sleep(2)

# Start Client
print("[2/3] Starting Frontend React Application (Port 3000)...")
client_proc = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=CLIENT_DIR,
    shell=True
)

time.sleep(3)

# Open browser
app_url = "http://localhost:3000"
print(f"\n[3/3] Opening AI Study Companion in your browser: {app_url}")
print("=" * 60)
print("✅ Application is now live and running!")
print("   - Login Page:     http://localhost:3000")
print("   - Sign Up Page:   http://localhost:3000 (click 'Create an Account')")
print("   - Backend API:    http://localhost:4000/api")
print("   - Health Status:  http://localhost:4000/health")
print("\nPress Ctrl + C in this terminal to stop all servers.")
print("=" * 60)

try:
    webbrowser.open(app_url)
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Shutting down AI Study Companion...")
    server_proc.terminate()
    client_proc.terminate()
    print("Done. Goodbye!")
