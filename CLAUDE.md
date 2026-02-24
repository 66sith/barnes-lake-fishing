# Barnes Lake Fishing PWA

## Architecture
- **Single HTML monolith** — no build tools, no npm
- **CDN deps:** MapLibre GL JS 4.7.1, SunCalc 1.9.0
- **API:** Open-Meteo (free, no auth)
- **Serving:** nginx port 8092 → Cloudflare tunnel → `fishing.wasubihq.com`
- **Config:** `/opt/homebrew/etc/nginx/servers/fishing.conf`

## Design Tokens
- Bg: `#0a1628` → `#0f1f35` → `#162a46`
- Gold: `#d4a843` (metallic accent)
- Teal: `#00d4aa` (score/data)
- Glass: `rgba(15,31,53,0.72)` + `backdrop-filter: blur(40px)`
- Font: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui`
- iOS Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Tap: `180ms cubic-bezier(0.2, 0, 0, 1)`

## Key Files
| File | Purpose |
|------|---------|
| `index.html` | Entire app (~3000 lines) |
| `sw.js` | Service worker (offline-first) |
| `manifest.json` | PWA manifest |
| `icons/` | App icons (192, 512, apple-touch, favicon) |

## Barnes Lake Info
- Location: 43.1845°N, 83.3025°W
- Lapeer County, Michigan
- 149 acres, max depth ~45ft
- Two basins (north + south), kidney/boomerang shape

## Species: Largemouth, Smallmouth, Pike, Crappie, Bluegill, Perch, Walleye

## Testing Checklist
- [ ] Jeff banner gold metallic shimmer
- [ ] Gauge placeholder → fills on weather load
- [ ] Hourly timeline 24h species + best windows
- [ ] Species cards with 2 baits + Amazon links
- [ ] Bottom sheet: spring snap, velocity flick, rubberband
- [ ] Sheet content scrolls at full height
- [ ] Safe areas (Dynamic Island + home indicator)
- [ ] All touch targets ≥ 44pt
- [ ] Settings persist across reload
- [ ] Screen Wake Lock active
- [ ] Zero console errors
- [ ] SW caches v3
