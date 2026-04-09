# 🚀 Deployment Guide - Base Mainnet

Your Tic Tac Toe app is ready to deploy! Follow these steps to get it live.

## ✅ Pre-Deployment Checklist

### 1. Verify Environment Variables
Make sure your `.env.local` has all required variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2Ce6EA5243B37B558920B501510A4595808b43cF
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_SUPABASE_URL=https://umsyanyejzqpnfvtxcgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=e80525c279db34f73aa0c7c3f08f9625
```

### 2. Test Locally
```bash
# Build the app to check for errors
npm run build

# Test the production build
npm start
```

Visit `http://localhost:3000` and test:
- ✅ Wallet connection
- ✅ Registration (if new user)
- ✅ AI game
- ✅ Friend game (create & join)
- ✅ Random matchmaking
- ✅ Transaction recording

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest way to deploy Next.js apps and it's free!

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# Deploy to production
vercel --prod
```

#### Step 4: Set Environment Variables
After deployment, go to your Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
3. Redeploy: `vercel --prod`

#### Step 5: Custom Domain (Optional)
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

### Option 2: Netlify

#### Step 1: Install Netlify CLI
```bash
npm i -g netlify-cli
```

#### Step 2: Login
```bash
netlify login
```

#### Step 3: Initialize and Deploy
```bash
# Initialize
netlify init

# Deploy
netlify deploy --prod
```

#### Step 4: Set Environment Variables
```bash
netlify env:set NEXT_PUBLIC_CONTRACT_ADDRESS "0x2Ce6EA5243B37B558920B501510A4595808b43cF"
netlify env:set NEXT_PUBLIC_NETWORK "base"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_key"
netlify env:set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID "your_id"
```

---

### Option 3: Railway

#### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

#### Step 2: Login and Initialize
```bash
railway login
railway init
```

#### Step 3: Add Environment Variables
```bash
railway variables set NEXT_PUBLIC_CONTRACT_ADDRESS=0x2Ce6EA5243B37B558920B501510A4595808b43cF
railway variables set NEXT_PUBLIC_NETWORK=base
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
railway variables set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
```

#### Step 4: Deploy
```bash
railway up
```

---

### Option 4: Self-Hosted (VPS/Cloud)

#### Requirements:
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy

#### Step 1: Build the App
```bash
npm run build
```

#### Step 2: Install PM2
```bash
npm i -g pm2
```

#### Step 3: Create Ecosystem File
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'tictactoe',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_CONTRACT_ADDRESS: '0x2Ce6EA5243B37B558920B501510A4595808b43cF',
      NEXT_PUBLIC_NETWORK: 'base',
      NEXT_PUBLIC_SUPABASE_URL: 'your_url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_key',
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: 'your_id'
    }
  }]
}
```

#### Step 4: Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx
Create `/etc/nginx/sites-available/tictactoe`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/tictactoe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Post-Deployment Security

### 1. Enable HTTPS
- **Vercel/Netlify**: Automatic SSL
- **Self-hosted**: Use Let's Encrypt
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com
  ```

### 2. Configure CORS (if needed)
Your Supabase project should allow requests from your domain.

### 3. Rate Limiting
Consider adding rate limiting to prevent abuse:
- Vercel: Built-in edge functions
- Self-hosted: Use nginx rate limiting

---

## 📊 Monitoring

### Vercel Analytics
```bash
npm i @vercel/analytics
```

Add to `pages/_app.js`:
```javascript
import { Analytics } from '@vercel/analytics/react'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
      <Analytics />
    </>
  )
}
```

### Monitor Supabase
- Check Supabase dashboard for:
  - Database usage
  - Real-time connections
  - API requests

### Monitor Blockchain
- Check BaseScan for contract interactions
- Monitor gas usage
- Track transaction success rate

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check browser console for undefined values

### Wallet Connection Issues
- Verify contract address is correct
- Check network is set to "base"
- Ensure MetaMask is on Base Mainnet

### Supabase Connection Issues
- Verify Supabase URL and key
- Check CORS settings in Supabase dashboard
- Ensure real-time is enabled

---

## 🎉 You're Live!

After deployment:

1. **Test Everything**
   - Connect wallet
   - Play AI game
   - Create friend game
   - Join random match
   - Check leaderboard

2. **Share Your App**
   - Share on Twitter/X
   - Post in Base community
   - Share in Web3 gaming communities

3. **Monitor Performance**
   - Check analytics
   - Monitor error logs
   - Track user engagement

---

## 📝 Quick Deploy Commands

### Vercel (Fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## 🔗 Useful Links

- **Base Mainnet**: https://base.org
- **BaseScan**: https://basescan.org
- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Contract Address**: `0x2Ce6EA5243B37B558920B501510A4595808b43cF`

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error logs
2. Verify all environment variables
3. Test locally first with `npm run build && npm start`
4. Check Supabase and blockchain status

Good luck with your deployment! 🚀
