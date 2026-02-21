# SRT Editor Pro

A web-based subtitle editor for creating and editing SRT files with built-in monetization.

## Features

### Three Editing Modes

1. **Paste & Parse** - Copy/paste existing SRT content and instantly parse it
2. **Manual Entry** - Create subtitles one by one with a simple form
3. **Open File** - Load and edit existing .srt files

### Core Functionality

- Add, edit, and delete subtitle entries
- Download as .srt file
- Real-time subtitle counter
- Clean, intuitive interface

### Monetization Strategy

- **Free Tier**: Up to 10 subtitles
- **Pro Tier ($9.99/month)**: 
  - Unlimited subtitles
  - Advanced features (ready for expansion)
  - Batch operations
  - Auto-sync tools
  - Priority support

## Getting Started

1. Open `index.html` in a web browser
2. Choose your editing mode
3. Start creating subtitles!

## Deployment Options

### Quick Deploy (Static Hosting)
- Netlify: Drag and drop the folder
- Vercel: Connect your Git repo
- GitHub Pages: Push to a repo and enable Pages

### Monetization Integration

Replace the checkout button handler in `app.js` with your payment processor:

```javascript
// Stripe example
document.querySelector('.checkout-btn').addEventListener('click', () => {
    window.location.href = 'https://buy.stripe.com/your-payment-link';
});
```

**Recommended Payment Processors:**
- Stripe (easiest integration)
- PayPal
- Paddle (handles VAT/taxes)
- Gumroad (simple for digital products)

### Backend Integration (Optional)

For user accounts and subscription management:
- Add authentication (Firebase, Auth0, Supabase)
- Store user data and subscription status
- Implement API to check Pro status

## Customization

- Adjust `FREE_LIMIT` in `app.js` to change free tier limit
- Modify pricing in `index.html`
- Add more features to Pro tier
- Customize colors in `styles.css`

## Future Enhancements

- Video preview with subtitle overlay
- Auto-timing suggestions
- Batch import/export
- Translation features
- Keyboard shortcuts
- Undo/redo functionality

## License

Customize for your needs!
