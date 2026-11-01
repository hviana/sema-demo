# Sema demo

A self-contained, cross-platform chat application for
[`@hviana/sema`](https://www.npmjs.com/package/@hviana/sema) — a non-parametric,
instance-based reasoning system that answers by walking a graph of stored notes
rather than by sampling from trained weights.

The whole app is one binary: server, UI, and bootstrap. `npm:@hviana/sema` is
the only dependency.

## Run

```bash
deno task start      # http://127.0.0.1:8000
deno task dev        # same, with --watch
deno task update     # re-resolve @hviana/sema to the newest published release
```

On start it **opens your browser at that address** and prints where to go anyway
— all progress is shown in the browser, live:

```
  ┌──────────────────────────────────────────────────────────┐
  │  SEMA · a mind without weights                           │
  └──────────────────────────────────────────────────────────┘

  Open this in your browser:

      http://127.0.0.1:8000/

  Data directory  /path/to/data
  Stop the server Ctrl+C

  Trained memory  downloading — follow the progress at http://127.0.0.1:8000/
```

Opening the browser is strictly best-effort, via `xdg-open` / `open` / `start`.
If it fails for any reason — no launcher installed, a headless server, no
permission to spawn a process — the failure is swallowed and the banner above is
the fallback, exactly as before. Set `SEMA_NO_OPEN=1` to turn it off; the `dev`
task already does, so `--watch` restarts do not pile up browser tabs.

This matters most on Linux, where double-clicking a binary attaches no terminal
at all: the banner is invisible there, so without this the app looks like it did
nothing. Windows allocates a console for the compiled `.exe` and macOS opens the
binary in Terminal, so on those two the banner is visible either way.

The dependency is **pinned** (`npm:@hviana/sema@1.0.8`) and the lockfile is
disabled: which engine this app runs is written down where it can be read. Every
`compile:*` task re-resolves it too, so a binary you ship is never built against
a stale cached copy.

### What moved between 1.0.3 and 1.0.8

The parts this app reads are the conversation API, the `Store` probes, the
corpus search, and the rationale — and only the last of those moved. The step
shapes (`RationaleStep`, `RationaleItem`) and every structured payload
(`decideGrounding`'s candidates, `narrowDecision`'s margin) are unchanged, as is
the wording of every note the panel parses. Four things did change:

| In the engine                                                                                                                  | Here                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `regimePrediction` became `regime`, and stopped being a prediction: it is read off the response, once, when it is over         | Renamed, and its sentence no longer claims the engine knew in advance; the payload is v2 (`regime`, `incumbentGrade`)  |
| The arithmetic unit is a mechanism like any other now, and traces nothing — `computeExtensions` and `evalComputation` are gone | A computed answer is recognised by its **provenance** (`alu`) instead of by a step, and keeps its own hop and headline |
| `Provenance` is an open string — each mechanism names its own, and the decider's composition is `compose`                      | `compose` joined the routes said in ordinary words; an unknown route still prints its own name rather than breaking    |
| Recognition can refuse a span on its role, and recall and reference can refuse an answer as unasked                            | `roleRefused`, `unaskedAnchor` and `unaskedPrecedent` are named, along with every other step name the engine can emit  |

`MindOptions.mechanisms` also changed shape (one list of factories, with
`defaultMechanisms` exported), which this app does not pass — it takes the
engine as it comes.

**1.0.7** did not touch the rationale at all: the 74 step names, every payload
and every note template are identical to 1.0.6's, and the near-dedup rewrite
behind it (a `whole_kid` range read in place of a parent climb) is training work
this app never does. What it did move is the **store**: the fallback that opened
a pre-layer store as one file is gone, so such a store now opens as a base with
no derived layer beside it. See [How it is validated](#how-it-is-validated).

**1.0.8** is a reasoning change on the engine's side, and nothing in this app
moves with it. Where a relation is read off several instances that spell it in
different ways, the engine now goes by the answer each one gives, and lets the
others contest that reading. The 74 step names, every payload and every note the
panel parses are the same as in 1.0.7. One note, `relationFrames`, can now carry
a longer ending; the panel shows it only as Sema's own words, and never parses
it. The store format did not change either, so a 1.0.7 memory opens as it is,
with its derived layer current, and nothing is rebuilt.

## Build binaries

```bash
deno task compile            # quick local build → dist/sema-demo
deno task compile:all        # the release set: wipes dist/, then builds all five

deno task compile:linux-x64      # → dist/sema-demo-linux-x64
deno task compile:linux-arm64    # → dist/sema-demo-linux-arm64
deno task compile:macos-x64      # → dist/sema-demo-macos-x64
deno task compile:macos-arm64    # → dist/sema-demo-macos-arm64
deno task compile:windows-x64    # → dist/sema-demo-windows-x64.exe
```

`compile` is the unlabelled convenience build for the machine you are on — the
same bytes as that machine's labelled target, just named `dist/sema-demo`. It is
**not** part of `compile:all`, which clears `dist/` first so a release directory
holds exactly the five named binaries and never a stale sixth left over from an
earlier `compile`.

## The trained memory

Sema keeps its knowledge _as knowledge_ — a content-addressed graph on disk, not
weights. This demo uses the pre-trained store published at
[`hviana/sema-trained-v1`](https://huggingface.co/buckets/hviana/sema-trained-v1)
(~3 GB): a `.sqlite` file holding the content-addressed DAG, plus `.content.vec`
(node gists) and `.halo.vec` (the distributional halo index). From Sema 1.0.6 a
store is **layered**: everything re-derivable from the nodes, edges, wholes and
halos lives in a second file, `.derived.sqlite`, beside the base. `SQliteStore`
derives them all from one **stem** path, so they sit together and keep their
published names.

A memory trained before that split publishes only the base, and from 1.0.7 the
engine no longer reads a derived table out of it: it opens the base, finds no
layer beside it, and says so through `derivedLag()` — null when the layer is
current, otherwise the first node it has never seen. Reads from a layer that is
behind _degrade, never mislead_: the answers stay honest and quietly get worse,
which is the one failure a demo built to show its reasoning must not serve in
silence. So the app asks before the first question, and when the layer is
missing it runs the engine's own remedy, `Mind.repairDerived()`, during the
opening phase and says that is what it is doing. It is minutes on a large memory
and it happens once — the rebuild stamps the layer current.

### How it is validated

Nothing about the data is hardcoded — not the file names, not their sizes, not
how many there are. The bucket's own listing is the source of truth on every
start, and the stem is discovered from whichever `.sqlite` file it publishes —
the **base** one: a layered store publishes two names ending in `.sqlite`, and
taking `sema.derived.sqlite` for the stem would send the store looking for a
`sema.derived.content.vec` that nobody published.

What was downloaded is recorded in `manifest.json` beside the data (name, size,
content hash, and whether the transfer finished). Comparing that manifest to the
live listing tells the four cases apart:

| On disk                                    | Result                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Manifest matches the listing, size agrees  | used as-is, no download                                                |
| Transfer never finished                    | **resumed** via HTTP range request                                     |
| Bucket republished the file (hash changed) | re-fetched **from zero** — resuming would splice two versions together |
| Files with no manifest                     | trusted only if the size matches exactly, else re-fetched              |
| Rebuilt by the engine while opening        | held to the published **hash** only — its size is its own now          |

That last row is what keeps the rebuild above from looping. Rebuilding the
derived layer rewrites everything beside the base — `.derived.sqlite`,
`.content.vec`, `.halo.vec` are worked out from the notes rather than being
notes — so their bytes stop being the bytes the bucket published. The size test
exists to catch a half-written download, and left alone it would read a
legitimately rebuilt index as a truncated one: fetch it again, rebuild it again,
find it wrong again on the next start, for ever. The manifest marks those three
files **by name**, never by measuring — SQLite keeps a freshly written index in
its write-ahead log until the database closes, so the sizes are not final at the
moment this runs — and it marks them **before** the rebuild starts: a rebuild
cut short (minutes, on a large memory) leaves the indexes already rewritten, and
marked first they are rebuilt again on the next start instead of being read as a
truncated download and "resumed" with bytes fetched on top. Killed halfway and
restarted, it does exactly that.

A session on a memory that is already current writes nothing: opened,
questioned, browsed, searched and closed, all four files come back byte for byte
as they were.

If the bucket is unreachable, a fully-validated local copy still starts offline;
an incomplete one fails loudly rather than opening a truncated store.

The server binds its port _before_ downloading, so the browser is the place you
watch the transfer rather than a dead port. The download screen shows the
percentage, bytes, a live throughput graph, speed and ETA, plus a row per file
with its own state — queued, in flight, or done — and, when a file is being
fetched again, _why_ (republished upstream, unverified, or resuming). If it
fails, the error card keeps the progress on screen and offers **Try again**,
which resumes rather than restarting.

Data lives next to the executable for a compiled binary, and in `./data` when
running from source.

### Environment

| Variable             | Effect                                              |
| -------------------- | --------------------------------------------------- |
| `PORT` / `HOST`      | listen address (default `127.0.0.1:8000`)           |
| `SEMA_DATA_DIR`      | where the trained memory lives                      |
| `SEMA_SKIP_DOWNLOAD` | trust whatever is on disk; never contact the bucket |
| `SEMA_NO_OPEN`       | do not open a browser on start                      |

`SEMA_SKIP_DOWNLOAD` is for developing against a small store you trained
yourself — point `SEMA_DATA_DIR` at it and the bootstrap is bypassed entirely.

## What the UI does

- **The scale is in `rem`, so the interface belongs to the reader.** Type,
  space, radii and the 44px touch minimum are all expressed against the root
  font size — at the default 16px every value is exactly the pixel number it
  replaces, and a reader who has raised their default gets a larger _interface_
  rather than larger text in boxes built for smaller text. The reading measure
  scales with it, so a bigger font still buys the same number of words per line.
  Verified by rendering at a 20px root and by a pixel-identical diff at 16.

- **One column — the same one — at every width.** The reading measure is a
  token, `--measure`, and every band of the app is `min(var(--measure), 100%)`:
  header, prose, boot card, conversation, explorer, composer, footer. The page
  therefore has one left edge and one right edge, and a region cannot quietly
  grow its own. Past 1040px the token itself steps up one notch and the example
  cards use that width two-up — the column widens, nothing breaks out of it, and
  prose keeps its own cap in `ch` so the sentences do not widen with it. Because
  the conversation scrolls and the header and composer do not, a classic
  scrollbar takes its width out of exactly one of the three, and the column
  centred inside it lands half a scrollbar left of the other two. The scroller
  reserves that gutter unconditionally (`scrollbar-gutter: stable`) and the two
  bands that do not scroll reserve the same width on the same side, from a
  `--sbw` measured once at startup — so all three centre inside the same box at
  every width, and on a phone, where scrollbars overlay, `--sbw` is `0px` and
  none of it reserves anything. Reserving on _both_ edges was the first attempt
  and was worse: above the measure the three agreed, below it the conversation
  lost 15px on each side while the header went on hugging the viewport. Below
  1040 there are two width thresholds (560 for "wide enough for a label gutter",
  768 for "room for a step more air") and one height threshold, because **a
  phone in landscape is 740×360 — wider than any phone breakpoint and shorter
  than any of them account for.** The explanation sheet, the act gutters, the
  boot card and the composer all key off the short dimension too. Where a layout
  can respond without a breakpoint at all it does: the search field states the
  width its placeholder needs and the button steps down to its own line exactly
  when that width stops being available — keeping the trailing edge it has at
  every other width, rather than jumping to the opposite side of the field.

- **The explanation panel is prose too.** Its sentences carry their own `ch`
  cap, like the hero's. Without it they ran the full width of the widened column
  — 137 characters a line at 1440px against the hero's 62 — which is the surest
  way to lose the reader the panel exists for.

- **The turn is the unit of rhythm.** One `gap` on the conversation, declared
  once, and an answer closes half of it to sit with the question above it: 8px
  inside a turn, 16px between turns, 32px and a hairline where the retired
  welcome ends and the conversation begins. The gaps used to be margins on the
  messages, which in a flex column add instead of collapsing — "half inside, the
  full gap between" shipped as 24 and 32, three-quarters rather than half. A
  container's gap cannot drift like that.

- **The keyboard is not the viewport.** `interactive-widget=resizes-content` is
  Android-only and `100dvh` tracks retracting browser chrome, not the on-screen
  keyboard — so on iOS the composer went under it, with nothing able to scroll
  it back: the page does not scroll, and the composer is a _sibling_ of the
  scroller rather than inside it. A `visualViewport` listener writes the real
  height into `--vvh`, and the field caps itself at a share of that height so
  what you are typing can never be pushed off the bottom edge.

- **Multi-turn chat.** Each browser session gets its own `Conversation`, so
  follow-up turns are answered in context. Because Sema is given the _whole_
  thread, an earlier turn can still shape a later answer — ask `137*24`, then
  ask something it holds nothing about, and the arithmetic path answers over the
  accumulated context instead of staying silent. From the second turn on, the
  composer says so plainly ("Sema is also reading the 2 earlier turns in this
  thread, so answers can drift"). Starting over is the header's job and is
  labelled there, once — the bar used to carry a second, differently-named
  button for the same action. What is genuinely out of reach once a conversation
  has started is the training data, scrolled above every turn, so that is what
  the bar offers instead.
- **Any script, either direction.** This store is heavily multilingual, so every
  element holding stored or typed text carries `dir="auto"` — Arabic, Sindhi and
  N'Ko lay out right-to-left while their Latin siblings do not. Counts are
  grouped with `toLocaleString("en-US")` rather than the browser's locale, so
  325,615 never renders as "325.615" inside an English sentence.
- **Explore the training data.** Search the store for the experience pairs it
  actually holds — see [below](#exploring-the-training-data). Clicking a result
  asks Sema that very context, so the examples on offer are always real ones
  drawn from this store rather than hardcoded guesses.
- **"Why this answer?"** — the structure, drawn. Sema reports a _rationale_ of
  every mechanism it ran (238 steps is ordinary), and that rationale is a
  **graph**: each step carries the mechanism it ran _inside_ (`parent`) and the
  earlier steps whose output it consumed (`dependsOn`). Bucketing all of it
  under five headings — which is what this panel used to do — is short and says
  nothing, because a bucket is a category, not a step: the reader never sees
  what led to what. The structure _is_ the explanation, so the panel draws it.

  The test the panel is held to: **delete every sentence from it and the picture
  must still read.** A relation that is only asserted in prose is a relation the
  design failed to show.

  **1 · Where the answer came from.** The flow leads, because it is what was
  asked. One box per real place in the graph, read back verbatim, joined by
  drawn arrows. The first box is your own text with every piece the store
  recognised painted onto it _in place_, at the real byte offsets the engine
  reported, in three states: the stretch that **carried the answer**, wording it
  merely **holds**, and wording it holds whose continuation **answers a
  different question**. Reading and walking are one place, so they are drawn as
  one box; printing the question twice, two hundred pixels apart, told the
  reader they were two.

  **Each mechanism gets its own silhouette**, because they are not the same
  thing happening:

  | the engine did                 | the picture does                                                                                                                                          |
  | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | followed a learnt connection   | box → arrow → box, the arrow carrying the move and its cost                                                                                               |
  | derived through a second fact  | the same, one box per hop                                                                                                                                 |
  | completed a phrase it had seen | both strings on one left edge, the shared opening **solid** and the rest of the note **faded** — you see your text _being_ the start of that note         |
  | answered from agreement        | one drawn line per stored note, each starting at its own row and all meeting the single point the next arrow leaves from                                  |
  | voted by precedent             | the same funnel, over the stored notes most like your question that carry the answer — titled "_9 of 11_" when some carried another one and lost the vote |
  | lent one note's answer         | a single stored note, the one most like yours, and the answer it carries — a resemblance, which the engine files as a suggestion and the panel says so    |
  | worked out a sum               | an `=` and a value, no arrow and no box — a shape that cannot be mistaken for a walk between two notes, because it is not one                             |
  | said nothing                   | no chain at all, and the near misses shown against your own words with the stretch they share **solid**                                                   |

  Blur the text out and those eight are still distinguishable. That is the
  point.

  The precedent shapes are drawn from the notes the engine itself names as the
  voters (`bindPrecedent`), and only when that step could have produced this
  answer on this route: two votes or more say `reference`, one says `recall`,
  and a precedent that ran on a losing route stays in the trace and out of the
  chain. Under a suggestion, the count of _other ways of asking that reach this
  answer_ changes what it claims: on a derived answer it shows the answer does
  not rest on one note; on a suggestion none of those notes took part, so it
  says only that the answer exists in memory, without the reassuring tick.

  **2 · What it weighed.** One line: how many ways of answering it had, which
  one it took, and what that cost. The engine's full cost ladder — read from its
  own `decideGrounding` payload rather than scraped out of prose — is one click
  below, because it is the most technical content in the panel and it measured
  38–49% of the panel's height when it was an act of its own. Two different
  numbers live on that ladder and get two different marks: a route that actually
  ran has a **cost**, drawn as a filled bar; a route that did not has a
  **floor** — the cheapest it could ever have come out at — drawn as a tick on
  an empty track. Plotting both as filled bars is how a panel ends up showing
  the winning route with the longest bar directly under a heading saying the
  cheapest wins. A cost, never a confidence — and when only one route reached an
  answer at all, the panel says no contest was recorded, because an uncontested
  win is not a wide one. A **close call** is flagged only when the runner-up
  answered something _else_: one that reached the same answer by another route,
  at almost the same cost, corroborates the answer rather than threatening it.

  **Below that, on demand:** what it recognised in your text (the counts, and a
  chip per piece that lights that exact range when you point at it — tap, on a
  phone, because a relation that only exists on hover does not exist where most
  people read); the approaches it ruled out; and **the complete trace** — every
  step, indented by the mechanism it ran inside, in the engine's own order, with
  a dot for the kind of work and `←12` for the step whose output it consumed.
  Nothing is grouped away; a run of identical steps in the same place is shown
  once with its count, and the panel says when it is.

  Every step gets a plain sentence saying what it contributed, whether it
  succeeded or gave up. A route that found a candidate and **refused** it — the
  closest note being another case of the same kind, a precedent nothing
  licenses, an answer to a question you did not ask — is never told as "produced
  nothing": its sentence is the reason the engine noted, which on a silent turn
  is the whole explanation. Sema's exact note and the spans each step consumed
  are the auditable record and are always in the page, but they sit behind one
  **"Show Sema's own notes"** switch — printed inline they put a cost float on
  every row, and the sentence above already says what happened. Turn it on and
  `pool independent regions' evidence for a shared anchor (sum, not shortest
  path) (cost 0.0388)`
  appears one line under its plain reading, _"Separate parts of your question
  pointed at the same note, so it added their evidence together rather than
  trusting any one of them"_.

  A sentence never merely restates its own label — where the label names the
  action, the sentence says why that action mattered. Where the note carries
  real numbers they are carried through: _"6 of the 12 parts of your question
  pointed at the same stored note"_, _"111 different continuations could have
  followed here"_.

  No label in the panel borrows Sema's vocabulary — no _grounding_, _resonance_,
  _schema_, _extraction_, _derivation_. `castSchema` reads "Applying a pattern
  it learnt", `liftAnswer` reads "Separating the answer from how you asked",
  `roleRefused` reads "Rejecting a familiar word in an unfamiliar place".
  Nothing has to be learnt to follow the story, and the exact terms stay one
  line below it. **Every** step name the engine can emit has one: the table is
  checked against the names in the installed engine rather than against the ones
  that happened to come up, so a step nobody has seen yet still arrives in
  words. All ninety of them: the 74 the engine writes as literals, the two names
  composition enters under (`cover` with nothing in hand, `compose` with pieces
  already), the two a response is entered under, the refusal the graph search
  reports by hand, and the thirteen **moves** — `axiom`, `follow-edge`,
  `concept-hop`, `voice`, `splice-connector`, `split`, `fuse`, `recompose`,
  `derive-through`, `bridge`, `pool-vote`, `ground`, `step` — which a chain's
  own steps are named after, and which no list of literals contains.

  The reading of the rationale lives in its own file, `src/explain.ts`, apart
  from the inference in `src/mind.ts`: what the engine did and what we say about
  it are two different jobs, and keeping them apart is what stops the
  explanation from quietly becoming a second opinion about the answer.

### Failure and recovery

A failed turn is never a dead end. The chat parses the response as text before
JSON, so a plain 404 reads as _"That part of the server is missing (404)"_
rather than _"Unexpected token 'N'"_; an unreachable server says so and points
at the terminal. The explorer speaks the same language for the same status — a
bare `HTTP 503` reached the reader there until it was pointed at the same
translation the chat uses. Every failed turn carries **Try again**, which
removes the dead turn and re-asks the same question — and puts back whatever you
had typed into the composer in the meantime, since the composer is focused after
every failure.

A turn that failed does not end by saying the memory is ready. Every turn used
to finish by writing `ready` into the header, including the one whose whole
error message was _"The trained memory is not open yet"_; now a failure asks the
server what its state is instead of asserting one.

**Send is lit only when there is something to send.** The field is empty when
the app opens, with the caret already in it, and a full-accent button that
answers a click with nothing is a lie about what the app is waiting for.

Motion respects `prefers-reduced-motion`: the panel entrance and the staged
arrival of the acts is dropped entirely, along with the progress-bar sheen,
while the spinners and typing dots stay — they are the only signal that work is
in flight.

### Accessibility

Colours are not chosen by eye. Every text node in the running page — welcome,
download card, chat, and a fully expanded explanation — is sampled against its
composited background and checked at WCAG AA (4.5:1, or 3:1 for large text), in
both themes. The sweep comes back clean; getting there moved `--ink-faint` in
both themes, split `--accent-ink` / `--ok-ink` for text sitting on a tinted
panel, and added `--on-accent`, because white on the dark theme's tan accent
measured **2.34:1** on the primary Search and Send buttons. A state change is
checked too: the explorer card's hover tint is darker than the card, so the
labels on it step up a level rather than drop to 4.17:1.

The palette has **three ink levels and room for two.** `--ink-soft` and
`--ink-faint` were 2% apart — no perceptible step, which silently defeated every
rule whose whole job is to recede. Holding 4.5:1 on both `--surface` and
`--surface-2`, the furthest a third level can travel is about 1.15×, so it
travels that far and no further: colour is not what separates these, and size,
weight and uppercase are.

Tints that carry text are opaque. A `color-mix(…, transparent)` chip composites
against whatever happens to be behind it, so its real contrast depends on
context rather than on the palette.

What announces itself is what changed: each reply is its own live region, along
with the download card and the explorer's result line. The log as a whole is not
one — it holds the entire welcome screen, which would have been read out on
arrival and again after every reset. Every control takes a visible 2px focus
ring under keyboard focus — verified by dispatching real Tab presses and reading
the ring off `document.activeElement`, since a programmatic `.focus()` never
triggers `:focus-visible`. A skip link, first in the tab order, jumps past the
explorer and one disclosure per answered turn straight to the question box.

On a phone the explanation is a sheet over a scrim, so it says so: `role`
`dialog`, `aria-modal`, and everything behind it — the conversation, the header,
the composer — marked `inert` while it is open, released when it closes. A scrim
that is modal only to the eye lets Tab walk out of the sheet into controls
nobody can see. The boot card is no longer one live region either: what is
announced is the phase, not the figure, the meter, the counters and the file
list being rewritten several times a second for the length of a multi-gigabyte
download.

**A finger is not a mouse, and that is a fact about the pointer, not about how
wide the window is.** The 44px minimum is relaxed by `@media (pointer: fine)`
rather than by a width, so it still holds on a tablet and on a phone in
landscape — and it is relaxed on the **token**, not as an exception on one
control, so every control relaxes together and the rule is true rather than
merely stated. Affordances that would otherwise exist only on hover are restored
under `@media (hover: none)`. For the same reason **Enter sends only where there
is a key to hold with it** — a soft keyboard has no Shift+Enter, so on touch
Enter opens a new line, the send button sends, and the line explaining the
keyboard is hidden by the same pointer query that governs the behaviour, not by
a width that disagrees with it.

**Nothing you have typed is ever discarded.** Tapping a note in the explorer
asks Sema about it — unless the composer already holds a draft, in which case it
loads the question and waits, because on a phone the whole row is what you drag
past while scrolling. The explorer survives the first question too: the pitch
above it retires, the instrument does not.

## Exploring the training data

A trained "experience pair" is literally one continuation edge in the DAG: the
`src` node is the context that was deposited, the `dst` node is what Sema learnt
follows it. `GET /api/explore?q=…&limit=…` reads them back.

It builds **no index of its own**, and it keeps no search of its own either: the
search is the engine's — `searchCorpus`, and `searchCorpusText` for the text
case — and it makes the same move `recognise()` makes, over the store's own
structure and the indexes already in it. It perceives the query into a
content-defined tree, content-addresses those chunks against the store's
content-address index, and climbs to the edge-bearing contexts above them.
Contexts are weighted by how much query content reached them, so a whole clause
outranks a stray character.

Cost is set by how much of the _query_ resolves, never by the size of the store.
Every stage is bounded:

| Bound            | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Results          | `limit`, hard-capped at 24                                    |
| Preview per side | 220 bytes via `bytesPrefix`, so one huge node cannot dominate |

The search's own limits are the engine's, and live with it.

**What this is and is not.** It is exact content addressing, not fuzzy keyword
search. A query returns pairs when it shares genuinely chunk-aligned content
with a stored note; an arbitrary mid-word fragment resolves to nothing, and the
honest answer there is "nothing matched". That is why the field also
**browses**: a browse reads real pairs out of the store, striding the id space
from a caller's own offset, and that is what the welcome screen shows on load.

Searches run through the same serialisation queue as chat, because the perceive
and the climb must not interleave with an inference in flight. The store is only
ever read — the explorer never writes or trains.

Measured on the published store (15.7M nodes, 325,615 learnt contexts, 2.5 GB
SQLite): searches return in **1–5 ms**, browsing in ~4 ms, at ~140 MB RSS.

## A note on scope

Sema here is trained on a **limited, finite set of notes** — it has no broad,
open-world knowledge. When nothing it holds bears on your question it returns
nothing, and the UI says so plainly. That is the design: it never fills a gap by
guessing.

Two caveats worth knowing:

- Answers marked with the `recall-echo` provenance are the nearest stored
  wording returned verbatim, not a derived fact. The explanation panel flags it.
- Sema carries the entire thread as conversation context. On a sparsely trained
  store, long threads can bleed earlier answers into later ones; "Start a new
  conversation" resets the context.

## Licence

`@hviana/sema` is released under the PolyForm Noncommercial License 1.0.0.
Commercial use requires a separate paid licence — see the package's
`COMMERCIAL-LICENSE.md`.
