WOVEN BRACELET GENERATOR — INSTALLABLE WEB APP PACKAGE

This folder is a Progressive Web App (PWA). It keeps the original app-style setup,
adds a custom app icon, and can be installed to an iPhone/iPad Home Screen.

IMPORTANT:
Apple does not allow a downloaded unsigned app package to be installed directly.
For iPhone/iPad, this package must first be placed on an HTTPS website.

INSTALL AFTER HOSTING:
1. Open the hosted site in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. The Woven Bracelet icon will appear on your Home Screen.
5. After the first load, the app can work offline.

FILES:
- index.html — the bracelet generator
- manifest.webmanifest — app name/icon settings
- service-worker.js — offline support
- apple-touch-icon.png — iPhone/iPad Home Screen icon
- icon-192.png / icon-512.png / icon-1024.png — app icons

The package is ready to upload as-is to GitHub Pages, Netlify, Cloudflare Pages,
or another static HTTPS host.
