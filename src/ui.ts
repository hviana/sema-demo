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
    /* Three voices, and each one means something.  The demo ships as one offline
       binary, so these are system stacks chosen for ROLE, not decoration:
       display (a title sounds like a title), ui (the interface talks), machine
       (stored notes are DATA — they are quoted, never paraphrased). */
    --font-display: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
    --font-ui: ui-sans-serif, -apple-system, "Segoe UI", Inter, Roboto, sans-serif;
    --font-machine: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
    /* Motion: one duration per INTENT, not one per rule.  Each value is the one
       the design already used for that intent (fast feedback, a chevron turn, a
       pulse), so naming them changes no timing a reader can perceive — it just
       stops .12/.15/.18/.2 and 1.3/1.4/1.5 from reading as four and three
       separate decisions.  The pulse matches the one reduced-motion keeps. */
    --t-fast: .15s;
    --t-med: .2s;
    --t-blink: 1.4s;
    --ease: cubic-bezier(.4,0,.2,1);
    /* Space: one scale, so gaps read as a rhythm instead of as accidents.
       Mobile-first — the values are the phone's, and the wider screens step
       them up in one place below rather than inventing local numbers. */
    --s1: 4px;
    --s2: 8px;
    --s3: 12px;
    --s4: 16px;
    --s5: 24px;
    --s6: 32px;
    --s7: 48px;
    /* Type: one size per job. */
    --f-xs: 11px;      /* eyebrows, metadata */
    --f-sm: 12.5px;    /* labels, dense UI */
    --f-md: 14px;      /* secondary body */
    --f-base: 15.5px;  /* body and inputs */
    --f-lg: 18px;      /* a card's own title */
    --f-hero: 25px;    /* the one headline (a serif wants the size) */
    --f-display: 34px; /* the one big number (download progress) */
    --lh-tight: 1.22;
    --lh-snug: 1.4;
    --lh-body: 1.55;
    /* A finger is not a mouse: every tappable control clears this. */
    --tap: 44px;
    --r-sm: 10px;
    --r-lg: 18px;
  }
  /* Wider screens get more air, not a different design. */
  @media (min-width: 768px) {
    :root {
      --s5: 28px;
      --s6: 40px;
      --f-hero: 31px;
    }
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
  /* Author display rules beat the UA's [hidden] rule, so the attribute silently
     stops working the moment an element sets its own display — .figure, .stats
     and .thread all do.  One definition, once, instead of one per element. */
  [hidden] { display: none !important; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.55 var(--font-ui);
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column; overflow: hidden;
  }
  /* One reading measure for the whole demo: a line of prose or of stored text
     stays comfortable on a wide screen instead of stretching to the viewport.
     The gutter is the mobile one (16px) at every width — mobile first. */
  .wrap { width: min(700px, 100%); margin: 0 auto; padding: 0 var(--s4); }

  /* ---------------- header ---------------- */
  header {
    border-bottom: 1px solid var(--line); background: var(--bg);
    flex: none; z-index: 5;
  }
  .bar { display: flex; align-items: center; gap: var(--s3); height: 56px; }
  .mark { font-weight: 700; letter-spacing: .22em; font-size: var(--f-sm); text-transform: uppercase; }
  .mark span { color: var(--accent); }
  .tag {
    font-size: var(--f-sm); color: var(--ink-soft);
    border-left: 1px solid var(--line); padding-left: var(--s3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .spacer { margin-left: auto; }
  .status {
    display: inline-flex; align-items: center; gap: var(--s2);
    font-size: var(--f-xs); color: var(--ink-soft); white-space: nowrap;
  }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); flex: none; }
  .dot.busy { background: var(--warn); animation: blink var(--t-blink) ease-in-out infinite; }
  .dot.bad { background: var(--danger); }
  @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
  /* Mobile first: the reset is an icon and a full finger target.  Where there is
     room for the word, the word comes back. */
  .icon-btn {
    flex: none; width: var(--tap); height: var(--tap); display: none;
    align-items: center; justify-content: center; gap: var(--s2); padding: 0;
    border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface);
    color: var(--ink-soft); cursor: pointer; transition: var(--t-fast); margin-left: var(--s2);
    font: inherit; font-size: var(--f-sm);
  }
  .icon-btn .lab { display: none; white-space: nowrap; }
  @media (min-width: 700px) {
    .icon-btn { width: auto; height: 36px; padding: 0 var(--s3); }
    .icon-btn .lab { display: inline; }
  }
  .icon-btn:hover { color: var(--accent); border-color: var(--accent); }
  .icon-btn.on { display: inline-flex; }
  @media (max-width: 620px) { .tag { display: none; } }

  /* ---------------- boot ---------------- */
  #boot { flex: 1; display: grid; place-items: center; padding: var(--s5) var(--s4); overflow-y: auto; }
  .card {
    width: min(560px, 100%); background: var(--surface); border: 1px solid var(--line);
    border-radius: var(--r); box-shadow: var(--shadow); padding: var(--s5) var(--s5) var(--s4);
  }
  .card h1 { margin: 0 0 var(--s1); font-family: var(--font-display); font-size: var(--f-hero); font-weight: 600; letter-spacing: -.01em; }
  .card .sub { margin: 0; color: var(--ink-soft); font-size: var(--f-md); line-height: var(--lh-snug); }

  /* headline figure + live throughput graph */
  .figure { display: flex; align-items: flex-end; gap: var(--s4); margin: var(--s5) 0 var(--s3); }
  .pct { font-size: var(--f-display); font-weight: 660; letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .pct small { font-size: var(--f-base); font-weight: 550; color: var(--ink-faint); margin-left: 2px; }
  .of { flex: 1; font-size: var(--f-sm); color: var(--ink-soft); padding-bottom: 3px; }
  .graph { width: 128px; height: 34px; flex: none; overflow: hidden; opacity: 0; transition: opacity .4s; }
  .graph.on { opacity: 1; }
  .graph path.area { fill: color-mix(in srgb, var(--accent) 14%, transparent); }
  .graph path.line { fill: none; stroke: var(--accent); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }

  .meter { height: 8px; background: var(--surface-2); border-radius: 99px; overflow: hidden; position: relative; }
  .meter > i {
    display: block; height: 100%; width: 0%; border-radius: 99px; background: var(--accent);
    transition: width .45s var(--ease);
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
  .meter.idle > i { width: 100% !important; opacity: .25; animation: blink var(--t-blink) ease-in-out infinite; }

  .stats { display: flex; justify-content: space-between; gap: var(--s3); font-size: var(--f-sm); color: var(--ink-soft); margin-top: var(--s2); }
  .stats b { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }

  .files { margin-top: var(--s5); display: grid; gap: var(--s3); }
  .file .row { display: flex; align-items: center; gap: var(--s2); margin-bottom: var(--s1); font-size: var(--f-sm); color: var(--ink-soft); }
  .file code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--ink); font-size: var(--f-xs); }
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
  .why-note { margin-top: var(--s1); font-size: var(--f-xs); color: var(--accent); }

  .hint { margin: var(--s5) 0 0; font-size: var(--f-sm); line-height: var(--lh-snug); color: var(--ink-faint); }
  .err {
    margin-top: var(--s4); padding: var(--s3) var(--s4); border-radius: var(--r-sm); font-size: var(--f-md);
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    line-height: var(--lh-snug);
  }
  .retry {
    margin-top: var(--s3); min-height: var(--tap); background: var(--accent); color: var(--on-accent);
    border: 0; border-radius: var(--r-sm);
    font: inherit; font-size: var(--f-md); font-weight: 600; padding: 0 var(--s4); cursor: pointer;
  }
  .retry:disabled { opacity: .5; cursor: not-allowed; }

  /* ---------------- chat ---------------- */
  #app { flex: 1; display: none; flex-direction: column; min-height: 0; }
  #app.on { display: flex; }
  #scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
  #log { padding: var(--s2) 0 var(--s5); }

  /* welcome state — scrolls away once the conversation starts */
  .welcome { padding: var(--s6) 0 var(--s2); }
  .welcome h2 {
    margin: 0 0 var(--s3); font-family: var(--font-display); font-size: var(--f-hero);
    font-weight: 600; letter-spacing: -.005em; line-height: var(--lh-tight);
  }
  .welcome > p {
    margin: 0 0 var(--s5); color: var(--ink-soft); font-size: var(--f-base);
    line-height: 1.6; max-width: 54ch;
  }
  /* The corpus caveat is an ASIDE: it is not a card.  No box, no fill — just a
     quieter size and the one warning-coloured mark, so the only filled surfaces
     on this screen are the cards the reader is meant to look at. */
  .caveat {
    display: flex; gap: var(--s2); align-items: flex-start;
    font-size: var(--f-sm); line-height: var(--lh-snug); color: var(--ink-soft);
    background: none; border: 0; border-radius: 0; padding: 0;
  }
  .caveat b { color: var(--ink); font-weight: 600; }
  .caveat svg { flex: none; margin-top: 1px; color: var(--warn); width: 15px; height: 15px; }
  .try {
    margin: var(--s5) 0 var(--s2); font-size: var(--f-xs); font-weight: 600;
    letter-spacing: .14em; text-transform: uppercase; color: var(--ink-faint);
  }
  /* The wider column carries a step more type — declared HERE, after the base
     rules, because a media query adds no specificity and would otherwise lose. */
  @media (min-width: 768px) {
    .welcome > p { font-size: var(--f-base); }
    .caveat { font-size: var(--f-md); }
  }

  /* ---------------- training-data explorer ---------------- */
  .explorer { margin-top: var(--s3); }
  .ex-field {
    display: flex; gap: var(--s2); align-items: center; background: var(--surface);
    border: 1px solid var(--line); border-radius: var(--r); padding: 4px 4px 4px var(--s4);
    transition: border-color var(--t-fast);
  }
  .ex-field:focus-within { border-color: var(--accent); }
  .ex-field svg { color: var(--ink-faint); flex: none; }
  #exq {
    flex: 1; min-width: 0; border: 0; background: none; color: var(--ink);
    font: inherit; font-size: var(--f-base); outline: none; padding: 0;
  }
  #exgo {
    flex: none; min-height: var(--tap); border: 0; border-radius: var(--r-sm);
    background: var(--accent); color: var(--on-accent);
    font: inherit; font-size: var(--f-md); font-weight: 600; padding: 0 var(--s4); cursor: pointer;
  }
  #exgo:disabled { opacity: .4; cursor: not-allowed; }
  .ex-meta {
    margin: var(--s3) 2px 0; font-size: var(--f-xs); color: var(--ink-faint);
    min-height: 16px; display: flex; align-items: center; gap: var(--s2);
  }
  .spin {
    width: 11px; height: 11px; flex: none; border-radius: 50%;
    border: 1.6px solid var(--line); border-top-color: var(--accent);
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ex-list { margin-top: var(--s3); display: grid; gap: var(--s2); }
  .pair {
    background: var(--surface); border: 1px solid var(--line); border-radius: var(--r);
    padding: var(--s4); font-size: var(--f-md); line-height: var(--lh-snug);
    cursor: pointer; transition: var(--t-fast); text-align: left;
    font-family: inherit; color: var(--ink); width: 100%; display: block;
  }
  .pair:hover { border-color: var(--accent); background: var(--accent-soft); }
  /* A finger has no hover: the press itself has to answer. */
  .pair:active { border-color: var(--accent); background: var(--accent-soft); }
  /* Mobile first: the label sits ABOVE its text, so the text keeps the full
     width instead of wrapping into a narrow second column.  From 560px up there
     is room for the two columns this card was originally drawn for. */
  .pair .side { display: block; }
  .pair .lbl {
    display: block; font-size: var(--f-xs); font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: var(--ink-faint); margin-bottom: var(--s1);
  }
  /* A card is a PREVIEW of one trained note, not the note itself: two lines on a
     phone (three where the column is wider) keep the list scannable and the
     heights even.  The full text is one tap away — the card asks the question. */
  .pair .val {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; min-width: 0; overflow-wrap: anywhere;
  }
  @media (min-width: 768px) { .pair .val { -webkit-line-clamp: 3; } }
  .pair .to { color: var(--accent); }
  .pair .rule { display: block; height: 1px; background: var(--line-soft); margin: var(--s3) 0; }
  .pair .sc {
    font-size: var(--f-xs); color: var(--ink-faint); margin-top: var(--s3);
    display: flex; align-items: center; gap: var(--s3);
  }
  .pair .ask {
    margin-left: auto; display: inline-flex; align-items: center; gap: var(--s1);
    font-size: var(--f-sm); font-weight: 600; color: var(--accent); white-space: nowrap;
  }
  @media (min-width: 560px) {
    .pair .side { display: flex; gap: var(--s3); align-items: baseline; }
    .pair .lbl { flex: none; width: 78px; margin-bottom: 0; }
  }
  .pair .ask-ar { display: inline-flex; transition: transform var(--t-med); }
  .pair:hover .ask-ar, .pair:focus-visible .ask-ar { transform: translateX(3px); }
  /* A search that finds nothing is still a screen the reader lands on: it gets
     the same shape as a card, an icon that says which memory came up empty, and
     one line of what to do next — never a bare sentence floating in space. */
  .ex-empty {
    display: flex; gap: var(--s3); align-items: flex-start;
    padding: var(--s4); border: 1px dashed var(--line); border-radius: var(--r);
    background: var(--surface-2); color: var(--ink-soft);
  }
  .ex-empty svg { flex: none; color: var(--ink-faint); margin-top: 1px; }
  .ex-empty-title { margin: 0 0 var(--s1); font-size: var(--f-md); font-weight: 620; color: var(--ink); }
  .ex-empty-msg { margin: 0; font-size: var(--f-sm); line-height: var(--lh-body); }
  .ex-more {
    margin-top: var(--s3); background: none; border: 1px solid var(--line); color: var(--ink-soft);
    font: inherit; font-size: var(--f-sm); padding: 0 var(--s4); min-height: var(--tap);
    border-radius: 99px; cursor: pointer; transition: var(--t-fast);
  }
  .ex-more:hover { border-color: var(--accent); color: var(--accent); }
  .ex-more:disabled { opacity: .45; cursor: not-allowed; }

  .msg { margin: var(--s5) 0; display: flex; flex-direction: column; }
  .msg.me { align-items: flex-end; }
  /* Shrink-wrap to the text: a stretched bubble around three loading dots
     reads as a broken empty box. */
  .bubble { align-self: flex-start; max-width: 90%; padding: var(--s3) var(--s4); border-radius: var(--r); white-space: pre-wrap; overflow-wrap: anywhere; }
  .me .bubble { align-self: flex-end; background: var(--user); color: var(--bg); border-bottom-right-radius: 4px; }
  .ai .bubble { background: var(--surface); border: 1px solid var(--line); border-bottom-left-radius: 4px; box-shadow: var(--shadow); }
  .ai .bubble.silent { background: none; border-style: dashed; box-shadow: none; color: var(--ink-soft); font-size: var(--f-md); }
  .ai .bubble.err-bubble {
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    color: var(--danger);
  }
  .again {
    display: block; margin-top: var(--s2); background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-sm); color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  .who { font-size: var(--f-xs); letter-spacing: .13em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: var(--s1); }
  .dots { display: flex; gap: var(--s1); padding: var(--s1) 2px; }
  .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-faint); animation: bob 1.2s infinite; }
  .dots i:nth-child(2) { animation-delay: .15s } .dots i:nth-child(3) { animation-delay: .3s }
  @keyframes bob { 0%,60%,100% { opacity: .25; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-3px) } }

  .why {
    align-self: flex-start; margin-top: var(--s3); display: inline-flex; align-items: center;
    gap: var(--s2); min-height: var(--tap); padding: 0 var(--s4);
    background: none; border: 1px solid var(--line); color: var(--ink-soft);
    font: inherit; font-size: var(--f-md); border-radius: 99px; cursor: pointer; transition: var(--t-fast);
  }
  .why:hover, .why[aria-expanded="true"] { border-color: var(--accent); color: var(--accent-ink); background: var(--accent-soft); }
  .why .chev { transition: transform var(--t-med); }
  .why[aria-expanded="true"] .chev { transform: rotate(180deg); }

  /* ---------------- explanation ---------------- */
  .explain {
    margin-top: var(--s3); width: 100%; background: var(--surface); border: 1px solid var(--line);
    border-radius: var(--r); box-shadow: var(--shadow); overflow: hidden;
    animation: rise .25s var(--ease);
  }
  @keyframes rise { from { opacity: 0; transform: translateY(-4px) } }
  .ex-top { padding: var(--s4); background: var(--surface-2); border-bottom: 1px solid var(--line); }
  .ex-top h3 { margin: 0 0 var(--s1); font-family: var(--font-display); font-size: var(--f-lg); font-weight: 600; letter-spacing: -.005em; }
  .ex-top p { margin: 0; font-size: var(--f-md); color: var(--ink-soft); line-height: var(--lh-body); }
  .tags { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s3); }
  .tagx {
    font-size: var(--f-xs); font-weight: 550; padding: 3px var(--s3); border-radius: 99px; border: 1px solid var(--line);
    background: var(--surface); color: var(--ink-soft);
  }
  .tagx.warn { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 40%, transparent); }
  .techbtn {
    margin-top: var(--s3); display: inline-flex; align-items: center; min-height: var(--tap);
    background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-md); color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  /* The auditable layer: present in the DOM always, shown on request. */
  .explain .rej-raw, .explain .io { display: none; }
  .explain.tech .rej-raw { display: block; }
  .explain.tech .io { display: flex; }
  .legend {
    margin: 0; padding: var(--s3) var(--s4) 0; font-size: var(--f-sm); color: var(--ink-faint);
    line-height: var(--lh-snug);
  }

  /* ---- the journey: question → the note it used → the answer ---- */
  .journey { padding: var(--s4) var(--s4) var(--s1); }
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
    .journey > *, .explain, .scrim, .meter.live > i::after { animation: none; }
    .dots i { animation: blink var(--t-blink) ease-in-out infinite; }
    * { scroll-behavior: auto !important; }
  }
  .jnode {
    border: 1px solid var(--line); border-radius: var(--r-sm); padding: var(--s3) var(--s4);
    background: var(--surface-2);
  }
  .jnode.ask { background: none; }
  .jnode.out { background: none; border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
  .jlabel {
    font-size: var(--f-xs); font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
    color: var(--ink-faint); margin-bottom: var(--s1); display: flex; align-items: center; gap: var(--s2);
  }
  .jnode.out .jlabel { color: var(--accent); }
  .jtext { font-size: var(--f-md); line-height: var(--lh-body); overflow-wrap: anywhere; }
  .jtext.quiet { color: var(--ink-soft); font-style: italic; }

  /* the connector between two nodes, carrying the move that happened */
  .jlink {
    display: flex; align-items: center; gap: var(--s2); padding: var(--s2) 0 var(--s2) var(--s4);
    font-size: var(--f-sm); color: var(--ink-soft);
  }
  .jlink .rail { width: 1px; align-self: stretch; background: var(--line); margin-left: 1px; }
  .jlink .arrow-down { color: var(--accent); flex: none; }

  /* the trained note — the evidence, visually the centrepiece */
  .note-card {
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: var(--r-sm); overflow: hidden; background: var(--surface);
  }
  .note-card .head {
    display: flex; align-items: center; gap: var(--s2); padding: var(--s2) var(--s4);
    background: var(--accent-soft); color: var(--accent-ink);
    font-size: var(--f-xs); letter-spacing: .12em; text-transform: uppercase; font-weight: 600;
  }
  /* Same shape as a pair card: label above its text on a phone, two columns
     from 560px up, so the reader learns the pattern once. */
  .note-row { padding: var(--s3) var(--s4); font-size: var(--f-md); line-height: var(--lh-body); }
  .note-row + .note-row { border-top: 1px solid var(--line-soft); }
  .note-row .k {
    display: block; width: auto; font-size: var(--f-xs); font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: var(--ink-faint); margin-bottom: var(--s1);
  }
  .note-row .v { min-width: 0; overflow-wrap: anywhere; }
  .note-row.learnt .v { color: var(--ink); font-weight: 500; }
  @media (min-width: 560px) {
    .note-row { display: flex; gap: var(--s3); align-items: baseline; }
    .note-row .k { flex: none; width: 68px; margin-bottom: 0; }
  }
  .exact {
    display: inline-block; margin-left: var(--s2); font-size: var(--f-xs); font-weight: 500;
    color: var(--ok-ink); background: var(--ok-soft);
    border-radius: 99px; padding: 1px var(--s2); white-space: nowrap; vertical-align: 1px;
  }

  /* corroboration */
  .corrob { margin: var(--s3) var(--s4) var(--s4); }
  .corrob-head {
    display: flex; align-items: flex-start; gap: var(--s2); font-size: var(--f-md); line-height: var(--lh-body);
    color: var(--ink-soft);
  }
  .corrob-head b { color: var(--ink); font-weight: 620; }
  .corrob-head svg { flex: none; color: var(--ok); margin-top: 2px; }
  .corrob-more {
    margin-top: var(--s2); margin-left: var(--s5); display: inline-flex; align-items: center;
    min-height: var(--tap); background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-md); color: var(--accent); text-decoration: underline;
    text-underline-offset: 3px;
  }
  .corrob-list { margin: var(--s2) 0 0 var(--s5); display: grid; gap: var(--s1); }
  .corrob-list div {
    font-size: var(--f-sm); color: var(--ink-soft); padding: var(--s2) var(--s3); border-radius: var(--r-sm);
    background: var(--surface-2); overflow-wrap: anywhere;
  }

  .stages { padding: var(--s1) 0; }
  details.stage { border-bottom: 1px solid var(--line-soft); }
  details.stage:last-child { border-bottom: 0; }
  details.stage > summary {
    display: flex; gap: var(--s3); align-items: flex-start; padding: var(--s3) var(--s4);
    cursor: pointer; list-style: none; user-select: none; transition: background var(--t-fast);
  }
  details.stage > summary::-webkit-details-marker { display: none }
  details.stage > summary:hover { background: var(--surface-2); }
  .badge {
    flex: none; width: 28px; height: 28px; border-radius: 50%; background: var(--accent-soft);
    color: var(--accent); display: grid; place-items: center;
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  }
  .st-txt { flex: 1; min-width: 0; }
  .st-txt h4 { margin: 0 0 2px; font-size: var(--f-md); font-weight: 620; display: flex; align-items: center; gap: var(--s2); }
  .st-txt p { margin: 0; font-size: var(--f-sm); color: var(--ink-soft); line-height: var(--lh-snug); }
  .n { font-size: var(--f-xs); color: var(--ink-faint); font-weight: 500; white-space: nowrap; }
  .st-chev { flex: none; color: var(--ink-faint); margin-top: var(--s1); transition: transform var(--t-med); }
  details.stage[open] .st-chev { transform: rotate(180deg); }
  .st-body { padding: 0 var(--s4) var(--s4) 56px; }
  @media (max-width: 560px) { .st-body { padding-left: var(--s4); } }
  .step { border-top: 1px solid var(--line-soft); padding: var(--s2) 0; font-size: var(--f-sm); }
  .step:first-child { border-top: 0; }
  .step .lab { font-weight: 600; display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; }
  .step .count {
    font-weight: 500; font-size: var(--f-xs); color: var(--accent-ink);
    background: var(--accent-soft); border-radius: 99px; padding: 1px 7px;
  }
  .step .note { color: var(--ink-soft); margin-top: 2px; font-size: var(--f-sm); line-height: var(--lh-snug); }
  .io { display: flex; flex-wrap: wrap; gap: var(--s1); margin-top: var(--s2); align-items: center; }
  .chip {
    background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px;
    padding: 2px var(--s2); font-family: var(--font-machine); font-size: var(--f-xs); color: var(--ink-soft);
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .chip.out { color: var(--ink); border-color: color-mix(in srgb, var(--accent) 30%, transparent); }
  .arrow { color: var(--ink-faint); font-size: var(--f-xs); }

  details.more { border-top: 1px solid var(--line); }
  details.more > summary {
    display: flex; align-items: center; min-height: var(--tap); padding: var(--s3) var(--s4);
    cursor: pointer; font-size: var(--f-md); color: var(--ink-soft);
    list-style: none; user-select: none;
  }
  details.more > summary::-webkit-details-marker { display: none }
  details.more > summary:hover { color: var(--accent); }
  details.more .inner { padding: 0 var(--s4) var(--s4); font-size: var(--f-md); color: var(--ink-soft); }
  .rej { padding: var(--s2) 0; border-top: 1px dashed var(--line); line-height: var(--lh-snug); font-size: var(--f-sm); }
  .rej b { color: var(--ink); font-weight: 600; display: block; }
  .rej-raw {
    margin-top: 3px; font-size: var(--f-xs); color: var(--ink-faint);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; line-height: 1.45;
  }
  .flag {
    display: flex; gap: var(--s2); align-items: flex-start; margin: 0 var(--s4) var(--s4); padding: var(--s3);
    border-radius: var(--r-sm); font-size: var(--f-sm); line-height: var(--lh-snug);
    background: color-mix(in srgb, var(--warn) 11%, transparent);
    border: 1px solid color-mix(in srgb, var(--warn) 30%, transparent);
  }

  /* On a phone the explanation comes up as a SHEET from the bottom edge: full
     width, its own scroll, a way out always in reach — instead of a panel that
     pushes the answer out of the conversation.  Above 560px none of this
     applies and the panel is the in-flow region it always was; resizing across
     the boundary needs no script, only these two rules. */
  .scrim { display: none; }
  .sheet-bar { display: none; }
  @media (max-width: 560px) {
    .scrim {
      display: block; position: fixed; inset: 0; z-index: 20;
      background: rgba(0, 0, 0, .38); animation: fade .2s var(--ease);
    }
    .explain.sheet {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 21;
      max-height: 86vh; overflow-y: auto; overscroll-behavior: contain;
      margin: 0; border-radius: var(--r-lg) var(--r-lg) 0 0; border-bottom: 0;
      padding-bottom: env(safe-area-inset-bottom, 0px);
      animation: sheet-up .28s var(--ease);
    }
    .sheet-bar {
      display: flex; align-items: center; justify-content: flex-end; position: sticky;
      top: 0; z-index: 1; min-height: var(--tap); padding: 0 var(--s2);
      background: var(--surface-2); border-bottom: 1px solid var(--line);
    }
    .sheet-bar .grab {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 40px; height: 4px; border-radius: 99px; background: var(--line);
    }
    .sheet-close {
      flex: none; width: var(--tap); height: var(--tap); display: grid; place-items: center;
      border: 0; border-radius: var(--r-sm); background: none; color: var(--ink-soft);
      cursor: pointer; transition: var(--t-fast);
    }
    .sheet-close:hover, .sheet-close:active { color: var(--accent); background: var(--surface); }
  }
  @keyframes fade { from { opacity: 0 } }
  @keyframes sheet-up { from { transform: translateY(16px); opacity: .55 } }

  /* A thread carries every earlier turn into the next answer, which is why a
     long conversation can drift. That is invisible unless it is stated. */
  .thread {
    display: flex; align-items: center; gap: var(--s2); margin-bottom: var(--s2);
    font-size: var(--f-xs); color: var(--ink-faint); line-height: var(--lh-snug);
  }
  .thread button {
    margin-left: auto; flex: none; display: inline-flex; align-items: center; min-height: var(--tap);
    background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-xs); color: var(--accent);
    text-decoration: underline; text-underline-offset: 3px;
  }

  /* ---------------- composer ---------------- */
  .composer { flex: none; border-top: 1px solid var(--line); background: var(--bg); padding: var(--s3) 0 var(--s4); }
  .field {
    display: flex; gap: var(--s2); align-items: flex-end; background: var(--surface);
    border: 1px solid var(--line); border-radius: var(--r); padding: 4px 4px 4px var(--s4);
    transition: border-color var(--t-fast);
  }
  .field:focus-within { border-color: var(--accent); }
  #q {
    flex: 1; min-width: 0; border: 0; background: none; color: var(--ink); font: inherit;
    font-size: var(--f-base); line-height: var(--lh-snug); resize: none; max-height: 150px;
    min-height: var(--tap); padding: 10px 0; outline: none;
  }
  #send {
    flex: none; width: var(--tap); height: var(--tap); border-radius: var(--r-sm); border: 0; cursor: pointer;
    background: var(--accent); color: var(--on-accent); display: grid; place-items: center; transition: var(--t-fast);
  }
  #send:disabled { opacity: .35; cursor: not-allowed; }
  #send:active { background: var(--accent-ink); }
  /* A consistent, visible keyboard focus ring on every control. The text
     inputs set outline:none by id, so they need to be named explicitly to
     win it back — a keyboard user must always be able to see where they are. */
  button:focus-visible, summary:focus-visible, a:focus-visible,
  #q:focus-visible, #exq:focus-visible, .pair:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  summary:focus-visible { outline-offset: -2px; border-radius: 8px; }

  .foot { text-align: center; font-size: var(--f-xs); color: var(--ink-faint); margin: var(--s2) 0 0; }
  @media (max-width: 620px) { .foot { display: none; } }
