# Daily Games Lab

Playtest prototypes for daily puzzle games. See PLAN.md for the goal, design rules, ideation history and game backlog.

```
index.html              hub page listing every game
games/<name>/index.html one self-contained file per game
.nojekyll               tells GitHub Pages to serve files as-is
```

## Hosting

The site is served by GitHub Pages from the `main` branch, root folder, at https://ericyangwa.github.io/test-games/. Every push to `main` redeploys it within a minute or two. Pages only works while the repository is public (on a free GitHub plan).

All links are relative (`games/<name>/`, `../../`), so the site works under the `/test-games/` path without changes.

Netlify or Vercel also work: point them at the repo, with no build command and the root folder as the publish directory.

## Run it locally

Open `index.html` in a browser, or serve the folder with `python3 -m http.server` and visit http://localhost:8000.

## Add a game

1. Create `games/<name>/index.html`, a single file with its CSS and JS inline.
2. Add a card for it in the root `index.html`.
3. Link back to the hub with `href="../../"`.

## How daily puzzles work

Each game builds today's puzzle from the date (puzzle #1 is Nov 1, 2026) using a seeded random generator. Everyone gets the same puzzle on the same day with no server, and the scoring needs no other players.
