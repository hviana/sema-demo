// explain.ts — one inference, turned into a VISIBLE STRUCTURE.
//
// WHY THIS FILE REPLACED A SUMMARY.  The explanation used to be five headings
// with the steps bucketed under them and repeats collapsed into "×24". That is
// short, and it says nothing: a bucket is a CATEGORY, not a step, so the reader
// never sees what led to what. Worse, the engine hands us a graph — every step
// carries `parent` (which mechanism it ran inside) and `dependsOn` (whose output
// it consumed) — and bucketing throws the whole graph away. The structure IS the
// explanation; deleting it leaves prose about an inference nobody can see.
//
// So nothing here groups. It reads the SAME rationale four times and each pass
// recovers one piece of concrete material the reader can look at:
//
//   1. WHAT IT READ      the asked text with every piece the store recognised
//                        marked IN PLACE, at its real byte offsets, so "it knew
//                        this much of your sentence" is a thing you can see.
//   2. THE CHAIN         the actual walk from your words to the answer, hop by
//                        hop, each hop a real edge between two stored nodes read
//                        back from the store verbatim — including the fan-in
//                        shape when the answer came from several notes agreeing.
//   3. WHAT IT WEIGHED   the engine's one cost ladder: the winning route's grade
//                        and every rival's floor, which is WHY the rivals never
//                        ran. A cost, never a probability.
//   4. THE TRACE         every step, in the engine's own nesting, nothing merged
//                        and nothing dropped.
//
// Nothing here decides anything — `mind.ts` owns the inference and this only
// witnesses it. And no reading ever REPLACES the engine's own note: the exact
// wording rides alongside every line, so a plain sentence never costs the reader
// the auditable one.

import type { Mind, RationaleItem, RationaleStep } from "@hviana/sema";
import { renderNode } from "./explore.ts";

const dec = new TextDecoder();
const encUtf8 = new TextEncoder();

// ── the vocabulary ─────────────────────────────────────────────────────────
//
// Every mechanism the engine can name, said the way a person would say it.
// These labels are the last place the reader meets Sema's own words, so none of
// them borrows one: no "grounding", no "resonance", no "schema", no "span".

/** Which part of the work a mechanism belongs to. Used ONLY to colour the trace
 *  so its shape is readable at a glance — it groups nothing. */
type Family = "read" | "recall" | "walk" | "weigh" | "speak";

interface Mech {
  label: string;
  family: Family;
}

const MECH: Record<string, Mech> = {
  // reading the question
  perceive: { label: "Cutting your question into pieces", family: "read" },
  recognise: { label: "Looking the pieces up in memory", family: "read" },
  unaskedFragments: {
    label: "Setting aside pieces that answer other questions",
    family: "read",
  },
  singleCluster: {
    label: "Reading the whole text as one topic",
    family: "read",
  },
  thinGrounding: { label: "Recognising very little of it", family: "read" },

  // finding what it holds
  resonate: { label: "Pulling the closest stored notes", family: "recall" },
  climbConsensus: { label: "Letting the pieces vote", family: "recall" },
  "pool-vote": { label: "Adding up evidence that agrees", family: "recall" },
  recallByResonance: { label: "Recalling the closest note", family: "recall" },
  alignStructures: {
    label: "Lining your sentence up against known ones",
    family: "recall",
  },
  relationFrames: {
    label: "Reading how known notes are shaped",
    family: "recall",
  },
  crossRegion: {
    label: "Joining two parts of your question",
    family: "recall",
  },
  fuseAttention: { label: "Joining parts learnt separately", family: "recall" },
  absorbForward: { label: "Carrying the chain one step on", family: "walk" },
  bindReferenceMiss: {
    label: "Needing two notes that agree, and finding fewer",
    family: "walk",
  },
  askedContinuationMiss: {
    label: "No continuation your question names",
    family: "walk",
  },

  // walking the graph
  "follow-edge": {
    label: "Following a connection it was taught",
    family: "walk",
  },
  "derive-through": {
    label: "Deriving through a fact it already held",
    family: "walk",
  },
  deriveThroughMiss: {
    label: "Looking for a second fact and finding none",
    family: "walk",
  },
  askedContinuation: {
    label: "Taking the continuation your question names",
    family: "walk",
  },
  bindReference: {
    label: "Making notes that agree carry the answer",
    family: "walk",
  },
  bindReferent: {
    label: "Several stored notes agreeing on one answer",
    family: "walk",
  },
  referenceLicence: {
    label: "Checking the agreeing notes really agree",
    family: "walk",
  },
  substitutionBridge: {
    label: "Swapping in something that means the same",
    family: "walk",
  },
  bridge: {
    label: "Covering the next stretch of the sentence",
    family: "walk",
  },
  cover: { label: "Putting the chosen steps in order", family: "walk" },
  ground: { label: "Reaching a stored answer", family: "walk" },
  reason: { label: "Going one step past what it recognised", family: "walk" },
  castSchema: { label: "Applying a pattern it learnt", family: "walk" },
  projectCounterfactual: {
    label: "Putting your details into the pattern",
    family: "walk",
  },
  counterfactual: {
    label: "Checking the pattern with a variation",
    family: "walk",
  },
  tryAnalog: { label: "Looking for something similar", family: "walk" },
  validateAnalogy: { label: "Checking the analogy holds", family: "walk" },
  trySkillAnchors: {
    label: "Looking for a worked example to copy",
    family: "walk",
  },
  extractBySkill: {
    label: "Copying how a worked example does it",
    family: "walk",
  },
  prefixCompletion: { label: "Finishing a familiar opening", family: "walk" },
  computeExtensions: {
    label: "Spotting something to work out",
    family: "walk",
  },
  evalComputation: { label: "Doing the arithmetic", family: "walk" },
  think: { label: "Putting it together", family: "walk" },

  // the walk's own endings
  enumerationExhausted: {
    label: "Looking for one more step, and finding none",
    family: "walk",
  },
  pivotCandidateRefused: {
    label: "Turning down a step that would repeat itself",
    family: "walk",
  },
  absorbCandidateRefused: {
    label: "A next step that led nowhere new",
    family: "walk",
  },
  walkClosed: {
    label: "Everything asked for was accounted for",
    family: "walk",
  },
  walkEndedWithoutOffer: {
    label: "Stopping with part of the question unexplained",
    family: "walk",
  },
  reachAlreadySpokenFor: {
    label: "Arriving somewhere already accounted for",
    family: "walk",
  },
  readBoundSaturated: {
    label: "Reading as many follow-ups as it is allowed to",
    family: "walk",
  },

  // weighing
  regimePrediction: {
    label: "Working out what kind of question this is",
    family: "weigh",
  },
  runAhead: {
    label: "Running the cheaper route first",
    family: "weigh",
  },
  skipMechanism: { label: "Ruled out before trying", family: "weigh" },
  disambiguate: { label: "Choosing between rival answers", family: "weigh" },
  decideGrounding: { label: "Choosing the cheapest route", family: "weigh" },
  narrowDecision: { label: "Checking how close the call was", family: "weigh" },
  echoGuard: {
    label: "Answering from memory: the question was itself an answer",
    family: "weigh",
  },

  // speaking
  liftAnswer: {
    label: "Separating the answer from how you asked",
    family: "speak",
  },
  postGrounding: {
    label: "Checking nothing was left unexplained",
    family: "speak",
  },
  completeGrounding: {
    label: "Declaring the answer complete",
    family: "speak",
  },
  articulate: { label: "Rewording it to match how you asked", family: "speak" },
  respond: { label: "Giving the answer back", family: "speak" },
  respondTurn: { label: "Giving the answer back", family: "speak" },
};

function mechOf(name: string): Mech {
  return MECH[name] ?? { label: name, family: "walk" };
}