</style>
</head>
<body>

<header>
  <div class="wrap bar">
    <div class="mark">Se<span>ma</span></div>
    <div class="tag">A mind without weights — reasoning, not sampling</div>
    <div class="spacer"></div>
    <div class="status" role="status" aria-live="polite"><span class="dot busy" id="dot"></span><span id="state">starting</span></div>
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
        <textarea id="q" rows="1" placeholder="Ask Sema something…" aria-label="Ask Sema something" autocomplete="off"></textarea>
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
  // The header status is a live region, so it must mutate ONLY when the words
  // really change: a download progress event that re-sets the same string would
  // make a screen reader repeat "downloading" on every tick.
  function setState(t) {
    var s = $('state');
    if (s.textContent !== t) s.textContent = t;
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
    setState(s.phase === 'opening' ? 'opening' : s.phase);
    $('dot').className = 'dot' + (s.phase === 'ready' ? '' : s.phase === 'error' ? ' bad' : ' busy');
    $('boot-sub').textContent = s.message || '';

    var meter = $('total-meter');
    var active = s.phase === 'downloading';

    // A failure has no progress to show.  Left up, the bar reads as a full (and
    // therefore finished) transfer under a message saying it could not start.
    var stats = $('boot').querySelector('.stats');
    if (stats) stats.hidden = s.phase === 'error';
    meter.hidden = s.phase === 'error';

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
    // The stream dropped: say so rather than leaving a stale "ready" on screen.
    // EventSource reconnects on its own, and the next message clears this.
    setState('reconnecting');
    $('dot').className = 'dot busy';
    fetch('/api/status').then(function (r) { return r.json(); }).then(renderBoot).catch(function () {
      setState('reconnecting');
      $('dot').className = 'dot busy';
    });
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
      'Not a language model, and no open-world knowledge: when nothing it holds ' +
      'answers you, it stays silent rather than invent — that silence is the point.'));
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
    input.setAttribute('aria-label', 'Search what Sema was trained on');
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
        .catch(function (e) {
          meta.textContent = 'Search failed: ' + e.message;
          // A failed search must not be a dead end: offer the same query again.
          var again = el('button', 'ex-more', 'Try again');
          again.onclick = function () { load(q); };
          list.appendChild(again);
        })
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
    // "stored notes" — the words the rest of the page uses.  "learnt contexts"
    // is Sema's own vocabulary for the same thing, and it was the one place it
    // leaked into the interface.
    var held = group(d.totalContexts) + ' stored notes';

    if (!d.pairs.length) {
      meta.textContent = held;
      var empty = el('div', 'ex-empty');
      empty.innerHTML = svg(
        '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/>' +
          '<path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
        18,
      );
      var ebody = el('div');
      ebody.appendChild(el('p', 'ex-empty-title', 'Nothing matched'));
      ebody.appendChild(el(
        'p',
        'ex-empty-msg',
        d.note ||
          'Sema holds a finite set of notes, and nothing sits above the parts of ' +
            'your text it recognised.',
      ));
      empty.appendChild(ebody);
      list.appendChild(empty);
      return;
    }

    meta.textContent = d.browsed
      ? 'A few real notes from this memory · ' + d.tookMs + 'ms · ' + held
      : d.pairs.length + ' matched · ' + d.resolved + ' parts of your text found in the graph · ' +
        d.tookMs + 'ms · ' + held;

    d.pairs.forEach(function (p) {
      // The whole card is a <button>, and a button's content model is PHRASING
      // content — block-level divs inside it are invalid HTML.  Spans with the
      // same classes keep the layout (the CSS gives .side/.sc flex and .rule a
      // block box) and make the markup valid.
      var b = el('button', 'pair');
      var s1 = el('span', 'side');
      s1.appendChild(el('span', 'lbl', 'Given'));
      var v1 = el('span', 'val', p.context + (p.contextTruncated ? '…' : ''));
      v1.dir = 'auto';
      s1.appendChild(v1);
      b.appendChild(s1);
      b.appendChild(el('span', 'rule'));
      var s2 = el('span', 'side');
      s2.appendChild(el('span', 'lbl to', 'It learnt'));
      var v2 = el('span', 'val', p.continuation + (p.continuationTruncated ? '…' : ''));
      v2.dir = 'auto';
      s2.appendChild(v2);
      b.appendChild(s2);
      var foot = el('span', 'sc');
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
            var c = el('span', 'chip', short(t)); c.title = t; c.tabIndex = 0; io.appendChild(c);
          });
          if (!same && ins.length && outs.length) io.appendChild(el('span', 'arrow', '→'));
          if (!same) {
            outs.forEach(function (t) {
              var c = el('span', 'chip out', short(t)); c.title = t; c.tabIndex = 0; io.appendChild(c);
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
    setState(on ? 'thinking' : 'ready');
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

  var whySeq = 0;
  // One explanation is open at a time, and Escape has to close it from anywhere
  // — so the open panel publishes its own closer here.
  var closeOpenSheet = null;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && closeOpenSheet) closeOpenSheet();
  });

  function attachWhy(msg, x) {
    var btn = el('button', 'why');
    btn.setAttribute('aria-expanded', 'false');
    // Tie the button to the panel it opens, and NAME the panel, so a screen
    // reader can move between them and knows what it landed in.
    var panelId = 'why-' + (++whySeq);
    btn.setAttribute('aria-controls', panelId);
    btn.innerHTML = svg('<circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a3 3 0 1 1 4 2.8c-.8.3-1.2 1-1.2 1.8v.3M12 17h.01"/>', 14) +
      '<span>' + (x.answer ? 'Why this answer?' : 'Why the silence?') + '</span>' +
      svg(CHEV, 12, 'chev');
    var panel = null, scrim = null, asSheet = false;

    function close() {
      if (!panel) return;
      if (scrim) { scrim.remove(); scrim = null; }
      var wasSheet = asSheet;
      panel.remove(); panel = null; asSheet = false;
      closeOpenSheet = null;
      btn.setAttribute('aria-expanded', 'false');
      // A sheet took the focus with it when it opened; give it back.
      if (wasSheet) btn.focus();
    }

    btn.onclick = function () {
      if (btn.getAttribute('aria-expanded') === 'true') { close(); return; }
      panel = renderExplanation(x);
      panel.id = panelId;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', x.answer
        ? 'Why Sema gave this answer'
        : 'Why Sema stayed silent');
      // A phone has no room for a panel that pushes the answer off-screen: the
      // sheet takes the bottom edge, scrolls inside itself, and carries its own
      // way out.  Wider screens keep the panel above the button, in flow.
      asSheet = window.matchMedia('(max-width: 560px)').matches;
      var closer = null;
      if (asSheet) {
        panel.classList.add('sheet');
        var bar = el('div', 'sheet-bar');
        bar.appendChild(el('i', 'grab'));
        closer = el('button', 'sheet-close');
        closer.type = 'button';
        closer.setAttribute('aria-label', 'Close the explanation');
        closer.innerHTML = svg('<path d="M6 6l12 12M18 6L6 18"/>', 16);
        closer.onclick = close;
        bar.appendChild(closer);
        panel.insertBefore(bar, panel.firstChild);
        scrim = el('div', 'scrim');
        scrim.onclick = close;
        document.body.appendChild(scrim);
      }
      msg.appendChild(panel);
      btn.setAttribute('aria-expanded', 'true');
      if (asSheet) {
        closeOpenSheet = close;
        closer.focus();
      } else {
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
    // A reset while this turn is in flight makes its answer STALE: the epoch
    // guard below drops it instead of pasting it onto a fresh thread.
    var mine = epoch;
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
        if (mine !== epoch) return;   // the thread was reset under this turn
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
        if (mine !== epoch) return;   // stale: its bubble went with the reset
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
  // Bumped on every successful reset: anything still in flight belongs to the
  // thread the reader just cleared.
  var epoch = 0;
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
    }).then(function (r) {
      // A reset that FAILED must not clear the thread — that would lie about
      // the session state — and saying nothing would leave a dead button.
      if (!r.ok) throw new Error(httpReason(r.status));
      epoch++;   // any answer still in flight belongs to the old thread
      // A sheet lives outside the log (it has a scrim on the body), so a reset
      // has to take it down before it clears the conversation under it.
      if (closeOpenSheet) closeOpenSheet();
      log.innerHTML = ''; turns = 0; paintThread(); welcome(); $('q').focus();
    }).catch(function (err) {
      var m = addMessage('ai', null);
      m.bubble.className = 'bubble silent err-bubble';
      m.bubble.textContent = 'Could not start a new conversation (' + err.message +
        '). Your thread is still here — nothing was lost.';
      // The same remedy a failed TURN offers: the reader should not have to go
      // hunting for the button that just failed.
      var again = el('button', 'again', 'Try again');
      again.onclick = function () { m.msg.remove(); resetThread(); };
      m.bubble.appendChild(again);
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
