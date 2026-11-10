# CLAUDE.md

Read `PLAN.md` first. It has the goal, the design rules every game must pass, the ideation history (what was dropped and why), the Fracture learnings, and the game backlog.

## Building a new game

- One self-contained file per game: `games/<name>/index.html`, CSS and JS inline, no build step, no external dependencies.
- Add a card for it in the root `index.html`, and link back to the hub with `href="../../"`.
- Copy Fracture's structure (`games/fracture/index.html`):
  - Daily seed from the date (puzzle #1 = Nov 1, 2026), FNV-1a hash + mulberry32 RNG, so everyone gets the same puzzle.
  - A move budget with a fail state; reveal the answer on a loss.
  - Wordle-style share text: `<Game> #<n> <moves>/<budget>` plus one emoji per move.
  - A "Prototype tools" section: random puzzle, reveal solution, back to daily.
  - Mobile-friendly: works at phone width, pointer events, no hover-only controls.
- Ask Eric which backlog games to build before starting; don't pick on your own.

## Testing

- Serve the repo with `python3 -m http.server` (game links open folders, so `file://` won't work).
- Check in a headless browser (Playwright): the daily solution is reachable within the budget, a win and a loss both show the right share text, and there are no console errors.
