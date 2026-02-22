# Google AdSense Setup Guide for WithSwag.org

## What I've Done

✅ Added 4 strategic ad placement slots in your HTML:
- **Ad Slot 1**: Below Pro Banner (high visibility)
- **Ad Slot 2**: Before Tools Section (natural break point)
- **Ad Slot 3**: Before SEO Content (content transition)
- **Ad Slot 4**: Mid-content in SEO section (in-content ad)

✅ Added CSS styling for ad containers
✅ Configured ads to automatically hide for Pro subscribers
✅ Made ads responsive for mobile devices

## How to Get Started with Google AdSense

### Step 1: Apply for AdSense
1. Go to: https://www.google.com/adsense
2. Click "Get Started"
3. Enter your website: `withswag.org`
4. Fill in your payment details
5. Submit application

### Step 2: Add Verification Code
After applying, Google will give you a verification code like:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

Add this to the `<head>` section of `srt-editor/index.html` (after the Google Fonts link).

### Step 3: Wait for Approval
- Usually takes 1-2 weeks
- Google will review your site for:
  - Original content ✓ (you have this)
  - Privacy policy (you should add one)
  - Sufficient content ✓ (you have this)
  - No prohibited content ✓

### Step 4: Create Ad Units
Once approved:
1. Go to AdSense dashboard
2. Click "Ads" → "By ad unit"
3. Create 4 display ads:
   - **Horizontal Banner** (728x90 or responsive) for slots 1, 2, 3
   - **In-article ad** for slot 4

### Step 5: Replace Placeholders
For each ad slot, replace the placeholder with your AdSense code:

**Replace this:**
```html
<div class="ad-placeholder">Advertisement</div>
```

**With this:**
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="YYYYYYYYYY"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## Expected Earnings

With your current setup:
- **100 daily visitors**: $0.50 - $2/day ($15-60/month)
- **500 daily visitors**: $2.50 - $10/day ($75-300/month)
- **1,000 daily visitors**: $5 - $20/day ($150-600/month)
- **5,000 daily visitors**: $25 - $100/day ($750-3,000/month)

**Note**: Actual earnings vary based on:
- Geographic location of visitors (US/UK/CA pay more)
- Niche (tech tools pay well)
- Click-through rate (CTR)
- Cost per click (CPC)

## Pro User Benefits
✅ Pro subscribers won't see any ads (better user experience)
✅ Free users see ads (helps monetize)
✅ This creates incentive to upgrade to Pro

## Alternative Ad Networks

If AdSense rejects you or you want more options:

1. **Media.net** - Good alternative, contextual ads
   - https://www.media.net

2. **PropellerAds** - Easier approval, lower quality
   - https://propellerads.com

3. **Ezoic** - AI-optimized (need 10k+ monthly visits)
   - https://www.ezoic.com

## Privacy Policy Requirement

⚠️ **IMPORTANT**: You MUST add a privacy policy before using ads!

Create a page at `withswag.org/privacy` that mentions:
- You use cookies
- You use Google AdSense
- How user data is collected
- User rights

You can use a generator: https://www.privacypolicygenerator.info/

## Next Steps

1. ✅ Apply for Google AdSense today
2. ⏳ Wait for approval (1-2 weeks)
3. 📝 Add privacy policy page
4. 💰 Replace ad placeholders with real AdSense code
5. 📊 Monitor earnings in AdSense dashboard

## Questions?

- Check AdSense Help: https://support.google.com/adsense
- Typical approval time: 1-2 weeks
- Payment threshold: $100 (paid monthly)
- Payment methods: Bank transfer, check, wire transfer

Good luck! 🚀
