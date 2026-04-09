# 🚀 Cloudflare Pages Deployment Guide

Deploy your Tic Tac Toe app to Cloudflare Pages with Next.js support.

## 📋 Prerequisites

- Cloudflare account (free tier works!)
- GitHub/GitLab account (for automatic deployments)
- Your code pushed to a Git repository

## 🎯 Deployment Methods

### Method 1: Cloudflare Dashboard (Recommended)

#### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for Cloudflare deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the sidebar
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your repository
5. Click **Begin setup**

#### Step 3: Configure Build Settings
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
```

#### Step 4: Add Environment Variables
Click **Environment variables** and add:

```
NEXT_PUBLIC_CONTRACT_ADDRESS = 0x2Ce6EA5243B37B558920B501510A4595808b43cF
NEXT_PUBLIC_NETWORK = base
NEXT_PUBLIC_SUPABASE_URL = https://umsyanyejzqpnfvtxcgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = e80525c279db34f73aa0c7c3f08f9625
NODE_VERSION = 18
```

**Important**: Add these for both **Production** and **Preview** environments!

#### Step 5: Deploy
1. Click **Save and Deploy**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `your-project.pages.dev`

---

### Method 2: Wrangler CLI (Advanced)

#### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

#### Step 2: Login to Cloudflare
```bash
wrangler login
```

#### Step 3: Create wrangler.toml
Create a file named `wrangler.toml` in your project root:

```toml
name = "tictactoe-game"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.production]
vars = { NODE_VERSION = "18" }
```

#### Step 4: Deploy
```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=tictactoe-game
```

#### Step 5: Set Environment Variables via CLI
```bash
wrangler pages secret put NEXT_PUBLIC_CONTRACT_ADDRESS
# Enter: 0x2Ce6EA5243B37B558920B501510A4595808b43cF

wrangler pages secret put NEXT_PUBLIC_NETWORK
# Enter: base

wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL
# Enter: your_supabase_url

wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter: your_supabase_key

wrangler pages secret put NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# Enter: e80525c279db34f73aa0c7c3f08f9625
```

---

## ⚙️ Next.js Configuration for Cloudflare

Cloudflare Pages uses the Edge Runtime. Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  // Ensure static export compatibility
  output: 'standalone',
}

module.exports = nextConfig
```

---

## 🔧 Troubleshooting

### Build Fails with "Module not found"
Add this to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Environment Variables Not Working
1. Make sure they start with `NEXT_PUBLIC_`
2. Add them to BOTH Production and Preview environments
3. Redeploy after adding variables

### Images Not Loading
Add to `next.config.js`:
```javascript
images: {
  unoptimized: true,
  domains: ['your-domain.com'],
}
```

### WebSocket Issues (Supabase Real-time)
Cloudflare Pages supports WebSockets by default. If issues occur:
1. Check Supabase CORS settings
2. Verify real-time is enabled in Supabase
3. Check browser console for connection errors

---

## 🌐 Custom Domain Setup

### Step 1: Add Custom Domain
1. Go to your Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `tictactoe.yourdomain.com`)

### Step 2: Configure DNS
Add a CNAME record in your DNS settings:
```
Type: CNAME
Name: tictactoe (or @ for root domain)
Target: your-project.pages.dev
Proxy: Enabled (orange cloud)
```

### Step 3: Wait for SSL
Cloudflare will automatically provision an SSL certificate (takes 1-5 minutes).

---

## 🚀 Automatic Deployments

Once connected to Git:
- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Automatic preview URLs

---

## 📊 Performance Optimization

### Enable Cloudflare Features

1. **Auto Minify**
   - Go to **Speed** → **Optimization**
   - Enable JavaScript, CSS, HTML minification

2. **Brotli Compression**
   - Automatically enabled on Cloudflare

3. **Caching**
   - Static assets cached automatically
   - Configure cache rules if needed

4. **Analytics**
   - Go to **Analytics** → **Web Analytics**
   - Add analytics snippet to your site

---

## 🔒 Security Settings

### 1. Enable Security Headers
Go to **Security** → **Settings** and enable:
- Always Use HTTPS
- Automatic HTTPS Rewrites
- Opportunistic Encryption

### 2. Configure Firewall Rules (Optional)
Create rules to:
- Block malicious traffic
- Rate limit API calls
- Protect against DDoS

### 3. Enable Bot Fight Mode
- Go to **Security** → **Bots**
- Enable Bot Fight Mode (free)

---

## 📈 Monitoring

### Cloudflare Analytics
- Real-time visitor stats
- Performance metrics
- Security insights

### Check Deployment Status
```bash
wrangler pages deployment list --project-name=tictactoe-game
```

### View Logs
```bash
wrangler pages deployment tail --project-name=tictactoe-game
```

---

## 🔄 Update Deployment

### Via Git (Automatic)
```bash
git add .
git commit -m "Update app"
git push origin main
```

### Via CLI (Manual)
```bash
npm run build
wrangler pages deploy .next --project-name=tictactoe-game
```

---

## 💰 Pricing

Cloudflare Pages is **FREE** for:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

Perfect for your Tic Tac Toe game! 🎮

---

## ✅ Post-Deployment Checklist

- [ ] App is live and accessible
- [ ] Wallet connection works
- [ ] Can register new users
- [ ] AI game works
- [ ] Friend game works (create & join)
- [ ] Random matchmaking works
- [ ] Transactions record correctly
- [ ] Leaderboard displays
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics enabled

---

## 🆘 Need Help?

### Cloudflare Support
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Discord](https://discord.gg/cloudflaredev)

### Common Issues
1. **Build fails**: Check Node version (should be 18+)
2. **Env vars not working**: Ensure `NEXT_PUBLIC_` prefix
3. **404 errors**: Check build output directory is `.next`
4. **Slow builds**: Enable build cache in settings

---

## 🎉 You're Live on Cloudflare!

Your app is now deployed with:
- ⚡ Global CDN (fast worldwide)
- 🔒 Free SSL certificate
- 🚀 Automatic deployments
- 📊 Built-in analytics
- 🛡️ DDoS protection

Share your app and enjoy! 🎮
