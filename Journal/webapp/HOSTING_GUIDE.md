# Hosting Guide - Making Journal App Accessible

## Option 1: Local Network Access (Free - Your PC)

### Step 1: Find Your Local IP Address

**macOS/Linux:**
```bash
cd webapp
./get-local-ip.sh
```

**Windows:**
```cmd
ipconfig
# Look for IPv4 Address under your active network adapter
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m app.main
```

**Terminal 2 - Frontend:**
```bash
cd webapp
npm run dev
```

### Step 3: Access from Other Devices

1. Make sure both devices are on the same WiFi network
2. On the other device, open browser and go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

### Firewall Configuration

**macOS:**
- System Settings → Network → Firewall → Options
- Allow incoming connections for Node.js and Python

**Windows:**
- Windows Defender Firewall → Allow an app
- Allow Node.js and Python through firewall

**Linux:**
```bash
sudo ufw allow 3000
sudo ufw allow 8000
```

---

## Option 2: Free Cloud Hosting

### Option A: Vercel (Frontend) + Railway/Render (Backend)

**Frontend on Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. In `webapp` directory: `vercel`
3. Update API URL in production build

**Backend on Railway (Free tier available):**
1. Sign up at railway.app
2. Connect GitHub repo
3. Deploy backend service
4. Set environment variables

### Option B: Render (Full Stack - Free Tier)

1. Sign up at render.com
2. Create Web Service for backend
3. Create Static Site for frontend
4. Connect GitHub repository

### Option C: Fly.io (Free Tier)

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. In backend: `fly launch`
3. In webapp: `fly launch`

---

## Option C: ngrok (Quick Testing - Free)

For quick external access without deployment:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Expose frontend
ngrok http 3000

# Expose backend (in another terminal)
ngrok http 8000
```

**Note:** Free ngrok URLs change on each restart. For permanent URLs, use paid plan.

---

## Production Configuration

For production, update these files:

1. **webapp/vite.config.ts** - Set production API URL
2. **backend/app/core/config.py** - Set specific CORS origins
3. **backend/.env** - Set `CORS_ALLOW_ALL=False`

---

## Troubleshooting

**Can't access from other device:**
- Check firewall settings
- Verify both devices on same network
- Try accessing from same device first: `http://localhost:3000`

**CORS errors:**
- Backend CORS is set to allow all origins in development
- Check backend is running on port 8000
- Verify API proxy in vite.config.ts

**Connection refused:**
- Make sure backend is running
- Check ports 3000 and 8000 are not in use
- Verify host is set to `0.0.0.0` in vite.config.ts