/** "1 byte" / "3 bytes" — the panel never prints "byte(s)". */
function plural(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : many ?? one + "s"}`;
}

/** Read a number out of the engine's note. The notes come from a fixed template
 *  per mechanism, so this is stable — but every caller reads correctly when the
 *  number is missing. */
function num(note: string, re: RegExp): number | null {
  const m = re.exec(note);
  return m ? Number(m[1]) : null;
}

/** Plain readings of a step that DID something. The engine's note is written for
 *  whoever is debugging a cost ladder; this is the same fact for someone who has
 *  never heard of one. The note itself is kept alongside, never replaced. */
const DID: Record<string, (note: string, answered: boolean) => string> = {
  perceive: () => "It cut your question along its own boundaries.",
  recognise: (n) => {
    const forms = num(n, /into (\d+) learnt form/);
    const seen = num(n, /over (\d+) perceived leaves/);
    if (forms === null) return "It looked for wording it had seen before.";
    if (forms === 0) {
      return `None of the ${
        seen ?? "many"
      } pieces led anywhere it had been taught.`;
    }
    return `Of ${seen ?? "many"} pieces, ${
      forms === 1
        ? "one was wording it holds"
        : `${forms} were wording it holds`
    } and could follow.`;
  },
  unaskedFragments: () =>
    "These pieces are wording it knows, but what follows them is not what you asked about — they answer other questions.",
  resonate: (n) =>
    `It pulled the ${
      num(n, /→ (\d+) nearest/) ?? "closest"
    } stored notes that feel most like your question.`,
  climbConsensus: (n) => {
    const voted = num(n, /^(\d+) of \d+ sub-regions/);
    const of = num(n, /^\d+ of (\d+) sub-regions/);
    return voted !== null && of !== null
      ? `${voted} of the ${of} parts of your question pointed at the same stored note, so it took that as the topic.`
      : "The parts of your question agreed on what it was about.";
  },
  "pool-vote": () =>
    "Separate parts of your question pointed at the same note, so it added their evidence together rather than trusting any one of them.",
  crossRegion: () =>
    "It joined two parts of your question it knew about separately.",
  alignStructures: () =>
    "It lined your sentence up against ones it already knew, piece for piece.",
  recallByResonance: (n) =>
    n.includes("exact self-match")
      ? "Your wording matched a stored note exactly, so it went straight to what follows it."
      : "It recalled the closest stored note to your wording.",
  relationFrames: () =>
    "It read how the notes around this topic are built — what varies between them and what stays the same.",
  "follow-edge": () =>
    "This is the move that carries the answer: it had been given a note saying this text is followed by that text.",
  "derive-through": () =>
    "It took the subject the first note was about and looked that subject up again, so the answer comes from a second note rather than from the first alone.",
  deriveThroughMiss: () =>
    "It looked for a note filed under the subject it had just reached and found none, so it kept looking instead of stopping.",
  askedContinuation: (n) => {
    const c = num(n, /^(\d+) continuation/);
    return `Your own question said which way to go: ${
      c === null ? "several" : c
    } continuations were on offer and the question itself names the one it meant.`;
  },
  bindReference: () =>
    "It answered from agreement: several notes shaped the same way all carry the same answer.",
  bindReferent: (n) => {
    const i = num(n, /^(\d+) instance/);
    return `${
      i ?? "Several"
    } stored notes built the same way all lead to this one answer, so the answer rests on their agreement rather than on any single note.`;
  },
  referenceLicence: () =>
    "It checked that the agreeing notes really do agree before letting them answer.",
  enumerationExhausted: () =>
    "It looked for one more step from where it had got to, and there was none left.",
  pivotCandidateRefused: () =>
    "It found something it could follow next and turned it down: it would have repeated what it had, or handed the question back.",
  absorbCandidateRefused: () =>
    "The next step led nowhere new, so it looked for another way forward.",
  walkClosed: () =>
    "Everything you asked about had been accounted for, so there was nothing left to look for.",
  walkEndedWithoutOffer: () =>
    "It followed what it could and stopped with part of the text still unexplained — it had nothing further to try.",
  readBoundSaturated: () =>
    "It read as many follow-ups at once as it is allowed to, so there may be more it did not reach.",
  reachAlreadySpokenFor: () =>
    "It arrived at something already accounted for, so going over it again would have added nothing.",
  echoGuard: () =>
    "Your question was itself something it had learnt as an answer, so it answered straight from memory.",
  fuseAttention: () =>
    "Parts of the answer it had learnt separately were joined into a form it had learnt whole.",
  postGrounding: (n) => {
    const left = num(n, /remainder(?:Bytes)?[ =](\d+)/);
    return left
      ? `After answering it checked what was left over: ${left} bytes of your text still unexplained.`
      : "After answering it checked whether anything in your question had been left unexplained.";
  },
  completeGrounding: () =>
    "Nothing was left over: what you asked IS the thing it had a note about.",
  reason: () =>
    "It went one step further than the material it had already recognised — this is reasoning, not recall.",
  singleCluster: () =>
    "Every part of your text pointed at the same small region of what it knows, so it read them together.",
  thinGrounding: () =>
    "It recognised only a little of what you asked, so there was little for it to follow.",
  bridge: () =>
    "Part of your sentence was still unaccounted for, and this covered the next stretch of it.",
  substitutionBridge: () =>
    "It swapped in something it had been taught means the same thing.",
  cover: () =>
    "Nothing may be left unexplained, so this checks the chosen steps line up end to end across your whole question.",
  ground: () =>
    "The end of the chain landed on text it had actually been given. That text is what becomes the answer.",
  liftAnswer: () =>
    "How you asked and what the answer is are two different things; this keeps only the second.",
  castSchema: () => "It applied a pattern it had learnt from examples.",
  projectCounterfactual: () => "It put your details into a pattern it learnt.",
  counterfactual: () => "It tested a variation to check the pattern held.",
  extractBySkill: () =>
    "It pulled the answer out the way its worked examples do.",
  tryAnalog: (n) => {
    const s = /strength ([\d.]+)/.exec(n);
    return s && Number(s[1]) === 0
      ? "It tried this as an analogy and the two had nothing in common."
      : "It tried to answer by analogy with something it knows.";
  },
  validateAnalogy: () =>
    "It checked whether the analogy accounted for everything, and it did not.",
  bindReferenceMiss: () => "It needed two notes that agree and found fewer.",
  regimePrediction: (n) =>
    n.startsWith("retrieval")
      ? "It worked out this is a look-up, not a construction — so the expensive routes were never going to win and were not run."
      : "It worked out this needs building rather than looking up, so every route was put in play.",
  runAhead: () =>
    "Two routes were in play and the cheaper one ran first, so whatever it found puts a ceiling on what the dearer one could have won.",
  prefixCompletion: () =>
    "Your opening matched one it had seen, so it finished it the way it was taught.",
  computeExtensions: (n) => {
    const c = num(n, /evaluated (\d+) computation/);
    return c
      ? `It spotted ${
        c === 1 ? "a sum" : `${c} sums`
      } to work out rather than recall.`
      : "It spotted something to calculate.";
  },
  evalComputation: () =>
    "It worked the sum out exactly. This is arithmetic, not a remembered fact — it is right because it was computed.",
  think: () =>
    "It settled on an answer, worked forward from it, and combined what the different parts of your question turned up.",
  disambiguate: (n, answered) => {
    const opts = num(n, /^(\d+) continuation/);
    const many = opts === null ? "Several" : String(opts);
    return answered
      ? `${many} different continuations could have followed here. It kept the one the most stored notes support, rather than the first it found.`
      : `${many} different continuations could have followed here, but none held up under the checks that came after.`;
  },
  decideGrounding: () =>
    "Every route to an answer was scored on one and the same scale, and the one that took the fewest leaps won.",
  narrowDecision: (n) =>
    num(n, /margin (\d+)/) === 0
      ? "The winner beat its rival by nothing at all — one more trained note could flip this answer."
      : "The winning route beat its rivals by a clear margin.",
  articulate: (n, answered) =>
    !answered
      ? "There was no answer to reword."
      // Both of the engine's real notes here are negative — "no asker concept
      // to revoice", "no answer form is a synonym of an asker concept" — so on
      // most grounded answers the cheerful version was describing work that
      // explicitly did not happen.
      : /^no /i.test(n)
      ? "Nothing needed rewording: the answer was already in words you had used."
      : "The stored note was written in someone else's words. This matches it to yours.",
  respond: (_n, answered) =>
    answered
      ? "The finished answer, handed back to you."
      : "It had nothing it could stand behind, so it returned nothing.",
  respondTurn: (n, answered) => DID.respond(n, answered),
};

/** Plain readings of a mechanism that came up EMPTY, keyed by the mechanism
 *  rather than by the note's wording — the mechanism is stable and the wording
 *  is not. */
const EMPTY: Record<string, string> = {
  trySkillAnchors:
    "None of its worked examples had the right shape to copy from.",
  extractBySkill: "It could not lift an answer out the way its examples do.",
  bindReference:
    "Generalising takes at least two stored notes of the same shape that agree; it found fewer.",
  referenceLicence:
    "The notes that were supposed to agree pointed at different answers, so none of them was allowed to answer.",
  substitutionBridge:
    "It found nothing it could safely treat as meaning the same thing.",
  recallByResonance: "Nothing it holds came close enough to this wording.",
  prefixCompletion: "No note it was given begins this way.",
  tryAnalog: "No close enough analogy among the notes it holds.",
  validateAnalogy:
    "The analogy left parts of what it knows unaccounted for, so it was not trusted.",
  crossRegion:
    "It could not connect two parts of your question through anything it knows.",
  alignStructures: "The patterns it knows did not line up with this.",
  counterfactual: "No learnt pattern applied to this.",
  castSchema: "No learnt pattern applied to this.",
  projectCounterfactual: "There was no pattern to substitute into.",
  computeExtensions: "There was nothing here to calculate.",
  evalComputation: "There was nothing here to calculate.",
  climbConsensus: "The pieces of your question did not agree on a topic.",
  "pool-vote": "The evidence did not pool onto any one topic.",
  resonate: "Nothing in memory resonated with this.",
  recognise: "None of the wording was familiar.",
  relationFrames: "The notes around this topic are not built alike.",
  bridge: "It could not bridge the gap in the sentence.",
  "follow-edge": "There was no learnt connection to follow from here.",
  cover: "It could not assemble a chain that reached an answer.",
  ground: "No chain reached a stored answer.",
  liftAnswer: "There was no recognised region to lift out.",
  think:
    "Every route was tried and none reached an answer it could stand behind.",
};

/** `skipMechanism` names the route it declined in the note's first word, so both
 *  the label and the reading come from that word. */
const SKIPPED: Record<string, { what: string; plain: string }> = {
  cast: {
    what: "transferring a learnt pattern",
    plain: "A learnt pattern could not apply to a sentence shaped like this.",
  },
  confluence: {
    what: "joining separate parts",
    plain: "There were no two separately-known parts here to join.",
  },
  extraction: {
    what: "copying a worked example",
    plain: "It had no worked example of this shape to lift an answer out of.",
  },
  reference: {
    what: "making agreeing notes vote",
    plain: "There was nothing here whose reference needed working out.",
  },
  recall: {
    what: "recalling the closest note",
    plain: "There was nothing here to recall the closest note against.",
  },
  prefix: {
    what: "finishing a familiar opening",
    plain: "Nothing it holds opens the way this does.",
  },
  analogy: {
    what: "looking for something similar",
    plain: "An analogy could not apply to a sentence shaped like this.",
  },
  counterfactual: {
    what: "checking a variation",
    plain: "There was no pattern here to try a variation of.",
  },
  alu: {
    what: "doing the arithmetic",
    plain: "There was nothing here to calculate.",
  },
};

/** The engine's route names, said in ordinary words. One line each: what taking
 *  that route would MEAN, not what it is called. */
const ROUTE: Record<string, string> = {
  cover: "cover your sentence end to end with things it knows",
  recall: "hand back the closest thing it holds",
  "recall-echo": "hand back the closest thing it holds, word for word",
  prefix: "finish an opening it has seen before",
  cast: "transfer a pattern it learnt from examples",
  confluence: "join separate parts of your question",
  extraction: "copy how a worked example does it",
  reference: "let several notes that agree carry the answer",
  join: "derive through a fact it already held",
  analogy: "answer by analogy with something similar",
  alu: "work the arithmetic out",
};

function routeLabel(name: string): string {
  return ROUTE[name] ?? name;
}

// ── small helpers over rationale items ─────────────────────────────────────

/** Internal handles an item may carry — node labels like `cover@0`, the
 *  placeholder `‹none›`, bare span coordinates. They mean nothing to a reader. */
function isInternal(text: string): boolean {
  return /^[a-z][\w-]*@-?\d+$/i.test(text) ||
    /^[‹<].*[›>]$/.test(text) ||
    /^[[(][\d,\s]+[\])]$/.test(text) ||
    // A span cut at a byte boundary mid-character decodes to U+FFFD; a chip of
    // pure replacement characters reads as a rendering bug, not as evidence.
    /^�+$/.test(text) ||
    text.trim().length === 0;
}

/** Items carry a scoring annotation ("… (df-w 11.31)"); inside a chip the number
 *  is noise, and the prose above already explains the weighting. */
function clean(text: string): string {
  return (text ?? "")
    .replace(/\s*\((?:df-w|cost|vote|weight)\s+[\d.]+\)\s*$/i, "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstText(items: readonly RationaleItem[]): string {
  for (const it of items) {
    const t = clean(it.text ?? "");
    if (t && !isInternal(t)) return t;
  }
  return "";
}

/** Byte offset → character offset, clamped to a character boundary (a span may
 *  be cut mid-character, and half a character is not a word). */
function charIndex(bytes: Uint8Array, byteOffset: number): number {
  let b = Math.max(0, Math.min(bytes.length, byteOffset));
  while (b > 0 && b < bytes.length && (bytes[b] & 0xc0) === 0x80) b--;
  return dec.decode(bytes.subarray(0, b)).length;
}

/** Loose comparison, so punctuation or spacing does not hide a match that is
 *  plainly the same sentence to a reader. */
function norm(t: string): string {
  return (t ?? "").toLowerCase().replace(/\s+/g, " ")
    .replace(/[.,;:!?"'’]/g, "").trim();
}

function lastOf(
  steps: RationaleStep[],
  name: string,
  where?: (s: RationaleStep) => boolean,
): RationaleStep | undefined {
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i];
    if (s.mechanism.at(-1) === name && (!where || where(s))) return s;
  }
  return undefined;
}

/** A note that describes a mechanism declining to act. Sema is explicit about
 *  what it did NOT conclude, and that is worth showing — separately from the
 *  steps that built the answer. */
function abstained(
  mechanism: string,
  note: string,
  produced = true,
): boolean {
  if (mechanism === "skipMechanism") return true;
  // The notes are prose and the prose varies; producing NOTHING does not.
  // `prefixCompletion` reports a real refusal as "other trained forms open with
  // this query but continue below one grouping window", which matches none of
  // the patterns below — and the panel then congratulated it on finishing a
  // familiar opening it had explicitly declined to finish.
  if (!produced && ROUTE_OF[mechanism]) return true;
  const n = note.toLowerCase();
  return /^(no |none |nothing|skipped|below |0 |refused)/.test(n) ||
    n.includes("none passed") ||
    n.includes("no analog") ||
    n.includes("no candidate passed") ||
    n.includes("agreement needs") ||
    n.includes("strength 0.0000");
}

/** The closing mechanisms belong in the story even when their note reads like an
 *  abstention: "no asker concept to revoice — answer unchanged" means the
 *  wording needed no change, not that the step failed. */
const ALWAYS_RAN = new Set([
  "respond",
  "respondTurn",
  "articulate",
  "postGrounding",
  "completeGrounding",
  "regimePrediction",
]);

/** Which route each mechanism's silence belongs to. Read in two places — the
 *  cost ladder, and the "produced nothing" test above — so it is declared once,
 *  here, rather than copied into both. */
const ROUTE_OF: Record<string, string> = {
  recallByResonance: "recall",
  prefixCompletion: "prefix",
  castSchema: "cast",
  projectCounterfactual: "cast",
  extractBySkill: "extraction",
  bindReference: "reference",
  referenceLicence: "reference",
  crossRegion: "confluence",
  evalComputation: "alu",
  tryAnalog: "analogy",
};

// ── the asked text, as the engine read it ──────────────────────────────────

export interface Mark {
  /** Character offsets into `Reading.text`. */
  a: number;
  b: number;
  text: string;
  node: number | null;
  /** `carried` — this piece is the one the answer came through.
   *  `known`   — recognised, and in play.
   *  `aside`   — recognised, but what follows it is not what you asked. */
  kind: "carried" | "known" | "aside";
}

export interface Reading {
  /** Exactly the bytes the engine was handed, decoded. In a thread this is the
   *  whole conversation so far, which is WHY a long thread drifts. */
  text: string;
  /** The read text is more than this turn's message. */
  fromThread: boolean;
  /** The non-overlapping UNION of everything recognised — how much of the text
   *  has any footing at all, and where. It is a coverage measure, not a set of
   *  claims: a run that absorbed several readings belongs to none of them, so
   *  its `kind` means nothing and nothing is painted from it. What the reader
   *  sees comes from `pieces`. */
  marks: Mark[];
  /** EVERY form the store recognised, absorbed ones included, each with its own
   *  offsets — so the pieces the cover swallowed are still reachable: point at
   *  one and the text shows you where it sits. */
  pieces: Mark[];
  /** Pieces the query was cut into. */
  leaves: number | null;
  /** How many of them were wording the store already held. */
  forms: number;
  /** Characters covered by at least one mark. */
  covered: number;
  /** Bytes of your text the walk reported it could not account for. */
  leftoverBytes: number | null;
  /** The literal pieces left unaccounted — only when they provably account for
   *  every one of `leftoverBytes`. Null when the count is all that can be
   *  trusted. */
  leftover: string[] | null;
  /** The engine's own note for the top-level recognise. */
  note: string;
}

// ── the chain ──────────────────────────────────────────────────────────────

export interface Voter {
  text: string;
  node: number | null;
  score: number | null;
}

export interface ChainNode {
  id: string;
  kind: "asked" | "note" | "agreement" | "answer";
  /** The caption over the box. */
  title: string;
  /** The text at this point of the chain — verbatim, never paraphrased. */
  text: string;
  node: number | null;
  /** Everywhere in the read text this node is anchored, in characters. Ties
   *  the box to the highlighted words above it; a list because one piece of
   *  wording can be recognised at several offsets. */
  spans: Array<[number, number]>;
  /** For an agreement node: the stored notes that agreed. */
  voters: Voter[];
  voterTotal: number;
  /** Other stored notes that lead to this same place — a high count is the
   *  plainest possible statement of "this does not rest on one note". `capped`
   *  says the scan stopped, so the real number is at least this. */
  support: { total: number; capped: boolean; samples: string[] } | null;
  /** This stored note repeats what you asked word for word. */
  exact: boolean;
}

export interface ChainLink {
  move: string;
  /** The move, named the way a person would name it. */
  label: string;
  /** One sentence on why this hop is the one that carries the answer. */
  plain: string;
  cost: number | null;
  /** The engine's own note for the step that made this hop. */
  note: string;
}

export interface Chain {
  nodes: ChainNode[];
  /** `links[i]` joins `nodes[i]` to `nodes[i + 1]`. */
  links: ChainLink[];
  /** The walk was stopped at a hop limit, so the chain begins mid-derivation.
   *  Drawn as a fact rather than left to read as the whole story. */
  truncated: boolean;
}

// ── the weighing ───────────────────────────────────────────────────────────

/** `decideGrounding`'s structured payload — the cost ladder as the engine
 *  itself computed it, rather than as this file could guess it from prose. */
interface DecideData {
  candidates?: Array<{
    provenance: string;
    weight: number;
    grade: number;
    unexplainedBytes: number;
    moves: number;
    decided: boolean;
  }>;
  runnerUpMargin?: number;
}

export interface Route {
  name: string;
  label: string;
  /** The grade on the engine's one cost ladder. Lower is cheaper. */
  grade: number | null;
  /** The grade is what this route ACTUALLY cost, not the floor it would have
   *  cost at best. The two must never be drawn as the same kind of claim. */
  measured: boolean;
  state: "won" | "empty" | "ran" | "outgunned" | "blocked";
  why: string;
}

export interface Weighing {
  /** "retrieval" or "composition", when the engine said. */
  regime: string | null;
  regimePlain: string | null;
  /** The winning route's grade. */
  incumbent: number | null;
  routes: Route[];
  /** What a state MEANS, said once for the whole ladder rather than repeated
   *  on every row that shares it. Six rows each carrying the same sentence is
   *  not six facts; it is one fact and five lines of noise. */
  rules: string[];
  closeCall: string | null;
}

// ── the trace ──────────────────────────────────────────────────────────────

export interface TraceStep {
  i: number;
  parent: number;
  depth: number;
  name: string;
  label: string;
  family: Family;
  note: string;
  plain: string | null;
  /** Data-flow: the earlier steps whose outputs this one consumed. */
  from: number[];
  /** A compact in → out summary, when both are real text. */
  io: [string, string] | null;
  /** Identical consecutive siblings folded into this one. */
  repeat: number;
}

export interface Rejected {
  mechanism: string;
  label: string;
  plain: string;
  note: string;
}

/** The closest things in the store to what was asked, with the resonance that
 *  selected them. On a silence this is the whole story: here is what it nearly
 *  said, and none of it was near enough. */
export interface Near {
  text: string;
  node: number | null;
  score: number;
}

export interface Explanation {
  question: string;
  answer: string;
  provenance: string | null;
  outcome: "grounded" | "echo" | "silent";
  /** One plain sentence naming what actually happened. */
  headline: string;
  reading: Reading;
  chain: Chain;
  /** What it almost reached. Shown when no chain was walked. */
  nearest: Near[];
  weighing: Weighing;
  rejected: Rejected[];
  trace: TraceStep[];
  /** The trace was cut short at {@link TRACE_CAP} rows. Distinct from a trace
   *  that is merely shorter than `stepCount` because runs of identical steps
   *  were folded — saying "it stops here" when nothing was dropped is a lie
   *  about the one thing this panel exists to be trusted on. */
  traceCapped: boolean;
  /** Steps the engine emitted in all. */
  stepCount: number;
  tookMs: number;
}

/** Steps past this are dropped from the trace, which says so. Past a few hundred
 *  the trace is scrolled, not read, and the whole panel has to stay sendable. */
const TRACE_CAP = 900;

/** The moves that actually carry an answer from one stored node to another, in
 *  the order we prefer to believe them, with the sentence that says what the hop
 *  MEANT. The first one present on a hop names it. */
const CARRIES: Array<[string, string, string]> = [
  [
    "evalComputation",
    "worked the sum out",
    "The answer was computed, not recalled — which is why it is exact.",
  ],
  [
    "derive-through",
    "looked the subject up again",
    "It took what the first note was about and looked THAT up, so the answer comes from a second note.",
  ],
  [
    "follow-edge",
    "followed a connection it was taught",
    "It had been given a note saying this text is followed by that text, and followed it.",
  ],
  [
    "askedContinuation",
    "took the continuation your question names",
    "More than one continuation was on offer here; your own question says which one it meant.",
  ],
  [
    "castSchema",
    "applied a pattern it learnt",
    "It had seen enough examples shaped like this to learn the pattern, and applied it here.",
  ],
  [
    "projectCounterfactual",
    "put your details into a pattern",
    "The pattern came from examples; your particulars were substituted into it.",
  ],
  [
    "extractBySkill",
    "copied a worked example",
    "It had a worked example of this exact shape and lifted the answer out the same way.",
  ],
  [
    "substitutionBridge",
    "swapped in an equivalent",
    "It had been taught these two mean the same thing, so one stood in for the other.",
  ],
  [
    "crossRegion",
    "joined two parts of your question",
    "Two parts of your question were known separately; this is where they met.",
  ],
  [
    "prefixCompletion",
    "finished a familiar opening",
    "Your opening is the opening of something it holds, and it finished it the way it was taught.",
  ],
  [
    "recallByResonance",
    "recalled the closest note",
    "Nothing could be derived, so it reached for the nearest thing it holds.",
  ],
];

const CARRY_NAMES = new Set(CARRIES.map(([m]) => m));

export function buildExplanation(
  mind: Mind,
  question: string,
  answer: string,
  provenance: string | null,
  steps: RationaleStep[],
  tookMs: number,
): Explanation {
  const ordered = steps.slice().sort((a, b) => a.index - b.index);
  const real = (id: unknown): id is number =>
    typeof id === "number" && id >= 0 && mind.store.has(id);
  const nodesOf = (items: readonly RationaleItem[]): number[] =>
    items.filter((i) => real(i.node)).map((i) => i.node as number);

  const outcome: Explanation["outcome"] = !answer
    ? "silent"
    : provenance === "recall-echo"
    ? "echo"
    : "grounded";

  const reading = readReading(ordered);
  // In a thread the engine is handed every earlier turn as well, which is
  // exactly why a long conversation drifts. Saying so here is the only place
  // that fact is visible at all.
  if (!reading.text) reading.text = question;
  reading.fromThread = norm(reading.text) !== norm(question);

  const chain = buildChain(
    mind,
    question,
    answer,
    provenance,
    ordered,
    reading,
    real,
    nodesOf,
  );
  // A piece of the sentence is marked `carried` only once the chain is known:
  // it is the piece whose node the chain actually walked through.
  const onChain = new Set(
    chain.nodes.map((n) => n.node).filter((n): n is number => n !== null),
  );
  for (const p of reading.pieces) {
    if (p.node !== null && onChain.has(p.node)) p.kind = "carried";
  }

  const weighing = readWeighing(ordered, provenance, outcome);
  const nearest = chain.nodes.length ? [] : readNearest(mind, ordered, real);
  const rejected = readRejected(ordered);
  const { rows: trace, cut: traceCapped } = readTrace(
    ordered,
    Boolean(answer),
  );

  return {
    question,
    answer,
    provenance,
    outcome,
    headline: headlineOf(outcome, provenance, chain),
    reading,
    chain,
    nearest,
    weighing,
    rejected,
    trace,
    traceCapped,
    stepCount: ordered.length,
    tookMs,
  };
}

// ── what it read ───────────────────────────────────────────────────────────

function readReading(steps: RationaleStep[]): Reading {
  // The root step was handed exactly the bytes the engine read — in a thread,
  // the whole conversation so far. Everything else is measured against THAT.
  //
  // THE TEXT IS NOT CLEANED.  Every span below is a BYTE OFFSET into these
  // bytes, so collapsing a double space or trimming a leading one silently
  // shifts every offset after it and the panel paints the wrong words under a
  // tooltip naming the right node. One pasted newline is enough. Cosmetic
  // tidying may only ever touch the SLICES, never the string being indexed.
  const root = steps.find((s) => s.parent === -1) ?? steps[0];
  const first = root?.inputs?.[0];
  const text = first?.bytes ? dec.decode(first.bytes) : (first?.text ?? "");

  // The top-level recognise is the one handed the whole read text; nested ones
  // run over other frames and their spans do not index this string.
  const top = steps
    .filter((s) =>
      s.mechanism.at(-1) === "recognise" && (s.inputs[0]?.text ?? "") === text
    )
    .sort((a, b) => b.outputs.length - a.outputs.length)[0];

  const note = top?.note ?? "";
  const bytes = encUtf8.encode(text);

  // Pieces whose continuation the question never names: recognised, but they
  // answer something else. Keyed by node, because the same wording can appear at
  // several offsets.
  const aside = new Set<number>();
  for (const s of steps) {
    if (s.mechanism.at(-1) !== "unaskedFragments") continue;
    for (const it of s.inputs) {
      if (typeof it.node === "number") aside.add(it.node);
    }
  }

  const raw = (top?.outputs ?? [])
    .filter((o) => Array.isArray(o.span))
    .map((o) => ({
      a: charIndex(bytes, (o.span as [number, number])[0]),
      b: charIndex(bytes, (o.span as [number, number])[1]),
      node: typeof o.node === "number" ? o.node : null,
    }))
    .filter((s) => s.b > s.a)
    // Longest first at the same start, so an overlapping shorter reading of the
    // same evidence is absorbed rather than drawn on top of it.
    .sort((x, y) => x.a - y.a || y.b - x.b);

  const kindOf = (node: number | null): Mark["kind"] =>
    node !== null && aside.has(node) ? "aside" : "known";

  const pieces: Mark[] = [];
  const seenPiece = new Set<string>();
  for (const sp of raw) {
    const key = `${sp.a}:${sp.b}:${sp.node}`;
    if (seenPiece.has(key)) continue;
    seenPiece.add(key);
    pieces.push({
      a: sp.a,
      b: sp.b,
      text: text.slice(sp.a, sp.b),
      node: sp.node,
      kind: kindOf(sp.node),
    });
  }

  // The painted cover. A run that absorbs several readings belongs to no single
  // one of them, so it keeps no node — and it takes the STRONGEST kind among
  // them, because a stretch holding one piece that is in play is in play.
  const rank = { aside: 0, known: 1, carried: 2 } as const;
  const marks: Mark[] = [];
  for (const sp of raw) {
    const kind = kindOf(sp.node);
    const last = marks[marks.length - 1];
    if (last && sp.a <= last.b) {
      if (rank[kind] > rank[last.kind]) last.kind = kind;
      if (sp.b > last.b) {
        last.b = sp.b;
        last.text = text.slice(last.a, last.b);
        last.node = null;
      }
      continue;
    }
    marks.push({
      a: sp.a,
      b: sp.b,
      text: text.slice(sp.a, sp.b),
      node: sp.node,
      kind,
    });
  }

  // What the walk could not account for. Only the engine's OWN count is
  // trusted: a leftover string from a walk over a different frame is not your
  // sentence, and printing it as unexplained text would be a lie.
  const post = lastOf(steps, "postGrounding");
  const data = post?.data as { remainderBytes?: number } | undefined;
  let leftoverBytes: number | null = typeof data?.remainderBytes === "number"
    ? data.remainderBytes
    : null;
  if (leftoverBytes === null && post?.note) {
    leftoverBytes = num(post.note, /remainder(?:Bytes)?[ =](\d+)/);
  }
  // The literal text, but ONLY when it provably belongs to the number beside
  // it. A walk reports what IT left uncovered, over whatever frame it ran on —
  // in a thread that can be an earlier turn's question spliced to an earlier
  // turn's answer, which would then be shown to someone asking about something
  // else entirely. So: one step, its pieces present in the read text, and their
  // bytes adding up to exactly the count the engine reported. Anything less and
  // the count stands alone, which is still true.
  let leftover: string[] | null = null;
  if (leftoverBytes && leftoverBytes > 0) {
    for (const s of steps) {
      if (s.mechanism.at(-1) !== "walkEndedWithoutOffer") continue;
      const parts = s.outputs
        .filter((o) => o.role === "uncovered")
        .map((o) => (o.text ?? ""))
        .filter((t) => t.length > 0);
      if (!parts.length) continue;
      const bytes = parts.reduce((n, t) => n + encUtf8.encode(t).length, 0);
      if (bytes !== leftoverBytes) continue;
      if (!parts.every((t) => text.includes(t))) continue;
      leftover = parts;
      break;
    }
  }

  return {
    text,
    fromThread: false, // set by the caller, which knows this turn's message
    marks,
    pieces,
    leaves: num(note, /over (\d+) perceived leaves/),
    forms: num(note, /into (\d+) learnt form/) ?? pieces.length,
    covered: marks.reduce((n, m) => n + (m.b - m.a), 0),
    leftoverBytes,
    leftover,
    note,
  };
}

// ── the chain it walked ────────────────────────────────────────────────────

function buildChain(
  mind: Mind,
  question: string,
  answer: string,
  provenance: string | null,
  steps: RationaleStep[],
  reading: Reading,
  real: (id: unknown) => id is number,
  nodesOf: (items: readonly RationaleItem[]) => number[],
): Chain {
  const nodes: ChainNode[] = [];
  const links: ChainLink[] = [];
  // With no trace there is nothing to witness, and resolving the answer's own
  // bytes would manufacture evidence for an inference nobody recorded.
  if (!answer || !steps.length) return { nodes, links, truncated: false };

  // Where the answer lives in the graph: the root step says so, and failing that
  // the answer's own bytes resolve to it.
  const root = steps.find((s) => s.parent === -1);
  let answerNode: number | null =
    nodesOf(root?.outputs ?? []).find((n) => real(n)) ?? null;
  if (answerNode === null) {
    const r = mind.resolve(encUtf8.encode(answer));
    if (real(r)) answerNode = r;
  }

  /** Is `from` really a stored predecessor of `to` — is there a LEARNT EDGE
   *  between them? The panel draws every hop as exactly that and says so in
   *  words, so it has to be checked rather than assumed. Without it, a trace
   *  carrying two `follow-edge` steps that happen to name the same target (one
   *  repeated answer in a thread is enough) lets the walk pick whichever ran
   *  last and draw a derivation through a note with no bearing on the question.
   *  Bounded and memoised: one indexed read per target. */
  const prevCache = new Map<number, Set<number> | null>();
  const edge = (from: number, to: number): boolean => {
    if (!prevCache.has(to)) {
      const prev = mind.store.prevFirst(to, 400);
      // A fully-read predecessor list can be decided on; a truncated one
      // cannot, so it stops gating rather than rejecting what it never saw.
      prevCache.set(to, prev.length >= 400 ? null : new Set(prev));
    }
    const set = prevCache.get(to);
    return set === null || set === undefined ? true : set.has(from);
  };

  /** The hops, discovered backwards from the answer. */
  const MAX_HOPS = 12;
  const hops: Array<{ from: number; to: number; step: RationaleStep }> = [];
  const seen = new Set<number>();
  let truncated = false;
  let cur = answerNode;
  for (let guard = 0; cur !== null && !seen.has(cur); guard++) {
    if (guard >= MAX_HOPS) {
      truncated = true;
      break;
    }
    seen.add(cur);
    const target = cur;
    let found: { from: number; step: RationaleStep } | null = null;
    // Earliest first: a parent reserves its index before its children run, so
    // among steps that name the same target the lower index is the one nearer
    // the decision rather than whichever happened to run last.
    for (const s of steps) {
      const name = s.mechanism.at(-1) ?? "";
      if (!CARRY_NAMES.has(name)) continue;
      if (abstained(name, s.note ?? "", s.outputs.length > 0)) continue;
      if (!nodesOf(s.outputs).includes(target)) continue;
      const from = nodesOf(s.inputs).find((n) =>
        n !== target && !seen.has(n) && edge(n, target)
      );
      if (from === undefined) continue;
      found = { from, step: s };
      break;
    }
    if (!found) break;
    hops.unshift({ from: found.from, to: target, step: found.step });
    cur = found.from;
  }

  // A hop the trace did not spell out but the STORE does. `prefixCompletion`
  // names no input node, so the walk above finds nothing and the panel used to
  // announce that no edge was walked — while the store holds the full note the
  // query is a prefix of, and its continuation IS the answer. That note is the
  // single most useful box on the page, and it was being dropped.
  if (!hops.length && answerNode !== null) {
    const nodeSpan = new Map<number, Mark[]>();
    for (const p of reading.pieces) {
      if (p.node === null) continue;
      if (!nodeSpan.has(p.node)) nodeSpan.set(p.node, []);
      nodeSpan.get(p.node)!.push(p);
    }
    let best: { from: number; step: RationaleStep } | null = null;
    for (const s of steps) {
      const name = s.mechanism.at(-1) ?? "";
      if (!CARRY_NAMES.has(name)) continue;
      if (abstained(name, s.note ?? "", s.outputs.length > 0)) continue;
      for (const n of nodesOf(s.outputs)) {
        if (n === answerNode) continue;
        if (!mind.store.hasNext(n)) continue;
        if (mind.store.nextFirst(n, 1)[0] !== answerNode) continue;
        best = { from: n, step: s };
        break;
      }
      if (best) break;
    }
    if (best) hops.push({ from: best.from, to: answerNode, step: best.step });
  }

  /** Everywhere a stored node shows up in the read text. A node can be seen at
   *  several offsets, and one of them is not "where it came from". */
  const spansOf = (node: number): Array<[number, number]> =>
    reading.pieces.filter((p) => p.node === node).map((p) => [p.a, p.b]);

  /** How many OTHER stored notes reach the same place, with a few read back so
   *  the number is concrete.
   *
   *  THE COUNT AND THE SAMPLES COUNT THE SAME THING.  The samples have always
   *  been filtered to contexts a deposit learnt WHOLE — the rest are fragments
   *  of other forms, and showing one as a stored note would misrepresent what
   *  the store holds. `prevCount` applies no such filter: for one node here it
   *  returns 154 where only 120 are notes, so the sentence overstated by a
   *  quarter while the examples under it were honest. The scan is bounded and
   *  says when it was, because "at least 400" is true and "154" was not. */
  const supportOf = (node: number, exclude: number[]) => {
    const CAP = 400;
    const prev = mind.store.prevFirst(node, CAP);
    const skip = new Set(exclude);
    let total = 0;
    const samples: string[] = [];
    for (const id of prev) {
      if (skip.has(id) || !mind.store.learntWhole(id)) continue;
      total++;
      if (samples.length < 3) {
        const t = renderNode(mind, id, 140);
        if (t) samples.push(t);
      }
    }
    if (!(total > 0)) return null;
    return { total, capped: prev.length >= CAP, samples };
  };

  // The question is always the first box: the chain starts in your words.
  const headSpans = hops.length ? spansOf(hops[0].from) : [];
  nodes.push({
    id: "asked",
    kind: "asked",
    title: "What you asked",
    text: question,
    node: null,
    spans: headSpans,
    voters: [],
    voterTotal: 0,
    support: null,
    exact: false,
  });

  if (hops.length) {
    // The chain Sema walked: your words → a stored note → … → the answer.
    //
    // The opening link may only claim a match against your sentence when the
    // head of the chain really is wording that was found IN it. A head reached
    // some other way — by resonance, by a pattern — is still a real starting
    // point, and saying it was highlighted above when nothing is highlighted
    // sends the reader hunting for a mark that does not exist.
    links.push(
      headSpans.length
        ? {
          move: "recognise",
          label: "matched it to something it holds",
          plain:
            "The highlighted piece of your sentence is wording the store already had, so there was somewhere to start from.",
          cost: null,
          note: reading.note,
        }
        : {
          move: "recognise",
          label: "started from a note it holds",
          plain:
            "The chain starts here. This note is not a piece of your sentence — it is what the engine reached from it.",
          cost: null,
          note: reading.note,
        },
    );

    const sequence = [hops[0].from, ...hops.map((h) => h.to)];
    sequence.forEach((node, i) => {
      const isAnswer = i === sequence.length - 1;
      const text = renderNode(mind, node, 260);
      nodes.push({
        id: "n" + node,
        kind: isAnswer ? "answer" : "note",
        title: isAnswer
          ? "The answer"
          : i === 0
          ? "A note it was given"
          : "and that led to another note",
        text: isAnswer ? answer : text,
        node,
        spans: spansOf(node),
        voters: [],
        voterTotal: 0,
        support: isAnswer
          ? supportOf(node, i > 0 ? [sequence[i - 1]] : [])
          : null,
        exact: !isAnswer && norm(text) === norm(question),
      });
      if (!isAnswer) {
        const hop = hops[i];
        const name = hop.step.mechanism.at(-1) ?? "";
        const carry = CARRIES.find(([m]) => m === name);
        links.push({
          move: name,
          label: carry ? carry[1] : mechOf(name).label.toLowerCase(),
          plain: carry
            ? carry[2]
            : (DID[name]?.(hop.step.note ?? "", true) ?? ""),
          cost: num(hop.step.note ?? "", /cost ([\d.]+)/),
          note: hop.step.note ?? "",
        });
      }
    });
    return { nodes, links, truncated };
  }

  // No edge was walked, and there are three reasons that can happen, each with
  // a shape of its own. Drawing any of them as a note it "followed" would be a
  // fiction, so each is drawn as what it is.

  // COMPUTED.  Arithmetic reaches an answer that is in no note at all — the
  // engine's own result node is negative, meaning nothing in the store holds
  // it. That is the most interesting thing about such an answer and it was
  // being reported as "the answer came out of this route".
  const sum = lastOf(
    steps,
    "evalComputation",
    (s) =>
      !abstained("evalComputation", s.note ?? "", s.outputs.length > 0) &&
      clean(s.outputs[0]?.text ?? "") === answer,
  );
  if (sum) {
    links.push({
      move: "evalComputation",
      label: "worked it out",
      plain:
        "This answer is in none of its notes: it was computed. That is why it is exact, and why it can be right about a sum it was never taught.",
      cost: null,
      note: sum.note ?? "",
    });
    nodes.push({
      id: "answer",
      kind: "answer",
      title: "The answer",
      text: answer,
      node: null,
      spans: [],
      voters: [],
      voterTotal: 0,
      support: null,
      exact: false,
    });
    return { nodes, links, truncated };
  }

  const bound = lastOf(
    steps,
    "bindReferent",
    (s) => s.inputs.some((i) => real(i.node)),
  );
  if (bound) {
    const voters: Voter[] = [];
    for (const it of bound.inputs) {
      if (!real(it.node)) continue;
      const text = renderNode(mind, it.node, 140);
      if (!text) continue;
      voters.push({
        text,
        node: it.node,
        score: typeof it.score === "number" ? it.score : null,
      });
      if (voters.length === 6) break;
    }
    const total = num(bound.note ?? "", /^(\d+) instance/) ??
      bound.inputs.filter((i) => real(i.node)).length;
    links.push({
      move: "bindReference",
      label: "found the notes your question is about",
      plain:
        "Nothing it holds says this exact thing. So instead it gathered every stored note built the same way as your question.",
      cost: null,
      note: bound.note ?? "",
    });
    nodes.push({
      id: "agree",
      kind: "agreement",
      title: `${total} stored notes, all built the same way`,
      text: "",
      node: null,
      spans: [],
      voters,
      voterTotal: total,
      support: null,
      exact: false,
    });
    links.push({
      move: "bindReferent",
      label: "and they all agree on one answer",
      plain:
        "The answer is not in any one of these notes — it is what all of them have in common. The engine needs at least two that agree before it will generalise at all; with fewer, it says nothing.",
      cost: null,
      note: bound.note ?? "",
    });
  } else {
    const echo = lastOf(
      steps,
      "recallByResonance",
      (s) => s.outputs.length > 0,
    );
    links.push({
      move: provenance ?? "recall",
      label: provenance === "recall-echo"
        ? "handed back the nearest thing it holds"
        : "produced the answer on this route",
      // NEVER THE NEGATIVE.  This used to read "no edge between two stored
      // notes was walked" — a claim about what did NOT happen, made from the
      // absence of a hop this reader could not reconstruct. On a `prefix`
      // answer an edge HAD been walked and the sentence was simply false. What
      // can be said is what the trace shows: this route produced the answer,
      // and the steps that got it there are in the trace below.
      plain: provenance === "recall-echo"
        ? "No chain of reasoning reached an answer, so it returned the closest stored wording verbatim. Read it as “the nearest thing I hold”, not as a derived fact."
        : "The answer came out of this route. The trace below has every step it took; the engine did not report it as a move between two stored notes, so there is no edge to draw here.",
      cost: null,
      note: echo?.note ?? root?.note ?? "",
    });
  }

  nodes.push({
    id: "answer",
    kind: "answer",
    title: "The answer",
    text: answer,
    node: answerNode,
    spans: [],
    voters: [],
    voterTotal: 0,
    // The notes shown agreeing directly above are not "other" notes.
    support: answerNode !== null
      ? supportOf(
        answerNode,
        nodes.flatMap((n) =>
          n.voters.map((v) => v.node).filter((v): v is number => v !== null)
        ),
      )
      : null,
    exact: false,
  });
  return { nodes, links, truncated };
}

/** The nearest stored notes the engine pulled, read back verbatim.
 *
 *  `resonate` reports its hits with the cosine that selected them, and
 *  `recallByResonance` reports the threshold they failed to clear. Together
 *  they are the only honest account of a silence: not "it knew nothing" but
 *  "here is the closest it holds, and the engine would not call it close
 *  enough". Without this a silence is an empty panel. */
function readNearest(
  mind: Mind,
  steps: RationaleStep[],
  real: (id: unknown) => id is number,
): Near[] {
  const hits = lastOf(
    steps,
    "resonate",
    (s) => s.outputs.some((o) => typeof o.score === "number"),
  );
  const out: Near[] = [];
  for (const it of hits?.outputs ?? []) {
    if (typeof it.score !== "number") continue;
    const text = real(it.node)
      ? renderNode(mind, it.node, 160)
      : clean(it.text ?? "");
    if (!text || isInternal(text)) continue;
    out.push({
      text,
      node: real(it.node) ? it.node : null,
      score: it.score,
    });
    if (out.length === 5) break;
  }
  return out;
}

// ── what it weighed ────────────────────────────────────────────────────────

function readWeighing(
  steps: RationaleStep[],
  provenance: string | null,
  outcome: Explanation["outcome"],
): Weighing {
  const regimeStep = lastOf(steps, "regimePrediction");
  const regimeData = regimeStep?.data as
    | {
      regime?: string;
      incumbentGrade?: number | null;
      climbFloorGrade?: number;
      boundGrade?: number;
    }
    | undefined;
  const regime = regimeData?.regime ??
    (/^(\w+) regime/.exec(regimeStep?.note ?? "")?.[1] ?? null);

  // THE ENGINE WEIGHS THE CANDIDATES ITSELF AND HANDS THE RESULT OVER.
  // `decideGrounding.data` carries every candidate with the weight and the
  // grade it was actually judged on. Everything below used to be reconstructed
  // from floors scraped out of skip notes — and a floor is what a route would
  // cost AT BEST, not what the winner paid. Printed in one column they put the
  // winning route at cost 53002 beside a rival "at 1", under a heading saying
  // the cheapest wins. These are the real numbers.
  const decide = lastOf(steps, "decideGrounding");
  const decided = (decide?.data as DecideData | undefined)?.candidates ?? [];
  const winner = decided.find((c) => c.decided);

  const incumbent = winner?.grade ??
    (typeof regimeData?.incumbentGrade === "number"
      ? regimeData.incumbentGrade
      : typeof regimeData?.boundGrade === "number"
      ? regimeData.boundGrade
      : num(regimeStep?.note ?? "", /(?:incumbent )?grade (\d+)/));

  // Two separate readings, kept apart because they answer different questions.
  // A FLOOR is what a route would cost at best — a fact about the route, true
  // whether or not it ran. A STATE is what became of it. Mixing them is how a
  // route that merely ran second ends up described as beaten.
  const floors = new Map<string, number>();
  /** Costs the engine really paid, as opposed to floors it merely predicted. */
  const measured = new Map<string, number>();
  const states = new Map<string, { state: Route["state"]; why: string }>();
  const floor = (name: string, grade: number) => {
    const had = floors.get(name);
    if (had === undefined || grade < had) floors.set(name, grade);
  };
  const state = (name: string, state: Route["state"], why: string) => {
    // Observed outcomes outrank inferred ones: won beats everything, and a
    // route that RAN and came back empty is not a route that was never run.
    const rank = {
      won: 4,
      empty: 3,
      blocked: 2,
      outgunned: 1,
      ran: 0,
    } as const;
    const had = states.get(name);
    if (had && rank[had.state] >= rank[state]) return;
    states.set(name, { state, why });
  };

  // Every candidate the decision actually compared, at the grade it compared
  // them on. These are measured costs, not floors, and they override anything
  // scraped out of a note below.
  for (const c of decided) {
    measured.set(c.provenance, c.grade);
    if (c.decided) continue;
    state(
      c.provenance,
      "empty",
      c.unexplainedBytes > 0
        ? `It reached an answer too, at ${c.grade}, leaving ${
          plural(c.unexplainedBytes, "byte")
        } of your text unexplained.`
        : `It reached an answer too, at ${c.grade} — dearer than the one that won.`,
    );
  }

  if (outcome !== "silent" && provenance) {
    if (incumbent !== null) measured.set(provenance, incumbent);
    state(provenance, "won", "The answer came by this route.");
  }

  for (const s of steps) {
    const name = s.mechanism.at(-1) ?? "";
    const note = s.note ?? "";

    if (name === "skipMechanism") {
      const which = (/^([\w-]+)/.exec(note)?.[1] ?? "").toLowerCase();
      if (!which) continue;
      // The engine prunes on cost in TWO wordings — "cannot beat incumbent
      // (grade N)" and "cannot beat grade N, already reached by a mechanism run
      // ahead" — and only the first was being recognised. The second fell
      // through to the structural glossary, so a route pruned purely on price
      // was reported as one that could not apply to a sentence of this shape,
      // while the ladder on the same page said it was never run. Two
      // incompatible reasons for one step.
      const f = num(note, /floor (\d+) cannot beat/);
      const g =
        num(note, /(?:incumbent \(grade (\d+)\)|cannot beat grade (\d+))/) ??
          num(note, /cannot beat grade (\d+)/);
      if (f !== null) {
        floor(which, f);
        state(which, "outgunned", "");
      } else {
        state(
          which,
          "blocked",
          SKIPPED[which]?.plain ??
            "It checked whether this approach could apply here, and it could not.",
        );
      }
      continue;
    }

    if (name === "runAhead") {
      // "X runs ahead of Y — its floor (grade A) is below Y's (grade B)". This
      // is the ORDER the market ran in, and both numbers are floors. It says
      // nothing about how either route ended, so it sets no state.
      const m =
        /^([\w-]+) runs ahead of ([\w-]+) — its floor \(grade (\d+)\) is below ([\w-]+)'s \(grade (\d+)\)/
          .exec(note);
      if (!m) continue;
      floor(m[1], Number(m[3]));
      floor(m[2], Number(m[5]));
      state(m[2], "ran", "");
      state(m[1], "ran", "");
    }
  }

  // A route that RAN and found nothing is the single most informative row on
  // this ladder, so it is read last and overrides anything inferred above.
  for (const s of steps) {
    const name = s.mechanism.at(-1) ?? "";
    const route = ROUTE_OF[name];
    if (!route) continue;
    if (!abstained(name, s.note ?? "", s.outputs.length > 0)) continue;
    state(route, "empty", EMPTY[name] ?? "It ran, and came back with nothing.");
  }

  const names = new Set([
    ...floors.keys(),
    ...measured.keys(),
    ...states.keys(),
  ]);
  const order = { won: 0, empty: 1, ran: 2, outgunned: 3, blocked: 4 } as const;
  const routes: Route[] = [...names]
    .map((name) => {
      const st = states.get(name)?.state ?? "ran";
      const paid = measured.get(name);
      return {
        name,
        label: routeLabel(name),
        // A route that cannot apply at all has no cost — showing it one, from
        // a floor predicted before the structure ruled it out, invites the
        // reader to compare a price nobody was ever charged.
        grade: st === "blocked" ? null : paid ?? floors.get(name) ?? null,
        measured: st !== "blocked" && paid !== undefined,
        state: st,
        why: states.get(name)?.why ?? "",
      };
    })
    .sort((a, b) =>
      order[a.state] - order[b.state] ||
      (a.grade ?? 99) - (b.grade ?? 99) ||
      a.name.localeCompare(b.name)
    );

  const rules: string[] = [];
  // A market of one records no comparison at all, which is NOT the same as a
  // wide win — and the reader should know that nothing here corroborates the
  // choice by contest.
  if (outcome !== "silent" && !decided.length) {
    rules.push(
      "No contest was recorded: only one route reached an answer at all. That is not the same as winning by a wide margin — nothing here corroborates the choice by comparison.",
    );
  }
  if (routes.some((r) => r.state === "outgunned")) {
    rules.push(
      `Never run: the engine did not try these at all. The cost shown is the cheapest each one could possibly have come out at, and ${
        incumbent === null
          ? "something cheaper was already in hand"
          : `an answer costing ${incumbent} was already in hand`
      } — so none of them could have won.`,
    );
  }
  if (routes.some((r) => r.state === "ran")) {
    rules.push(
      "In play: these were run. The cost shown is their floor, and a route that could not come out cheaper always runs after one that could — so the cheaper result caps what the dearer one can win.",
    );
  }

  // `narrowDecision` is emitted ONLY when the call was narrow, so its presence
  // is the flag; its `data.margin` is the number, parsed from prose before.
  const narrow = lastOf(steps, "narrowDecision");
  const narrowMargin =
    (narrow?.data as { margin?: number } | undefined)?.margin ??
      num(narrow?.note ?? "", /margin (\d+)/);
  return {
    regime,
    regimePlain: regime === "retrieval"
      ? "It judged this a look-up rather than something to build \u2014 which is what decided how many of the routes below were worth running at all."
      : regime === "composition"
      ? "It judged that this had to be built rather than looked up, so every route below was put in play."
      : null,
    incumbent,
    routes,
    rules,
    closeCall: narrow
      ? (narrowMargin === null
        ? "the engine flagged the call as narrow"
        : `a margin of ${plural(narrowMargin, "grade unit")}`)
      : null,
  };
}

// ── what came up empty ─────────────────────────────────────────────────────

function readRejected(steps: RationaleStep[]): Rejected[] {
  const out = new Map<string, Rejected>();
  for (const s of steps) {
    const name = s.mechanism.at(-1) ?? "";
    const note = s.note ?? "";
    if (ALWAYS_RAN.has(name) && name !== "counterfactual") continue;
    if (!abstained(name, note)) continue;
    let label = mechOf(name).label;
    let plain: string;
    if (name === "skipMechanism") {
      // A route skipped because its CHEAPEST possible outcome could not beat
      // what the engine already had is not an approach that failed — it is the
      // cost ladder doing its job, and the ladder above already draws it. Only
      // a skip for a structural reason belongs here, and only a structural skip
      // may take a sentence from SKIPPED: those sentences say an approach could
      // not APPLY, which is a different claim from "it would have cost more".
      if (/floor \d+ cannot beat/.test(note)) continue;
      const which = (/^([\w-]+)/.exec(note)?.[1] ?? "").toLowerCase();
      label = SKIPPED[which]
        ? `Ruled out before trying: ${SKIPPED[which].what}`
        : label;
      plain = SKIPPED[which]?.plain ??
        "It checked whether this approach could apply here, and it could not.";
    } else {
      plain = EMPTY[name] ?? "This approach produced nothing here.";
    }
    const key = name + "|" + plain;
    if (!out.has(key)) out.set(key, { mechanism: name, label, plain, note });
  }
  return [...out.values()].slice(0, 16);
}

// ── the trace, in the engine's own nesting ─────────────────────────────────

function readTrace(
  steps: RationaleStep[],
  answered: boolean,
): { rows: TraceStep[]; cut: boolean } {
  const rows: TraceStep[] = [];
  let cut = false;
  for (const s of steps) {
    const name = s.mechanism.at(-1) ?? "";
    const m = mechOf(name);
    const note = s.note ?? "";
    const inText = firstText(s.inputs);
    const outText = firstText(s.outputs);
    const plain = abstained(name, note) && !ALWAYS_RAN.has(name)
      ? (EMPTY[name] ?? null)
      : (DID[name]?.(note, answered) ?? null);

    // A run of identical consecutive siblings is one thing that happened many
    // times, not many things. Folding it keeps the run VISIBLE as a run — the
    // count is on the row — without burying the shape of the tree under it.
    const last = rows[rows.length - 1];
    if (
      last && last.name === name && last.parent === s.parent &&
      last.note === note
    ) {
      last.repeat++;
      continue;
    }

    rows.push({
      i: s.index,
      parent: s.parent,
      depth: Math.max(0, s.mechanism.length - 1),
      name,
      label: m.label,
      family: m.family,
      note,
      plain,
      from: s.dependsOn ?? [],
      // Only when the step really had ONE of each: picking the first of a
      // vector of twelve inputs and the first of a vector of three outputs
      // draws an arrow between two things that were never paired.
      io:
        s.inputs.length === 1 && s.outputs.length === 1 && inText && outText &&
          inText !== outText
          ? [inText, outText] as [string, string]
          : null,
      repeat: 1,
    });
    if (rows.length >= TRACE_CAP) {
      // Stopped WITH steps still unread — that is a cut trace. Stopping on the
      // last step is a complete one that happens to be exactly this long, and
      // calling it cut would be the one kind of lie this panel cannot afford.
      cut = steps.indexOf(s) < steps.length - 1;
      break;
    }
  }
  return { rows, cut };
}

// ── the one-line verdict ───────────────────────────────────────────────────

function headlineOf(
  outcome: Explanation["outcome"],
  provenance: string | null,
  chain: Chain,
): string {
  if (outcome === "silent") {
    return "Nothing it holds supported an answer, so it said nothing.";
  }
  if (outcome === "echo") {
    return "It returned the closest stored wording it has, rather than deriving an answer.";
  }
  const carried = chain.links.filter((l) => CARRY_NAMES.has(l.move));
  if (carried.length > 1) {
    return `It reached the answer in ${carried.length} hops, each one a connection it had been taught.`;
  }
  if (carried.length === 1) {
    const c = CARRIES.find(([m]) => m === carried[0].move);
    return `It ${c ? c[1] : carried[0].label}.`;
  }
  if (chain.nodes.some((n) => n.kind === "agreement")) {
    const n = chain.nodes.find((x) => x.kind === "agreement")!;
    return `It answered from agreement: ${n.voterTotal} stored notes built the same way all point at this.`;
  }
  // NO MECHANISM IS CREDITED THAT THE CHAIN DOES NOT SHOW.  This used to scan
  // every step for any carrying mechanism, in preference order, whether or not
  // it was on the winning route — so an arithmetic step inside a losing branch
  // produced the headline "It worked the sum out" directly above a chain whose
  // only arrow said no such move was recorded. When the chain has no hop, the
  // honest headline says where the answer came from, not how.
  if (chain.links.some((l) => l.move === "evalComputation")) {
    return "It worked the answer out exactly \u2014 computed, not recalled.";
  }
  return provenance
    ? `The answer came by the route that sets out to ${routeLabel(provenance)}.`
    : "It composed the answer from the notes it holds.";
}
