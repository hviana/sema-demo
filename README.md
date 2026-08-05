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

On start it prints where to go and gets out of the way — all progress is shown
in the browser, live:

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

The dependency is deliberately **unpinned** (`npm:@hviana/sema`, no version) and
the lockfile is disabled, so a fresh resolution always takes the latest release.
Every `compile:*` task re-resolves it too, so a binary you ship is never built
against a stale cached copy.

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
(node gists) and `.halo.vec` (the distributional halo index). `SQliteStore`
derives all three from one **stem** path, so they sit together and keep their
published names.

### How it is validated

Nothing about the data is hardcoded — not the file names, not their sizes, not
how many there are. The bucket's own listing is the source of truth on every
start, and the stem is discovered from whichever `.sqlite` file it publishes.

What was downloaded is recorded in `manifest.json` beside the data (name, size,
content hash, and whether the transfer finished). Comparing that manifest to the
live listing tells the four cases apart:

| On disk                                    | Result                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Manifest matches the listing, size agrees  | used as-is, no download                                                |
| Transfer never finished                    | **resumed** via HTTP range request                                     |
| Bucket republished the file (hash changed) | re-fetched **from zero** — resuming would splice two versions together |
| Files with no manifest                     | trusted only if the size matches exactly, else re-fetched              |

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

`SEMA_SKIP_DOWNLOAD` is for developing against a small store you trained
yourself — point `SEMA_DATA_DIR` at it and the bootstrap is bypassed entirely.

## What the UI does

- **Multi-turn chat.** Each browser session gets its own `Conversation`, so
  follow-up turns are answered in context. Because Sema is given the _whole_
  thread, an earlier turn can still shape a later answer — ask `137*24`, then
  ask something it holds nothing about, and the arithmetic path answers over the
  accumulated context instead of staying silent. From the second turn on, the
  composer says so plainly ("Sema is also reading the 2 earlier turns in this
  thread, so answers can drift") and offers **Start fresh** beside it; the
  header carries the same reset, labelled.
- **Any script, either direction.** This store is heavily multilingual, so every
  element holding stored or typed text carries `dir="auto"` — Arabic, Sindhi and
  N'Ko lay out right-to-left while their Latin siblings do not. Counts are
  grouped with `toLocaleString("en-US")` rather than the browser's locale, so
  325,615 never renders as "325.615" inside an English sentence.
- **Explore the training data.** Search the store for the experience pairs it
  actually holds — see [below](#exploring-the-training-data). Clicking a result
  asks Sema that very context, so the examples on offer are always real ones
  drawn from this store rather than hardcoded guesses.
- **"Why this answer?"** — evidence first. Sema reports a _rationale_ of every
  mechanism it ran (238 steps is ordinary), which is far too much to read. The
  panel leads instead with the thing the answer actually rests on:

  > **You asked** → _recognised as something it had been taught_ → **the note it
  > had been taught** (`Given` / `It learnt`) → **the answer**

  That middle card is the real stored pair, pulled out of the graph by the node
  ids the rationale tags its items with — not a paraphrase of the reasoning.
  Under it sits the corroboration: _"102 different stored notes lead to this
  same answer"_, counted with one indexed `prevCount`, with examples on demand.

  Everything else is progressive disclosure: the five stages (read the question
  → find what it knows about this → reason it through → weigh the options → say
  it back) and **roads not taken** — the approaches Sema tried and rejected —
  are collapsed below.

  Every step in there gets the same treatment, whether it succeeded or gave up:
  a plain sentence saying what that step contributed. Sema's exact note and the
  spans each step consumed are the auditable record and are always in the page,
  but they sit behind one **"Show Sema's own notes"** switch — printed inline
  they put a cost float on every row, and the sentence above already says what
  happened. Turn it on and
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
  `evalComputation` reads "Doing the arithmetic". Nothing has to be learnt to
  follow the story, and the exact terms stay one line below it.

  When there is no answer the panel reframes itself as **"Why Sema stayed
  silent"** and opens the rejections by default, because there they _are_ the
  explanation.

### Failure and recovery

A failed turn is never a dead end. The chat parses the response as text before
JSON, so a plain 404 reads as _"That part of the server is missing (404)"_
rather than _"Unexpected token 'N'"_; an unreachable server says so and points
at the terminal. Every failed turn carries **Try again**, which removes the dead
turn and re-asks the same question.

Motion respects `prefers-reduced-motion`: the panel entrance and the journey
build are dropped entirely, along with the progress-bar sheen, while the
spinners and typing dots stay — they are the only signal that work is in flight.

### Accessibility

Colours are not chosen by eye. Every text node in the running page — welcome,
download card, chat, and a fully expanded explanation — is sampled against its
composited background and checked at WCAG AA (4.5:1, or 3:1 for large text), in
both themes. The sweep now comes back clean; getting there moved `--ink-faint`
in both themes, split `--accent-ink` / `--ok-ink` for text sitting on a tinted
panel, and added `--on-accent`, because white on the dark theme's tan accent
measured **2.34:1** on the primary Search and Send buttons.

Tints that carry text are opaque. A `color-mix(…, transparent)` chip composites
against whatever happens to be behind it, so its real contrast depends on
context rather than on the palette.

Three live regions announce what changes on its own: the chat log, the download
card, and the explorer's result line. Every control takes a visible 2px focus
ring under keyboard focus — verified by dispatching real Tab presses and reading
the ring off `document.activeElement`, since a programmatic `.focus()` never
triggers `:focus-visible`.

## Exploring the training data

A trained "experience pair" is literally one continuation edge in the DAG: the
`src` node is the context that was deposited, the `dst` node is what Sema learnt
follows it. `GET /api/explore?q=…&limit=…` reads them back.

It builds **no index of its own**. It uses the store's own structure and the
indexes already in it, making the same move `recognise()` makes:

1. **Perceive** the query into a content-defined tree. Segmentation is
   deterministic — identical bytes always cut identically — so the chunks a
   query produces are the chunks training produced for the same text.
2. **Content-address** those chunks bottom-up: a leaf through `findLeaf`, a
   branch through `findBranch` over its resolved kid ids. Both are point probes
   on `idx_node_h`, the store's content-address index. A node that comes back is
   literally the node training interned.
3. **Climb** the structural `kid` table from each resolved node to the
   edge-bearing contexts above it (`edgeAncestors`), and read the continuation
   off the `edge` table (`nextFirst`). Contexts are weighted by how much query
   content reached them, so a whole clause outranks a stray character.

Cost is set by how much of the _query_ resolves, never by the size of the store.
Every stage is bounded:

| Bound            | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Results          | `limit`, hard-capped at 24                                    |
| Nodes climbed    | 24, largest match first; a match under 4 bytes never votes    |
| Contexts / climb | 6                                                             |
| Preview per side | 220 bytes via `bytesPrefix`, so one huge node cannot dominate |

**What this is and is not.** It is exact content addressing, not fuzzy keyword
search. A query returns pairs when it shares genuinely chunk-aligned content
with a stored note; an arbitrary mid-word fragment resolves to nothing, and the
honest answer there is "nothing matched". That is why the field also
**browses**: an empty query stride-samples real pairs out of the store, which is
what the welcome screen shows on load.

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
