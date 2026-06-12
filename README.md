# Jack M. Kite Co. — Heating & Air Conditioning
### Ground-up redesign of jackkiteheatandair.com

A dark-cinematic, animation-rich static site built around the heat ↔ air duality:
ember orange and ice blue on a deep charcoal canvas. No build step — deploy the
folder as-is to any host (Netlify, Vercel, GoDaddy, cPanel, S3…).

## Stack
- **HTML/CSS/JS** — zero tooling, zero dependencies to install
- **GSAP 3.13** (CDN): ScrollTrigger + SplitText — page-wipe transitions, masked
  split-line reveals, scroll-scrubbed statement text, counters, parallax media,
  magnetic buttons, hover-follow service previews, marquee, a vertical
  "thermometer" scroll-progress bar, and a custom blend-mode cursor
- **Three.js** (CDN, ES module): the home hero's thermal particle field — warm
  ember particles rise on the left, cool ice particles sink on the right, the
  whole flow bends around the mouse. Shader-animated (zero per-frame CPU work),
  pauses off-screen, and falls back to a CSS gradient if WebGL is unavailable
- **Fonts** (Google Fonts): Sora (display), Inter (body), IBM Plex Mono (technical labels)
- All motion respects `prefers-reduced-motion`

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home — Three.js hero, marquee, scrubbed statement, services index, stats, about, process, service area, CTA |
| `heating.html` | Heat pumps, gas/electric furnaces, boilers, thermostats, gas logs, zoning |
| `cooling.html` | AC install/repair/replacement/maintenance, humidifiers, purifiers |
| `air-quality.html` | Venting & IAQ — ductwork, ductless splits, exhaust hoods, ventilators, UV lights |
| `commercial.html` | Commercial/industrial HVAC contracting + sheet metal fabrication |
| `contact.html` | Info, floating-label form, hours, payment methods, service area |

## Imagery
All photos are hotlinked **Unsplash** placeholders inside `.ph` frames (each is
labeled "Placeholder — replace with …"). To swap in real photography, drop files
into an `img/` folder and change the `<img src>`; frames auto-cover. The service
index hover previews on the home page are set per-row via `data-preview-img`.
For production, self-host images rather than hotlinking.

## Contact form
Netlify-ready (`data-netlify="true"` — works automatically on Netlify with email
notifications). On other hosts, swap the `action` for Formspree/Basin or keep
the current `mailto:` fallback. The phone number is the primary CTA throughout.

## Local preview
```bash
python3 -m http.server 4181
# → http://localhost:4181
```
(Any static server works; the Three.js module import needs http://, not file://.)

## Content notes — verify before launch
- Phone 423-878-5210 · Fax 423-878-5216 · nancyk@jackkitecompany.com
- 261 South Acres Dr., Bristol TN 37620 · Mon–Fri 7:30–4:30 · 24/7 emergency
- Facts pulled from the live site: 42+ years, family & locally owned, licensed/
  insured/EPA certified, authorized Carrier dealer, all makes & models, extended
  warranties & service agreements, payment methods
- The old site lists service towns as "Irwin" and "Jonesboro" — rendered here
  with the standard spellings **Erwin** and **Jonesborough** (confirm with client)
- "42+ years" matches the live site's claim; if the company has an exact founding
  year, swap it in (hero, nav tagline, stats)
