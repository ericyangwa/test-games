# Daily Games Lab: Plan

## Goal

Build several quick daily-game prototypes in one static-site repo, host them, and send the best few to playtesters. The aim is to find an original daily game in the spirit of Krillion (answer trivia with the *least* common answer) or the paper-folding game (fold paper to reach a target pattern) that has a real chance of going viral.

Prototypes should be cheap and fast. Churn out many, playtest, keep what sticks.

## Design rules

Every game must pass all of these before it gets built:

1. **Daily and shared.** One puzzle per day, the same for everyone, generated from the date with a seeded random generator. No server needed.
2. **No cold start.** Scoring never depends on other players' submissions, so the first player of the day gets a real score. Crowd data can only be a bonus. (Krillion likely solves this by scoring against an AI-generated estimate of answer frequency.)
3. **Scales to 1M+ players a day.** No mechanic that needs turn-taking or a single shared object.
4. **One correct answer.** There is an objective "you got it" state, not a judgment call.
5. **A gradient.** Scores can be compared, e.g. fewest strokes, fewest pings, or swings used out of the limit.
6. **You can fail.** A fixed budget (e.g. twice the minimum moves). Miss it and you lose, then see the answer. No "good enough, I'll stop here" middle ground.
7. **Spoiler-free share text.** A Wordle-style emoji grid plus a result line, e.g. `Fracture #9 4/6`.
8. **Not too close to existing games.** Check before building.

## How we got here (ideation history)

Rounds of ideas and why each filter exists:

- **Round 1 (too on-the-nose):** Schelling (match the crowd), Median (guess the median guess), Rarest Pair, One Cut (fold + one cut), Pour, Shadow, Mobile, Draw It, Tilt perception, One Brick (shared tower). Feedback: too close to the examples; go wilder.
- **Round 2 (wilder):** Hum, Inkblot, Telephone, Ember, Quiet, Tide, Forgery, Five Words, Shards, Last Second.
- **Filter: scaling.** Dropped Telephone (one chain can't take a million turns), Ember (a global flame never goes out with that many players), Last Second (someone always submits at 11:59:59).
- **Filter: cold start.** Anything scored by other players' submissions fails for the first player. Hum and Five Words only survive with AI as the judge.
- **Filter: correct answer.** Inkblot was dropped: there's no way to tell a rare answer from a nonsense one ("potato" for any blot). Fixes like AI plausibility checks or tracing the shape were considered, but grading stays subjective.
- **Research (Nov 2026):** No daily Inkblot exists (closest: Mattel's *ThinkBlot* board game, which scores unique answers higher). Pottery repair is taken (*Kintsukuroi*, 2015 Android; *Shards Reunited: Kintsugi*, 2025 Steam), so Shards moved away from pottery. Krillion has a sibling, *Noillirk*, that rewards the most common answer.
- **Shards → Fracture.** Three directions were considered: Fracture (strike glass to match a crack pattern), Stained Glass (rebuild a window from the light it casts), Shredded (reassemble a shredded letter). Fracture was built.

## Fracture (built, on hold)

`games/fracture/index.html`. Fracture works but is parked: it doesn't create excitement yet. You strike a pane of glass to recreate a target crack pattern, and spot, force and order all matter.

How it works:

- **Fake physics, not real physics.** Each strike makes radial cracks (spokes) plus concentric cracks (rings between spokes). Shapes are seeded from the date, grid cell and force, so the same strike always breaks the same way.
- **Cracks stop at older cracks**, so strike order changes the result.
- **Strikes snap to a 20×20 grid**, with 3 forces: Tap, Hit, Smash. Daily target = 3 random strikes.
- **Scoring:** sample both crack patterns, count how much of each sits within 5px of the other (F1 score), then cube it to make it steeper. Exact solution = 100%; wrong order ≈ 16%; off by one cell ≈ 5%.
- **Rules:** budget is 2× the minimum hits. Undo is free but doesn't refund swings. Below 100% when out of swings = loss, and the answer appears.

Learnings:

- Showing the target on the glass gives away the impact points, so there's no "aha." Hiding it turns the game into a memory test. Neither works yet.
- Having a fail state matters; without it, players settle for "good enough."
- The per-swing emoji grid (🟥🟧🟨🟩) makes the share text feel like Wordle.

## Game backlog

Four games are the quickest to prototype: Tilt, Slingshot, Sonar and Half. Eric picks which to build next. Existing-game notes are unverified unless marked.

| Game | Concept | Score (fail state) | Build effort | Notes |
| --- | --- | --- | --- | --- |
| Tilt | Ice-slide maze: tilt the board, the ball slides until it hits a wall | Fewest tilts to the goal (tilt limit) | Low | Optimal solution computable by search |
| Slingshot | Space golf: launch a probe past planets whose gravity bends its path | Fewest launches (launch limit) | Low | The twist on plain daily golf |
| Sonar | A wreck is hidden in a dark ocean; each ping returns its distance | Fewest pings (ping limit) | Low | Battleship + triangulation |
| Half | One straight cut to split a country's outline into equal areas | Error % (miss tolerance = fail) | Low | Needs country outline data |
| Polyglot | Hear 3 spoken phrases, name the language; clues get easier | Clues used (wrong after 3 = fail) | Low | Audio: Mozilla Common Voice or Tatoeba; The Great Language Game did a non-daily version |
| Daily golf | One generated hole; aim and set power | Fewest strokes (stroke limit) | Medium | Some daily golf games exist; needs a twist |
| Ricochet | One laser shot; place mirrors to hit the target | Fewest mirrors (mirror limit) | Low | Best answer computable |
| Domino | Place N dominoes so the chain reaches the bell | Fewest pieces (piece limit) | Medium | Needs simple physics |
| Pour | Odd-sized jugs, hit an exact amount | Fewest pours (pour limit) | Low | Classic water-jug puzzle |
| Gears | Place gears so the output spins at an exact speed and direction | Fewest gears (gear limit) | Medium | |
| Safe | Crack a dial combination from audio clicks | Fewest tries (try limit) | Medium | Mastermind played by sound |
| Jar | Guess a generated jar's jellybean count with higher/lower hints | Fewest guesses (6 max) | Low | |
| Pitch | Recreate a 5-note melody with higher/lower feedback per note | Fewest tries (6 max) | Medium | Check for existing music dailies |
| Altitude | Generated terrain flyover; guess elevation or where a river flows | Within tolerance (guess limit) | High | |
| Mix | Reach a target color with limited paint drops | Fewest drops (drop limit) | Low | Least original: Colorfle and Hexle exist |

Dropped: Inkblot (no correct answer to grade), Telephone, Ember and Last Second (don't scale), movie frames (*Framed* exists; copyright gray area), pottery Shards (already exists).

## Next steps

- [ ] Push this repo to GitHub and turn on GitHub Pages (see README.md)
- [ ] Pick 3–4 games from the backlog to prototype
- [ ] Build each as `games/<name>/index.html` and add its card to the hub
- [ ] Send the hosted link to playtesters
- [ ] Collect feedback: was it fun, was it confusing, would you come back tomorrow
