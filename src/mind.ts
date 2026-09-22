// mind.ts — the Sema engine: one Mind over the trained store, one
// conversation per browser session, and the translation of Sema's rationale
// into something a non-technical reader can follow.

import { Mind, SQliteStore } from "@hviana/sema";
import type { RationaleStep } from "@hviana/sema";
import { renderNode } from "./explore.ts";

/** The package exports `Mind` but not the opaque conversation handle its
 *  conversation methods pass around, so name it from the method itself. */
type Conversation = ReturnType<Mind["beginConversation"]>;

/** One stage of the explanation, in the order Sema works. */
interface Stage {
  key: string;
  title: string;
  /** What this stage means, in plain words. */
  plain: string;
  icon: string;
}

const STAGES: Stage[] = [
  {
    key: "read",
    title: "Read the question",
    plain:
      "Sema breaks your sentence into pieces and checks which of them it has actually seen before.",
    icon: "read",
  },
  {
    key: "find",
    title: "Find what it knows about this",
    plain:
      "It goes through its memory for the notes closest to those pieces, and lets them vote on what your question is really about.",
    icon: "find",
  },
  {
    key: "reason",
    title: "Reason it through",
    plain:
      "It follows the connections between what it found — one thing leading to the next — until a chain reaches something that answers you.",
    icon: "reason",
  },
  {
    key: "decide",
    title: "Weigh the options",
    plain:
      "More than one chain can reach an answer. Sema keeps the one that took the fewest leaps, and throws the rest away.",
    icon: "decide",
  },
  {
    key: "answer",
    title: "Say it back",
    plain:
      "Finally it rephrases the winning answer using your own wording, so the reply sounds like a response to what you asked.",
    icon: "answer",
  },
];

/** Which stage each mechanism belongs to, plus a plain-language name for it.
 *  Mechanisms absent from this table are internal plumbing and are folded
 *  into the technical trace only.
 *
 *  These labels are the last place the reader meets Sema's vocabulary, so none
 *  of them borrows a term from it: no "grounding", no "resonance", no "schema",
 *  no "extraction". Each one is what a person would say they were doing. */
const MECHANISMS: Record<string, { stage: string; label: string }> = {
  recognise: { stage: "read", label: "Spotting wording it knows" },
  perceive: { stage: "read", label: "Breaking your question into pieces" },
  resonate: { stage: "find", label: "Looking for notes that feel similar" },
  climbConsensus: { stage: "find", label: "Letting the pieces vote" },
  "pool-vote": { stage: "find", label: "Adding up the evidence that agrees" },
  crossRegion: { stage: "find", label: "Joining two parts of your question" },
  alignStructures: {
    stage: "find",
    label: "Lining it up against something known",
  },
  recallByResonance: { stage: "find", label: "Recalling the closest note" },
  "follow-edge": {
    stage: "reason",
    label: "Following what it was taught comes next",
  },
  // The JOIN.  Without an entry here the step is DROPPED from the story
  // entirely (the builder below skips unknown mechanisms), and the join is
  // exactly the step the headline credits in the richest answers.
  "derive-through": {
    stage: "reason",
    label: "Deriving through a fact it already held",
  },
  bridge: { stage: "reason", label: "Covering the next part of the sentence" },
  substitutionBridge: {
    stage: "reason",
    label: "Swapping in something that means the same",
  },
  cover: { stage: "reason", label: "Putting the steps in order" },
  ground: { stage: "reason", label: "Reaching a stored answer" },
  liftAnswer: {
    stage: "reason",
    label: "Separating the answer from how you asked",
  },
  castSchema: { stage: "reason", label: "Applying a pattern it learnt" },
  projectCounterfactual: {
    stage: "reason",
    label: "Putting your details into the pattern",
  },
  counterfactual: {
    stage: "reason",
    label: "Checking the pattern with a variation",
  },
  tryAnalog: { stage: "reason", label: "Looking for something similar" },
  trySkillAnchors: {
    stage: "reason",
    label: "Looking for a worked example to copy",
  },
  extractBySkill: {
    stage: "reason",
    label: "Copying how a worked example does it",
  },
  bindReference: {
    stage: "reason",
    label: "Working out what a word points to",
  },
  prefixCompletion: { stage: "reason", label: "Finishing a familiar opening" },
  computeExtensions: {
    stage: "reason",
    label: "Spotting something to work out",
  },
  evalComputation: { stage: "reason", label: "Doing the arithmetic" },
  think: { stage: "reason", label: "Putting it together" },
  disambiguate: { stage: "decide", label: "Choosing between rival answers" },
  decideGrounding: {
    stage: "decide",
    label: "Choosing the simplest explanation",
  },
  narrowDecision: { stage: "decide", label: "Checking how close the call was" },
  // Reported when a mechanism declines before it even runs. Its note never
  // starts with "no"/"none", so `abstained` has to recognise it by mechanism.
  skipMechanism: { stage: "reason", label: "Ruled out before trying" },
  articulate: {
    stage: "answer",
    label: "Rewording it to match how you asked",
  },
  respond: { stage: "answer", label: "Giving the answer back" },
  respondTurn: { stage: "answer", label: "Giving the answer back" },
};

