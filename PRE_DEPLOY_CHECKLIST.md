# Pre-Deployment Checklist

Run through this before deploying to catch any issues:

## ✅ Build Verification

- [x] EasyPortrait built successfully
- [x] `EasyPortrait/dist/` folder exists
- [x] No TypeScript errors in build

## ✅ Configuration Files

- [x] Root `vercel.json` exists with routing rules
- [x] `EasyPortrait/vite.config.ts` has `base: '/portrait/'`
- [x] `EasyPortrait/src/App.tsx` has `basename="/portrait"`

## ✅ Content Updates

- [x] Landing page has Portrait card
- [x] Sitemap includes `/portrait/` URL
- [x] Meta descriptions updated

## 🔍 Optional Local Testing

Before deploying, you can test locally:

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Test the routing locally
vercel dev
```

Then check:
- http://localhost:3000/ (landing)
- http://localhost:3000/srt-editor/ (SRT tool)
- http://localhost:3000/portrait/ (Portrait tool)

## 🚀 Deploy Commands

When ready:

```bash
# Production deployment
vercel --prod
```

## 📋 Post-Deployment Testing

After deploying, test these URLs:

1. **Landing Page**: https://withswag.org/
   - [ ] Page loads
   - [ ] Both tool cards visible
   - [ ] Links work

2. **SRT Editor**: https://withswag.org/srt-editor/
   - [ ] Editor loads
   - [ ] Can create subtitles
   - [ ] Download works

3. **Portrait Tool**: https://withswag.org/portrait/
   - [ ] Landing page loads
   - [ ] Can click "Create Single Photo" or "Create Collage"
   - [ ] Editor page loads
   - [ ] Can upload image
   - [ ] Can crop and download

4. **SEO Files**:
   - [ ] https://withswag.org/sitemap.xml
   - [ ] https://withswag.org/robots.txt

## 🐛 Common Issues & Fixes

### Portrait tool shows 404
```bash
cd EasyPortrait
npm run build
cd ..
vercel --prod
```

### Assets not loading in Portrait tool
- Check browser console for errors
- Verify `base: '/portrait/'` in vite.config.ts
- Ensure basename="/portrait" in App.tsx

### Routing not working
- Verify `vercel.json` is in root directory
- Check route order (specific routes before general)

## 📊 Monitor After Launch

- Check Vercel deployment logs
- Monitor for 404 errors
- Test on mobile devices
- Submit sitemap to Google Search Console

---

Ready to deploy! 🎉
