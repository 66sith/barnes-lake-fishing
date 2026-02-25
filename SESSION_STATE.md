# SESSION STATE
## Last completed: PROMPT 1 — Emergency Species Data Accuracy Fix (TASKS 1.1–1.5)
## Next: PROMPT 2 — Backend API Server on CORTEX (~/fishcast-api)
## Date: 2026-02-24

## PROMPT 1 COMPLETED (all 5 tasks):
- 1.1 Research: All 7 species verified via Barnes Lake Club annual reports, fishing
      contest records, Michigan Sportsman Forum. Smallmouth Bass CONFIRMED (explicit
      contest category). Crappie/Walleye/Perch all actively stocked by Club.
- 1.2 SPECIES_DB replaced with rich, source-cited data structure:
      tempRange, seasonGrid[12], baits[] (objects w/ Amazon links), tips[], recipe{},
      regulations, source, proLocked
- 1.3 Species cards: Verified badge, specific bait names, all cards now tappable
      (PRO-locked cards open detail sheet with PRO banner, not just a toast)
- 1.4 Detail sheet expanded: Technique, Baits+Links, Targeting Info, Seasonal Calendar
      (12-month grid), MI DNR Regulations, Barnes Lake-specific Pro Tips, Recipe Card,
      Data Source footer
- 1.5 Committed and pushed: commit 10d8cd0

## Files modified: index.html

## Key facts for PROMPT 2:
- Backend goes in NEW repo: ~/fishcast-api
- CORTEX already has: PostgreSQL, Node.js, Python, Docker
- API exposed via Cloudflare Tunnel → api.wasubihq.com
- Port: 3500 (see CLAUDE.md prohibition on changing ports)
- Associate tag for Amazon affiliate: fishcastpro-20

## PROMPT 2 DEPENDENCIES:
- PostgreSQL already running on CORTEX ✓
- Cloudflare already configured for other services ✓
- npm/node.js already on CORTEX ✓
