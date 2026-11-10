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

## Round 1 prototypes (built Nov 2026, not yet playtested)

Eric picked the four quickest games: Tilt, Slingshot, Sonar and Half. Each is `games/<name>/index.html` and follows Fracture's structure.

- **Tilt.** 10×10 ice board; the ball slides until it hits a rock or the edge and must *stop* on the star. The generator BFS-searches random rock layouts and puts the star 6–9 tilts from the start. Budget is 2× the minimum. Emoji per tilt: 🟩 the move got one tilt closer, 🟨 no closer, 🟥 further away or a dead end.
- **Slingshot.** Every launch starts from the same pad; the probe's path comes from a fixed-timestep gravity sim, so the same angle and power always fly the same way. The straight shot is always blocked by a planet. The generator sweeps every angle and power and keeps layouts where only 0.4–3% of shots hit. 6 launches; old shots stay on screen as feedback. Emoji by closest approach.
- **Sonar.** 25×25 sea with generated islands. A ping returns the straight-line distance to the wreck, rounded to whole squares; ping the wreck's square to win. 6 pings. Emoji by range.
- **Half.** Changed from the backlog version in two ways. (1) The island is generated, not a real country, so there's no outline data to ship; real countries could replace it later (e.g. Natural Earth, which is public domain). (2) The border must pass through a capital ★, which makes the answer a single angle (the generator checks there's exactly one) instead of any line that bisects the area. 4 cuts, each reports the split; win within 0.5 points of 50/50.

## Polyglot (built Nov 2026, not yet playtested)

`games/polyglot/index.html`. Heardle for languages: hear a sentence, name the language in 6 guesses. Each miss or skip unlocks more: a short snippet, then half, then the whole sentence, then written clues (the sentence in its own script, the language family, where it's spoken).

- **The main risk is that it's all-or-nothing:** you either recognize a language or you don't, and more audio doesn't help with one you've never heard. The fix is Worldle-style misses: each wrong guess shows the distance and direction from its homeland to the answer's, and whether it's in the same branch or family. Emoji: 🟩 right, 🟨 same branch, 🟧 same family, 🟥 different family, ⬛ skip.
- **Difficulty by weekday:** Mon/Tue easy (Spanish, Japanese…), Wed/Thu medium (Dutch, Thai…), Fri–Sun hard (Basque, Georgian…). Each tier cycles through its languages before repeating.
- **Near-identical languages count as correct:** Hindi/Urdu, Indonesian/Malay, Czech/Slovak, Serbian/Croatian/Bosnian, Zulu/Xhosa, Dutch/Afrikaans, Portuguese/Galician.
- **Data:** 41 puzzle languages, each with two sentences ("My grandmother bakes bread every Sunday morning…" and "Yesterday it rained all day…"), and about 95 guessable languages. Sentences were written by Claude and not checked by native speakers; the less common ones (Georgian, Amharic, Tamil, Bengali, Zulu, Irish, Basque) most need checking.
- **Audio: pre-generated Azure text-to-speech clips** (see README), so every browser plays the same MP3s. Clips are played through the Web Audio API so each stage stops at an exact length (snippet = 1.5 s, half = 55%, then the whole clip). Only sentences with a clip go into the daily rotation. Until clips are generated, the game falls back to the browser's own speech voices, which differ by device (Edge has the most, some browsers only have English). Later option: real recordings from Mozilla Common Voice (public domain), which would also give more sentences per language.

## Game backlog

The first four rows are built (see above), and so is Polyglot. Eric picks which to build next. Existing-game notes are unverified unless marked.

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
- [x] Pick 3–4 games from the backlog to prototype (Tilt, Slingshot, Sonar, Half)
- [x] Build each as `games/<name>/index.html` and add its card to the hub
- [ ] Send the hosted link to playtesters
- [ ] Collect feedback: was it fun, was it confusing, would you come back tomorrow
