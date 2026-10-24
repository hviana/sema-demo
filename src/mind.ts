// mind.ts — the Sema engine: one Mind over the trained store, one conversation
// per browser session, and the hand-off of each inference's rationale to
// `explain.ts`, which turns it into the structure the panel draws.
//
// This file OWNS the inference and nothing else. The reading of the rationale
// lives next door on purpose: what the engine did and what we say about it are
// two different jobs, and keeping them apart is what stops the explanation from
// quietly becoming a second opinion about the answer.

import { Mind, SQliteStore } from "@hviana/sema";
import type { RationaleStep } from "@hviana/sema";
import { buildExplanation } from "./explain.ts";
import type { Explanation } from "./explain.ts";

export type { Explanation } from "./explain.ts";

/** The package exports `Mind` but not the opaque conversation handle its
 *  conversation methods pass around, so name it from the method itself. */
type Conversation = ReturnType<Mind["beginConversation"]>;

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
      const t0 = performance.now();
      // The byte-level entry point rather than `respondTurnText`, because the
      // text view drops `provenance` — and provenance is what tells us whether
      // the reply is a grounded fact or a last-resort echo of a stored form.
      const { response } = await mind.respondTurn(
        conv,
        message,
        (step) => steps.push(step),
      );
      const tookMs = Math.round(performance.now() - t0);

      // NUL bytes are structural padding in a text answer, exactly as
      // `respondText` documents.
      const answer = new TextDecoder()
        .decode(response.bytes.filter((b) => b !== 0))
        .trim();
      const provenance = response.provenance ?? null;
      return {
        answer,
        explanation: buildExplanation(
          mind,
          message,
          answer,
          provenance,
          steps,
          tookMs,
        ),
      };
    });
  }
}
