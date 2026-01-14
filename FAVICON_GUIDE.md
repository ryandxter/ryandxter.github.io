# Favicon Management Guide

## Automatic Title Update ✅

The website title now automatically updates based on your CV data:
- **Format**: `{name} - {title}`
- **Example**: `Yadwinder Singh - Freelance Product Designer`

This is configured in [app/layout.tsx](app/layout.tsx) and pulls from your data in [data/cv-data.ts](data/cv-data.ts).

## Custom Favicon Upload

You can now upload custom favicons directly from the Admin Panel:

### How to Upload:
1. Go to `/admin` in your portfolio
2. Enter your password: `Reflection2025`
3. Click on the **"Favicon"** tab
4. Upload your favicon file (ICO or PNG format, max 100KB)
5. The favicon will be saved and applied immediately

### File Requirements:
- **Format**: `.ico` or `.png`
- **Size**: Max 100KB
- **Recommended Dimensions**: 
  - ICO: 32x32 pixels
  - PNG: 180x180 pixels

### What Gets Updated:
- **favicon.ico** - Browser tab icon (32x32)
- **apple-touch-icon.png** - iOS home screen icon (180x180)

### Browser Support:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ Apple devices (iOS home screen)
- ✅ Bookmarks

### Tips:
- If you have a simple PNG, it works great for both desktop and mobile
- For best results, upload a PNG with your logo/icon
- Remember to clear your browser cache if the old favicon persists
- You can always re-upload to change your favicon later

## Technical Details

**API Endpoint**: `POST /api/favicon`
- Accepts multipart form data with `file` field
- Validates file type and size
- Saves to `/public` directory
- Returns success/error JSON response

**Auto Metadata**: The website automatically includes favicon references in the HTML `<head>`:
```html
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Default Favicons

If you haven't uploaded custom favicons yet, the portfolio uses these defaults:
- `favicon.ico` - Basic portfolio icon
- `apple-touch-icon.png` - Apple/iOS icon (2.6KB)

Both are located in the `/public` folder and can be replaced anytime.
