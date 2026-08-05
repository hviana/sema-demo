// ui.ts — the whole front end, inlined so the compiled binary is one file.

export const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sema — a mind without weights</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fbfaf8;
    --surface: #ffffff;
    --surface-2: #f5f3ef;
    --line: #e5e1d9;
    --line-soft: #efece5;
    --ink: #1c1a17;
    --ink-soft: #6d675e;
    --ink-faint: #726c61;
    --accent: #9a5b2c;
    --on-accent: #ffffff;
    --accent-soft: #f4e8dc;
    --accent-ink: #925629;
    --user: #262320;
    --ok: #3f7d52;
    --ok-ink: #376e48;
    --ok-soft: #e8efea;
    --warn: #b07d1f;
    --danger: #b3453a;
    --r: 14px;
    --shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 30px rgba(0,0,0,.05);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #131210;
      --surface: #1b1a16;
      --surface-2: #232119;
      --line: #33302a;
      --line-soft: #262420;
      --ink: #ece8e0;
      --ink-soft: #a29a8f;
      --ink-faint: #918a7d;
      --accent: #dc9c62;
      --on-accent: #131210;
      --accent-soft: #2c2218;
      --accent-ink: #dc9c62;
      --user: #ece8e0;
      --ok: #74b587;
      --ok-ink: #74b587;
      --ok-soft: #1d2a22;
      --warn: #d3aa52;
      --danger: #e0796c;
      --shadow: 0 1px 2px rgba(0,0,0,.3), 0 10px 30px rgba(0,0,0,.35);
    }
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.55 ui-sans-serif, -apple-system, "Segoe UI", Inter, Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .wrap { width: min(820px, 100%); margin: 0 auto; padding: 0 20px; }
  @media (max-width: 560px) { .wrap { padding: 0 14px; } }

  /* ---------------- header ---------------- */
  header {
    border-bottom: 1px solid var(--line); background: var(--bg);
    flex: none; z-index: 5;
  }
  .bar { display: flex; align-items: center; gap: 13px; height: 56px; }
  .mark { font-weight: 700; letter-spacing: .24em; font-size: 14px; text-transform: uppercase; }
  .mark span { color: var(--accent); }
  .tag {
    font-size: 12.5px; color: var(--ink-soft);
    border-left: 1px solid var(--line); padding-left: 13px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .spacer { margin-left: auto; }
  .status {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; color: var(--ink-soft); white-space: nowrap;
  }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); flex: none; }
  .dot.busy { background: var(--warn); animation: blink 1.3s ease-in-out infinite; }
  .dot.bad { background: var(--danger); }
  @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
  .icon-btn {
    flex: none; height: 32px; display: none; align-items: center; gap: 7px;
    padding: 0 11px;
    border: 1px solid var(--line); border-radius: 9px; background: var(--surface);
    color: var(--ink-soft); cursor: pointer; transition: .15s; margin-left: 10px;
    font: inherit; font-size: 12.5px;
  }
  .icon-btn .lab { white-space: nowrap; }
  /* The reset is the remedy for a thread that has drifted, so it carries its
     name wherever there is room for it. */
  @media (max-width: 700px) {
    .icon-btn { padding: 0; width: 32px; justify-content: center; }
    .icon-btn .lab { display: none; }
  }
  .icon-btn:hover { color: var(--accent); border-color: var(--accent); }
  .icon-btn.on { display: inline-flex; }
  @media (max-width: 620px) { .tag { display: none; } }

  /* ---------------- boot ---------------- */
  #boot { flex: 1; display: grid; place-items: center; padding: 24px 20px; overflow-y: auto; }
  .card {
    width: min(560px, 100%); background: var(--surface); border: 1px solid var(--line);
    border-radius: var(--r); box-shadow: var(--shadow); padding: 26px 26px 22px;
  }
  .card h1 { margin: 0 0 5px; font-size: 18px; font-weight: 650; letter-spacing: -.01em; }
  .card .sub { margin: 0; color: var(--ink-soft); font-size: 13.5px; }

  /* headline figure + live throughput graph */
  .figure { display: flex; align-items: flex-end; gap: 16px; margin: 22px 0 12px; }
  .pct { font-size: 34px; font-weight: 660; letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .pct small { font-size: 16px; font-weight: 550; color: var(--ink-faint); margin-left: 2px; }
  .of { flex: 1; font-size: 12.5px; color: var(--ink-soft); padding-bottom: 3px; }
  .graph { width: 128px; height: 34px; flex: none; overflow: hidden; opacity: 0; transition: opacity .4s; }
  .graph.on { opacity: 1; }
  .graph path.area { fill: color-mix(in srgb, var(--accent) 14%, transparent); }
  .graph path.line { fill: none; stroke: var(--accent); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }

  .meter { height: 8px; background: var(--surface-2); border-radius: 99px; overflow: hidden; position: relative; }
  .meter > i {
    display: block; height: 100%; width: 0%; border-radius: 99px; background: var(--accent);
    transition: width .45s cubic-bezier(.4,0,.2,1);
    /* positioned so the sheen below scopes to the FILL, not the whole track —
       without this it paints the full width and reads as 100% complete */
    position: relative; overflow: hidden;
  }
  /* a moving sheen, so a slow transfer still looks alive */
  .meter.live > i::after {
    content: ""; position: absolute; inset: 0; border-radius: 99px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
    animation: sheen 1.6s linear infinite;
  }
  @keyframes sheen { from { transform: translateX(-100%) } to { transform: translateX(100%) } }
  .meter.idle > i { width: 100% !important; opacity: .25; animation: blink 1.5s ease-in-out infinite; }

  .stats { display: flex; justify-content: space-between; gap: 12px; font-size: 12.5px; color: var(--ink-soft); margin-top: 9px; }
  .stats b { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }

  .files { margin-top: 20px; display: grid; gap: 10px; }
  .file .row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 12px; color: var(--ink-soft); }
  .file code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--ink); font-size: 11.5px; }
  .file .val { margin-left: auto; font-variant-numeric: tabular-nums; }
  .file .meter { height: 4px; }
  .file .tick { color: var(--ok); }
  .state {
    width: 13px; height: 13px; flex: none; border-radius: 50%; display: grid; place-items: center;
    border: 1.5px solid var(--line);
  }
  .state.done { border-color: var(--ok); background: var(--ok); }
  .state.done::after { content: ""; width: 4px; height: 7px; border: solid #fff; border-width: 0 1.6px 1.6px 0; transform: rotate(45deg) translate(-1px,-1px); }
  .state.active { border-color: var(--accent); border-top-color: transparent; animation: spin .7s linear infinite; }
  .why-note { margin-top: 6px; font-size: 11.5px; color: var(--accent); }

  .hint { margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: var(--ink-faint); }
  .err {
    margin-top: 16px; padding: 12px 14px; border-radius: 10px; font-size: 12.5px;
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    line-height: 1.5;
  }
  .retry {
    margin-top: 11px; background: var(--accent); color: var(--on-accent); border: 0; border-radius: 9px;
    font: inherit; font-size: 13px; font-weight: 550; padding: 8px 16px; cursor: pointer;
  }
  .retry:disabled { opacity: .5; cursor: not-allowed; }

  /* ---------------- chat ---------------- */
  #app { flex: 1; display: none; flex-direction: column; min-height: 0; }
  #app.on { display: flex; }
  #scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
  #log { padding: 8px 0 24px; }

  /* welcome state — scrolls away once the conversation starts */
  .welcome { padding: 26px 0 6px; }
  .welcome h2 { margin: 0 0 8px; font-size: 21px; font-weight: 650; letter-spacing: -.015em; }
  .welcome > p { margin: 0 0 18px; color: var(--ink-soft); font-size: 14px; max-width: 68ch; }
  .caveat {
    display: flex; gap: 11px; align-items: flex-start; font-size: 13px; line-height: 1.5;
    background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    border-radius: var(--r); padding: 13px 15px; color: var(--ink);
  }
  .caveat b { color: var(--accent-ink); }
  .caveat svg { flex: none; margin-top: 2px; color: var(--accent); }
  .try { margin: 22px 0 4px; font-size: 11px; letter-spacing: .13em; text-transform: uppercase; color: var(--ink-faint); }

  /* ---------------- training-data explorer ---------------- */
  .explorer { margin-top: 8px; }
  .ex-field {
    display: flex; gap: 8px; align-items: center; background: var(--surface);
    border: 1px solid var(--line); border-radius: 11px; padding: 8px 8px 8px 13px;
    transition: border-color .15s;
  }
  .ex-field:focus-within { border-color: var(--accent); }
  .ex-field svg { color: var(--ink-faint); flex: none; }
  #exq { flex: 1; border: 0; background: none; color: var(--ink); font: inherit; font-size: 14px; outline: none; padding: 4px 0; }
  #exgo {
    flex: none; border: 0; border-radius: 8px; background: var(--accent); color: var(--on-accent);
    font: inherit; font-size: 12.5px; font-weight: 550; padding: 6px 13px; cursor: pointer;
  }
  #exgo:disabled { opacity: .4; cursor: not-allowed; }
  .ex-meta {
    margin: 10px 2px 0; font-size: 11.5px; color: var(--ink-faint);
    min-height: 16px; display: flex; align-items: center; gap: 7px;
  }
  .spin {
    width: 11px; height: 11px; flex: none; border-radius: 50%;
    border: 1.6px solid var(--line); border-top-color: var(--accent);
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ex-list { margin-top: 9px; display: grid; gap: 8px; }
  .pair {
    background: var(--surface); border: 1px solid var(--line); border-radius: 11px;
    padding: 11px 13px; font-size: 13px; cursor: pointer; transition: .15s; text-align: left;
    font-family: inherit; color: var(--ink); width: 100%; display: block;
  }
  .pair:hover { border-color: var(--accent); background: var(--accent-soft); }
  .pair .side { display: flex; gap: 9px; align-items: baseline; }
  .pair .lbl {
    flex: none; font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--ink-faint); width: 62px; padding-top: 2px;
  }
  .pair .val { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .pair .to { color: var(--accent); }
  .pair .rule { height: 1px; background: var(--line-soft); margin: 7px 0; }
  .pair .sc {
    font-size: 10.5px; color: var(--ink-faint); margin-top: 9px;
    display: flex; align-items: center; gap: 10px;
  }
  .pair .ask {
    margin-left: auto; display: inline-flex; align-items: center; gap: 5px;
    font-size: 11.5px; font-weight: 550; color: var(--accent); white-space: nowrap;
  }
  .pair .ask-ar { display: inline-flex; transition: transform .18s; }
  .pair:hover .ask-ar, .pair:focus-visible .ask-ar { transform: translateX(3px); }
  .ex-empty { padding: 14px 2px; font-size: 13px; color: var(--ink-soft); line-height: 1.55; }
  .ex-more {
    margin-top: 9px; background: none; border: 1px solid var(--line); color: var(--ink-soft);
    font: inherit; font-size: 12.5px; padding: 6px 13px; border-radius: 99px; cursor: pointer;
    transition: .15s;
  }
  .ex-more:hover { border-color: var(--accent); color: var(--accent); }
  .ex-more:disabled { opacity: .45; cursor: not-allowed; }

  .msg { margin: 20px 0; display: flex; flex-direction: column; }
  .msg.me { align-items: flex-end; }
  /* Shrink-wrap to the text: a stretched bubble around three loading dots
     reads as a broken empty box. */
  .bubble { align-self: flex-start; max-width: 90%; padding: 11px 15px; border-radius: var(--r); white-space: pre-wrap; overflow-wrap: anywhere; }
  .me .bubble { align-self: flex-end; background: var(--user); color: var(--bg); border-bottom-right-radius: 4px; }
  .ai .bubble { background: var(--surface); border: 1px solid var(--line); border-bottom-left-radius: 4px; box-shadow: var(--shadow); }
  .ai .bubble.silent { background: none; border-style: dashed; box-shadow: none; color: var(--ink-soft); font-size: 14px; }
  .ai .bubble.err-bubble {
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    color: var(--danger);
  }
  .again {
    display: block; margin-top: 9px; background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: 12.5px; color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  .who { font-size: 10.5px; letter-spacing: .13em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 5px; }
  .dots { display: flex; gap: 5px; padding: 5px 2px; }
  .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint); animation: bob 1.2s infinite; }
  .dots i:nth-child(2) { animation-delay: .15s } .dots i:nth-child(3) { animation-delay: .3s }
  @keyframes bob { 0%,60%,100% { opacity: .25; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-3px) } }

  .why {
    align-self: flex-start; margin-top: 9px; display: inline-flex; align-items: center; gap: 7px;
    background: none; border: 1px solid var(--line); color: var(--ink-soft);
    font: inherit; font-size: 12.5px; padding: 5px 12px; border-radius: 99px; cursor: pointer; transition: .15s;
  }
  .why:hover, .why[aria-expanded="true"] { border-color: var(--accent); color: var(--accent-ink); background: var(--accent-soft); }
  .why .chev { transition: transform .2s; }
  .why[aria-expanded="true"] .chev { transform: rotate(180deg); }

  /* ---------------- explanation ---------------- */
  .explain {
    margin-top: 11px; width: 100%; background: var(--surface); border: 1px solid var(--line);
    border-radius: var(--r); box-shadow: var(--shadow); overflow: hidden;
    animation: rise .25s cubic-bezier(.4,0,.2,1);
  }
  @keyframes rise { from { opacity: 0; transform: translateY(-4px) } }
  .ex-top { padding: 15px 17px; background: var(--surface-2); border-bottom: 1px solid var(--line); }
  .ex-top h3 { margin: 0 0 4px; font-size: 13.5px; font-weight: 650; }
  .ex-top p { margin: 0; font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .tagx {
    font-size: 11px; padding: 2px 9px; border-radius: 99px; border: 1px solid var(--line);
    background: var(--surface); color: var(--ink-soft);
  }
  .tagx.warn { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 40%, transparent); }
  .techbtn {
    margin-top: 11px; background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: 12px; color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  /* The auditable layer: present in the DOM always, shown on request. */
  .explain .rej-raw, .explain .io { display: none; }
  .explain.tech .rej-raw { display: block; }
  .explain.tech .io { display: flex; }
  .legend {
    margin: 0; padding: 11px 17px 0; font-size: 11.5px; color: var(--ink-faint);
    line-height: 1.5;
  }

  /* ---- the journey: question → the note it used → the answer ---- */
  .journey { padding: 18px 17px 4px; }
  /* The journey is a sequence, so it arrives as one — each box settling after
     the one it follows from. It reads as cause and effect rather than as a
     list that happened to be stacked vertically. */
  .journey > * { animation: jstep .34s cubic-bezier(.2,.7,.3,1) backwards; }
  .journey > :nth-child(2) { animation-delay: .09s }
  .journey > :nth-child(3) { animation-delay: .18s }
  .journey > :nth-child(4) { animation-delay: .27s }
  .journey > :nth-child(5) { animation-delay: .36s }
  @keyframes jstep { from { opacity: 0; transform: translateY(7px) } }
  /* Decorative motion is dropped wholesale; the spinners and the typing dots
     are the only signal that work is in flight, so they stay — the dots lose
     their travel and pulse in place instead. */
  @media (prefers-reduced-motion: reduce) {
    .journey > *, .explain, .meter.live > i::after { animation: none; }
    .dots i { animation: blink 1.4s ease-in-out infinite; }
    * { scroll-behavior: auto !important; }
  }
  .jnode {
    border: 1px solid var(--line); border-radius: 11px; padding: 11px 13px;
    background: var(--surface-2);
  }
  .jnode.ask { background: none; }
  .jnode.out { background: none; border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
  .jlabel {
    font-size: 9.5px; letter-spacing: .13em; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: 5px; display: flex; align-items: center; gap: 7px;
  }
  .jnode.out .jlabel { color: var(--accent); }
  .jtext { font-size: 13.5px; line-height: 1.5; overflow-wrap: anywhere; }
  .jtext.quiet { color: var(--ink-soft); font-style: italic; }

  /* the connector between two nodes, carrying the move that happened */
  .jlink {
    display: flex; align-items: center; gap: 9px; padding: 7px 0 7px 15px;
    font-size: 12px; color: var(--ink-soft);
  }
  .jlink .rail { width: 1px; align-self: stretch; background: var(--line); margin-left: 1px; }
  .jlink .arrow-down { color: var(--accent); flex: none; }

  /* the trained note — the evidence, visually the centrepiece */
  .note-card {
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: 11px; overflow: hidden; background: var(--surface);
  }
  .note-card .head {
    display: flex; align-items: center; gap: 7px; padding: 8px 13px;
    background: var(--accent-soft); color: var(--accent-ink);
    font-size: 9.5px; letter-spacing: .13em; text-transform: uppercase; font-weight: 600;
  }
  .note-row { display: flex; gap: 11px; padding: 10px 13px; font-size: 13px; line-height: 1.5; }
  .note-row + .note-row { border-top: 1px solid var(--line-soft); }
  .note-row .k {
    flex: none; width: 62px; font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--ink-faint); padding-top: 3px;
  }
  .note-row .v { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .note-row.learnt .v { color: var(--ink); font-weight: 500; }
  .exact {
    display: inline-block; margin-left: 8px; font-size: 10.5px; font-weight: 500;
    color: var(--ok-ink); background: var(--ok-soft);
    border-radius: 99px; padding: 1px 8px; white-space: nowrap; vertical-align: 1px;
  }

  /* corroboration */
  .corrob { margin: 14px 17px 16px; }
  .corrob-head {
    display: flex; align-items: flex-start; gap: 9px; font-size: 12.5px; line-height: 1.5;
    color: var(--ink-soft);
  }
  .corrob-head b { color: var(--ink); font-weight: 620; }
  .corrob-head svg { flex: none; color: var(--ok); margin-top: 2px; }
  .corrob-more {
    margin-top: 8px; margin-left: 24px; background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: 12px; color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  .corrob-list { margin: 9px 0 0 24px; display: grid; gap: 5px; }
  .corrob-list div {
    font-size: 12px; color: var(--ink-soft); padding: 6px 10px; border-radius: 8px;
    background: var(--surface-2); overflow-wrap: anywhere;
  }

  .stages { padding: 4px 0; }
  details.stage { border-bottom: 1px solid var(--line-soft); }
  details.stage:last-child { border-bottom: 0; }
  details.stage > summary {
    display: flex; gap: 12px; align-items: flex-start; padding: 13px 17px;
    cursor: pointer; list-style: none; user-select: none; transition: background .12s;
  }
  details.stage > summary::-webkit-details-marker { display: none }
  details.stage > summary:hover { background: var(--surface-2); }
  .badge {
    flex: none; width: 27px; height: 27px; border-radius: 50%; background: var(--accent-soft);
    color: var(--accent); display: grid; place-items: center;
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  }
  .st-txt { flex: 1; min-width: 0; }
  .st-txt h4 { margin: 0 0 2px; font-size: 13.5px; font-weight: 620; display: flex; align-items: center; gap: 8px; }
  .st-txt p { margin: 0; font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; }
  .n { font-size: 10.5px; color: var(--ink-faint); font-weight: 500; white-space: nowrap; }
  .st-chev { flex: none; color: var(--ink-faint); margin-top: 4px; transition: transform .2s; }
  details.stage[open] .st-chev { transform: rotate(180deg); }
  .st-body { padding: 0 17px 14px 56px; }
  @media (max-width: 560px) { .st-body { padding-left: 17px; } }
  .step { border-top: 1px solid var(--line-soft); padding: 9px 0; font-size: 12.5px; }
  .step:first-child { border-top: 0; }
  .step .lab { font-weight: 600; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .step .count {
    font-weight: 500; font-size: 10.5px; color: var(--accent-ink);
    background: var(--accent-soft); border-radius: 99px; padding: 1px 7px;
  }
  .step .note { color: var(--ink-soft); margin-top: 2px; font-size: 12px; line-height: 1.5; }
  .io { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; align-items: center; }
  .chip {
    background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px;
    padding: 2px 8px; font-size: 11.5px; color: var(--ink-soft);
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .chip.out { color: var(--ink); border-color: color-mix(in srgb, var(--accent) 30%, transparent); }
  .arrow { color: var(--ink-faint); font-size: 11px; }

  details.more { border-top: 1px solid var(--line); }
  details.more > summary {
    padding: 12px 17px; cursor: pointer; font-size: 12.5px; color: var(--ink-soft);
    list-style: none; user-select: none;
  }
  details.more > summary::-webkit-details-marker { display: none }
  details.more > summary:hover { color: var(--accent); }
  details.more .inner { padding: 0 17px 15px; font-size: 12.5px; color: var(--ink-soft); }
  .rej { padding: 6px 0; border-top: 1px dashed var(--line); line-height: 1.5; }
  .rej b { color: var(--ink); font-weight: 600; display: block; }
  .rej-raw {
    margin-top: 3px; font-size: 11px; color: var(--ink-faint);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; line-height: 1.45;
  }
  .flag {
    display: flex; gap: 9px; align-items: flex-start; margin: 0 17px 15px; padding: 10px 12px;
    border-radius: 10px; font-size: 12px; line-height: 1.5;
    background: color-mix(in srgb, var(--warn) 11%, transparent);
    border: 1px solid color-mix(in srgb, var(--warn) 30%, transparent);
  }

  /* A thread carries every earlier turn into the next answer, which is why a
     long conversation can drift. That is invisible unless it is stated. */
  .thread {
    display: flex; align-items: center; gap: 10px; margin-bottom: 9px;
    font-size: 11.5px; color: var(--ink-faint); line-height: 1.4;
  }
  .thread[hidden] { display: none; }
  .thread button {
    margin-left: auto; flex: none; background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: 11.5px; color: var(--accent);
    text-decoration: underline; text-underline-offset: 3px;
  }

  /* ---------------- composer ---------------- */
  .composer { flex: none; border-top: 1px solid var(--line); background: var(--bg); padding: 12px 0 14px; }
  .field {
    display: flex; gap: 9px; align-items: flex-end; background: var(--surface);
    border: 1px solid var(--line); border-radius: var(--r); padding: 7px 7px 7px 15px; transition: border-color .15s;
  }
  .field:focus-within { border-color: var(--accent); }
  #q { flex: 1; border: 0; background: none; color: var(--ink); font: inherit; resize: none; max-height: 150px; padding: 7px 0; outline: none; }
  #send {
    flex: none; width: 36px; height: 36px; border-radius: 10px; border: 0; cursor: pointer;
    background: var(--accent); color: var(--on-accent); display: grid; place-items: center; transition: .15s;
  }
  #send:disabled { opacity: .35; cursor: not-allowed; }
  /* A consistent, visible keyboard focus ring on every control. The text
     inputs set outline:none by id, so they need to be named explicitly to
     win it back — a keyboard user must always be able to see where they are. */
  button:focus-visible, summary:focus-visible, a:focus-visible,
  #q:focus-visible, #exq:focus-visible, .pair:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  summary:focus-visible { outline-offset: -2px; border-radius: 8px; }

  .foot { text-align: center; font-size: 11px; color: var(--ink-faint); margin: 9px 0 0; }
  @media (max-width: 620px) { .foot { display: none; } }
</style>
</head>
<body>

<header>
  <div class="wrap bar">
    <div class="mark">Se<span>ma</span></div>
    <div class="tag">A mind without weights — reasoning, not sampling</div>
    <div class="spacer"></div>
    <div class="status"><span class="dot busy" id="dot"></span><span id="state">starting</span></div>
    <button class="icon-btn" id="reset" title="Start a new conversation" aria-label="Start a new conversation">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
      </svg>
      <span class="lab">New conversation</span>
    </button>
  </div>
</header>

<!-- ============ boot ============ -->
<section id="boot">
  <div class="card" role="status" aria-live="polite">
    <h1 id="boot-title">Preparing the trained memory</h1>
    <p class="sub" id="boot-sub">Checking the local data directory…</p>

    <div class="figure" id="figure" hidden>
      <div class="pct" id="pct">0<small>%</small></div>
      <div class="of" id="of"></div>
      <svg class="graph" id="graph" viewBox="0 0 128 34" preserveAspectRatio="none" aria-hidden="true">
        <path class="area" id="graph-area" d=""></path>
        <path class="line" id="graph-line" d=""></path>
      </svg>
    </div>

    <div class="meter idle" id="total-meter"><i></i></div>
    <div class="stats"><span id="stat-left">—</span><span id="stat-right"></span></div>
    <div class="files" id="files"></div>
    <div id="boot-error"></div>
    <p class="hint">
      Sema keeps its knowledge as knowledge — a graph on disk, not weights. The trained
      store is fetched once from Hugging&nbsp;Face, saved beside this application, and
      resumed automatically if the transfer is interrupted.
    </p>
  </div>
</section>

<!-- ============ chat ============ -->
<main id="app">
  <div id="scroll">
    <div class="wrap"><div id="log" aria-live="polite" aria-relevant="additions text"></div></div>
  </div>
  <div class="composer">
    <div class="wrap">
      <div class="thread" id="thread" hidden>
        <span id="thread-txt"></span>
        <button type="button" id="thread-clear">Start fresh</button>
      </div>
      <div class="field">
        <textarea id="q" rows="1" placeholder="Ask Sema something…" autocomplete="off"></textarea>
        <button id="send" title="Send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
      <p class="foot">Deterministic · auditable · CPU-only — <b>Enter</b> to send, <b>Shift+Enter</b> for a new line.</p>
    </div>
  </div>
</main>

<script>
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var session = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random()).slice(2) + Date.now();

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(paths, size, cls) {
    return '<svg class="' + (cls || '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }
  function bytes(n) {
    if (n == null) return '—';
    var u = ['B', 'KB', 'MB', 'GB'], i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return n.toFixed(i === 0 ? 0 : 1) + ' ' + u[i];
  }
  function duration(s) {
    if (s == null || !isFinite(s)) return '';
    if (s < 90) return Math.max(1, Math.round(s)) + 's';
    var m = Math.round(s / 60);
    return m < 60 ? m + ' min' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  }
  // Long stored sentences are the norm; a chip must stay one line to be scannable.
  function short(t) { return t.length > 52 ? t.slice(0, 51).trimEnd() + '…' : t; }

  // Thousands separators, fixed to the language the UI is actually written in.
  // toLocaleString() follows the browser, so a reader in pt-BR or de-DE saw
  // "325.615" — which in an English sentence reads as three hundred and
  // twenty-five point six.
  function group(n) { return Number(n).toLocaleString('en-US'); }

  /* ================= boot ================= */
  var rows = {};
  var history = [];   // recent throughput samples, for the live graph
  var HISTORY = 48;

  // Why a file is being fetched again — worth saying out loud, since a
  // re-download of something already on disk otherwise looks like a bug.
  var REASONS = {
    'changed-upstream': 'republished since you downloaded it — fetching the new version',
    'unverified': 'present but unverified, so it is being fetched again',
    'incomplete': 'resuming where the last transfer stopped'
  };

  function drawGraph(rate) {
    history.push(rate || 0);
    if (history.length > HISTORY) history.shift();
    // Below a handful of samples the line is a degenerate spike that reads as
    // a rendering fault rather than as data.
    if (history.length < 6) return;
    $('graph').classList.add('on');

    // Scale to the peak, but never let noise around a steady rate get
    // amplified into a mountain range.
    var peak = Math.max(Math.max.apply(null, history), 1);
    var w = 128, h = 34, span = w / (history.length - 1);
    var pts = history.map(function (v, i) {
      return [i * span, h - (v / peak) * (h - 4) - 2];
    });
    var d = pts.map(function (p, i) {
      return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }).join(' ');
    $('graph-line').setAttribute('d', d);
    $('graph-area').setAttribute('d',
      d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + h + ' L' + pts[0][0].toFixed(1) + ' ' + h + ' Z');
  }

  function renderBoot(s) {
    $('state').textContent = s.phase === 'opening' ? 'opening' : s.phase;
    $('dot').className = 'dot' + (s.phase === 'ready' ? '' : s.phase === 'error' ? ' bad' : ' busy');
    $('boot-sub').textContent = s.message || '';

    var meter = $('total-meter');
    var active = s.phase === 'downloading';

    if (s.total > 0 && (active || s.have > 0)) {
      var pct = (s.have / s.total) * 100;
      meter.classList.remove('idle');
      meter.classList.toggle('live', active);
      meter.firstElementChild.style.width = pct.toFixed(2) + '%';

      $('figure').hidden = false;
      $('pct').innerHTML = pct.toFixed(1) + '<small>%</small>';
      $('of').textContent = bytes(s.have) + ' of ' + bytes(s.total);

      $('stat-left').innerHTML = s.bytesPerSecond
        ? '<b>' + bytes(s.bytesPerSecond) + '/s</b>'
        : '';
      $('stat-right').textContent = s.etaSeconds != null
        ? duration(s.etaSeconds) + ' remaining'
        : '';
      if (active) drawGraph(s.bytesPerSecond);
    }

    if (active) {
      $('boot-title').textContent = 'Downloading the trained memory';
      $('boot-sub').textContent = (s.files || []).length + ' files · ' + bytes(s.total) +
        ' · resumes automatically if interrupted';
    }

    (s.files || []).forEach(function (f) {
      var r = rows[f.name];
      if (!r) {
        r = rows[f.name] = {};
        var box = el('div', 'file'), head = el('div', 'row');
        r.state = el('span', 'state');
        head.appendChild(r.state);
        head.appendChild(el('code', null, f.name));
        r.val = el('span', 'val');
        head.appendChild(r.val);
        var m = el('div', 'meter');
        r.bar = el('i'); m.appendChild(r.bar);
        r.why = el('div', 'why-note');
        box.appendChild(head); box.appendChild(m); box.appendChild(r.why);
        $('files').appendChild(box);
      }
      var running = !f.done && f.have > 0 && active;
      r.bar.style.width = (f.total > 0 ? (f.have / f.total) * 100 : 0).toFixed(2) + '%';
      r.state.className = 'state' + (f.done ? ' done' : running ? ' active' : '');
      r.val.textContent = f.done ? 'ready' : bytes(f.have) + ' / ' + bytes(f.total);
      r.val.className = 'val' + (f.done ? ' tick' : '');
      r.why.textContent = !f.done && REASONS[f.reason] ? REASONS[f.reason] : '';
    });

    var box = $('boot-error');
    if (s.phase === 'error') {
      $('boot-title').textContent = 'Could not prepare the trained memory';
      meter.classList.remove('live');
      if (!box.firstChild) {
        var e = el('div', 'err');
        e.appendChild(el('div', null, s.error || 'Unknown error.'));
        e.appendChild(el('div', null,
          'Nothing already downloaded is lost — retrying resumes where it stopped.'));
        box.appendChild(e);
        var btn = el('button', 'retry', 'Try again');
        btn.onclick = function () {
          btn.disabled = true;
          btn.textContent = 'Retrying…';
          fetch('/api/retry', { method: 'POST' }).then(function () {
            box.innerHTML = '';
          }).catch(function () {
            btn.disabled = false;
            btn.textContent = 'Try again';
          });
        };
        box.appendChild(btn);
      }
    } else if (box.firstChild) {
      box.innerHTML = '';
    }

    if (s.phase === 'ready') {
      $('boot').style.display = 'none';
      $('app').classList.add('on');
      $('reset').classList.add('on');
      welcome();
      $('q').focus();
    }
  }

  var es = new EventSource('/api/events');
  es.onmessage = function (ev) { renderBoot(JSON.parse(ev.data)); };
  es.onerror = function () {
    fetch('/api/status').then(function (r) { return r.json(); }).then(renderBoot).catch(function () {});
  };

  /* ================= welcome + training-data explorer ================= */

  function welcome() {
    var w = el('div', 'welcome');
    w.appendChild(el('h2', null, 'A mind without weights'));
    w.appendChild(el('p', null,
      'Sema answers by walking a graph of stored notes and composing a chain of reasoning — ' +
      'never by sampling from a probability distribution. Ask it something, then open ' +
      '“Why this answer?” to see every step it took.'));

    var c = el('div', 'caveat');
    c.innerHTML = svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>', 16);
    var d = el('div');
    d.appendChild(el('b', null, 'Trained on a limited set of notes. '));
    d.appendChild(document.createTextNode(
      'This is not a large language model and has no broad, open-world knowledge. ' +
      'When nothing it holds bears on your question it stays silent rather than inventing ' +
      'an answer — that silence is the point. Search below to see exactly what it holds.'));
    c.appendChild(d);
    w.appendChild(c);

    w.appendChild(el('div', 'try', 'Explore the training data'));
    var box = el('div', 'explorer');

    var f = el('div', 'ex-field');
    f.innerHTML = svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5"/>', 15);
    var input = el('input', null);
    input.id = 'exq';
    input.type = 'search';
    input.placeholder = 'Search what Sema was trained on…';
    input.autocomplete = 'off';
    var go = el('button', null, 'Search');
    go.id = 'exgo';
    f.appendChild(input);
    f.appendChild(go);
    box.appendChild(f);

    var meta = el('div', 'ex-meta');
    meta.setAttribute('aria-live', 'polite');
    meta.id = 'exmeta';
    box.appendChild(meta);
    var list = el('div', 'ex-list');
    list.id = 'exlist';
    box.appendChild(list);
    w.appendChild(box);
    log.appendChild(w);

    var shuffle = el('button', 'ex-more', 'Show me other examples');
    box.appendChild(shuffle);

    function load(q) {
      go.disabled = true;
      shuffle.disabled = true;
      meta.innerHTML = '';
      meta.appendChild(el('span', 'spin'));
      meta.appendChild(el('span', null, q
        ? 'Content-addressing the query against the graph…'
        : 'Reading notes from the store…'));
      list.innerHTML = '';
      fetch('/api/explore?limit=' + (q ? 8 : 5) + '&q=' + encodeURIComponent(q))
        .then(function (r) { return r.json().then(function (d) {
          if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status)); return d;
        }); })
        .then(function (d) { renderPairs(d, list, meta); })
        .catch(function (e) { meta.textContent = 'Search failed: ' + e.message; })
        .then(function () { go.disabled = false; shuffle.disabled = false; });
    }

    go.onclick = function () { load(input.value.trim()); };
    shuffle.onclick = function () { input.value = ''; load(''); };
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); load(input.value.trim()); }
    });

    // Open on real notes drawn from the store, so the first thing anyone sees
    // is what this memory actually contains.
    load('');
  }

  function renderPairs(d, list, meta) {
    list.innerHTML = '';
    var held = group(d.totalContexts) + ' learnt contexts in store';

    if (!d.pairs.length) {
      meta.textContent = held;
      list.appendChild(el('div', 'ex-empty', d.note ||
        'Nothing matched. Sema holds a finite set of notes.'));
      return;
    }

    meta.textContent = d.browsed
      ? 'A few real notes from this memory · ' + d.tookMs + 'ms · ' + held
      : d.pairs.length + ' matched · ' + d.resolved + ' parts of your text found in the graph · ' +
        d.tookMs + 'ms · ' + held;

    d.pairs.forEach(function (p) {
      var b = el('button', 'pair');
      var s1 = el('div', 'side');
      s1.appendChild(el('span', 'lbl', 'Given'));
      var v1 = el('span', 'val', p.context + (p.contextTruncated ? '…' : ''));
      v1.dir = 'auto';
      s1.appendChild(v1);
      b.appendChild(s1);
      b.appendChild(el('div', 'rule'));
      var s2 = el('div', 'side');
      s2.appendChild(el('span', 'lbl to', 'It learnt'));
      var v2 = el('span', 'val', p.continuation + (p.continuationTruncated ? '…' : ''));
      v2.dir = 'auto';
      s2.appendChild(v2);
      b.appendChild(s2);
      var foot = el('div', 'sc');
      foot.appendChild(el('span', null, p.matchedBytes
        ? 'matched on ' + p.matchedBytes + ' bytes of your text'
        : ''));
      // The whole card is a <button>; this makes it look like one rather than
      // relying on a grey caption to say so five times over.
      var cta = el('span', 'ask');
      cta.appendChild(document.createTextNode('Ask this'));
      var ar = el('span', 'ask-ar');
      ar.innerHTML = svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 12);
      cta.appendChild(ar);
      foot.appendChild(cta);
      b.appendChild(foot);
      b.onclick = function () { $('q').value = p.context; resize(); send(); };
      list.appendChild(b);
    });
  }

  /* ================= explanation ================= */
  var ICONS = {
    read:   '<path d="M4 5.5h16v13H4z"/><path d="M8 9.5h8M8 13.5h5"/>',
    find:   '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    reason: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.4 6H14a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8"/>',
    decide: '<path d="M12 4v16"/><path d="M4.5 8.5h15"/><path d="M4.5 8.5 2 14h5zM19.5 8.5 17 14h5z"/>',
    answer: '<path d="M21 12a9 9 0 1 1-3.6-7.2"/><path d="M8.5 12l2.8 2.8L21 6"/>'
  };
  var CHEV = '<path d="M6 9l6 6 6-6"/>';

  function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : (many || one + 's'));
  }

  /** Loose comparison, so punctuation or spacing differences do not hide a
   *  match that is plainly the same sentence to a reader. */
  function norm(t) {
    return (t || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:!?"'’]/g, '').trim();
  }

  // Sema's provenance names are internal vocabulary. Only the ones that change
  // how you should read the answer are surfaced; the generic "cover" would just
  // be jargon next to a headline that already says what happened — and calling
  // it "built from stored notes" would be wrong for pure arithmetic.
  var PROVENANCE = {
    'cast': 'applied a learnt pattern',
    'recall-echo': 'echo, not a derived fact'
  };

  /** One box in the journey: a small caption over a passage of text. */
  function jnode(cls, label, text) {
    var n = el('div', 'jnode ' + cls);
    n.appendChild(el('div', 'jlabel', label));
    var jt = el('div', 'jtext', text);
    jt.dir = 'auto';
    n.appendChild(jt);
    return n;
  }

  /** The connector between two boxes, carrying what happened in between. */
  function jlink(text) {
    var l = el('div', 'jlink');
    var a = el('span', 'arrow-down');
    a.innerHTML = svg('<path d="M12 5v14M6 13l6 6 6-6"/>', 13);
    l.appendChild(a);
    l.appendChild(el('span', null, text));
    return l;
  }

  function renderExplanation(x) {
    var root = el('div', 'explain');

    // Silence is a result, not a failure — and it needs its own framing, since
    // "how it reached this answer" describes nothing when there is no answer.
    var silent = !x.answer;

    var top = el('div', 'ex-top');
    top.appendChild(el('h3', null, silent ? 'Why Sema stayed silent' : 'How Sema reached this answer'));
    top.appendChild(el('p', null, silent
      ? 'It tried every way it knows to back an answer up, and nothing it holds supported one, ' +
        'so it said nothing. Below is what it attempted, and why each attempt came up empty.'
      : x.headline + (x.evidence
        ? ' Below is the actual note it used — not a description of it.'
        : '')));

    var tags = el('div', 'tags');
    tags.appendChild(el('span', 'tagx', plural(x.stepCount, 'reasoning step')));
    if (x.considered && x.considered.length) {
      tags.appendChild(el('span', 'tagx', plural(x.considered.length, 'approach', 'approaches') + ' rejected'));
    }
    if (x.provenance && PROVENANCE[x.provenance]) {
      tags.appendChild(el('span', 'tagx' + (x.provenance === 'recall-echo' ? ' warn' : ''),
        PROVENANCE[x.provenance]));
    }
    top.appendChild(tags);

    // Sema's own notes and the spans each step consumed are the auditable
    // record, and they have to stay reachable — but printed inline they put a
    // cost float on every row, and the plain reading above each one already
    // says what happened. One switch, off by default, for the whole panel.
    var tech = el('button', 'techbtn');
    var techOn = false;
    function paintTech() {
      root.className = 'explain' + (techOn ? ' tech' : '');
      tech.textContent = techOn
        ? 'Hide Sema\\'s own notes'
        : 'Show Sema\\'s own notes';
      tech.setAttribute('aria-pressed', techOn ? 'true' : 'false');
    }
    tech.onclick = function () { techOn = !techOn; paintTech(); };
    top.appendChild(tech);
    root.appendChild(top);
    paintTech();

    // ── The journey: your words, the stored note, the answer ──────────────
    if (!silent) {
      var j = el('div', 'journey');
      j.appendChild(jnode('ask', 'You asked', x.question));

      if (x.evidence) {
        j.appendChild(jlink('Sema recognised this as something it had been taught'));

        var card = el('div', 'note-card');
        var head = el('div', 'head');
        head.innerHTML = svg('<path d="M12 3l2.4 5.6L20 9.6l-4 4.2.9 5.9L12 17l-4.9 2.7.9-5.9-4-4.2 5.6-1z"/>', 12);
        head.appendChild(el('span', null, 'The note it had been taught'));
        card.appendChild(head);

        var r1 = el('div', 'note-row');
        r1.appendChild(el('div', 'k', 'Given'));
        var v1 = el('div', 'v');
        v1.dir = 'auto';
        v1.appendChild(document.createTextNode(x.evidence.context));
        // When the stored note repeats your sentence word for word, say so —
        // otherwise the reader just sees the same text three times and wonders
        // whether something is broken.
        if (norm(x.evidence.context) === norm(x.question)) {
          v1.appendChild(el('span', 'exact', 'word-for-word what you asked'));
        }
        r1.appendChild(v1);
        card.appendChild(r1);

        var r2 = el('div', 'note-row learnt');
        r2.appendChild(el('div', 'k', 'It learnt'));
        var rv = el('div', 'v', x.evidence.continuation);
        rv.dir = 'auto';
        r2.appendChild(rv);
        card.appendChild(r2);
        j.appendChild(card);

        j.appendChild(jlink('and voiced it back in your own wording'));
      } else {
        j.appendChild(jlink(x.headline.replace(/^It /, 'It ').replace(/\.$/, '')));
      }

      j.appendChild(jnode('out', 'The answer', x.answer));
      root.appendChild(j);
    }

    // ── Corroboration: the same answer, reached from many other notes ─────
    if (x.corroboration && x.corroboration.total > 1) {
      var c = el('div', 'corrob');
      var ch = el('div', 'corrob-head');
      ch.innerHTML = svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5L16 9.5"/>', 15);
      var ct = el('div');
      ct.appendChild(el('b', null, group(x.corroboration.total) + ' different stored notes '));
      ct.appendChild(document.createTextNode(
        'lead to this same answer, so it does not rest on a single note.'));
      ch.appendChild(ct);
      c.appendChild(ch);

      if (x.corroboration.samples.length) {
        var more = el('button', 'corrob-more', 'Show a few of them');
        var list = null;
        more.onclick = function () {
          if (list) { list.remove(); list = null; more.textContent = 'Show a few of them'; return; }
          list = el('div', 'corrob-list');
          x.corroboration.samples.forEach(function (t) {
            var row = el('div', null, t); row.dir = 'auto'; list.appendChild(row);
          });
          c.appendChild(list);
          more.textContent = 'Hide them';
        };
        c.appendChild(more);
      }
      root.appendChild(c);
    }

    var wrapS = el('div', 'stages');
    x.stages.forEach(function (stage) {
      var det = el('details', 'stage');
      var sum = document.createElement('summary');

      var badge = el('div', 'badge');
      badge.innerHTML = svg(ICONS[stage.icon] || ICONS.reason, 14);
      sum.appendChild(badge);

      var txt = el('div', 'st-txt');
      var h = el('h4');
      h.appendChild(document.createTextNode(stage.title));
      // Rows are merged by mechanism, so counting rows would report 3 where the
      // panel header says 443. Count the steps that actually ran.
      var ran = stage.steps.reduce(function (n, s) { return n + s.repeat; }, 0);
      h.appendChild(el('span', 'n', plural(ran, 'step')));
      txt.appendChild(h);
      // The closing stage's description assumes a winning answer exists; with
      // nothing grounded that sentence would simply be untrue.
      txt.appendChild(el('p', null, silent && stage.key === 'answer'
        ? 'Nothing came through, so there was no answer to give back.'
        : stage.plain));
      sum.appendChild(txt);

      var ch = el('span', 'st-chev');
      ch.innerHTML = svg(CHEV, 13);
      sum.appendChild(ch);
      det.appendChild(sum);

      var body = el('div', 'st-body');
      stage.steps.forEach(function (s) {
        var step = el('div', 'step');
        var lab = el('div', 'lab');
        lab.appendChild(document.createTextNode(s.label));
        if (s.repeat > 1) {
          var c = el('span', 'count', '×' + s.repeat);
          c.title = 'ran ' + s.repeat + ' times, over different parts of your question';
          lab.appendChild(c);
        }
        step.appendChild(lab);
        // Plain reading first; Sema's own note kept underneath in mono, exactly
        // as the rejections below do it, so the two never get confused for each
        // other and the auditable wording is never lost.
        if (s.plain) step.appendChild(el('div', 'note', s.plain));
        else if (s.note) step.appendChild(el('div', 'note', s.note));
        if (s.plain && s.note) step.appendChild(el('div', 'rej-raw', s.note));

        var ins = (s.inputs || []).slice(0, 2);
        var outs = (s.outputs || []).slice(0, 2);
        // Identical in and out is a no-op worth stating once, not twice.
        var same = ins.length === outs.length && ins.every(function (v, i) { return v === outs[i]; });
        if (ins.length || outs.length) {
          var io = el('div', 'io');
          ins.forEach(function (t) {
            var c = el('span', 'chip', short(t)); c.title = t; io.appendChild(c);
          });
          if (!same && ins.length && outs.length) io.appendChild(el('span', 'arrow', '→'));
          if (!same) {
            outs.forEach(function (t) {
              var c = el('span', 'chip out', short(t)); c.title = t; io.appendChild(c);
            });
          }
          step.appendChild(io);
        }
        body.appendChild(step);
      });
      det.appendChild(body);
      wrapS.appendChild(det);
    });
    // The five stages are the machinery behind the journey above — real detail,
    // but detail. Open by default only when there is no journey to show.
    var stagesDet = el('details', 'more');
    if (silent) stagesDet.open = true;
    stagesDet.appendChild(el('summary', null,
      'Step by step — ' + plural(x.stages.length, 'stage') + ', ' +
        plural(x.stepCount, 'step') + ' in all'));
    var stagesInner = el('div');
    // One legend, once — rather than a tooltip on each badge that a reader has
    // to discover by hovering (and cannot discover at all on a phone).
    if (x.stages.some(function (s) { return s.steps.some(function (t) { return t.repeat > 1; }); })) {
      stagesInner.appendChild(el('p', 'legend',
        'Steps of the same kind are grouped together. ×24 means that step ran ' +
        '24 times, over different parts of your question.'));
    }
    stagesInner.appendChild(wrapS);
    stagesDet.appendChild(stagesInner);
    root.appendChild(stagesDet);

    if (x.closeCall) {
      var flag = el('div', 'flag');
      flag.innerHTML = svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z"/>', 14);
      var t = el('div');
      t.appendChild(el('b', null, 'Close call. '));
      t.appendChild(document.createTextNode(
        'A rival line of reasoning came very near to winning (' + x.closeCall +
        '), so one more trained fact could tip this the other way.'));
      flag.appendChild(t);
      root.appendChild(flag);
    }

    if (x.considered && x.considered.length) {
      var det2 = el('details', 'more');
      // When there is no answer, these rejections ARE the explanation, so they
      // open by default instead of hiding behind a disclosure.
      if (silent) det2.open = true;
      det2.appendChild(el('summary', null,
        (silent ? 'What Sema tried — ' : 'Roads not taken — ') +
        plural(x.considered.length, 'approach', 'approaches') + ' tried and rejected'));
      var inner = el('div', 'inner');
      inner.appendChild(el('p', null, silent
        ? 'Each of these is a different way of arriving at an answer it could stand behind. All of them came ' +
          'up empty, which is precisely why Sema stayed quiet.'
        : 'Sema tries many ways to reach an answer it can back up, and reports each one that came up empty. ' +
          'This is why it can stay silent instead of inventing something.'));
      x.considered.forEach(function (s) {
        var r = el('div', 'rej');
        // Label on its own line, not joined by a dash. The labels name an
        // action ("Copying how a worked example does it"), so "label — it could
        // not" reads as a claim immediately contradicted.
        r.appendChild(el('b', null, s.label));
        r.appendChild(document.createTextNode(s.plain || s.note || 'no result'));
        // Sema's exact wording stays available underneath, so the plain
        // reading never costs you the auditable one.
        if (s.plain && s.note) r.appendChild(el('div', 'rej-raw', s.note));
        inner.appendChild(r);
      });
      det2.appendChild(inner);
      root.appendChild(det2);
    }

    if (x.provenance === 'recall-echo') {
      var w2 = el('div', 'flag');
      w2.innerHTML = svg('<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>', 14);
      var t2 = el('div');
      t2.appendChild(el('b', null, 'This is an echo. '));
      t2.appendChild(document.createTextNode(
        'Sema returned the nearest stored wording verbatim rather than deriving a fact — ' +
        'read it as “the closest thing I hold”, not as an answer.'));
      w2.appendChild(t2);
      root.appendChild(w2);
    }
    return root;
  }

  /* ================= chat ================= */
  var log = $('log'), scroller = $('scroll'), busy = false;
  function toBottom() { scroller.scrollTop = scroller.scrollHeight; }

  // Reasoning over a multi-gigabyte store is not instant, so the header says
  // so too — the dots alone are easy to miss on a long page.
  function working(on) {
    $('state').textContent = on ? 'thinking' : 'ready';
    $('dot').className = 'dot' + (on ? ' busy' : '');
  }

  function addMessage(role, text) {
    var m = el('div', 'msg ' + (role === 'me' ? 'me' : 'ai'));
    m.appendChild(el('div', 'who', role === 'me' ? 'You' : 'Sema'));
    var b = el('div', 'bubble');
    b.dir = 'auto';
    if (text) b.textContent = text;
    m.appendChild(b);
    log.appendChild(m);
    toBottom();
    return { msg: m, bubble: b };
  }

  function attachWhy(msg, x) {
    var btn = el('button', 'why');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = svg('<circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a3 3 0 1 1 4 2.8c-.8.3-1.2 1-1.2 1.8v.3M12 17h.01"/>', 14) +
      '<span>' + (x.answer ? 'Why this answer?' : 'Why the silence?') + '</span>' +
      svg(CHEV, 12, 'chev');
    var panel = null;
    btn.onclick = function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.remove(); panel = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        panel = renderExplanation(x);
        msg.appendChild(panel);
        btn.setAttribute('aria-expanded', 'true');
        // Bring the panel's top into view rather than jumping to the bottom of
        // a tall explanation — the reader wants to start at step one.
        panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };
    msg.appendChild(btn);
  }

  function send() {
    var text = $('q').value.trim();
    if (!text || busy) return;
    busy = true;
    $('send').disabled = true;
    working(true);
    $('q').value = '';
    resize();

    var w = log.querySelector('.welcome');
    if (w) w.remove();

    addMessage('me', text);
    turns++;
    paintThread();
    var pending = addMessage('ai', null);
    pending.bubble.innerHTML = '<div class="dots"><i></i><i></i><i></i></div>';

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session: session, message: text })
    })
      // A failing route answers in text, not JSON, so parsing first turns a
      // plain 404 into "Unexpected token 'N'" in front of the reader.
      .then(function (r) { return r.text().then(function (body) {
        var d = null;
        try { d = JSON.parse(body); } catch (e) { d = null; }
        if (!r.ok) throw new Error((d && d.error) || httpReason(r.status));
        if (!d) throw new Error('The server replied with something unreadable.');
        return d;
      }); })
      .then(function (d) {
        if (d.answer) {
          pending.bubble.textContent = d.answer;
        } else {
          pending.bubble.className = 'bubble silent';
          pending.bubble.textContent =
            'Nothing I hold bears on that. I was trained on a limited set of notes, so ' +
            'rather than invent an answer, I say nothing.';
        }
        if (d.explanation) attachWhy(pending.msg, d.explanation);
      })
      .catch(function (err) {
        pending.bubble.className = 'bubble silent err-bubble';
        pending.bubble.textContent = /Failed to fetch|NetworkError|load failed/i.test(err.message)
          ? 'Could not reach the server. It may have stopped — check the terminal it was started from.'
          : err.message;
        // A failed turn must not be a dead end: offer the same question again.
        var again = el('button', 'again', 'Try again');
        again.onclick = function () {
          pending.msg.remove();
          $('q').value = text; resize(); send();
        };
        pending.bubble.appendChild(again);
      })
      .then(function () {
        busy = false; $('send').disabled = false; working(false); $('q').focus(); toBottom();
      });
  }

  // Sema is given the whole thread, not just the latest message, so an earlier
  // turn can still shape a later answer. Stating the turn count makes an
  // otherwise baffling drift legible, and puts the cure next to the diagnosis.
  var turns = 0;
  function paintThread() {
    var bar = $('thread');
    if (turns < 2) { bar.hidden = true; return; }
    bar.hidden = false;
    $('thread-txt').textContent =
      'Sema is also reading the ' + plural(turns - 1, 'earlier turn') +
      ' in this thread, so answers can drift.';
  }

  // Status codes, in words. The number alone tells a reader nothing.
  function httpReason(code) {
    if (code === 404) return 'That part of the server is missing (404). It may be a different version than this page.';
    if (code === 429) return 'Too many questions at once — give it a moment and try again.';
    if (code === 503) return 'The trained memory is not open yet. Give it a moment.';
    if (code >= 500) return 'The server hit an error while answering (' + code + ').';
    return 'The server refused that request (' + code + ').';
  }

  function resize() {
    var q = $('q');
    q.style.height = 'auto';
    q.style.height = Math.min(q.scrollHeight, 150) + 'px';
  }

  function resetThread() {
    fetch('/api/reset', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session: session })
    }).then(function () {
      log.innerHTML = ''; turns = 0; paintThread(); welcome(); $('q').focus();
    });
  }
  $('reset').onclick = resetThread;
  $('thread-clear').onclick = resetThread;
  $('send').onclick = send;
  $('q').addEventListener('input', resize);
  $('q').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
</script>
</body>
</html>`;
