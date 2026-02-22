# Quick Deploy Commands

## First Time Setup

```bash
# 1. Build EasyPortrait
cd EasyPortrait
npm install
npm run build
cd ..

# 2. Install Vercel CLI (if needed)
npm install -g vercel

# 3. Deploy
vercel --prod
```

## Regular Updates

### Update Landing Page or SRT Editor
```bash
# Just push changes - no build needed
git add .
git commit -m "Update landing page"
git push
```

### Update Portrait Tool
```bash
cd EasyPortrait
npm run build
cd ..
git add .
git commit -m "Update portrait tool"
git push
```

## Local Testing

```bash
# Test full site with routing
vercel dev

# Or develop Portrait tool separately
cd EasyPortrait
npm run dev
```

## Verify Deployment

After deploying, check these URLs:
- https://withswag.org/
- https://withswag.org/srt-editor/
- https://withswag.org/portrait/

## Troubleshooting

If portrait tool doesn't work:
```bash
# Rebuild and redeploy
cd EasyPortrait
rm -rf dist
npm run build
cd ..
vercel --prod
```
