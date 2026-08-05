// data.ts — discover, validate and download the trained Sema memory.
//
// Nothing about the trained store is hardcoded here: not the file names, not
// their sizes, not how many there are.  The bucket's own listing is the source
// of truth, and what we fetched is recorded in a local manifest so a later
// startup can tell "complete and current" from "stale" or "half-downloaded".
//
// The store itself is three sibling files that SQliteStore derives from a
// single STEM path (see store-sqlite.ts): `<stem>.sqlite` holds the
// content-addressed DAG, `<stem>.content.vec` the node gists, and
// `<stem>.halo.vec` the distributional halo index.  The stem is discovered
// from whichever `.sqlite` file the bucket publishes.

/** The bucket publishing the pre-trained memory. */
const REPO = "hviana/sema-trained-v1";
const BUCKET = `https://huggingface.co/buckets/${REPO}`;
const TREE = `https://huggingface.co/api/buckets/${REPO}/tree`;

/** The manifest recording what we downloaded, so the next start can validate
 *  it without re-reading three gigabytes. */
const MANIFEST = "manifest.json";

/** One file as the bucket describes it. */
interface RemoteFile {
  name: string;
  size: number;
  /** Content hash published by the bucket — changes whenever the file does. */
  hash: string;
}

interface ManifestEntry {
  size: number;
  hash: string;
  /** False while a download is still in flight, so a partial file is never
   *  mistaken for a finished one. */
  complete: boolean;
}

type Manifest = Record<string, ManifestEntry>;

export interface FileProgress {
  name: string;
  /** Bytes present on disk. */
  have: number;
  /** Bytes the complete file should have. */
  total: number;
  done: boolean;
  /** Why this file needs fetching — surfaced so a re-download is explicable
   *  rather than mysterious. */
  reason?: "missing" | "incomplete" | "changed-upstream" | "unverified";
}

export type Phase = "checking" | "downloading" | "opening" | "ready" | "error";

export interface BootstrapStatus {
  phase: Phase;
  files: FileProgress[];
  have: number;
  total: number;
  bytesPerSecond: number | null;
  etaSeconds: number | null;
  message: string;
  error?: string;
}

/** Where the trained memory lives: next to the executable for a compiled
 *  binary, and in `./data` when running from source (where `Deno.execPath()`
 *  is the `deno` binary itself, not this app). */
export function dataDir(): string {
  const override = Deno.env.get("SEMA_DATA_DIR");
  if (override) return override;

  const exe = Deno.execPath();
  const base = exe.split(/[\\/]/).pop() ?? "";
  if (/^deno(\.exe)?$/i.test(base)) return `${Deno.cwd()}/data`;
  return exe.slice(0, exe.length - base.length - 1) || ".";
}

async function sizeOf(path: string): Promise<number> {
  try {
    const st = await Deno.stat(path);
    return st.isFile ? st.size : 0;
  } catch {
    return 0;
  }
}

/** Ask the bucket what it currently publishes.  Throws when unreachable — the
 *  caller decides whether the local manifest is enough to proceed offline. */
async function listRemote(): Promise<RemoteFile[]> {
  const res = await fetch(TREE, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    throw new Error(`Bucket listing failed: HTTP ${res.status}`);
  }
  const tree = await res.json() as Array<
    { type?: string; path?: string; size?: number; xetHash?: string }
  >;
  if (!Array.isArray(tree)) throw new Error("Bucket listing was not a list.");

  const files: RemoteFile[] = [];
  for (const e of tree) {
    if (e.type && e.type !== "file") continue;
    if (typeof e.path !== "string" || typeof e.size !== "number") continue;
    // A file with no published hash still validates by size; using the size as
    // the fallback identity keeps the comparison total.
    files.push({
      name: e.path,
      size: e.size,
      hash: e.xetHash ?? `size:${e.size}`,
    });
  }
  if (files.length === 0) throw new Error("The bucket listed no files.");
  return files;
}

/** The stem SQliteStore should open, given a set of file names.  Derived from
 *  whichever `.sqlite` file is present rather than assumed to be "sema". */
function stemFrom(names: string[]): string {
  const db = names.find((n) => n.endsWith(".sqlite"));
  if (!db) {
    throw new Error(
      "No .sqlite file was published, so the store's stem cannot be determined.",
    );
  }
  return db.slice(0, -".sqlite".length);
}

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await Deno.readTextFile(`${dataDir()}/${MANIFEST}`));
  } catch {
    return {};
  }
}

async function writeManifest(m: Manifest): Promise<void> {
  await Deno.writeTextFile(
    `${dataDir()}/${MANIFEST}`,
    JSON.stringify(m, null, 2),
  );
}

