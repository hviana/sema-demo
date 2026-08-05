// server.ts — a self-contained Sema demo.
//
// On startup it makes sure the trained memory is on disk (downloading it with
// live progress if not), opens it, and serves a single-page chat UI that can
// explain every answer it gives.
//
//   deno task start          run from source
//   deno task compile:all    build binaries for every supported platform

import { DataBootstrap, dataDir } from "./src/data.ts";
import { SemaService } from "./src/mind.ts";
import { ExploreService } from "./src/explore.ts";
import { HTML } from "./src/ui.ts";

const PORT = Number(Deno.env.get("PORT") ?? 8000);
const HOST = Deno.env.get("HOST") ?? "127.0.0.1";

const boot = new DataBootstrap();
const sema = new SemaService();
const explore = new ExploreService();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Live bootstrap progress as Server-Sent Events. */
function events(): Response {
  let off = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      off = boot.subscribe((status) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(status)}\n\n`));
        } catch {
          off();
        }
      });
    },
    cancel() {
      off();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
    },
  });
}

async function handleRequest(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (
    req.method === "GET" && (pathname === "/" || pathname === "/index.html")
  ) {
    return new Response(HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (req.method === "GET" && pathname === "/api/status") {
    return json(boot.status);
  }

  if (req.method === "GET" && pathname === "/api/events") {
    return events();
  }

  // Retry a failed bootstrap from the browser, resuming where it stopped.
  if (req.method === "POST" && pathname === "/api/retry") {
    boot.retry().catch(() => {}); // reported through the status stream
    return json({ ok: true });
  }

  // Start a fresh conversation: Sema carries the whole thread as context, so
  // a clean slate is sometimes exactly what you want.
  if (req.method === "POST" && pathname === "/api/reset") {
    const { session } = await req.json().catch(() => ({ session: "default" }));
    sema.end(session ?? "default");
    return json({ ok: true });
  }

  // Search the trained memory itself: which experience pairs does it hold?
  if (req.method === "GET" && pathname === "/api/explore") {
    if (boot.status.phase !== "ready") {
      return json(
        { error: "The trained memory is still being prepared." },
        503,
      );
    }
    const params = new URL(req.url).searchParams;
    const q = (params.get("q") ?? "").trim();
    const limit = Number(params.get("limit") ?? 8);

    try {
      // Through the Mind's own queue: perceive and the DAG climb must not
      // interleave with an inference in flight.  An empty query browses.
      const result = await sema.run(() =>
        Promise.resolve(q ? explore.search(q, limit) : explore.sample(limit))
      );
      return json(result);
    } catch (err) {
      console.error("explore failed:", err);
      return json({
        error: err instanceof Error ? err.message : String(err),
      }, 500);
    }
  }

  if (req.method === "POST" && pathname === "/api/chat") {
    if (boot.status.phase !== "ready") {
      return json(
        { error: "The trained memory is still being prepared." },
        503,
      );
    }
    let body: { session?: string; message?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Malformed request body." }, 400);
    }

    const message = (body.message ?? "").trim();
    const session = body.session ?? "default";
    if (!message) return json({ error: "Empty message." }, 400);

    try {
      const reply = await sema.ask(session, message);
      return json(reply);
    } catch (err) {
      console.error("chat failed:", err);
      return json({
        error: err instanceof Error ? err.message : String(err),
      }, 500);
    }
  }

  return new Response("Not found", { status: 404 });
}

// ── Start ────────────────────────────────────────────────────────────────
// The server comes up FIRST, so the browser can watch the download happen
// instead of staring at a dead port for the length of a 3 GB transfer.

const url = `http://${HOST}:${PORT}/`;

/** ANSI styling, dropped when the output is not a terminal (piped to a file,
 *  run as a service) so logs stay clean. */
const tty = Deno.stdout.isTerminal();
const s = (code: string, text: string) =>
  tty ? `\x1b[${code}m${text}\x1b[0m` : text;
const bold = (t: string) => s("1", t);
const dim = (t: string) => s("2", t);
const accent = (t: string) => s("38;5;173", t);

/** A dim, fixed-width label so every startup line shares one value column. */
const label = (t: string) => dim(t.padEnd(16));

function banner() {
  const width = 58;
  const line = "─".repeat(width);
  // Pad on the PLAIN text, then style: escape codes have no display width, so
  // padding a styled string would push the right border out of true.
  const title = "  SEMA · a mind without weights".padEnd(width)
    .replace("SEMA", bold("SEMA"))
    .replace("· a mind without weights", dim("· a mind without weights"));
  console.log(`
  ${dim("┌" + line + "┐")}
  ${dim("│")}${title}${dim("│")}
  ${dim("└" + line + "┘")}

  ${bold("Open this in your browser:")}

      ${accent(url)}

  ${label("Data directory")}${dataDir()}
  ${label("Stop the server")}Ctrl+C
`);
}

// `onListen` replaces Deno's own "Listening on …" line, so the address is
// announced exactly once, by us.
const server = Deno.serve(
  { port: PORT, hostname: HOST, onListen: banner },
  handleRequest,
);

// Progress belongs in the browser, which shows it live and in detail. The
// terminal only says where to watch it, once.
let announcedDownload = false;
boot.subscribe((st) => {
  if (st.phase !== "downloading" || announcedDownload) return;
  announcedDownload = true;
  console.log(
    `  ${label("Trained memory")}downloading — follow the progress at ${
      accent(url)
    }`,
  );
});

boot.ensure(async (stem) => {
  console.log(`  ${label("Trained memory")}validated`);
  console.log(`  ${label("Opening store")}${stem}`);
  explore.attach(sema.open(stem));
  console.log(
    `  ${label("Learnt contexts")}${explore.totalContexts().toLocaleString()}`,
  );
})
  .then(() =>
    console.log(`\n  ${accent("●")} ${bold("Ready")} — open ${accent(url)}\n`)
  )
  .catch((err) => {
    console.error(`\n  ${bold("Could not prepare the trained memory")}`);
    console.error(`  ${err.message}`);
    console.error(
      `  ${dim("Restart to resume the download where it stopped.")}\n`,
    );
  });

const shutdown = async () => {
  await sema.close();
  await server.shutdown();
  Deno.exit(0);
};
Deno.addSignalListener("SIGINT", shutdown);
if (Deno.build.os !== "windows") Deno.addSignalListener("SIGTERM", shutdown);
