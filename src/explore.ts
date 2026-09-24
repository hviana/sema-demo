// explore.ts — read the trained memory back out of the DAG.
//
// The search itself lives in the engine, once: `searchCorpus` reads a query's
// resolved subtrees, climbs to the edge-bearing contexts above them and returns
// the pairs a caller can show.  `searchCorpusText` is its text case — encode,
// search, decode — and `sampleCorpus` browses the id space DETERMINISTICALLY
// from the caller's own offset, so browsing twice shows different notes without
// a random draw (same seed, same order, same query ⇒ the same answer).
//
// WHAT THIS FILE KEEPS.  The result the interface reads, taken from the engine's
// own fields so the two cannot drift, plus the milliseconds this demo measured.
// The browse CURSOR, which is exactly the offset the engine asks for.  And
// `renderNode`, shared with the explanation builder, which shows the same stored
// notes as the evidence behind an answer.
//
// WHAT IT NO LONGER DOES.  It used to content-address the query, climb the kid
// table and read the continuation by hand — perceive, findLeaf, findBranch,
// edgeAncestors, nextFirst — with its own limits (a minimum match size, a climb
// cap, contexts per climb, sampling probes) and its own random browse.  All of
// that is the engine's now, in one place: this file is the reader, not the search.

import type { CorpusTextPair, CorpusTextResult, Mind } from "@hviana/sema";
import { decodeText } from "@hviana/sema";

/** Bytes of each side rendered into a preview. */
const PREVIEW_BYTES = 220;

/** Hard ceiling on results per request. */
const MAX_LIMIT = 24;

/** One stored experience pair, as the interface shows it.  ALIASED to the
 *  engine's own pair rather than restated, so a field cannot drift. */
export type Pair = CorpusTextPair;

/** What a search or a browse returns: the engine's fields, plus the
 *  milliseconds this demo measured. */
export type ExploreResult = CorpusTextResult & { tookMs: number };

const dec = new TextDecoder();

/** Shared with the explanation builder, which shows the same stored notes as
 *  the evidence behind an answer. */
export function renderNode(
  mind: Mind,
  id: number,
  cap = PREVIEW_BYTES,
): string {
  return render(mind, id, cap)[0];
}

function render(mind: Mind, id: number, cap: number): [string, boolean] {
  const raw = mind.store.bytesPrefix(id, cap + 1);
  const truncated = raw.length > cap;
  const text = dec.decode(truncated ? raw.slice(0, cap) : raw)
    .replace(/\u0000/g, "")
    // Cutting at a byte boundary can split a multi-byte character, which
    // decodes to U+FFFD. Most of this corpus is non-Latin, so a trailing
    // replacement char is the common case here, not an exotic one.
    .replace(/\uFFFD+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return [text, truncated];
}

/** Reads the trained store as data — never writes, never trains. */
export class ExploreService {
  #mind: Mind | null = null;
  /** Where the next browse starts.  The engine strides from the caller's own
   *  offset, so advancing it shows different notes without a random draw. */
  #from = 0;

  attach(mind: Mind): void {
    this.#mind = mind;
  }

  totalContexts(): number {
    return this.#mind ? this.#mind.store.edgeSourceCount() : 0;
  }

  #require(): Mind {
    if (!this.#mind) throw new Error("The trained memory is not open yet.");
    return this.#mind;
  }

  #bounded(limit: number): number {
    return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit) || 1));
  }

  /** Which stored notes does this query reach? */
  search(query: string, limit: number): ExploreResult {
    const n = this.#bounded(limit);
    const t0 = performance.now();
    const out = this.#require().searchCorpusText(query, n);
    return { ...out, tookMs: Math.round(performance.now() - t0) };
  }

  /** Browse the memory, from where the last browse stopped.
   *
   *  The browse comes back in BYTES — `sampleCorpus` is the multimodal call — and
   *  the panel wants text.  The decoding is the engine's own (`decodeText`), the
   *  one the text search uses, so search and browse cannot disagree about what a
   *  stored note says.  Building the result field by field rather than spreading
   *  it is deliberate: it makes every field a decision, and `query` has an honest
   *  value here (a browse has no question). */
  sample(limit: number): ExploreResult {
    const mind = this.#require();
    const n = this.#bounded(limit);
    const t0 = performance.now();
    const out = mind.sampleCorpus(n, this.#from);
    this.#from += n;
    return {
      query: "",
      pairs: out.pairs.map((p) => ({
        context: decodeText(p.context),
        continuation: decodeText(p.continuation),
        contextId: p.contextId,
        continuationId: p.continuationId,
        matchedBytes: p.matchedBytes,
        contextTruncated: p.contextTruncated,
        continuationTruncated: p.continuationTruncated,
      })),
      resolved: out.resolved,
      reached: out.reached,
      totalContexts: out.totalContexts,
      browsed: out.browsed,
      note: out.miss === "matched" ? undefined : `browse: ${out.miss}`,
      tookMs: Math.round(performance.now() - t0),
    };
  }
}
