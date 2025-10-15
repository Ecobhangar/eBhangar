# 🚀 eBhangar Free Deployment Guide

## 📊 Free Deployment Stack

- **Database:** Neon.tech (FREE forever - 0.5GB)
- **Backend:** Railway (FREE $5 trial - 30 days) OR Render (FREE but sleeps)
- **Frontend:** Vercel (FREE - 100GB bandwidth/month)

---

## 1️⃣ Database Setup (Neon.tech)

### Steps:
1. Go to [neon.tech](https://neon.tech)
2. Sign up (GitHub login works)
3. Click "Create Project"
4. Name: `ebhangar-production`
5. Region: Select closest to Mumbai
6. Copy connection string (looks like):
   ```
   postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```

### Important:
- ✅ FREE forever (0.5GB storage)
- ✅ Auto-sleeps after inactivity (saves compute)
- ✅ Data persists permanently

---

## 2️⃣ Backend Deployment

### Option A: Railway (Recommended - $5 FREE trial)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your eBhangar repository
5. Railway auto-detects Node.js

**Environment Variables to Add:**
```env
DATABASE_URL=<your-neon-connection-string>
SESSION_SECRET=<generate-random-string>
FIREBASE_API_KEY=<from-firebase-console>
FIREBASE_AUTH_DOMAIN=<from-firebase-console>
FIREBASE_PROJECT_ID=<from-firebase-console>
FIREBASE_STORAGE_BUCKET=<from-firebase-console>
FIREBASE_MESSAGING_SENDER_ID=<from-firebase-console>
FIREBASE_APP_ID=<from-firebase-console>
NODE_ENV=production
PORT=5000
```

**Build Command:** (Railway auto-detects from package.json)
- Already configured in `package.json`

**Start Command:**
- `npm run dev` (already in scripts)

**Cost:**
- Days 1-30: FREE ($5 credit)
- After 30 days: $5/month

---

### Option B: Render (FREE but sleeps)

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repo
5. Configure:
   - Name: `ebhangar-backend`
   - Environment: Node
   - Build: `npm install`
   - Start: `npm run dev`
   - Instance: FREE

**Same environment variables as Railway**

**Limitation:**
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ First request takes 30-60 sec to wake

---

## 3️⃣ Frontend Deployment (Vercel)

### Steps:
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import eBhangar repository
5. Configure:
   - Framework: React
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

**Environment Variables:**
```env
VITE_FIREBASE_API_KEY=<your-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_API_URL=<your-railway-backend-url>
```

**Important:**
- Get backend URL from Railway/Render dashboard
- Add `/api` at the end: `https://your-backend.railway.app/api`

**Deploy:**
- Click "Deploy"
- Done in 2 minutes!
- Get `.vercel.app` domain

---

## 4️⃣ Code Changes Needed

### Update Frontend API URL

Edit `client/src/lib/queryClient.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(`${API_URL}${queryKey[0]}`, {
          credentials: 'include',
          headers: {
            'x-user-phone': getPhoneFromAuth(),
          },
        });
        
        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`Server error: ${res.status}`);
          }
          const text = await res.text();
          throw new Error(text || `Error: ${res.status}`);
        }
        return res.json();
      },
      // ... rest of config
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-user-phone': getPhoneFromAuth(),
    },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}
```

### Update Backend CORS

Edit `server/index.ts` - add CORS for Vercel:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app', // Add your Vercel URL
  ],
  credentials: true,
}));
```

---

## 5️⃣ Firebase Configuration

### Add Authorized Domains:

1. Go to Firebase Console
2. Authentication → Settings → Authorized Domains
3. Add:
   - `your-app.vercel.app` (frontend)
   - `localhost` (for testing)

**Important:** Without this, login won't work!

---

## 6️⃣ Testing Checklist

After deployment:

- [ ] Frontend loads on Vercel URL
- [ ] Backend responds on Railway/Render URL
- [ ] Database connection works (check Railway logs)
- [ ] Login with phone OTP works
- [ ] Create booking works
- [ ] Data persists in Neon database
- [ ] Admin can assign vendors

---

## 💰 Cost Summary

| Service | Free Tier | After Free | Notes |
|---------|-----------|------------|-------|
| **Neon DB** | 0.5GB | Same (FREE forever) | Data permanent |
| **Railway** | $5 trial (30 days) | $5/month | Best option |
| **Render** | FREE always | FREE always | But sleeps |
| **Vercel** | 100GB bandwidth | $20/month Pro | Usually enough |

**Total First Month:** ₹0  
**Monthly After:** ₹0-420 (depends on Railway vs Render choice)

---

## 🔧 Troubleshooting

### Backend won't connect:
- Check DATABASE_URL in environment variables
- Verify Neon database is not paused
- Check Railway/Render logs

### Frontend API errors:
- Verify VITE_API_URL points to correct backend
- Check CORS settings in backend
- Ensure credentials: 'include' in fetch

### Login not working:
- Add domain to Firebase authorized domains
- Check Firebase environment variables
- Verify phone authentication enabled

---

## 📈 Scaling Path

**Month 1 (FREE):**
- Railway trial ($5 credit)
- Neon free tier
- Vercel free tier

**Month 2-6 (₹420/month):**
- Railway $5/month
- Neon free tier
- Vercel free tier

**Growth Stage (₹1700-3000/month):**
- Upgrade to Railway Pro
- Or migrate to Replit Autoscale
- Keep Neon (upgrade if needed)
- Keep Vercel (upgrade if traffic high)

---

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Build frontend for deployment
npm run build

# 3. Test locally before deploy
npm run dev

# 4. Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 📞 Support

**Railway:** [railway.app/help](https://railway.app/help)  
**Render:** [render.com/docs](https://render.com/docs)  
**Vercel:** [vercel.com/docs](https://vercel.com/docs)  
**Neon:** [neon.tech/docs](https://neon.tech/docs)

---

**Good luck with your launch! 🚀**
