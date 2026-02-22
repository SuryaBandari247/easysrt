# WithSwag Deployment Guide

This guide covers deploying both projects (easysrt and EasyPortrait) under the same domain: withswag.org

## Project Structure

```
/
├── easysrt/              # Main site + SRT Editor
│   ├── index.html        # Landing page (withswag.org/)
│   ├── srt-editor/       # SRT tool (withswag.org/srt-editor/)
│   └── ...
├── EasyPortrait/         # Portrait tool (withswag.org/portrait/)
│   ├── src/
│   ├── dist/             # Built files
│   └── package.json
└── vercel.json           # Routing configuration
```

## URLs

- Landing page: `https://withswag.org/`
- SRT Editor: `https://withswag.org/srt-editor/`
- Portrait Creator: `https://withswag.org/portrait/`

## Deployment Steps

### 1. Build EasyPortrait

Before deploying, build the EasyPortrait project:

```bash
cd EasyPortrait
npm install
npm run build
cd ..
```

This creates the `EasyPortrait/dist/` folder with production files.

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Deploy from root directory
vercel

# For production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will automatically detect the `vercel.json` config
4. Click "Deploy"

### 3. Configure Domain

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add `withswag.org`
4. Update your DNS records as instructed

## How Routing Works

The `vercel.json` configuration handles routing:

- `/` → easysrt landing page
- `/srt-editor/` → SRT editor tool
- `/portrait/` → EasyPortrait app
- Static files (images, CSS, JS) → served from easysrt

## Local Development

### Test the full setup locally:

1. Build EasyPortrait:
```bash
cd EasyPortrait
npm run build
cd ..
```

2. Serve with Vercel CLI:
```bash
vercel dev
```

This simulates the production routing locally.

### Develop EasyPortrait separately:

```bash
cd EasyPortrait
npm run dev
```

Access at `http://localhost:5173` (note: base path won't work in dev mode)

## Updating Content

### Update Landing Page
Edit `easysrt/index.html` and push changes.

### Update SRT Editor
Edit files in `easysrt/srt-editor/` and push changes.

### Update Portrait Tool
1. Make changes in `EasyPortrait/src/`
2. Build: `npm run build`
3. Commit the `dist/` folder
4. Push changes

## SEO Files

Updated files for both tools:
- `easysrt/sitemap.xml` - includes both tools
- `easysrt/robots.txt` - search engine directives
- Landing page meta tags - updated descriptions

## Troubleshooting

### Portrait tool shows 404
- Ensure `EasyPortrait/dist/` exists and is committed
- Check that `vercel.json` is in the root directory
- Verify the build completed successfully

### Assets not loading
- Check that `base: '/portrait/'` is set in `vite.config.ts`
- Ensure all asset paths are relative in the React app

### Routing conflicts
- The order in `vercel.json` routes matters
- More specific routes should come before general ones

## Environment Variables

If you need environment variables for either project:

1. Create `.env` files locally (already gitignored)
2. Add them in Vercel dashboard under "Environment Variables"

## Performance Tips

- EasyPortrait is built with code splitting (vendor chunk)
- Both projects use minimal dependencies
- All images should be optimized before deployment
- Consider adding a CDN for static assets if traffic grows

## Monitoring

After deployment, monitor:
- Vercel Analytics (built-in)
- Google Search Console (for SEO)
- Core Web Vitals (performance)

## Next Steps

1. Test all routes after deployment
2. Submit updated sitemap to Google Search Console
3. Test on mobile devices
4. Monitor for any 404s or broken links

---

Need help? Check Vercel docs or create an issue in the repo.
