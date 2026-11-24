# VOLT — Strength Lab

A bold, dark + lime multi-page marketing site for a fictional high-intensity gym.
Static HTML/CSS/JS with GSAP scroll animations. No build step — deploy the folder as-is.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home — video hero, scroll-flown program images, pinned gallery, coaches, CTA |
| `programs.html` | Training programs (feature rows) |
| `inside.html` | Facility tour — pinned horizontal gallery + zones |
| `coaches.html` | Coach profiles |
| `join.html` | Membership tiers + sign-up CTA |
| `404.html` | Branded not-found page |

## Shared assets
- `styles.css` — all styling (design tokens at the top in `:root`)
- `script.js` — all behaviour (GSAP engine, reveals, cursor, loader)
- `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml`

## Run locally
It's a static site — open `index.html` in a browser, or serve the folder:
```bash
npx serve .          # or: python -m http.server
```
> GSAP, the hero video and photos load from CDNs (jsDelivr/cdnjs, Pexels, Unsplash),
> so an internet connection is needed. To go fully self-contained, download those
> assets locally and update the URLs.

## Deploy
Drop the folder on any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.
No configuration required. `404.html` is picked up automatically by most hosts.

## ⚠️ Before you go live — replace the placeholder domain
The canonical tags, Open Graph URLs, `robots.txt` and `sitemap.xml` use a placeholder:
**`https://voltstrength.lab`**. Find-and-replace it with your real domain in:
- all `*.html` (`<link rel="canonical">`, `og:url`)
- `robots.txt` (the `Sitemap:` line)
- `sitemap.xml` (every `<loc>`)

## Performance notes
- Scripts are `defer`-loaded; the hero image is `preload`ed for a fast LCP.
- The hero video is the 720p clip and is **not loaded on phones / data-saver / reduced-motion** — the poster image shows instead.
- Images are width/quality-tuned Unsplash URLs; `prefers-reduced-motion` is fully respected.
- Optional next steps: self-host the font + responsive `srcset`, and swap the Unsplash/Pexels
  URLs for your own optimised, self-hosted media.

## Credits
Placeholder imagery from Unsplash, hero video from Pexels, fonts Anton + Space Grotesk (Google Fonts),
animation via GSAP. Replace all placeholder copy, stats and media with your real brand content.