/** The closing mechanisms always belong in the story even when their note
 *  reads like an abstention: "no asker concept to revoice — answer unchanged"
 *  means the wording needed no change, not that the step failed. */
const ALWAYS_SHOWN = new Set(["respond", "respondTurn", "articulate"]);

/** Notes that describe a mechanism declining to act. Sema is explicit about
 *  what it did NOT conclude, and that is worth showing — but separately from
 *  the steps that actually built the answer. */
function abstained(mechanism: string, note: string): boolean {
  if (mechanism === "skipMechanism") return true;
  const n = note.toLowerCase();
  return /^(no |none |nothing|skipped|below |0 )/.test(n) ||
    n.includes("none passed") ||
    n.includes("no analog") ||
    n.includes("agreement needs");
}

export interface ExplainedStep {
  label: string;
  note: string;
  mechanism: string;
  inputs: string[];
  outputs: string[];
  /** How many times this mechanism ran within its stage. */
  repeat: number;
  /** For an abstention: why it came up empty, in ordinary words. Sema's own
   *  note is precise but written for a debugger ("no consensus root is a
   *  span-shaped skill exemplar"), and that is the one thing in this panel a
   *  non-technical reader cannot get past. The exact note is still carried in
   *  `note`, so nothing is lost. */
  plain?: string;
}

/** Plain-language readings of an abstention, keyed by the mechanism that gave
 *  up. Keyed by mechanism rather than by matching the note text, because the
 *  mechanism is stable and the wording is not. */
const WHY_EMPTY: Record<string, string> = {
  trySkillAnchors:
    "None of its worked examples had the right shape to copy from.",
  extractBySkill: "It could not lift an answer out the way its examples do.",
  bindReference:
    "Pinning a word down takes two mentions that agree; it found one.",
  substitutionBridge:
    "It found nothing it could safely treat as meaning the same thing.",
  recallByResonance: "Nothing it holds came close enough to this wording.",
  prefixCompletion: "No note it was given begins this way.",
  tryAnalog: "No close enough analogy among the notes it holds.",
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
  bridge: "It could not bridge the gap in the sentence.",
  "follow-edge": "There was no learnt connection to follow from here.",
  cover: "It could not assemble a chain that reached an answer.",
  ground: "No chain reached a stored answer.",
  liftAnswer: "There was no recognised region to lift out.",
  think:
    "Every route was tried and none of them reached an answer it could stand behind.",
};

/** `skipMechanism` names which mechanism it declined in the note's first word,
 *  so BOTH the plain reading and the label come from that word.  Two declines in
 *  one list otherwise share the title "Ruled out before trying" with nothing to
 *  tell them apart, and `alu` had no reading of its own at all. */
