# Birthday Love Web App

A romantic, animated, mobile-friendly birthday greeting. It works offline after its first successful load when served from a supported local web server or HTTPS host.

## Personalise it
1. Open `app.js`.
2. Find `const birthdayName='My Love';` and replace `My Love` with her name.
3. In `index.html`, edit the two paragraphs inside the letter card to add your own message.

## Preview
Open `index.html` in a browser. Some browsers restrict service workers and install prompts for pages opened directly as `file://`. For full offline/PWA behaviour, serve the folder from localhost or publish it to an HTTPS static host.

## Add to Android home screen
1. Open the hosted HTTPS link in Chrome.
2. Open Chrome's menu (⋮).
3. Tap **Add to Home screen** or **Install app**.

## Included
- Animated birthday cake, floating hearts and starry background
- Birthday letter and celebratory confetti
- Optional generated musical notes (no audio file or internet required)
- PWA manifest and service worker for offline caching
- Responsive phone and desktop layout

Google Fonts are optional decoration; if unavailable offline, the browser uses fallback fonts.
