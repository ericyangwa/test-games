# Daily Games Lab

Playtest prototypes for daily puzzle games. See PLAN.md for the goal, design rules, ideation history and game backlog.

```
index.html              hub page listing every game
games/<name>/index.html one self-contained file per game
.nojekyll               tells GitHub Pages to serve files as-is
```

## Host it on GitHub Pages

1. Create a new empty repository on GitHub (for example `daily-games`).
2. From this folder, run:
   ```
   git remote add origin https://github.com/<your-username>/daily-games.git
   git push -u origin main
   ```
3. On GitHub, open the repo's **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/daily-games/`.

Netlify or Vercel also work: point them at the repo, with no build command and the root folder as the publish directory.

## Run it locally

Open `index.html` in a browser, or serve the folder with `python3 -m http.server` and visit http://localhost:8000.

## Add a game

1. Create `games/<name>/index.html`, a single file with its CSS and JS inline.
2. Add a card for it in the root `index.html`.
3. Link back to the hub with `href="../../"`.

## How daily puzzles work

Each game builds today's puzzle from the date (puzzle #1 is Nov 1, 2026) using a seeded random generator. Everyone gets the same puzzle on the same day with no server, and the scoring needs no other players.
