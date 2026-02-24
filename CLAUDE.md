# FishCast Pro — Project Context

## ⚠️ FIRST THING EVERY SESSION: READ SESSION_STATE.md ⚠️

```bash
cat SESSION_STATE.md
git log --oneline -10
```

If SESSION_STATE.md shows completed tasks, DO NOT redo them.
Continue from the NEXT uncompleted task only.

## What This Project Is

FishCast Pro is a single-file PWA fishing forecast app.
- **Live site:** https://fishing.wasubihq.com (GitHub Pages)
- **Repo:** 66sith/barnes-lake-fishing
- **Architecture:** Everything is in `index.html` (~2148 lines). CSS + HTML + JS in one file.
- **External libs already loaded:** MapLibre GL 4.7.1, SunCalc 1.9.0 — do NOT add others
- **Contact:** ops@wasubihq.com (business) / trap4tacos@gmail.com (GitHub)

## 🚫 ABSOLUTE RULES — VIOLATING ANY = SESSION FAILURE

1. Do NOT change any port numbers anywhere
2. Do NOT rename or move files
3. Do NOT restructure the repo or add folders
4. Do NOT modify the gate system (EVAL_TOKENS, session timer) unless the current task says to
5. Do NOT modify sw.js or manifest.json
6. Do NOT add external dependencies
7. Do NOT create a backend/server — this is a client-side PWA
8. Do NOT push to git without committing first
9. Do NOT start work without reading SESSION_STATE.md
10. Do NOT redo completed tasks — check git log

## Git Workflow

After EVERY completed task:
```bash
git add -A
git commit -m "TASK X: [description] — COMPLETE"
```

Then update SESSION_STATE.md:
```bash
cat > SESSION_STATE.md << 'EOF'
# SESSION STATE
## Last completed task: TASK X
## Next task: TASK Y
## Files modified: index.html
EOF
git add SESSION_STATE.md && git commit -m "state: updated after TASK X"
git push origin main
```

Push after every 2-3 tasks minimum.

## Code Style

- Vanilla JavaScript, named functions (not arrow), match existing patterns
- CSS custom properties in :root {}
- New HTML inside `<div id="app">` or as overlay modals
- Modals: fixed position, backdrop blur, .open class toggle

## Key Existing Functions (DO NOT DELETE OR RENAME)

fetchWeather(), calculateFishingScore(), calculateSpeciesScores(),
computeSolunar(), renderForecast(), renderSpecies(), renderCatchLog(),
renderMap(), renderPremium(), switchScreen(), openLakeModal(),
closeLakeModal(), selectLake(), validateToken(), checkExistingSession(),
dismissGate(), startSessionTimer(), initMap(), init()

## Key Data

- LAKES[] — array of lake objects with id, name, lat, lng, species
- EVAL_TOKENS{} — token auth (DO NOT MODIFY unless task says to)
- state{} — currentLake, weather, solunar
