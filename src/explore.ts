// explore.ts — read the trained memory back out of the DAG.
//
// A trained experience pair IS one continuation edge: `src` is the context that
// was deposited, `dst` is what Sema learnt follows it.  Reading them back uses
// the store's own structure and its own indexes — no auxiliary index is built,
// and nothing here writes to the store.
//
// HOW THE SEARCH WORKS.  It is the same move `recognise()` makes:
//
//   1. PERCEIVE the query into a content-defined tree.  Segmentation is
//      deterministic — identical bytes always cut identically — so the chunks
//      a query produces are the chunks training produced for the same text.
//   2. CONTENT-ADDRESS those chunks bottom-up: a leaf through `findLeaf`, a
//      branch through `findBranch` over its resolved kid ids.  Both are point
//      probes on `idx_node_h`, the store's content-address index.  A node that
//      comes back is literally the node training interned.
//   3. CLIMB the structural `kid` table from each resolved node to the
//      edge-bearing contexts above it (`edgeAncestors`), and read the
//      continuation off the `edge` table (`nextFirst`).
//
// Cost is set by how much of the QUERY resolves, never by the size of the
// store, and every stage is explicitly bounded below.
//
// WHAT THIS IS NOT.  It is exact content addressing, not fuzzy keyword search:
// a query shares results with a stored note when it shares actual chunk-aligned
// content with it.  An arbitrary mid-word fragment resolves to nothing, and the
// honest answer there is "nothing matched" — plus browsing, which is why
// `sample()` exists.

import type { Mind, Sema } from "@hviana/sema";

/** Bytes of each side rendered into a preview. */
const PREVIEW_BYTES = 220;

/** Hard ceiling on results per request. */
const MAX_LIMIT = 24;

/** A resolved node must account for at least this many bytes to vote: single
 *  characters resolve against almost any store and mean nothing. */
const MIN_MATCH_BYTES = 4;

/** Resolved nodes we climb from, largest first. */
const MAX_CLIMBS = 24;

/** Edge-bearing contexts requested per climb. */
const CONTEXTS_PER_CLIMB = 6;

/** Probes used to stride-sample the id space when browsing. */
const SAMPLE_PROBES = 6000;

export interface Pair {
  context: string;
  continuation: string;
  contextTruncated: boolean;
  continuationTruncated: boolean;
  contextId: number;
  continuationId: number;
  /** Bytes of the query this pair was matched on — 0 when browsing. */
  matchedBytes: number;
}

export interface ExploreResult {
  query: string;
  pairs: Pair[];
  /** Subtrees of the query that content-addressed to a real stored node. */
  resolved: number;
  /** Distinct edge-bearing contexts the climb reached. */
  reached: number;
  tookMs: number;
  /** Distinct contexts that carry a learnt continuation, store-wide. */
  totalContexts: number;
  /** True when these are browse samples rather than search results. */
  browsed: boolean;
  note?: string;
}

const dec = new TextDecoder();
const enc = new TextEncoder();

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
    .replace(/�+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return [text, truncated];
}

/** Reads the trained store as data — never writes, never trains. */
export class ExploreService {
  #mind: Mind | null = null;

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

  /** Turn a context node into a presentable pair, or null when it holds no
   *  continuation or renders empty. */
  #pair(mind: Mind, id: number, matchedBytes: number): Pair | null {
    const outs = mind.store.nextFirst(id, 1);
    if (outs.length === 0) return null;
    const [context, contextTruncated] = render(mind, id, PREVIEW_BYTES);
    const [continuation, continuationTruncated] = render(
      mind,
      outs[0],
      PREVIEW_BYTES,
    );
    if (!context || !continuation) return null;
    return {
      context,
      continuation,
      contextTruncated,
      continuationTruncated,
      contextId: id,
      continuationId: outs[0],
      matchedBytes,
    };
  }

  /** Content-address the query's chunks and climb to the contexts above them. */
  search(query: string, limit: number): ExploreResult {
    const mind = this.#require();
    const started = performance.now();
    const want = Math.max(1, Math.min(limit || 8, MAX_LIMIT));
    const store = mind.store;

    const tree = mind.perceive(enc.encode(query));

    // Resolve bottom-up. A branch can only be addressed once every kid is,
    // which is exactly how the store interned it.
    const resolvedIds = new Set<number>();
    const resolve = (n: Sema): number | null => {
      if (n.leaf) {
        const id = store.findLeaf(n.leaf);
        if (id !== null) resolvedIds.add(id);
        return id;
      }
      const kids: number[] = [];
      for (const kid of n.kids ?? []) {
        const got = resolve(kid);
        if (got === null) return null;
        kids.push(got);
      }
      const id = store.findBranch(kids);
      if (id !== null) resolvedIds.add(id);
      return id;
    };
    resolve(tree);

    // Climb from the biggest matches first: a whole clause is evidence, a
    // single character is noise.
    const byLength = [...resolvedIds]
      .map((id) => [id, store.contentLen(id, 512)] as const)
      .filter(([, len]) => len >= MIN_MATCH_BYTES)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CLIMBS);

    // Weight each context by how much query content reached it.
    const weight = new Map<number, number>();
    for (const [id, len] of byLength) {
      for (const root of mind.edgeAncestors(id, CONTEXTS_PER_CLIMB).roots) {
        weight.set(root, (weight.get(root) ?? 0) + len);
      }
    }

    const pairs: Pair[] = [];
    for (const [id, w] of [...weight.entries()].sort((a, b) => b[1] - a[1])) {
      if (pairs.length >= want) break;
      const pair = this.#pair(mind, id, w);
      if (pair) pairs.push(pair);
    }

    const tookMs = Math.round(performance.now() - started);
    return {
      query,
      pairs,
      resolved: byLength.length,
      reached: weight.size,
      tookMs,
      totalContexts: store.edgeSourceCount(),
      browsed: false,
      note: pairs.length > 0
        ? undefined
        : weight.size === 0
        ? "No trained note sits above the parts of that text Sema recognised. It addresses content exactly, so try wording closer to something it was actually given — or browse the examples below."
        : "That text reaches stored nodes, but none of them carries a learnt continuation.",
    };
  }

  /** Browse real pairs from the store, striding the id space so the sample is
   *  spread rather than one local cluster. */
  sample(limit: number): ExploreResult {
    const mind = this.#require();
    const started = performance.now();
    const want = Math.max(1, Math.min(limit || 6, MAX_LIMIT));
    const store = mind.store;
    const total = store.nodeCount();

    const pairs: Pair[] = [];
    // A different offset each call, so browsing twice shows different notes.
    const jitter = Math.random();
    for (let i = 0; i < SAMPLE_PROBES && pairs.length < want; i++) {
      const id = Math.floor(((i / SAMPLE_PROBES + jitter) % 1) * total);
      if (!store.has(id) || !store.hasNext(id)) continue;
      if (store.contentLen(id, 40) < 12) continue;
      const pair = this.#pair(mind, id, 0);
      if (pair) pairs.push(pair);
    }

    return {
      query: "",
      pairs,
      resolved: 0,
      reached: pairs.length,
      tookMs: Math.round(performance.now() - started),
      totalContexts: store.edgeSourceCount(),
      browsed: true,
    };
  }
}