const SKIPPED: Record<string, { what: string; plain: string }> = {
  cast: {
    what: "applying a pattern it learnt",
    plain: "A learnt pattern could not apply to a sentence shaped like this.",
  },
  extraction: {
    what: "copying a worked example",
    plain:
      "Lifting the answer out by example could not beat what it already had.",
  },
  reference: {
    what: "working out what a word points to",
    plain: "There was nothing here whose reference needed working out.",
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

function whyEmpty(mechanism: string, note: string): string | undefined {
  if (mechanism !== "skipMechanism") return WHY_EMPTY[mechanism];
  const which = /^(\w+)/.exec(note)?.[1]?.toLowerCase() ?? "";
  return SKIPPED[which]?.plain ??
    "It checked whether this approach could apply here, and it could not.";
}

/** Read a number out of Sema's note. The notes are generated from a fixed
 *  template per mechanism, so this is stable — but every caller falls back to
 *  wording that reads correctly when the number is missing. */
function num(note: string, re: RegExp): number | null {
  const m = re.exec(note);
  return m ? Number(m[1]) : null;
}

/** Plain-language readings of a step that DID something. Sema's notes are
 *  written for whoever is debugging the cost ladder ("pool independent
 *  regions' evidence for a shared anchor (sum, not shortest path) (cost
 *  0.0388)"); this is the same fact for someone who has never heard of a cost
 *  ladder. The exact note is kept alongside, never replaced. */
const DID: Record<string, (note: string, answered: boolean) => string> = {
  perceive: () => "It cut your question into pieces along its own boundaries.",
  recognise: (n) => {
    const forms = num(n, /into (\d+) learnt form/);
    const seen = num(n, /over (\d+) perceived leaves/);
    if (forms === null) return "It looked for wording it had seen before.";
    if (forms === 0) {
      return `None of the ${
        seen ?? "many"
      } pieces of your question led anywhere it had been taught.`;
    }
    return `Of the ${seen ?? "many"} pieces it cut your question into, ${
      forms === 1 ? "one was wording it had" : `${forms} were wording it had`
    } seen before and could follow.`;
  },
  resonate: (n) => {
    const near = num(n, /→ (\d+) nearest/);
    return `It pulled the ${
      near ?? "closest"
    } stored notes that feel most like your question out of memory.`;
  },
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
    "It joined two parts of your question that it knew about separately.",
  alignStructures: () =>
    "It lined your sentence up against one it already knew, piece for piece.",
  recallByResonance: (n) =>
    n.includes("exact self-match")
      ? "Your wording matched a stored note exactly, so it went straight to what follows it."
      : "It recalled the closest stored note to your wording.",
  // The plain sentence must not just restate the label. Where the label already
  // names the action, the sentence says why that action mattered here.
  "follow-edge": () =>
    "This is the move that carries the answer: it had been given a note saying this text is followed by that text.",
  "derive-through": () =>
    "It took the subject the first note was about and looked that subject up again, so the answer comes from a second note rather than from the first one alone.",
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
  projectCounterfactual: () =>
    "It put your details into a pattern it had learnt.",
  counterfactual: () => "It tested a variation to check the pattern held.",
  extractBySkill: () =>
    "It pulled the answer out the way its worked examples do.",
  bindReference: () => "It worked out what a word in your question refers to.",
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
  // The note also reports "distinct contexts" and "poured mass". Those are the
  // weights behind the choice, not a count of notes that agreed — glossing them
  // as agreement would put a number in front of the reader that means something
  // other than what it appears to.
  disambiguate: (n, answered) => {
    const opts = num(n, /^(\d+) continuation/);
    const many = opts === null ? "Several" : String(opts);
    return answered
      ? `${many} different continuations could have followed here. It kept the one that the most stored notes support, rather than the first one it found.`
      : `${many} different continuations could have followed here, but none of them held up under the checks that came after.`;
  },
  decideGrounding: () =>
    "Every route to an answer was scored on one and the same scale, and the one that took the fewest leaps won.",
  narrowDecision: (n) =>
    num(n, /margin (\d+)/) === 0
      ? "The winner beat its rival by nothing at all — one more trained note could flip this answer."
      : "The winning route beat its rivals by a clear margin.",
  // These three are in ALWAYS_SHOWN, so they appear even when nothing was
  // grounded — and "it gave the answer back" in front of an empty reply is the
  // one sentence in this panel that would be flatly untrue.
  articulate: (_n, answered) =>
    answered
      ? "The stored note was written in someone else's words. This matches it to yours."
      : "There was no answer to reword.",
  respond: (_n, answered) =>
    answered
      ? "The finished answer, handed back to you."
      : "It had nothing it could stand behind, so it returned nothing.",
  respondTurn: (_n, answered) => DID.respond(_n, answered),
};

/** The stored note an answer actually rests on — one trained pair, shown
 *  verbatim. This is the most legible evidence there is: not a description of
 *  the reasoning, but the thing the reasoning used. */
export interface Evidence {
  context: string;
  continuation: string;
  contextId: number;
  continuationId: number;
}

/** Other stored contexts that lead to the very same answer. A high count is
 *  the plainest possible statement of "this is not a fluke". */
export interface Corroboration {
  total: number;
  samples: string[];
}

export interface Explanation {
  question: string;
  answer: string;
  /** How Sema grounded the answer, e.g. "recall-echo". */
  provenance: string | null;
  /** One plain sentence naming what actually happened. */
  headline: string;
  /** The trained note the answer rests on, when one can be pinpointed. */
  evidence: Evidence | null;
  corroboration: Corroboration | null;
  stages: Array<Stage & { steps: ExplainedStep[] }>;
  /** Lines of reasoning Sema considered and rejected. */
  considered: ExplainedStep[];
  /** Set when the winning answer only narrowly beat its rival. */
  closeCall: string | null;
  stepCount: number;
}

/** Internal handles a rationale item may carry — node labels like `cover@0`,
 *  the placeholder `‹none›`, bare operator names.  They mean nothing to a
 *  reader, and showing them as evidence is worse than showing nothing. */
function isInternal(text: string): boolean {
  return /^[a-z][\w-]*@\d+$/i.test(text) ||
    /^[‹<].*[›>]$/.test(text) ||
    // Span offsets — a coordinate, not a piece of your question. Sema writes
    // them half-open, "[0,4)", so the closing bracket is not always a bracket.
    /^[[(][\d,\s]+[\])]$/.test(text) ||
    // A span cut at a byte boundary mid-character decodes to U+FFFD. On this
    // mostly non-Latin corpus that yields chips of pure replacement characters,
    // which look like a rendering bug rather than evidence.
    /�/.test(text) ||
    text.length < 3;
}

/** Rationale items carry a scoring annotation ("… (df-w 11.31)"). The number is
 *  the weight the span was given, which the prose above the chips already
 *  explains — inside the chip it just reads as noise. */
function clean(text: string): string {
  return text.replace(/\s*\((?:df-w|cost|vote)\s+[\d.]+\)\s*$/i, "").trim();
}

function itemsOf(items: readonly { text: string }[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    const text = clean(it.text ?? "");
    if (!text || seen.has(text) || isInternal(text)) continue;
    seen.add(text);
    out.push(text);
  }
  // Spans are reported at several granularities, so the same evidence shows up
  // both whole and as a mid-word fragment ("icasso" beside "Pablo Picasso").
  // Only the longest form of any overlapping pair says anything.
  const kept = out.filter((t) =>
    !out.some((other) => other !== t && other.includes(t))
  );
  return kept.slice(0, 4);
}

/** The mechanisms that actually carry an answer across, in the order we prefer
 *  to believe them. The first one present names what happened. */
const DECISIVE: Array<[string, string]> = [
  ["evalComputation", "worked the arithmetic out exactly"],
  // Before `follow-edge`: when a join fired it is what carried the answer
  // across (it derived a second fact through the subject the first one
  // contains), while `follow-edge` only carried the intermediate.  Ordered
  // after it, the panel reported the FIRST hop's note as the answer's
  // evidence.  Sema names the move `derive-through` (added in 0.7.7).
  ["derive-through", "derived the answer through a fact it already held"],
  ["follow-edge", "followed a connection it had been taught"],
  ["castSchema", "applied a pattern it had learnt from examples"],
  ["projectCounterfactual", "substituted into a pattern it had learnt"],
  ["extractBySkill", "lifted the answer out the way its examples do"],
  ["substitutionBridge", "swapped in something it knows to be equivalent"],
  ["crossRegion", "joined two parts of your question together"],
  ["prefixCompletion", "completed a phrasing it had seen open that way"],
  ["recallByResonance", "recalled the closest thing it holds"],
];

/** Pull the one trained note the answer rests on out of the rationale, and
 *  count how many other stored notes reach the same place.
 *
 *  The rationale tags items with the graph node they resolved to, so this is a
 *  lookup rather than a guess: find the step that carried the answer across,
 *  take the node on each side, and read the pair straight out of the store. */
function evidenceFrom(
  mind: Mind,
  steps: RationaleStep[],
): { evidence: Evidence | null; corroboration: Corroboration | null } {
  // Not every id a rationale item carries is a real stored node — internal
  // placeholders come through negative, and reading one back yields a single
  // replacement character presented as if it were a trained note.
  const real = (id: unknown): id is number =>
    typeof id === "number" && id >= 0 && mind.store.has(id);
  const nodeOf = (items: readonly { node?: number }[]) =>
    items.find((i) => real(i.node))?.node;

  let contextId: number | undefined;
  let answerId: number | undefined;

  // Prefer the step that moved the answer; fall back to whatever grounded it.
  for (const name of [...DECISIVE.map(([m]) => m), "ground", "recognise"]) {
    const step = steps.findLast((s) => s.mechanism.at(-1) === name);
    if (!step) continue;
    const from = nodeOf(step.inputs);
    const to = nodeOf(step.outputs);
    // A useful pair needs two DIFFERENT nodes joined by a learnt edge.
    if (from !== undefined && to !== undefined && from !== to) {
      contextId = from;
      answerId = to;
      break;
    }
    if (from !== undefined && mind.store.hasNext(from)) {
      contextId = from;
      answerId = mind.store.nextFirst(from, 1)[0];
      break;
    }
  }

  if (contextId === undefined || answerId === undefined) {
    return { evidence: null, corroboration: null };
  }

  const context = renderNode(mind, contextId);
  const continuation = renderNode(mind, answerId);
  if (!context || !continuation) {
    return { evidence: null, corroboration: null };
  }

  // How many other stored contexts lead to this same answer — one indexed
  // count, and a few examples to make the number concrete.
  const total = mind.store.prevCount(answerId);
  const samples = mind.store.prevFirst(answerId, 6)
    .filter((id) => id !== contextId)
    .map((id) => renderNode(mind, id, 120))
    .filter((t) => t.length > 0)
    .slice(0, 3);

  return {
    evidence: { context, continuation, contextId, continuationId: answerId },
    corroboration: total > 1 ? { total, samples } : null,
  };
}

function explain(
  mind: Mind,
  question: string,
  answer: string,
  provenance: string | null,
  steps: RationaleStep[],
): Explanation {
  const byStage = new Map<string, ExplainedStep[]>(
    STAGES.map((s) => [s.key, []]),
  );
  const considered: ExplainedStep[] = [];
  let closeCall: string | null = null;

  for (const step of steps) {
    const mechanism = step.mechanism.at(-1) ?? "";
    const known = MECHANISMS[mechanism];
    if (!known) continue;

    const note = step.note ?? "";
    if (mechanism === "narrowDecision" && note) closeCall = note;

    // A decline names the mechanism it declined in the note's first word, so the
    // label can say WHICH approach was ruled out — otherwise two declines in one
    // list both read "Ruled out before trying" and nothing tells them apart.
    const declined = mechanism === "skipMechanism"
      ? (/^(\w+)/.exec(note)?.[1]?.toLowerCase() ?? "")
      : "";

    const entry: ExplainedStep = {
      label: SKIPPED[declined]
        ? known.label + ": " + SKIPPED[declined].what
        : known.label,
      note,
      mechanism,
      inputs: itemsOf(step.inputs),
      outputs: itemsOf(step.outputs),
      repeat: 1,
    };

    if (abstained(mechanism, note) && !ALWAYS_SHOWN.has(mechanism)) {
      entry.plain = whyEmpty(mechanism, note);
      considered.push(entry);
    } else {
      entry.plain = DID[mechanism]?.(note, Boolean(answer));
      byStage.get(known.stage)!.push(entry);
    }
  }

  // One mechanism often fires many times over different spans of the query.
  // Listing all of them buries the story, so each mechanism appears once per
  // stage — keeping its first note — with a count of how often it ran.
  for (const [key, list] of byStage) {
    const merged = new Map<string, ExplainedStep>();
    for (const step of list) {
      const seen = merged.get(step.mechanism);
      if (seen) seen.repeat++;
      else merged.set(step.mechanism, { ...step, repeat: 1 });
    }
    byStage.set(key, [...merged.values()]);
  }

  const { evidence, corroboration } = answer
    ? evidenceFrom(mind, steps)
    : { evidence: null, corroboration: null };

  // Name what happened in one sentence, using the mechanism that carried the
  // answer rather than a generic summary.
  const move = DECISIVE.find(([m]) =>
    steps.some((s) => s.mechanism.at(-1) === m && !abstained(m, s.note ?? ""))
  );
  const headline = !answer
    ? "Nothing it holds supported an answer, so it said nothing."
    : provenance === "recall-echo"
    ? "It returned the closest stored wording it has, rather than deriving an answer."
    : move
    ? `It ${move[1]}.`
    : "It composed the answer from the notes it holds.";

  return {
    question,
    answer,
    provenance,
    headline,
    evidence,
    corroboration,
    stages: STAGES.map((s) => ({ ...s, steps: byStage.get(s.key)! }))
      .filter((s) => s.steps.length > 0),
    // One mechanism can decline for genuinely different reasons — `skipMechanism`
    // reports several distinct ones — so dedupe on the reading, not the key.
    considered: [
      ...new Map(
        considered.map((s) => [s.mechanism + "|" + (s.plain ?? s.note), s]),
      ).values(),
    ].slice(0, 12),
    closeCall,
    stepCount: steps.length,
  };
}

export interface Reply {
  answer: string;
  explanation: Explanation;
}

/** Holds the Mind and serialises access to it.
 *
 *  Sema's own docs are explicit that two concurrent `respondTurn` calls on the
 *  SAME Mind interleave their per-response state, so every request goes
 *  through one promise chain. */
export class SemaService {
  #mind: Mind | null = null;
  #conversations = new Map<string, Conversation>();
  #queue: Promise<unknown> = Promise.resolve();

  /** Open the trained store at `stem` — the path SQliteStore appends
   *  `.sqlite` / `.content.vec` / `.halo.vec` to. */
  open(stem: string): Mind {
    if (!this.#mind) {
      this.#mind = new Mind({ store: new SQliteStore({ path: stem }) });
    }
    return this.#mind;
  }

  /** Run `fn` on the Mind with the same serialisation chat uses, so a search
   *  can never interleave with an inference in flight. */
  run<T>(fn: (mind: Mind) => Promise<T>): Promise<T> {
    return this.#serial(() => {
      if (!this.#mind) throw new Error("The trained memory is not open yet.");
      return fn(this.#mind);
    });
  }

  async close(): Promise<void> {
    await this.#mind?.store.close();
    this.#mind = null;
  }

  /** Run `fn` once every earlier request has finished. */
  #serial<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.#queue.then(fn, fn);
    // Keep the chain alive even if this request rejects.
    this.#queue = run.catch(() => {});
    return run;
  }

  /** Drop a session's conversation, releasing its accumulated context. */
  end(sessionId: string): void {
    const conv = this.#conversations.get(sessionId);
    if (conv && this.#mind) this.#mind.endConversation(conv);
    this.#conversations.delete(sessionId);
  }

  /** Answer one turn of a multi-turn conversation. */
  ask(sessionId: string, message: string): Promise<Reply> {
    return this.#serial(async () => {
      const mind = this.#mind;
      if (!mind) throw new Error("The trained memory is not open yet.");

      let conv = this.#conversations.get(sessionId);
      if (!conv) {
        conv = mind.beginConversation();
        this.#conversations.set(sessionId, conv);
      }

      const steps: RationaleStep[] = [];
      // The byte-level entry point rather than `respondTurnText`, because the
      // text view drops `provenance` — and provenance is what tells us whether
      // the reply is a grounded fact or a last-resort echo of a stored form.
      const { response } = await mind.respondTurn(
        conv,
        message,
        (step) => steps.push(step),
      );

      // NUL bytes are structural padding in a text answer, exactly as
      // `respondText` documents.
      const answer = new TextDecoder()
        .decode(response.bytes.filter((b) => b !== 0))
        .trim();
      const provenance = response.provenance ?? null;
      return {
        answer,
        explanation: explain(mind, message, answer, provenance, steps),
      };
    });
  }
}