/** Tracks the bootstrap so the HTTP layer can report it live. */
export class DataBootstrap {
  #status: BootstrapStatus = {
    phase: "checking",
    files: [],
    have: 0,
    total: 0,
    bytesPerSecond: null,
    etaSeconds: null,
    message: "Checking the local data directory…",
  };
  #listeners = new Set<(s: BootstrapStatus) => void>();
  #ready: Promise<void> | null = null;
  #manifest: Manifest = {};
  #andOpen: ((stem: string) => Promise<void>) | undefined;

  /** The stem to hand SQliteStore, known once checking has run. */
  stem = "";

  get status(): BootstrapStatus {
    return this.#status;
  }

  subscribe(fn: (s: BootstrapStatus) => void): () => void {
    this.#listeners.add(fn);
    fn(this.#status);
    return () => this.#listeners.delete(fn);
  }

  #emit(patch: Partial<BootstrapStatus>) {
    this.#status = { ...this.#status, ...patch };
    for (const fn of this.#listeners) {
      try {
        fn(this.#status);
      } catch {
        // A dead SSE connection must never break the download.
      }
    }
  }

  /** Ensure the trained memory is present, complete and current.  Idempotent.
   *
   *  `andOpen` receives the store stem and runs once every file is validated
   *  but BEFORE the status flips to `"ready"`, so a client that unlocks on
   *  `"ready"` can never query a store that is still opening. */
  ensure(andOpen?: (stem: string) => Promise<void>): Promise<void> {
    this.#andOpen = andOpen ?? this.#andOpen;
    return this.#ready ??= this.#run(this.#andOpen);
  }

  /** Try again after a failure — the browser offers this rather than making
   *  someone restart the process. A no-op unless the last attempt failed, so a
   *  stray click can never interrupt a healthy download. */
  retry(): Promise<void> {
    if (this.#status.phase !== "error") return this.#ready ?? Promise.resolve();
    this.#ready = null;
    this.#emit({
      phase: "checking",
      error: undefined,
      message: "Retrying…",
      bytesPerSecond: null,
      etaSeconds: null,
    });
    return this.ensure();
  }

  async #run(andOpen?: (stem: string) => Promise<void>): Promise<void> {
    try {
      await Deno.mkdir(dataDir(), { recursive: true });
      this.#emit({
        phase: "checking",
        message: "Checking the local data directory…",
      });
      this.#manifest = await readManifest();

      const files = Deno.env.get("SEMA_SKIP_DOWNLOAD")
        ? await this.#planOffline(true)
        : await this.#plan();

      this.stem = `${dataDir()}/${stemFrom(files.map((f) => f.name))}`;
      this.#report(files);

      const stale = files.filter((f) => !f.done);
      if (stale.length > 0) {
        this.#emit({
          phase: "downloading",
          message: stale.some((f) => f.reason === "changed-upstream")
            ? "The published data has changed — fetching the new version…"
            : "Downloading the trained memory…",
        });
        for (const file of stale) await this.#download(file, files);
      }

      this.#emit({
        phase: "opening",
        bytesPerSecond: null,
        etaSeconds: null,
        message: "Opening the trained memory — this takes a moment…",
      });
      await andOpen?.(this.stem);

      this.#emit({ phase: "ready", message: "Sema is ready." });
    } catch (err) {
      this.#emit({
        phase: "error",
        error: err instanceof Error ? err.message : String(err),
        message: "The trained memory could not be prepared.",
      });
      throw err;
    }
  }

  /** Compare what the bucket publishes against what is on disk, and decide
   *  per file whether it is usable, resumable, or stale. */
  async #plan(): Promise<FileProgress[]> {
    let remote: RemoteFile[];
    try {
      remote = await listRemote();
    } catch (err) {
      // Unreachable bucket: a fully-validated local copy is still usable, so
      // fall back to the manifest rather than refusing to start offline.
      const offline = await this.#planOffline(false);
      if (offline.every((f) => f.done)) return offline;
      throw new Error(
        `The bucket is unreachable and the local data is incomplete. ${
          err instanceof Error ? err.message : err
        }`,
      );
    }

    const files: FileProgress[] = [];
    for (const r of remote) {
      const onDisk = await sizeOf(`${dataDir()}/${r.name}`);
      const known = this.#manifest[r.name];

      let reason: FileProgress["reason"];
      let have = onDisk;

      if (known && known.hash !== r.hash) {
        // The bucket republished this file: whatever we hold is a different
        // artefact, so resuming would splice two versions together.
        reason = "changed-upstream";
        have = 0;
      } else if (onDisk === 0) {
        reason = "missing";
      } else if (!known) {
        // Bytes with no provenance — trust them only if the size matches
        // exactly, otherwise treat them as a partial download.
        if (onDisk !== r.size) {
          reason = "unverified";
          have = 0;
        }
      } else if (!known.complete || onDisk !== r.size) {
        reason = "incomplete";
        have = Math.min(onDisk, r.size);
      }

      files.push({
        name: r.name,
        have,
        total: r.size,
        done: reason === undefined && have === r.size,
        reason,
      });

      // Record the target identity up front, so an interrupted download
      // resumes against the version it started on.
      this.#manifest[r.name] = {
        size: r.size,
        hash: r.hash,
        complete: reason === undefined && have === r.size,
      };
    }
    await writeManifest(this.#manifest);
    return files;
  }

  /** Validate purely against the local manifest — used when the bucket is
   *  unreachable, and when the download is deliberately skipped. */
  async #planOffline(skipping: boolean): Promise<FileProgress[]> {
    const names = Object.keys(this.#manifest);

    // With no manifest at all (a store trained locally, or files dropped in by
    // hand) there is nothing to validate against, so discover what is there.
    if (names.length === 0) {
      if (!skipping) return [];
      const found: FileProgress[] = [];
      for await (const entry of Deno.readDir(dataDir())) {
        if (!entry.isFile || entry.name === MANIFEST) continue;
        // SQLite's own sidecars are runtime artefacts of an open database, not
        // part of the store's published file set.
        if (/-(wal|shm|journal)$/.test(entry.name)) continue;
        const size = await sizeOf(`${dataDir()}/${entry.name}`);
        found.push({ name: entry.name, have: size, total: size, done: true });
      }
      return found;
    }

    const files: FileProgress[] = [];
    for (const name of names) {
      const known = this.#manifest[name];
      const onDisk = await sizeOf(`${dataDir()}/${name}`);
      const ok = known.complete && onDisk === known.size;
      files.push({
        name,
        have: onDisk,
        total: known.size,
        done: skipping || ok,
        reason: ok ? undefined : "incomplete",
      });
    }
    return files;
  }

  /** Recompute the aggregate counters from the per-file ones. */
  #report(files: FileProgress[], rate?: number | null) {
    const have = files.reduce((n, f) => n + f.have, 0);
    const total = files.reduce((n, f) => n + f.total, 0);
    const bytesPerSecond = rate === undefined
      ? this.#status.bytesPerSecond
      : rate;
    const etaSeconds = bytesPerSecond && bytesPerSecond > 0
      ? Math.round((total - have) / bytesPerSecond)
      : null;
    this.#emit({ files: [...files], have, total, bytesPerSecond, etaSeconds });
  }

  /** Download one file, resuming from whatever is already on disk. */
  async #download(file: FileProgress, all: FileProgress[]) {
    const target = `${dataDir()}/${file.name}`;
    const partial = file.have > 0;

    const res = await fetch(`${BUCKET}/resolve/${file.name}`, {
      headers: partial ? { Range: `bytes=${file.have}-` } : {},
    });
    if (!res.ok || !res.body) {
      throw new Error(
        `Download of ${file.name} failed: HTTP ${res.status} ${res.statusText}`,
      );
    }

    // A server that ignores our Range header sends 200 and the whole file —
    // restart from zero rather than appending a duplicate prefix.
    const resuming = partial && res.status === 206;
    if (partial && !resuming) file.have = 0;

    const out = await Deno.open(target, {
      create: true,
      write: true,
      truncate: !resuming,
    });
    if (resuming) await out.seek(file.have, Deno.SeekMode.Start);

    let sampleBytes = 0;
    let sampleAt = performance.now();
    try {
      for await (const chunk of res.body) {
        await out.write(chunk);
        file.have += chunk.byteLength;
        sampleBytes += chunk.byteLength;

        // Sample the rate about twice a second — often enough to feel live,
        // rarely enough that the SSE stream stays cheap.
        const now = performance.now();
        if (now - sampleAt >= 500) {
          this.#report(all, (sampleBytes * 1000) / (now - sampleAt));
          sampleBytes = 0;
          sampleAt = now;
        }
      }
    } finally {
      out.close();
    }

    if (file.have !== file.total) {
      throw new Error(
        `${file.name} is incomplete: got ${file.have} of ${file.total} bytes.`,
      );
    }

    file.done = true;
    file.reason = undefined;
    const entry = this.#manifest[file.name];
    if (entry) entry.complete = true;
    await writeManifest(this.#manifest);
    this.#report(all);
  }
}
