// ui.ts — the whole front end, inlined so the compiled binary is one file.

export const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
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
    /* The third ink is only as light as AA on --surface-2 allows, which is not
       very: hold 4.5:1 on both surfaces and the furthest this can travel from
       --ink-soft is about 1.15x. It used to sit 1.09x away, which is no step at
       all — three levels declared and two shipped. The palette has no room for
       a third READABLE level, so colour is not what separates these: size,
       weight and uppercase do, and this token only has to stop fighting them. */
    --ink-faint: #756e65;
    --accent: #9a5b2c;
    --on-accent: #ffffff;
    --accent-soft: #f4e8dc;
    --accent-ink: #925629;
    /* What YOU said: a warm step of the paper, deep enough to read as a
       message (the accent tint alone disappears into the background). */
    --bubble-me: color-mix(in srgb, var(--accent) 20%, var(--surface));
    --ok: #3f7d52;
    --ok-ink: #376e48;
    --ok-soft: #e8efea;
    --warn: #b07d1f;
    --danger: #b3453a;
    /* One cool hue, for the one place the palette has to carry a CATEGORY
       rather than a meaning: the trace's five families of work. */
    --cool: #4f7693;
    --r: 0.875rem;
    /* Elevation: one soft step for content, one deeper for whatever floats.
       A card is MATERIAL — it sits on the paper by value and shadow, never by
       an outline (an outline is a wireframe, not a surface). */
    --elev-1: 0 1px 2px rgba(0, 0, 0, .03), 0 6px 16px rgba(0, 0, 0, .045);
    --elev-2: 0 2px 6px rgba(0, 0, 0, .06), 0 18px 44px rgba(0, 0, 0, .12);
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
       them up in one place below rather than inventing local numbers.
       In REM, with the type below, so that a reader who has set a larger
       default font size gets a larger INTERFACE rather than larger text in
       boxes built for smaller text. At the default 16px root every value
       below is exactly the pixel number it replaces. */
    --s1: 0.25rem;    /*  4px */
    --s2: 0.5rem;     /*  8px */
    --s3: 0.75rem;    /* 12px */
    --s4: 1rem;       /* 16px */
    --s5: 1.5rem;     /* 24px */
    --s6: 2rem;       /* 32px */
    --s7: 3rem;       /* 48px */
    /* Type: one size per job. */
    --f-2xs: 0.625rem;    /* 10px — inside a badge, never on its own */
    --f-xs: 0.6875rem;    /* 11px — eyebrows, metadata */
    --f-sm: 0.78125rem;   /* 12.5px — labels, dense UI */
    --f-md: 0.875rem;     /* 14px — secondary body */
    --f-base: 0.96875rem; /* 15.5px — body and inputs */
    --f-lg: 1.125rem;     /* 18px — a card's own title */
    --f-hero: 1.5625rem;  /* 25px — the one headline (a serif wants the size) */
    --f-display: 2.125rem;/* 34px — the one big number (download progress) */
    /* Tracking: three values, each with a job. The uppercase labels in this
       interface were carrying five different ones (.1, .12, .13, .14, .26),
       which is not a system — it is five decisions nobody made on purpose. */
    --track-label: .12em;   /* eyebrows and section labels */
    --track-badge: .06em;   /* small badges inside a card */
    --track-mark: .26em;    /* the wordmark, deliberately wider */
    --lh-tight: 1.22;
    --lh-snug: 1.4;
    --lh-body: 1.55;
    /* A finger is not a mouse: every tappable control clears this. */
    --tap: 2.75rem;  /* 44px — a finger. Relaxed for a mouse below. */
    --r-xs: 0.375rem;  /*  6px — a chip */
    --r-sm: 0.625rem;
    --r-lg: 1.125rem;
  }
  /* A mouse is precise, so the minimum relaxes — for every control at once,
     by moving the token, rather than as an exception on one of them. */
  @media (pointer: fine) { :root { --tap: 2.25rem; } }

  /* Wider screens get more air, not a different design. */
  @media (min-width: 768px) {
    :root {
      --s5: 1.75rem;      /* 28px */
      --s6: 2.5rem;       /* 40px */
      --f-hero: 1.9375rem;/* 31px */
    }
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #131210;
      --surface: #1b1a16;
      --surface-2: #232119;
      --line: #3d392f;
      --line-soft: #302c26;
      --ink: #ece8e0;
      --ink-soft: #a29a8f;
      --ink-faint: #8e877d;
      --accent: #dc9c62;
      --on-accent: #131210;
      --accent-soft: #2c2218;
      --accent-ink: #dc9c62;
      --bubble-me: color-mix(in srgb, var(--accent) 24%, var(--surface));
      --ok: #74b587;
      --ok-ink: #74b587;
      --ok-soft: #1d2a22;
      --warn: #d3aa52;
      --danger: #e0796c;
      --cool: #7fa9c6;
      --elev-1: 0 0 0 1px color-mix(in srgb, var(--ink) 9%, transparent),
                0 1px 2px rgba(0, 0, 0, .35), 0 6px 16px rgba(0, 0, 0, .4);
      --elev-2: 0 0 0 1px color-mix(in srgb, var(--ink) 13%, transparent),
                0 2px 6px rgba(0, 0, 0, .4), 0 18px 44px rgba(0, 0, 0, .5);
    }
    /* On a dark surface the same trace needs more of the accent to be seen. */
    .graph path.area { fill: color-mix(in srgb, var(--accent) 20%, transparent); }
  }
  * { box-sizing: border-box; }
  /* Author display rules beat the UA's [hidden] rule, so the attribute silently
     stops working the moment an element sets its own display — .figure, .stats
     and .thread all do.  One definition, once, instead of one per element. */
  [hidden] { display: none !important; }
  html { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 1rem/1.55 var(--font-ui);
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column; overflow: hidden;
    /* The dynamic viewport unit, so the column is the height actually
       available rather than the height the page was loaded at — browser
       chrome that retracts on scroll no longer leaves the composer cut off. */
    height: 100%;
    height: 100dvh;
    height: var(--vvh, 100dvh);
  }
  /* One reading measure for the whole demo: a line of prose or of stored text
     stays comfortable on a wide screen instead of stretching to the viewport.
     The gutter is the mobile one (16px) at every width — mobile first. */
  .wrap {
    width: min(43.75rem, 100%); margin: 0 auto;
    padding-left: max(var(--s4), env(safe-area-inset-left));
    padding-right: max(var(--s4), env(safe-area-inset-right));
  }

  /* ---------------- header ---------------- */
  header {
    border-bottom: 1px solid var(--line); background: var(--bg);
    flex: none; z-index: 5;
  }
  .bar { display: flex; align-items: center; gap: var(--s3); min-height: 3.5rem; }
  .mark { font-weight: 600; letter-spacing: var(--track-mark); font-size: var(--f-sm); text-transform: uppercase; }
  .mark span { color: var(--accent); }
  /* The subtitle is a line of prose, so it takes the editorial voice — the one
     place the header admits it is part of the same page as the hero. */
  .tag {
    font-family: var(--font-display); font-style: italic; font-size: var(--f-sm);
    color: var(--ink-soft);
    border-left: 1px solid var(--line); padding-left: var(--s3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    /* The one element in the bar that may be sacrificed as it narrows. */
    flex: 0 1 auto; min-width: 0;
  }
  .mark, .status, .icon-btn { flex: none; }
  .spacer { margin-left: auto; }
  .status {
    display: inline-flex; align-items: center; gap: var(--s2);
    font-size: var(--f-xs); color: var(--ink-soft); white-space: nowrap;
  }
  /* The state mark is a lamp, not a bullet: a soft halo says "this is live". */
  .dot {
    width: 0.4375rem; height: 0.4375rem; border-radius: 50%; flex: none;
    background: var(--ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 22%, transparent);
  }
  .dot.busy { box-shadow: 0 0 0 3px color-mix(in srgb, var(--warn) 22%, transparent); }
  .dot.bad { box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 22%, transparent); }
  .dot.busy { background: var(--warn); animation: blink var(--t-blink) ease-in-out infinite; }
  .dot.bad { background: var(--danger); }
  @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
  /* Mobile first: the reset is an icon and a full finger target, and it is a
     GHOST — a header does not need a second box.  Where there is room for the
     word, the word comes back. */
  .icon-btn {
    flex: none; min-width: var(--tap); min-height: var(--tap); display: none;
    align-items: center; justify-content: center; gap: var(--s2); padding: 0 var(--s3);
    border: 0; border-radius: var(--r-sm); background: none;
    color: var(--ink-soft); cursor: pointer; transition: var(--t-fast); margin-left: var(--s2);
    font: inherit; font-size: var(--f-sm);
  }
  .icon-btn .lab { display: none; white-space: nowrap; }
  @media (min-width: 560px) { .icon-btn .lab { display: inline; } }
  @media (pointer: fine) { .icon-btn { min-width: 0; min-height: 36px; } }
  .icon-btn:hover { color: var(--accent-ink); background: var(--surface-2); }
  .icon-btn.on { display: inline-flex; }
  @media (max-width: 560px) { .tag { display: none; } }

  /* ---------------- boot ---------------- */
  #boot { flex: 1; display: grid; align-content: safe center; padding: var(--s5) 0; overflow-y: auto; }
  #boot > .wrap { width: min(43.75rem, 100%); }
  .card {
    width: min(35rem, 100%); background: var(--surface); border: 0;
    border-radius: var(--r); box-shadow: var(--elev-1); padding: var(--s5) var(--s5) var(--s4);
  }
  .card h1 {
    margin: 0 0 var(--s1); font-family: var(--font-display); font-size: var(--f-hero);
    font-weight: 600; letter-spacing: -.01em; line-height: var(--lh-tight);
  }
  .card .sub { margin: 0; color: var(--ink-soft); font-size: var(--f-md); line-height: var(--lh-snug); }

  /* The figure is an INSTRUMENT: the number and its unit on one line, and the
     rate-over-time chart on its own full-width row underneath — never squeezed
     into a third column where the unit has to wrap. */
  .figure {
    display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: end;
    gap: var(--s2) var(--s3); margin: var(--s5) 0 var(--s3);
  }
  .pct {
    grid-column: 1; font-family: var(--font-display);
    font-size: var(--f-display); font-weight: 600; letter-spacing: -.02em; line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  /* The sign belongs to its number, not a space away from it. */
  .pct small { font-size: var(--f-base); font-weight: 600; color: var(--ink-soft); margin-left: 0; }
  .of { grid-column: 2; font-size: var(--f-sm); color: var(--ink-soft); padding-bottom: 4px; }
  .graph {
    grid-column: 1 / -1; width: 100%; height: 0; flex: none;
    overflow: hidden; opacity: 0;
    transition: opacity .4s, height var(--t-med) var(--ease);
  }
  .graph.on { height: 34px; opacity: 1; }
  /* A ghost trace, not a filled block: the METER below carries the progress, so
     the chart only has to say "the rate is alive". */
  .graph path.area { fill: color-mix(in srgb, var(--accent) 10%, transparent); }
  .graph path.line { fill: none; stroke: var(--accent); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }

  .meter { height: 0.5rem; background: var(--surface-2); border-radius: 99px; overflow: hidden; position: relative; }
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
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--surface) 55%, transparent), transparent);
    animation: sheen 1.6s linear infinite;
  }
  @keyframes sheen { from { transform: translateX(-100%) } to { transform: translateX(100%) } }
  .meter.idle > i { width: 100% !important; opacity: .25; animation: blink var(--t-blink) ease-in-out infinite; }

  .stats { display: flex; justify-content: space-between; gap: var(--s3); font-size: var(--f-sm); color: var(--ink-soft); margin-top: var(--s2); }
  .stats b { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }

  /* The file list is a LIST, not a stack of widgets: hairline between entries,
     the state mark large enough to read at a glance, the name in the machine
     voice and the numbers in tabular figures. */
  .files { margin-top: var(--s5); display: grid; }
  .file { padding: var(--s3) 0; }
  .file + .file { border-top: 1px solid var(--line-soft); }
  .file .row {
    display: flex; align-items: baseline; gap: var(--s2) var(--s3); flex-wrap: wrap;
    margin-bottom: var(--s2); font-size: var(--f-sm); color: var(--ink-soft);
  }
  .file code {
    font-family: var(--font-machine); color: var(--ink); font-size: var(--f-xs);
    min-width: 0; overflow-wrap: anywhere;
  }
  .file .role { color: var(--ink-faint); }
  @media (max-width: 560px) {
    .file .role { flex: 1 0 100%; order: 1; margin-left: calc(0.9375rem + var(--s2)); }
    .file .val { order: 0; }
  }
  .file .val { flex: none; margin-left: auto; font-variant-numeric: tabular-nums; }
  .file .meter { height: 0.25rem; transition: opacity var(--t-med); }
  .file.is-done .meter { display: none; }
  .file .tick { color: var(--ok); font-weight: 600; }
  /* A file waiting its turn is not a file at zero percent. */
  .file.is-idle .meter { display: none; }
  .file.is-idle code, .file.is-idle .val { color: var(--ink-faint); }
  .state {
    width: 0.9375rem; height: 0.9375rem; flex: none; border-radius: 50%; display: grid; place-items: center;
    border: 1.5px solid var(--line);
  }
  .state.done { border-color: var(--ok); background: var(--ok); }
  .state.done::after { content: ""; width: 4px; height: 7px; border: solid var(--surface); border-width: 0 1.6px 1.6px 0; transform: rotate(45deg) translate(-1px,-1px); }
  .state.active { border-color: var(--accent); border-top-color: transparent; animation: spin .7s linear infinite; }
  .why-note:not(:empty) {
    margin: 0 0 var(--s2) calc(0.9375rem + var(--s2)); font-size: var(--f-xs);
    color: var(--ink-faint); line-height: var(--lh-snug);
  }

  .hint { margin: var(--s5) 0 0; font-size: var(--f-xs); line-height: var(--lh-snug); color: var(--ink-faint); }
  .err {
    margin-top: var(--s4); padding: var(--s3) var(--s4); border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    border: 0; line-height: var(--lh-snug);
  }
  /* What went wrong, then what it means for you — two different jobs, and
     they were set identically and ran together as one block. */
  .err > :first-child { font-size: var(--f-md); font-weight: 600; color: var(--ink); }
  .err > :last-child {
    margin-top: var(--s1); font-size: var(--f-sm); color: var(--ink-soft);
  }
  .err > :only-child { margin-top: 0; font-size: var(--f-md); color: var(--ink); }
  /* ---- the one filled button ---- */
  .retry, #exgo {
    min-height: var(--tap); background: var(--accent); color: var(--on-accent);
    border: 0; border-radius: var(--r-sm); cursor: pointer;
    font: inherit; font-size: var(--f-md); font-weight: 600; padding: 0 var(--s4);
  }
  .retry:disabled, #exgo:disabled { opacity: .45; cursor: not-allowed; }
  .retry { margin-top: var(--s3); }

  /* ---------------- chat ---------------- */
  #app { flex: 1; display: none; flex-direction: column; min-height: 0; }
  #app.on { display: flex; }
  #scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
  /* A flex column, so the margins below do not collapse into each other —
     as a block container it silently flattened every gap to the larger of
     the two and the grouping rule did nothing at all. */
  #log { display: flex; flex-direction: column; padding: 0 0 var(--s5); }

  /* welcome state — scrolls away once the conversation starts */
  .welcome { padding: var(--s6) 0 var(--s2); }
  /* What is left once the conversation has started: the instrument alone,
     quieter, and no longer claiming the top of the page. */
  .welcome.retired {
    padding: var(--s3) 0 var(--s5);
    margin-bottom: var(--s7);
    border-bottom: 1px solid var(--line-soft);
  }
  .welcome.retired .explorer { margin-top: 0; }
  .welcome h2 {
    margin: 0 0 var(--s3); font-family: var(--font-display); font-size: var(--f-hero);
    font-weight: 600; letter-spacing: -.005em; line-height: var(--lh-tight);
  }
  /* One measure for every line of prose on this screen. */
  .welcome > p, .caveat { max-width: 62ch; }
  .welcome > p {
    margin: 0 0 var(--s5); color: var(--ink); font-size: var(--f-base);
    line-height: var(--lh-body);
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
  /* A section eyebrow, drawn the editorial way: the label, then a hairline that
     ties it to the width of what it introduces. */
  /* ---- the one eyebrow ---- */
  .try, .who, .pair .lbl {
    font-size: var(--f-xs); font-weight: 600; letter-spacing: var(--track-label);
    text-transform: uppercase; color: var(--ink-faint);
  }
  .try {
    display: flex; align-items: center; gap: var(--s3); margin: var(--s6) 0 var(--s3);
  }
  .try::after { content: ""; flex: 1; height: 1px; background: var(--line); }
  /* The wider column carries a step more type — declared HERE, after the base
     rules, because a media query adds no specificity and would otherwise lose. */
  @media (min-width: 768px) {
    .welcome > p { font-size: var(--f-base); }
    .caveat { font-size: var(--f-md); }
  }

  /* ---------------- training-data explorer ---------------- */
  .explorer { margin-top: var(--s6); }
  .explorer > .try { margin: 0 0 var(--s2); }
  .explorer > .caption { margin: 0 0 var(--s4); }
  @media (min-width: 1040px) {
    .explorer { width: min(1020px, calc(100vw - var(--s6))); margin-left: 50%; transform: translateX(-50%); }
    .ex-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .ex-field {
    display: flex; flex-wrap: wrap; gap: var(--s2); align-items: center;
    background: var(--surface); border: 0; border-radius: var(--r);
    box-shadow: var(--elev-1);
    padding: var(--s1) var(--s1) var(--s1) var(--s4); transition: var(--t-fast);
  }
  .ex-field:focus-within {
    box-shadow: var(--elev-1), 0 0 0 2px color-mix(in srgb, var(--accent) 32%, transparent);
  }
  .ex-field svg { color: var(--ink-faint); flex: none; }
  #exq {
    /* The basis is the width the placeholder actually needs; below it the
       button wraps rather than squeezing the field. */
    flex: 1 1 15rem; min-width: 0; min-height: var(--tap); border: 0; background: none;
    color: var(--ink); font: inherit; font-size: var(--f-base); outline: none; padding: 0;
  }
  #exgo { flex: 0 0 auto; }
  #exq::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
  .ex-meta {
    margin: var(--s2) 0 0; font-size: var(--f-xs); color: var(--ink-soft);
    min-height: 16px; display: flex; align-items: center; gap: var(--s2);
  }
  .ex-meta .dim { color: var(--ink-faint); }
  .ex-meta.bad { color: var(--danger); font-weight: 600; }
  .spin {
    width: 0.6875rem; height: 0.6875rem; flex: none; border-radius: 50%;
    border: 1.6px solid var(--line); border-top-color: var(--accent);
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ex-list { margin-top: var(--s4); display: grid; gap: var(--s2); }
  .pair {
    position: relative; background: var(--surface); border: 0; border-radius: var(--r);
    box-shadow: var(--elev-1);
    padding: var(--s3) calc(var(--s4) + 15px + var(--s3)) var(--s3) var(--s4);
    font-size: var(--f-md); line-height: var(--lh-snug);
    cursor: pointer; transition: var(--t-fast); text-align: left;
    font-family: inherit; color: var(--ink); width: 100%; display: block;
  }
  .pair:hover, .pair:active { background: var(--accent-soft); }
  /* The hover tint is darker than the card, so the quiet text on it has to
     step up a level or it drops to 4.17:1 — the one place in the app where a
     state change was taking a label below AA. */
  .pair:hover .lbl, .pair:active .lbl,
  .pair:hover .sc, .pair:active .sc { color: var(--ink-soft); }
  /* The whole card is the control, so the affordance is one mark at its edge
     rather than a footer row repeating "Ask this" once per result. */
  .pair .go {
    position: absolute; right: var(--s4); top: 50%; transform: translateY(-50%);
    display: inline-flex; color: var(--ink-faint); transition: var(--t-fast);
  }
  .pair:hover .go, .pair:focus-visible .go {
    color: var(--accent); transform: translateY(-50%) translateX(3px);
  }
  @media (hover: none) { .pair .go { color: var(--accent); } }
  /* Mobile first: the label sits ABOVE its text, so the text keeps the full
     width instead of wrapping into a narrow second column.  From 560px up there
     is room for the two columns this card was originally drawn for. */
  .pair .side { display: block; }
  .pair .lbl { display: block; margin-bottom: var(--s1); }
  /* A card is a PREVIEW of one trained note, not the note itself: two lines on a
     phone (three where the column is wider) keep the list scannable and the
     heights even.  The full text is one tap away — the card asks the question. */
  .pair .val {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; min-width: 0; overflow-wrap: anywhere;
    font-family: var(--font-machine); font-size: var(--f-sm);
    /* A line of text has a comfortable length even inside a wide card. */
    max-width: 74ch;
  }
  @media (min-width: 768px) { .pair .val { -webkit-line-clamp: 3; } }
  .pair .side.learnt .val { color: var(--accent-ink); font-weight: 600; }
  .pair .rule { display: block; height: 1px; background: var(--line-soft); margin: var(--s2) 0; }
  /* Shown only for a search hit, where it says WHY this one matched. */
  .pair .sc {
    display: block; font-size: var(--f-xs); color: var(--ink-faint); margin-top: var(--s2);
  }
  @media (min-width: 560px) {
    .pair .side { display: flex; gap: var(--s3); align-items: baseline; }
    .pair .lbl { flex: none; width: 6.6em; min-width: 72px; margin-bottom: 0; }
    .pair .sc { margin-left: calc(6.6em + var(--s3)); }
  }
  /* A search that finds nothing is still a screen the reader lands on: it gets
     the same shape as a card, an icon that says which memory came up empty, and
     one line of what to do next — never a bare sentence floating in space. */
  /* An empty state is a TYPOGRAPHIC moment, not an illustration: a small
     centred block with the title in the display voice, no icon to apologise
     with. */
  .ex-empty {
    display: block; text-align: center; padding: var(--s5) var(--s4);
    color: var(--ink-soft);
  }
  .ex-empty-title {
    margin: 0 0 var(--s2); font-family: var(--font-display); font-size: var(--f-lg);
    font-weight: 600; color: var(--ink); line-height: var(--lh-tight);
  }
  .ex-empty-msg { margin: 0 auto; max-width: 46ch; font-size: var(--f-sm); line-height: var(--lh-body); }
  /* ---- the one text button ------------------------------------------------
     A control that wants no surface of its own: it lives in the flow, clears
     the touch minimum through its own height, and says it is a control by
     colour and by the underline it takes on hover. */
  .linkbtn {
    display: inline-flex; align-items: center; min-height: var(--tap);
    background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-sm); font-weight: 600; color: var(--accent-ink);
    text-align: left; transition: var(--t-fast);
  }
  .linkbtn:hover { text-decoration: underline; text-underline-offset: 3px; }
  .linkbtn:disabled { opacity: .45; cursor: not-allowed; text-decoration: none; }
  /* The remedy for a failure belongs to the failure, not to the brand. */
  .linkbtn.on-error { color: var(--danger); }
  /* An auditable layer nobody has asked for yet is not an action. */
  .linkbtn.quiet { min-height: 2.125rem; font-weight: 400; color: var(--ink-soft); }
  .linkbtn.quiet:hover { color: var(--accent-ink); }
  .ex-more { margin-top: var(--s5); }

  .msg { margin: var(--s4) 0; display: flex; flex-direction: column; }
  .msg.me { align-items: flex-end; }
  /* A reply belongs to the question above it: half the gap inside a turn, the
     full gap between turns, so the eye groups them without a rule or a box. */
  .msg.ai { margin-top: var(--s2); }
  /* Shrink-wrap to the text: a stretched bubble around three loading dots
     reads as a broken empty box. */
  .bubble {
    align-self: flex-start; max-width: 90%; padding: var(--s3) var(--s4);
    border-radius: var(--r); white-space: pre-wrap; overflow-wrap: anywhere;
    font-size: var(--f-base);
  }
  /* An answer is often a bare code; its digits should line up with themselves. */
  .ai .bubble { font-variant-numeric: tabular-nums; }
  /* Both sides of the conversation are material too: what Sema says sits on a
     raised surface, what you said sits on a warm tint of the paper. */
  .me .bubble {
    align-self: flex-end; background: var(--bubble-me); color: var(--ink);
    border: 0; border-bottom-right-radius: 6px;
  }
  .ai .bubble {
    background: var(--surface); border: 0; box-shadow: var(--elev-1);
    border-bottom-left-radius: 6px;
  }
  /* Silence and failure are still MESSAGES: quiet tint, no dashed outline. */
  .ai .bubble.silent {
    background: var(--surface-2); box-shadow: none; border: 0; color: var(--ink-soft);
  }
  .ai .bubble.err-bubble {
    background: color-mix(in srgb, var(--danger) 9%, var(--surface));
    border: 0; color: var(--danger);
  }
  /* Its own line, its own target, and the failure's colour rather than the
     brand's — but not the same colour as the sentence above it. */
  .err-line { margin: 0; color: var(--ink); }
  .again {
    display: flex; margin-top: var(--s2); min-height: 0; padding: var(--s2) 0 0;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .who { margin-bottom: var(--s1); }
  /* Kept for assistive tech, which has no alignment or colour to go on. */
  .msg.me .who {
    position: absolute; width: 1px; height: 1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap;
  }
  .dots { display: flex; gap: var(--s1); padding: var(--s1) 2px; }
  .dots i { width: 0.375rem; height: 0.375rem; border-radius: 50%; background: var(--ink-faint); animation: bob 1.2s infinite; }
  .dots i:nth-child(2) { animation-delay: .15s } .dots i:nth-child(3) { animation-delay: .3s }
  @keyframes bob { 0%,60%,100% { opacity: .25; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-3px) } }

  /* The explanation is the demo's point, so its button is a material pill —
     the last outlined box in the conversation is gone. */
  .why {
    align-self: flex-start; margin-top: var(--s1); display: inline-flex; align-items: center;
    gap: var(--s2); min-height: var(--tap); padding: 0 var(--s3);
    background: none; border: 0; box-shadow: none; color: var(--accent-ink);
    font: inherit; font-size: var(--f-md); font-weight: 600; border-radius: 99px;
    cursor: pointer; transition: var(--t-fast);
  }
  .why:hover { color: var(--accent-ink); background: var(--surface-2); }
  .why[aria-expanded="true"] {
    color: var(--accent-ink); background: var(--surface); box-shadow: var(--elev-1);
  }
  .why .chev { transition: transform var(--t-med); }
  .why[aria-expanded="true"] .chev { transform: rotate(180deg); }

  /* ---------------- explanation ---------------- */
  .explain {
    margin-top: var(--s3); width: 100%; background: var(--surface); border: 0;
    border-radius: var(--r); box-shadow: var(--elev-2); overflow: hidden;
    animation: rise .25s var(--ease);
  }
  @keyframes rise { from { opacity: 0; transform: translateY(-4px) } }
  /* No band, no step: the panel is ONE surface.  The title carries the same
     hairline the section eyebrows use, so the eye reads a hierarchy that is
     drawn rather than shaded. */
  .ex-top { padding: var(--s4) var(--s4) var(--s2); }
  .ex-top h3 {
    margin: 0 0 var(--s1); display: flex; align-items: center; gap: var(--s3);
    font-family: var(--font-display); font-size: var(--f-lg); font-weight: 600; letter-spacing: -.005em;
  }
  .ex-top h3::after { content: ""; flex: 1; height: 1px; background: var(--line-soft); }
  .ex-top p { margin: 0; font-size: var(--f-md); color: var(--ink-soft); line-height: var(--lh-body); }
  .tags { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s3); }
  .tagx {
    font-size: var(--f-xs); font-weight: 600; padding: 3px var(--s3); border-radius: 99px; border: 0;
    background: var(--surface-2); color: var(--ink-soft);
  }
  .tagx.warn { color: var(--warn); background: color-mix(in srgb, var(--warn) 14%, var(--surface-2)); }
  .techbtn { margin-top: var(--s2); }
  /* The auditable layer: present in the DOM always, shown on request.  Written
     as a :not() so no later component rule can out-specify it and leak the
     engine's raw notes into the plain reading. */
  .explain:not(.tech) .enote,
  .explain:not(.tech) .rej-raw,
  .explain:not(.tech) .nid,
  .explain:not(.tech) .ns,
  .explain:not(.tech) .io { display: none; }
  .enote {
    margin-top: var(--s2); font-family: var(--font-machine); font-size: var(--f-xs);
    color: var(--ink-faint); line-height: 1.45; overflow-wrap: anywhere;
  }
  .legend {
    margin: 0; padding: var(--s3) var(--s4) 0; font-size: var(--f-sm); color: var(--ink-faint);
    line-height: var(--lh-snug);
  }

  /* ---- the explanation, drawn as the structure it describes ---------------
     Four acts hanging off ONE rail, so the panel reads as a single sequence
     rather than four boxes that happen to be stacked. The rail is not
     decoration: it is the claim that these things happened in this order. */
  .acts { padding: var(--s2) 0 0; }
  /* The acts arrive as a sequence, each settling after the one it follows from,
     so the panel reads as cause and effect rather than as four regions that
     happened to be stacked. */
  .act { animation: settle .34s cubic-bezier(.2,.7,.3,1) backwards; }
  .act:nth-child(2) { animation-delay: .09s }
  .act:nth-child(3) { animation-delay: .18s }
  .act:nth-child(4) { animation-delay: .27s }
  @keyframes settle { from { opacity: 0; transform: translateY(7px) } }
  /* Decorative motion is dropped wholesale; the spinners and the typing dots
     are the only signal that work is in flight, so they stay — the dots lose
     their travel and pulse in place instead. */
  @media (prefers-reduced-motion: reduce) {
    .act, .explain, .scrim, .meter.live > i::after { animation: none; }
    .dots i { animation: blink var(--t-blink) ease-in-out infinite; }
    * { scroll-behavior: auto !important; }
  }
  .act { position: relative; padding: 0 var(--s4) var(--s5) 52px; }
  /* The rail runs from under one act's number straight to the next one's, with
     no break at the boundary — a spine that stops at every joint is not a
     spine. On the last act it runs most of the way down and stops, so the
     sequence closes instead of pointing at nothing. */
  .act::before {
    content: ""; position: absolute; left: 29px; top: 28px; bottom: 0;
    width: 1px; background: var(--line);
  }
  .act:last-child::before { bottom: var(--s5); }
  .act > .no {
    position: absolute; left: var(--s4); top: 0; width: 26px; height: 26px;
    border-radius: 50%; display: grid; place-items: center;
    background: var(--surface-2); color: var(--accent-ink);
    font-family: var(--font-display); font-size: var(--f-sm); font-weight: 600;
  }
  .act > h4 { margin: 3px 0 2px; font-size: var(--f-md); font-weight: 600; }
  .act > .lede {
    margin: 0 0 var(--s3); font-size: var(--f-sm); color: var(--ink-soft);
    line-height: var(--lh-snug);
  }
  .act > .note-under {
    margin: var(--s2) 0 0; font-size: var(--f-sm); color: var(--ink-soft);
    line-height: var(--lh-snug);
  }
  @media (max-width: 560px), (max-height: 560px) {
    .act { padding-left: 42px; padding-right: var(--s3); }
    .act::before { left: 23px; }
    .act > .no { left: 10px; }
  }

  /* ---- the asked text, with what it recognised painted onto it ---------- */
  .pane {
    background: var(--surface-2); border-radius: var(--r-sm);
    padding: var(--s3) var(--s4); font-family: var(--font-machine);
    font-size: var(--f-sm); line-height: 1.95; overflow-wrap: anywhere;
    max-height: 210px; overflow-y: auto;
  }
  /* Three readings, told apart by WEIGHT and underline as well as by colour —
     a reader who cannot separate the hues still sees three states. */
  /* The text is cut at EVERY boundary the engine reported, so a run of one
     reading is many adjacent <mark>s and they have to look like one stretch.
     Two things would break that, and both are avoided here:
       · a border-radius notches a gap at every cut;
       · text-decoration: underline is simply NOT DRAWN over a <mark> holding
         only a space, so the rule breaks at every word boundary.
     The fill is a background-COLOR and the rule is a box-shadow (or, for the
     dashed one, a background-IMAGE), both of which paint the inline box whole —
     whitespace included. Three readings, told apart by weight and by the style
     of the rule as well as by colour, so they survive without the hues. */
  .pane mark { background: none; color: inherit; border-radius: 0; }
  .pane mark.carried {
    background-color: var(--accent-soft); color: var(--accent-ink);
    font-weight: 600; box-shadow: inset 0 -2px 0 var(--accent);
  }
  .pane mark.known {
    background-color: color-mix(in srgb, var(--ink) 7%, transparent);
    box-shadow: inset 0 -1px 0 var(--ink-faint);
  }
  .pane mark.aside {
    color: var(--ink-faint);
    background-image: linear-gradient(90deg, currentColor 55%, transparent 55%);
    background-size: 5px 1px; background-repeat: repeat-x; background-position: 0 100%;
  }
  .pane mark.flash { outline: 2px solid var(--accent); outline-offset: 2px; }
  .key {
    display: flex; flex-wrap: wrap; gap: var(--s1) var(--s3); margin-top: var(--s2);
    font-size: var(--f-xs); color: var(--ink-faint);
  }
  .key span { display: inline-flex; align-items: center; gap: 5px; }
  /* Each swatch is the pane's own treatment at swatch size — fill and rule
     both — so the legend teaches the marks that are actually on the page. */
  .key b {
    width: 17px; height: 11px; flex: none; border-radius: 2px;
    outline: 1px solid var(--line); outline-offset: -1px;
  }
  .key b.carried {
    background-color: var(--accent-soft); box-shadow: inset 0 -2px 0 var(--accent);
  }
  .key b.known {
    background-color: color-mix(in srgb, var(--ink) 7%, transparent);
    box-shadow: inset 0 -1px 0 var(--ink-faint);
  }
  .key b.aside {
    color: var(--ink-faint);
    background-image: linear-gradient(90deg, currentColor 55%, transparent 55%);
    background-size: 5px 1px; background-repeat: repeat-x; background-position: 0 100%;
  }
  .tally {
    margin: var(--s3) 0 0; font-size: var(--f-sm); color: var(--ink-soft);
    line-height: var(--lh-snug);
  }
  .caption {
    margin: var(--s3) 0 0; font-size: var(--f-xs); color: var(--ink-faint);
    line-height: var(--lh-snug);
  }
  .tally b { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
  .pieces { display: flex; flex-wrap: wrap; gap: var(--s1); margin-top: var(--s3); }
  .piece {
    font-family: var(--font-machine); font-size: var(--f-xs); border: 0;
    padding: 3px var(--s2); border-radius: var(--r-xs); background: var(--surface-2);
    color: var(--ink-soft); cursor: pointer; max-width: 100%;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition: box-shadow var(--t-fast);
  }
  .piece.more { cursor: default; }
  @media (hover: none) { .piece { padding: 9px var(--s3); } }
  /* Pinned: the control stays lit while the words it names stay lit. */
  .piece[aria-pressed="true"], .anchor[aria-pressed="true"] {
    box-shadow: inset 0 0 0 2px var(--accent);
  }
  .anchor { transition: box-shadow var(--t-fast); }
  .piece.carried { background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; }
  .piece.aside { background: none; color: var(--ink-faint); box-shadow: inset 0 0 0 1px var(--line); }

  /* ---- the chain, one box per place it stood ----------------------------- */
  .fnode { border-radius: var(--r-sm); padding: var(--s3) var(--s4); background: var(--surface-2); }
  /* Your own words are not a stored object, so they are not drawn as a card. */
  .fnode.asked { background: none; padding: 0; }
  .fnode.answer { background: var(--accent-soft); }
  .fnode.agreement {
    margin-left: 11px; background: var(--surface-2);
    box-shadow: inset 2px 0 0 var(--accent);
    border-radius: 0 var(--r-sm) var(--r-sm) 0;
  }
  .fhead {
    display: flex; align-items: center; flex-wrap: wrap; gap: var(--s1) var(--s2);
    margin-bottom: var(--s1); font-size: var(--f-xs); font-weight: 600;
    letter-spacing: var(--track-label); text-transform: uppercase; color: var(--ink-faint);
  }
  .fhead > span:first-child { white-space: nowrap; min-width: 0; overflow-wrap: anywhere; }
  @media (max-width: 560px) { .fhead > span:first-child { white-space: normal; flex: 1 1 100%; } }
  .fnode.answer .fhead { color: var(--accent-ink); }
  .ftext { font-size: var(--f-md); line-height: var(--lh-body); overflow-wrap: anywhere; }
  /* A stored note is DATA: quoted in the machine voice, never paraphrased. */
  .fnode.note .ftext, .fnode.answer .ftext, .fnode.agreement .ftext {
    font-family: var(--font-machine); font-size: var(--f-sm);
  }
  .nid {
    margin-left: auto; flex: none; font-family: var(--font-machine);
    font-size: var(--f-xs); font-weight: 500; letter-spacing: 0;
    text-transform: none; color: var(--ink-faint);
  }
  .fnode.answer .nid { color: var(--accent-ink); }
  /* The tie back to the question: point at this and the words light up. */
  .anchor {
    flex: none; border: 0; background: var(--accent-soft); color: var(--accent-ink);
    border-radius: 99px; padding: 2px var(--s2); cursor: pointer;
    font: inherit; font-size: var(--f-2xs); font-weight: 600; letter-spacing: var(--track-badge);
    text-transform: uppercase;
  }
  .exact {
    flex: none; font-size: var(--f-2xs); font-weight: 600; letter-spacing: var(--track-badge);
    text-transform: uppercase; color: var(--ok-ink); background: var(--ok-soft);
    border-radius: 99px; padding: 2px var(--s2);
  }
  /* The connector carries the move: the arrow is drawn, not typed, so it reads
     as one continuous line from the box above to the box below. */
  .flink {
    display: grid; grid-template-columns: 24px minmax(0, 1fr);
    column-gap: var(--s2); padding: var(--s2) 0;
  }
  /* The arrow keeps the first column for the WHOLE connector, however many
     lines it carries; everything else is placed in the second explicitly. Left
     to auto-placement a third line (the engine's own note, when the auditable
     layer is on) drops into the 24px arrow column and renders one letter per
     line. */
  .flink .glyph { grid-column: 1; grid-row: 1 / -1; color: var(--accent); }
  .flink > :not(.glyph) { grid-column: 2; min-width: 0; }
  .flink .move {
    display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2);
    font-size: var(--f-sm); font-weight: 600; padding-top: 1px;
  }
  .flink .lead {
    font-size: var(--f-sm); color: var(--ink-soft); line-height: var(--lh-snug);
    margin-top: 2px;
  }
  .cost {
    font-family: var(--font-machine); font-size: var(--f-xs); font-weight: 500;
    color: var(--ink-soft); background: var(--surface); border-radius: 99px;
    padding: 1px 7px;
  }
  /* THE CONVERGENCE.  Lines spread across the top of the group and meet one
     point at the bottom — the mark for "these many became this one". The next
     arrow leaves from that point, so the funnel and the arrow read as one
     continuous movement rather than as a list beside a separate arrow. */
  /* THE OVERLAP.  One left edge, one type size, the shared opening solid and
     the rest of the note faded: "your text is the start of this note" becomes
     something you see instead of something the caption claims. */
  /* THE COMPUTATION.  An equals sign and a value, with no arrow and no box —
     a silhouette that cannot be confused with a walk between two stored notes,
     because it is not one. */
  .equation {
    display: flex; align-items: baseline; gap: var(--s3);
    padding: var(--s2) 0 0 var(--s2);
  }
  .eqsign {
    font-family: var(--font-display); font-size: var(--f-hero); font-weight: 600;
    line-height: 1; color: var(--accent);
  }
  .eqval {
    font-family: var(--font-machine); font-size: var(--f-lg); font-weight: 600;
    color: var(--ink); overflow-wrap: anywhere; min-width: 0;
  }

  .ftext.overlap .same { color: var(--ink); font-weight: 600; }
  .ftext.overlap .rest,
  .near-row2 .rest { color: var(--ink-faint); }
  .near-row2 .same {
    color: var(--ink); font-weight: 600;
    background: color-mix(in srgb, var(--ink) 7%, transparent);
    box-shadow: inset 0 -1px 0 var(--ink-faint);
  }
  .near-row2 {
    display: flex; align-items: baseline; gap: var(--s3);
    padding: var(--s2) 0; border-top: 1px solid var(--line-soft);
  }
  .near-row2:first-child { border-top: 0; }
  .near-row2 .nt {
    flex: 1; min-width: 0; font-family: var(--font-machine); font-size: var(--f-xs);
    line-height: var(--lh-snug); overflow-wrap: anywhere;
  }
  .near-row2 .ns {
    flex: none; font-family: var(--font-machine); font-size: var(--f-xs);
    color: var(--ink-faint); font-variant-numeric: tabular-nums;
  }

  .voters { display: grid; gap: 3px; margin-top: var(--s2); }
  .voters div {
    font-family: var(--font-machine); font-size: var(--f-xs); color: var(--ink-soft);
    background: var(--surface); border-radius: var(--r-xs); padding: 3px var(--s2);
    overflow-wrap: anywhere;
  }
  .voters p { margin: 2px 0 0; font-size: var(--f-xs); color: var(--ink-faint); }
  /* THE FAN.  A gutter on the left holds one drawn line per note; the lines
     start at their own rows and meet one point at the bottom, where the arrow
     out of the group begins. "They agree on this" is then a thing you see. */
  .fan { position: relative; padding-left: 26px; margin-top: var(--s2); }
  .fanrows { display: grid; gap: 3px; }
  .fanrows > div {
    font-family: var(--font-machine); font-size: var(--f-xs); color: var(--ink-soft);
    background: var(--surface); border-radius: var(--r-xs); padding: 3px var(--s2);
    overflow-wrap: anywhere;
  }
  .fanlines {
    position: absolute; left: 0; top: 0; bottom: 0; width: 26px;
    color: var(--accent);
  }
  .fanlines svg { display: block; width: 100%; height: 100%; }
  .fanmore {
    margin: var(--s2) 0 0 26px; font-size: var(--f-xs); color: var(--ink-faint);
  }
  .support {
    display: flex; gap: var(--s2); align-items: flex-start; margin-top: var(--s3);
    font-size: var(--f-sm); color: var(--ink-soft); line-height: var(--lh-snug);
  }
  .support svg { flex: none; color: var(--ok); margin-top: 2px; }
  .support b { color: var(--ink); font-weight: 600; }


  /* ---- what it nearly reached (a silence has a shape too) ---------------- */
  .near { display: grid; gap: var(--s2); }
  .near-row {
    display: grid; grid-template-columns: minmax(0, 1fr) 68px 34px;
    gap: var(--s2); align-items: center;
  }
  .near-row .t {
    font-family: var(--font-machine); font-size: var(--f-xs); color: var(--ink-soft);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .near { display: grid; }

  /* ---- the cost ladder ---------------------------------------------------- */
  .ladder { display: grid; gap: 0; }
  .rung { padding: var(--s3) 0; }
  .rung + .rung { border-top: 1px solid var(--line-soft); }
  .rules { margin: var(--s3) 0 0; display: grid; gap: var(--s2); }
  .rules p {
    margin: 0; font-size: var(--f-sm); color: var(--ink-soft);
    line-height: var(--lh-snug);
  }
  .rung .top { display: flex; align-items: baseline; gap: var(--s2); flex-wrap: wrap; }
  .rung .name { font-size: var(--f-sm); font-weight: 600; }
  .rung .stat {
    font-size: var(--f-xs); border-radius: 99px; padding: 1px 7px;
    background: var(--surface-2); color: var(--ink-soft);
  }
  .rung.won .stat { background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; }
  .rung .grade {
    margin-left: auto; font-family: var(--font-machine); font-size: var(--f-xs);
    color: var(--ink-faint); font-variant-numeric: tabular-nums;
  }
  .rung .gauge {
    position: relative; height: 6px; border-radius: 99px;
    background: var(--surface-2); margin-top: var(--s2); overflow: hidden;
  }
  .rung .gauge > i {
    display: block; height: 100%; border-radius: 99px; background: var(--ink-faint);
  }
  /* A floor is a POSITION on the scale, not a quantity spent — so it is a mark
     at that position, never a filled length. */
  .rung .gauge > i.tick {
    position: absolute; top: 0; bottom: 0; width: 2px; border-radius: 0;
    background: var(--ink-faint);
  }
  .rung.floor .gauge {
    background: none; box-shadow: inset 0 0 0 1px var(--line);
  }
  .rung.won .gauge > i { background: var(--accent); }
  .rung .lead {
    margin: var(--s2) 0 0; font-size: var(--f-sm); color: var(--ink-soft);
    line-height: var(--lh-snug);
  }

  /* ---- the trace, in the engine's own nesting ---------------------------- */
  .tree-key {
    display: flex; flex-wrap: wrap; gap: var(--s1) var(--s3); margin-bottom: var(--s2);
    font-size: var(--f-xs); color: var(--ink-faint);
  }
  .tree-key span { display: inline-flex; align-items: center; gap: 5px; }
  .tree {
    max-height: 420px; overflow: auto; overscroll-behavior: contain;
    border-radius: var(--r-sm); background: var(--surface-2);
  }
  /* The key has to stay beside the rows it explains, not scroll off the top of
     four hundred pixels of tree. */
  .tree .tree-key {
    position: sticky; top: 0; z-index: 1; margin: 0;
    padding: var(--s2) var(--s3); background: var(--surface-2);
    border-bottom: 1px solid var(--line-soft);
  }
  .trow { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: var(--s2); padding: 5px var(--s3); }
  .trow + .trow { border-top: 1px solid var(--line-soft); }
  .trow .ix {
    font-family: var(--font-machine); font-size: var(--f-2xs); color: var(--ink-faint);
    text-align: right; padding-top: 4px; font-variant-numeric: tabular-nums;
  }
  .trow .body { min-width: 0; }
  .trow .nm { display: flex; align-items: center; gap: var(--s2); font-size: var(--f-sm); }
  .trow .nm .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .trow .plain { font-size: var(--f-xs); color: var(--ink-soft); line-height: var(--lh-snug); }
  /* Five families, and three of the five hues that survive both themes are
     warm browns — indistinguishable at 7px, and worse for a reader who cannot
     separate them at all. The SHAPE carries the category and the hue only
     confirms it: square, ring, disc, diamond, disc, with the two discs far
     apart in hue. */
  .dotf { width: 7px; height: 7px; border-radius: 50%; flex: none; }
  .dotf.read { border-radius: 1px; background: var(--ink-faint); }
  .dotf.recall { background: none; box-shadow: inset 0 0 0 2px var(--cool); }
  .dotf.walk { background: var(--accent); }
  .dotf.weigh { border-radius: 1px; background: var(--warn); transform: rotate(45deg); }
  .dotf.speak { background: var(--ok); }
  .trow .rep {
    flex: none; font-size: var(--f-2xs); font-weight: 600; color: var(--accent-ink);
    background: var(--accent-soft); border-radius: 99px; padding: 0 6px;
  }
  .trow .dep {
    flex: none; margin-left: auto; font-family: var(--font-machine);
    font-size: var(--f-2xs); color: var(--ink-faint);
  }
  .trow .io {
    display: flex; align-items: center; gap: 5px; margin-top: 3px;
    font-family: var(--font-machine); font-size: var(--f-2xs); color: var(--ink-faint);
    min-width: 0;
  }
  .trow .io span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .trow .io span.to { color: var(--accent-ink); }

  details.more { border-top: 1px solid var(--line); }
  details.more > summary {
    display: flex; align-items: center; min-height: var(--tap);
    padding: var(--s3) var(--s4); cursor: pointer; list-style: none;
    user-select: none; font-size: var(--f-sm); font-weight: 600;
    color: var(--ink-soft);
  }
  details.more > summary::-webkit-details-marker { display: none; }
  details.more > summary::before {
    content: ""; flex: none; width: 0; height: 0; margin-right: var(--s2);
    border: 4px solid transparent; border-left-color: currentColor;
    transition: transform var(--t-med);
  }
  details.more[open] > summary::before { transform: rotate(90deg) translateX(-2px); }
  details.more > summary:hover { color: var(--accent-ink); }
  details.more .inner {
    padding: 0 var(--s4) var(--s4); font-size: var(--f-sm); color: var(--ink-soft);
  }
  details.more .inner > p { margin: 0 0 var(--s3); line-height: var(--lh-snug); }

  /* A disclosure that belongs to an act, not to the panel: it carries the act's
     own indent and none of the appendix chrome. */
  details.inline { margin-top: var(--s3); }
  details.inline > summary {
    display: inline-flex; align-items: center; gap: var(--s2);
    min-height: 2.125rem; cursor: pointer; list-style: none; user-select: none;
    font-size: var(--f-sm); font-weight: 600; color: var(--accent-ink);
  }
  details.inline > summary::-webkit-details-marker { display: none; }
  details.inline > summary::before {
    content: ""; flex: none; width: 0; height: 0;
    border: 4px solid transparent; border-left-color: currentColor;
    transition: transform var(--t-med);
  }
  details.inline[open] > summary::before { transform: rotate(90deg) translateX(-2px); }
  details.inline > summary:hover { text-decoration: underline; text-underline-offset: 3px; }
  .inline-body { padding-top: var(--s2); }

  .rej { padding: var(--s2) 0; border-top: 1px solid var(--line-soft); line-height: var(--lh-snug); font-size: var(--f-sm); }
  .rej:first-child { border-top: 0; }
  .rej b { color: var(--ink); font-weight: 600; display: block; }
  .rej-raw {
    margin-top: 3px; font-size: var(--f-xs); color: var(--ink-faint);
    font-family: var(--font-machine); line-height: 1.45; overflow-wrap: anywhere;
  }
  .flag {
    display: flex; gap: var(--s2); align-items: flex-start; margin: 0 var(--s4) var(--s4); padding: var(--s3);
    border-radius: var(--r-sm); font-size: var(--f-sm); line-height: var(--lh-snug);
    background: color-mix(in srgb, var(--warn) 11%, transparent); border: 0;
  }
  .flag svg { flex: none; color: var(--warn); margin-top: 2px; }

  /* On a phone the explanation comes up as a SHEET from the bottom edge: full
     width, its own scroll, a way out always in reach — instead of a panel that
     pushes the answer out of the conversation.  Above 560px none of this
     applies and the panel is the in-flow region it always was; resizing across
     the boundary needs no script, only these two rules. */
  .scrim { display: none; }
  .sheet-bar { display: none; }
  /* On a phone the panel is already a sheet that scrolls inside itself, and a
     scroller nested in a disclosure nested in that sheet is a trap: the trace
     ends up behind an inner scrollbar two levels down. Let them grow. */
  @media (max-width: 560px) {
    .pane, .tree { max-height: none; }
    .tree .tree-key { position: static; }
  }
  @media (max-width: 560px), (max-height: 560px) {
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
    display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--s3);
    margin-bottom: var(--s2); font-size: var(--f-xs); color: var(--ink-faint);
    line-height: var(--lh-snug);
  }
  .thread > span { flex: 1 1 12rem; min-width: 0; }
  .thread button {
    margin-left: auto; flex: none; display: inline-flex; align-items: center; min-height: var(--tap);
    background: none; border: 0; padding: 0; cursor: pointer;
    font: inherit; font-size: var(--f-xs); color: var(--accent);
    text-decoration: underline; text-underline-offset: 3px;
  }

  /* Reachable by keyboard, invisible until it is. */
  .skip {
    position: absolute; left: var(--s4); top: -100px; z-index: 30;
    background: var(--surface); color: var(--accent-ink); box-shadow: var(--elev-2);
    border-radius: var(--r-sm); padding: var(--s2) var(--s4);
    font-size: var(--f-sm); font-weight: 600; text-decoration: none;
    transition: top var(--t-fast);
  }
  .skip:focus { top: var(--s2); }

  /* ---------------- composer ---------------- */
  .composer {
    flex: none; border-top: 1px solid var(--line-soft); background: var(--bg);
    padding: var(--s3) 0 var(--s4);
    padding-bottom: calc(var(--s4) + env(safe-area-inset-bottom, 0px));
  }
  /* The one place you type is material, like a card — not another outlined box.
     Focus is answered by a ring plus a deeper step, never by a border colour. */
  .field {
    display: flex; gap: var(--s2); align-items: flex-end; background: var(--surface);
    border: 0; border-radius: var(--r); box-shadow: var(--elev-1);
    padding: 4px 4px 4px var(--s4); transition: var(--t-fast);
  }
  .field:focus-within {
    box-shadow: var(--elev-1), 0 0 0 2px color-mix(in srgb, var(--accent) 32%, transparent);
  }
  #q {
    flex: 1; min-width: 0; border: 0; background: none; color: var(--ink); font: inherit;
    font-size: var(--f-base); line-height: var(--lh-snug); resize: none; max-height: min(9.375rem, 30vh);
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
  .pair:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  /* The two inputs are wrapped in a field that rings itself on focus-within,
     so they must NOT also draw their own — two concentric marks of different
     shapes is not a clearer focus state, it is a drawing error. */
  #q:focus-visible, #exq:focus-visible { outline: none; }
  summary:focus-visible { outline-offset: -2px; border-radius: var(--r-sm); }
  .ex-top h3:focus, .ex-top h3:focus-visible { outline: none; }

  /* A status bar, not a sentence: what it is on the left, how to drive it on the
     right. */
  .foot {
    display: flex; justify-content: space-between; gap: var(--s3);
    font-size: var(--f-xs); color: var(--ink-faint); margin: var(--s2) 0 0;
  }
  @media (max-width: 560px) { .foot { display: none; } }
  /* Enter sends only where there is a key to hold with it, so the line that
     says so may only appear there. */
  @media (pointer: coarse) { .foot .keys { display: none; } }
  /* Landscape on a phone is ~360px tall: the composer must not take a third of
     it, and the hint line below it has no business being there at all. */
  @media (max-height: 560px) {
    /* The boot card is the tallest thing in the app and this is the shortest
       viewport it meets; its actions have to stay within one screen. */
    #boot { padding: var(--s3) var(--s4); }
    .card { padding: var(--s4); }
    .hint { font-size: var(--f-2xs); }
  }
  @media (max-height: 460px) {
    .composer { padding: var(--s2) 0; padding-bottom: calc(var(--s2) + env(safe-area-inset-bottom, 0px)); }
    #q { min-height: 38px; max-height: 84px; padding: 7px 0; }
    .foot { display: none; }
    .welcome { padding-top: var(--s4); }
  }
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
 <div class="wrap">
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
      Sema keeps its knowledge as knowledge — a graph on disk, not weights. These files
      are fetched once from Hugging&nbsp;Face and saved beside this application.
    </p>
  </div>
 </div>
</section>

<!-- ============ chat ============ -->
<main id="app">
  <a class="skip" href="#q">Skip to the question box</a>
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
      <p class="foot"><span>deterministic · auditable · CPU-only</span><span class="keys"><b>Enter</b> to send · <b>Shift+Enter</b> for a new line</span></p>
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
    // Precision follows magnitude: 820 MB, not 820.0 MB; 2.2 GB, not 2 GB.
    return n.toFixed(i === 0 || n >= 100 ? 0 : 1) + ' ' + u[i];
  }
  function duration(s) {
    if (s == null || !isFinite(s)) return '';
    if (s < 90) return Math.max(1, Math.round(s)) + ' sec';
    var m = Math.round(s / 60);
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' hr ' + r + ' min' : h + ' hr';
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
  // What each file IS. Without this the largest block on the first screen
  // anyone sees is three internal filenames.
  var FILES = {
    'sqlite': 'the notes themselves',
    'content.vec': 'what each note is about',
    'halo.vec': 'how the notes relate'
  };
  function fileRole(name) {
    for (var k in FILES) if (name.indexOf(k) >= 0) return FILES[k];
    return '';
  }

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
    // The bar goes (there is no progress to show) but the FIGURE stays: how
    // far it got is exactly what the reader wants here, and "nothing already
    // downloaded is lost" is the next sentence on the card.
    if (s.phase === 'error') $('graph').classList.remove('on');

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
      $('boot-sub').textContent = plural((s.files || []).length, 'file') +
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
        var role = fileRole(f.name);
        if (role) head.appendChild(el('span', 'role', role));
        r.val = el('span', 'val');
        head.appendChild(r.val);
        var m = el('div', 'meter');
        r.bar = el('i'); m.appendChild(r.bar);
        r.why = el('div', 'why-note');
        r.box = box;
        box.appendChild(head); box.appendChild(r.why); box.appendChild(m);
        $('files').appendChild(box);
      }
      var running = !f.done && f.have > 0 && active;
      r.bar.style.width = (f.total > 0 ? (f.have / f.total) * 100 : 0).toFixed(2) + '%';
      r.box.className = 'file' + (f.done ? ' is-done' : running ? ' is-running' : ' is-idle');
      r.state.className = 'state' + (f.done ? ' done' : running ? ' active' : '');
      r.val.textContent = f.done ? 'done' : bytes(f.have) + ' of ' + bytes(f.total);
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
          fetch('/api/retry', { method: 'POST' }).then(function (r) {
            if (!r.ok) throw new Error(httpReason(r.status));
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
      focusComposer();
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

    var box = el('div', 'explorer');
    box.appendChild(el('div', 'try', 'Explore the training data'));
    // A first-time reader has no model of what "a stored note" is, and the
    // rows alone do not supply one. This says the SHAPE of a note, which
    // holds for any corpus this app is pointed at.
    box.appendChild(el('p', 'caption',
      'This is the memory itself. Each row is one note it was given — some ' +
      'text, and what it was taught comes after it. Pick one to ask Sema about.'));

    var f = el('div', 'ex-field');
    f.innerHTML = svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5"/>', 15);
    var input = el('input', null);
    input.id = 'exq';
    input.type = 'search';
    input.placeholder = 'Search the training data…';
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


    var shuffle = el('button', 'linkbtn ex-more', 'Show other examples');
    box.appendChild(shuffle);

    function load(q) {
      go.disabled = true;
      shuffle.disabled = true;
      meta.innerHTML = '';
      meta.className = 'ex-meta';
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
          meta.textContent = '';
          meta.className = 'ex-meta bad';
          meta.appendChild(el('span', null, 'Search failed'));
          // A failure takes the same shape as an empty result, so the two read
          // as the same kind of outcome rather than as a styling accident.
          var box2 = el('div', 'ex-empty');
          box2.appendChild(el('p', 'ex-empty-title', 'The search did not run'));
          box2.appendChild(el('p', 'ex-empty-msg', e.message));
          var again = el('button', 'linkbtn', 'Try again');
          again.onclick = function () { load(q); };
          box2.appendChild(again);
          list.appendChild(box2);
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
    var held = group(d.totalContexts) + ' notes held';

    if (!d.pairs.length) {
      meta.textContent = held;
      var empty = el('div', 'ex-empty');
      empty.appendChild(el('p', 'ex-empty-title', 'Nothing matched'));
      empty.appendChild(el(
        'p',
        'ex-empty-msg',
        d.note ||
          'Sema holds a finite set of notes, and nothing sits above the parts of ' +
            'your text it recognised.',
      ));
      list.appendChild(empty);
      return;
    }

    // Two tones: what happened, then how long it took — three facts joined by
    // middots read like a log line, not like a caption.
    meta.innerHTML = '';
    meta.appendChild(el('span', null, d.browsed
      ? 'A few of the ' + held + ', picked at random'
      : d.pairs.length + ' matched · ' + d.resolved + ' parts of your text recognised'));
    meta.appendChild(el('span', 'dim', '· ' + d.tookMs + ' ms'));

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
      var s2 = el('span', 'side learnt');
      s2.appendChild(el('span', 'lbl', 'It learnt'));
      var v2 = el('span', 'val', p.continuation + (p.continuationTruncated ? '…' : ''));
      v2.dir = 'auto';
      s2.appendChild(v2);
      b.appendChild(s2);
      // Only a search hit has anything to say here; a browsed sample does not,
      // and an empty footer was costing every card a row of its own.
      if (p.matchedBytes) {
        b.appendChild(el('span', 'sc',
          'matched on ' + p.matchedBytes + ' bytes of your text'));
      }
      var go = el('span', 'go');
      go.innerHTML = svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 15);
      b.appendChild(go);
      b.setAttribute('aria-label', 'Ask Sema: ' + p.context);
      b.onclick = function () {
        var draft = $('q').value.trim();
        $('q').value = p.context;
        resize();
        // With something half-written, loading the question and waiting is the
        // only safe reading of a tap: sending would throw the draft away, and
        // a stray tap while scrolling is exactly how that would happen.
        if (draft) { focusComposer(); return; }
        send();
      };
      list.appendChild(b);
    });
  }

  /* ================= explanation ================= */
  var CHEV = '<path d="M6 9l6 6 6-6"/>';

  function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : (many || one + 's'));
  }

  /** Sentence case for a phrase used as a heading. */
  function upper(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

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

  /** One act of the explanation: a number on the rail, a title, a line of
   *  orientation, and then the concrete material the act is ABOUT. */
  function act(n, title, lede) {
    var a = el('div', 'act');
    a.appendChild(el('div', 'no', String(n)));
    a.appendChild(el('h4', null, title));
    if (lede) a.appendChild(el('p', 'lede', lede));
    return a;
  }

  /** A box in the chain. Its kind is what this place IS — your words, a stored
   *  note, several notes agreeing, the answer — and the box is drawn
   *  differently for each, because they are not the same kind of thing. */
  function fnode(kind, title) {
    var n = el('div', 'fnode ' + kind);
    var h = el('div', 'fhead');
    h.appendChild(el('span', null, title));
    n.appendChild(h);
    return { box: n, head: h };
  }

  /** The connector between two boxes: a drawn arrow on the left, the move it
   *  made beside it, and one sentence on why that move is the one that carried
   *  the answer. */
  function flink(link, headline) {
    var l = el('div', 'flink');
    var g = el('div', 'glyph');
    g.innerHTML = '<svg width="24" height="30" viewBox="0 0 24 30" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 1v22"/><path d="M6 17l6 6 6-6"/></svg>';
    l.appendChild(g);
    var m = el('div', 'move');
    // The panel's one-line verdict is often this very move, word for word, and
    // printing it again directly beneath is a restatement rather than a second
    // fact. When that happens the arrow carries the REASON in the strong
    // position instead — one line, not two saying the same thing.
    var said = headline && link.label &&
      headline.toLowerCase().indexOf(link.label.toLowerCase()) >= 0;
    var lead = said && link.plain ? null : link.plain;
    m.appendChild(document.createTextNode(
      said && link.plain ? link.plain : link.label));
    if (link.cost != null) {
      var c = el('span', 'cost', 'cost ' + link.cost);
      c.title = 'What this move cost on the engine\\'s one scale. Lower is cheaper. ' +
        'It is a cost, never a confidence.';
      m.appendChild(c);
    }
    l.appendChild(m);
    if (lead) l.appendChild(el('div', 'lead', lead));
    // The engine's own wording for this hop, kept underneath and shown on
    // request: a plain reading must never cost the reader the auditable one.
    if (link.note) l.appendChild(el('div', 'enote', link.note));
    return l;
  }

  /** How strong a reading is: a stretch that carries the answer outranks one
   *  that is merely known, which outranks one that answers something else. */
  var rank = { aside: 0, known: 1, carried: 2 };

  /** THE CONVERGENCE, as a drawing.  One line per note spread across the top,
   *  all meeting one point at the bottom — the mark for "these many became
   *  this one". It is the only visual event in an answer that rests on
   *  agreement, and a bracket down the side of a list does not show it.
   *
   *  The viewBox is stretched to the element's real width, so the lines fan
   *  across whatever space the group occupies, while a non-scaling stroke keeps
   *  them hairlines as they stretch. No measurement, no layout dependency. */
  function funnel(n) {
    // The viewBox is n units tall and the SVG is stretched over exactly the n
    // rows, so unit i + 0.5 lands on row i's centre whatever the type size or
    // the viewport does. Each line starts at its own row's left edge and ends
    // at one point in the bottom-left corner — the point the next arrow leaves
    // from. No measurement, no layout dependency, and it is the rows that
    // converge rather than a decoration under them.
    var W = 26, paths = '';
    for (var i = 0; i < n; i++) {
      var y = (i + 0.5).toFixed(2);
      paths += '<path d="M' + W + ' ' + y + ' C' + (W * 0.3) + ' ' + y +
        ', 3 ' + ((i + n) / 2).toFixed(2) + ', 3 ' + n + '"' +
        ' vector-effect="non-scaling-stroke"/>';
    }
    var d = el('div', 'fanlines');
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + n + '" preserveAspectRatio="none" ' +
      'fill="none" stroke="currentColor" stroke-width="1.1">' + paths + '</svg>';
    return d;
  }

  /** The longest stretch the second string shares with the first, as a
   *  [start, end) range into the second.
   *  Used to show a near miss against your own words: what it has in common
   *  solid, what it does not faded. The strings here are one short line each,
   *  so the straightforward table is the right amount of machinery. */
  function sharedRun(a, b) {
    a = (a || '').toUpperCase(); b = (b || '').toUpperCase();
    if (!a || !b) return null;
    var prev = new Array(a.length + 1).fill(0), best = 0, end = 0;
    for (var j = 1; j <= b.length; j++) {
      var cur = new Array(a.length + 1).fill(0);
      for (var i = 1; i <= a.length; i++) {
        if (b[j - 1] === a[i - 1]) {
          cur[i] = prev[i - 1] + 1;
          if (cur[i] > best) { best = cur[i]; end = j; }
        }
      }
      prev = cur;
    }
    return best >= 3 ? [end - best, end] : null;
  }

  function renderExplanation(x) {
    var root = el('div', 'explain');
    var silent = x.outcome === 'silent';

    /* ── the verdict ─────────────────────────────────────────────────── */
    var top = el('div', 'ex-top');
    top.appendChild(el('h3', null, silent
      ? 'Why Sema stayed silent'
      : 'How Sema reached this answer'));
    top.appendChild(el('p', null, x.headline));

    var tags = el('div', 'tags');
    var hops = x.chain.links.filter(function (l) { return l.move !== 'recognise'; }).length;
    if (!silent && hops) tags.appendChild(el('span', 'tagx', plural(hops, 'move')));
    // The step count and the milliseconds used to sit here, where "1 move"
    // beside "159 steps in all" reads as the panel contradicting itself. Both
    // now live on the trace disclosure, next to the thing they count.
    if (x.tookMs != null) tags.appendChild(el('span', 'tagx enote', x.tookMs + ' ms'));
    if (x.provenance && PROVENANCE[x.provenance]) {
      tags.appendChild(el('span', 'tagx' + (x.provenance === 'recall-echo' ? ' warn' : ''),
        PROVENANCE[x.provenance]));
    }
    top.appendChild(tags);

    // Sema's own notes are the auditable record and have to stay reachable, but
    // printed inline they put a cost float on every row. One switch, off by
    // default, for the whole panel.
    var tech = el('button', 'linkbtn quiet techbtn');
    var techOn = false;
    function paintTech() {
      root.className = 'explain' + (techOn ? ' tech' : '');
      tech.textContent = techOn ? 'Hide Sema\\'s own notes' : 'Show Sema\\'s own notes';
      tech.setAttribute('aria-pressed', techOn ? 'true' : 'false');
    }
    tech.onclick = function () { techOn = !techOn; paintTech(); };
    top.appendChild(tech);
    root.appendChild(top);
    paintTech();

    var acts = el('div', 'acts');
    root.appendChild(acts);

    /* ── the acts, numbered as they are built ────────────────────────── */
    var actNo = 0;
    var r = x.reading;

    // THE PAINTED QUESTION.  Built once and placed wherever the story needs
    // it: inside the chain's first box when there is a chain, standing alone
    // when there is not. It used to be printed twice — once as an act of its
    // own and again as the chain's opening box, two hundred pixels apart and
    // identical — which told the reader that reading and walking are two
    // different places. They are one place.
    var cuts = {};
    cuts[0] = 1; cuts[r.text.length] = 1;
    r.pieces.forEach(function (p) { cuts[p.a] = 1; cuts[p.b] = 1; });
    var edges = Object.keys(cuts).map(Number).sort(function (a, b) { return a - b; });
    var pane = el('div', 'pane');
    pane.dir = 'auto';
    for (var i = 0; i < edges.length - 1; i++) {
      var lo = edges[i], hi = edges[i + 1];
      if (hi <= lo) continue;
      var kind = null;
      r.pieces.forEach(function (p) {
        if (p.a <= lo && p.b >= hi && (kind === null || rank[p.kind] > rank[kind])) kind = p.kind;
      });
      var slice = r.text.slice(lo, hi);
      if (kind === null) { pane.appendChild(document.createTextNode(slice)); continue; }
      var mk = el('mark', kind, slice);
      mk.dataset.a = String(lo);
      mk.dataset.b = String(hi);
      pane.appendChild(mk);
    }

    /** Light up every segment of the painted question inside [a, b) — the
     *  relation between a box further down and the words it came from. */
    function flash(a, b, on) {
      pane.querySelectorAll('mark').forEach(function (m) {
        if (Number(m.dataset.a) >= a && Number(m.dataset.b) <= b) {
          m.classList.toggle('flash', on);
        }
      });
      if (on) {
        var first = pane.querySelector('mark.flash');
        if (first && first.scrollIntoView) {
          first.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }
    }
    /** Wire a control to the words it stands for. Pointing lights them;
     *  CLICKING pins them, because a phone has no hover and without the pin
     *  the one relation this panel exists to show would be unreachable there. */
    function linkFlash(node, ranges) {
      var pinned = false;
      function set(on) { ranges.forEach(function (rg) { flash(rg[0], rg[1], on); }); }
      node.onmouseenter = function () { if (!pinned) set(true); };
      node.onmouseleave = function () { if (!pinned) set(false); };
      node.onfocus = function () { if (!pinned) set(true); };
      node.onblur = function () { if (!pinned) set(false); };
      node.onclick = function () {
        pinned = !pinned;
        set(pinned);
        node.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      };
      node.setAttribute('aria-pressed', 'false');
    }

    /** The forensic detail about the reading: real, auditable, and not the
     *  derivation. It used to open the panel — ~350px of counts ending in a
     *  sentence admitting the answer came from somewhere else — and readers
     *  stopped there, before any arrow. It is one line away now. */
    function recognitionDetail() {
      var d = el('details', 'inline');
      d.appendChild(el('summary', null, r.covered > 0
        ? 'What it recognised in your text'
        : 'It recognised none of your text'));
      var body = el('div', 'inline-body');
      if (r.covered > 0) {
        var tally = el('p', 'tally');
        tally.innerHTML =
          (r.leaves ? 'It cut your text into <b>' + r.leaves + '</b> pieces and found <b>' +
            r.forms + '</b> of them in memory. ' : '') +
          'Between them they span <b>' + r.covered + '</b> of its <b>' + r.text.length +
          '</b> characters.';
        body.appendChild(tally);
      }
      if (r.fromThread) {
        body.appendChild(el('p', 'note-under',
          'This is more than you just typed: Sema is handed the whole thread, so ' +
          'earlier turns are part of what it read — which is why a long conversation drifts.'));
      }
      if (r.leftoverBytes && r.covered > 0) {
        body.appendChild(el('p', 'note-under',
          'Spanned is not the same as accounted for: going back over your text piece ' +
          'by piece it could not account for ' + plural(r.leftoverBytes, 'byte') +
          ' on their own' + (r.leftover ? ' — “' + r.leftover.join('”, “') + '”' : '') +
          '. They sit inside wording that matched as a whole.'));
      }
      if (r.pieces.length) {
        var byText = {}, order = [];
        r.pieces.forEach(function (p) {
          var t = p.text.trim() || p.text;
          var k = p.kind + '\u0000' + t;
          if (!byText[k]) { byText[k] = { text: t, kind: p.kind, node: p.node, at: [] }; order.push(k); }
          byText[k].at.push([p.a, p.b]);
        });
        var groups = order.map(function (k) { return byText[k]; })
          .sort(function (a, b) {
            return (rank[b.kind] - rank[a.kind]) || (b.text.length - a.text.length);
          });
        var key = el('div', 'key');
        [['carried', 'carried the answer'],
         ['known', 'wording it holds'],
         ['aside', 'holds it, but it answers something else']].forEach(function (k) {
          if (!groups.some(function (g) { return g.kind === k[0]; })) return;
          var sp = el('span');
          sp.appendChild(el('b', k[0]));
          sp.appendChild(document.createTextNode(k[1]));
          key.appendChild(sp);
        });
        body.appendChild(key);
        body.appendChild(el('p', 'caption',
          'Sema cuts your text at its own boundaries, so these overlap — ' +
          (window.matchMedia('(hover: none)').matches ? 'tap' : 'point at') +
          ' one to find it above.'));
        var pieces = el('div', 'pieces');
        groups.slice(0, 14).forEach(function (g) {
          var c = el('button', 'piece ' + g.kind,
            short(g.text) + (g.at.length > 1 ? ' ×' + g.at.length : ''));
          c.type = 'button';
          c.dir = 'auto';
          c.title = g.text + (g.node != null ? '  ·  note #' + g.node : '');
          c.setAttribute('aria-label',
            'Show where “' + g.text + '” appears in your text');
          linkFlash(c, g.at);
          pieces.appendChild(c);
        });
        if (groups.length > 14) {
          pieces.appendChild(el('span', 'piece aside more', '+' + (groups.length - 14) + ' more'));
        }
        body.appendChild(pieces);
      }
      if (r.note) body.appendChild(el('div', 'enote', 'recognise · ' + r.note));
      d.appendChild(body);
      return d;
    }

    /* ── the flow, which leads, because it is what was asked ─────────── */
    if (x.chain.nodes.length) {
      var a2 = act(++actNo, 'Where the answer came from',
        'Every box is a real place in its memory, read back word for word; every ' +
        'arrow is a move it actually made. Nothing below was invented — it is all ' +
        'notes Sema was given.');

      var nodes = x.chain.nodes, links = x.chain.links;
      // When the stored note is your sentence word for word, "your words" and
      // "the note" are ONE place; two boxes with an arrow between them would
      // spend half the picture on a move that did not happen.
      if (
        nodes.length > 2 && nodes[0].kind === 'asked' && nodes[1].kind === 'note' &&
        nodes[1].exact && links[0] && links[0].move === 'recognise'
      ) {
        nodes = nodes.slice(1);
        links = links.slice(1);
        nodes[0] = Object.assign({}, nodes[0], {
          kind: 'asked',
          title: 'What you asked',
          exact: true,
        });
      }

      if (x.chain.truncated) {
        a2.appendChild(el('p', 'note-under',
          'The walk ran longer than this. What follows starts part-way along it; ' +
          'the complete sequence is in the trace at the foot of this panel.'));
      }

      // THE OVERLAP, DRAWN.  When the answer came by completing a phrase, the
      // whole mechanism is "your text is the opening of that note" — and two
      // unaligned boxes assert it without showing it. Align them on one left
      // edge, keep the shared run solid and ghost the rest, and the relation
      // is the picture rather than the caption under it.
      var overlapAt = -1;
      if (nodes.length >= 2 && nodes[0].kind === 'asked' && nodes[1].kind === 'note') {
        var mine = (nodes[0].text || ''), theirs = (nodes[1].text || '');
        var n = 0;
        while (n < mine.length && n < theirs.length && mine[n] === theirs[n]) n++;
        // Worth drawing only when the shared opening is most of what you typed.
        if (n >= 4 && n >= mine.length * 0.6 && theirs.length > n) overlapAt = n;
      }

      nodes.forEach(function (n, i) {
        // ARITHMETIC IS NOT A WALK.  A computed answer exists in no note at
        // all, and drawing it as box-arrow-box made it identical to an answer
        // that followed a learnt connection — the same silhouette for the two
        // most different things the engine does. It gets an equals sign.
        if (i && links[i - 1].move === 'evalComputation') {
          var eq = el('div', 'equation');
          eq.appendChild(el('span', 'eqsign', '='));
          var eqv = el('div', 'eqval', n.text);
          eqv.dir = 'auto';
          eq.appendChild(eqv);
          a2.appendChild(eq);
          a2.appendChild(el('p', 'caption',
            'Worked out, not looked up. This answer is in none of its notes, which ' +
            'is why it is exact and why it can be right about a sum it was never taught.'));
          return;
        }
        if (i) {
          a2.appendChild(flink(
            i === 1 && overlapAt > 0
              ? {
                move: links[0].move,
                label: 'your text is how this note begins',
                plain: 'Everything you typed is the opening of the note above, ' +
                  'letter for letter. It finished the note the way it was taught.',
                cost: links[0].cost,
                note: links[0].note,
              }
              : links[i - 1],
            x.headline,
          ));
        }
        var f = fnode(n.kind, n.title);
        if (n.node != null) f.head.appendChild(el('span', 'nid', '#' + n.node));
        if (n.exact) f.head.appendChild(el('span', 'exact', 'word for word'));
        if (n.spans.length && n.kind !== 'asked') {
          var anc = el('button', 'anchor', 'from your text');
          anc.type = 'button';
          anc.title = 'Show which words of yours this came from';
          linkFlash(anc, n.spans);
          f.head.appendChild(anc);
        }
        if (i === 0 && n.kind === 'asked') {
          // The painted question IS the first node. One place, drawn once.
          f.box.appendChild(pane);
          if (r.covered > 0) {
            f.box.appendChild(el('p', 'caption',
              'Underlined: wording it had seen before.'));
          } else {
            f.box.appendChild(el('p', 'caption',
              'None of this wording appears in what it was taught.'));
          }
        } else if (i === 1 && overlapAt > 0) {
          var ov = el('div', 'ftext overlap');
          ov.dir = 'auto';
          ov.appendChild(el('span', 'same', n.text.slice(0, overlapAt)));
          ov.appendChild(el('span', 'rest', n.text.slice(overlapAt)));
          f.box.appendChild(ov);
          f.box.appendChild(el('p', 'caption',
            'Solid: the part that is your text, letter for letter. Faded: what ' +
            'the note goes on to say, which you did not type.'));
        } else if (n.text) {
          var t = el('div', 'ftext', n.text);
          t.dir = 'auto';
          f.box.appendChild(t);
        }
        if (n.voters.length) {
          // THE CONVERGENCE, DRAWN.  "They all agree" is the one visual event
          // in this shape, and a bracket down the side of a list does not show
          // many things becoming one. The rows sit in their own wrapper so the
          // lines can be stretched over exactly them, each starting at its own
          // row and all ending at one point the next arrow leaves from.
          var fan = el('div', 'fan');
          var rows = el('div', 'fanrows');
          n.voters.forEach(function (v) {
            var d = el('div', null, v.text);
            d.dir = 'auto';
            if (v.node != null) d.title = 'note #' + v.node;
            rows.appendChild(d);
          });
          fan.appendChild(funnel(n.voters.length));
          fan.appendChild(rows);
          f.box.appendChild(fan);
          if (n.voterTotal > n.voters.length) {
            f.box.appendChild(el('p', 'fanmore',
              'and ' + (n.voterTotal - n.voters.length) + ' more like them, all agreeing'));
          }
        }
        if (n.support) {
          var sup = el('div', 'support');
          sup.innerHTML = svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5L16 9.5"/>', 15);
          var st = el('div');
          st.appendChild(el('b', null,
            (n.support.capped ? 'at least ' : '') + group(n.support.total) + ' other ways '));
          st.appendChild(document.createTextNode(
            'of asking also reach this same answer, so it does not rest on one note.'));
          if (n.support.samples.length) {
            var more = el('button', 'linkbtn', 'Show a few');
            var list = null;
            more.onclick = function () {
              if (list) { list.remove(); list = null; more.textContent = 'Show a few'; return; }
              list = el('div', 'voters');
              n.support.samples.forEach(function (sm) {
                var d = el('div', null, sm); d.dir = 'auto'; list.appendChild(d);
              });
              sup.parentNode.insertBefore(list, sup.nextSibling);
              more.textContent = 'Hide them';
            };
            st.appendChild(document.createElement('br'));
            st.appendChild(more);
          }
          sup.appendChild(st);
          f.box.appendChild(sup);
        }
        a2.appendChild(f.box);
      });
      a2.appendChild(recognitionDetail());
      acts.appendChild(a2);
    } else {
      // NO CHAIN.  The painted question stands on its own, and the near misses
      // carry the story: each one shown against YOUR words, with the stretch
      // they share solid and the rest faded. "Close, but not close enough" is
      // then something you look at rather than a number you take on trust.
      var a1 = act(++actNo, 'What it read', null);
      a1.appendChild(pane);
      a1.appendChild(el('p', 'caption', r.covered > 0
        ? 'Underlined: wording it had seen before. Everything else is new to it.'
        : 'None of this wording appears in what it was taught.'));
      a1.appendChild(recognitionDetail());
      acts.appendChild(a1);

      var a2b = act(++actNo, 'What it nearly reached',
        'No chain of reasoning got anywhere, so there is none to draw. What there ' +
        'is instead is the closest thing it holds.');
      if (x.nearest.length) {
        var near = el('div', 'near');
        x.nearest.forEach(function (nr) {
          var row = el('div', 'near-row2');
          var t = el('div', 'nt');
          t.dir = 'auto';
          var run = sharedRun(x.question, nr.text);
          if (run) {
            t.appendChild(el('span', 'rest', nr.text.slice(0, run[0])));
            t.appendChild(el('span', 'same', nr.text.slice(run[0], run[1])));
            t.appendChild(el('span', 'rest', nr.text.slice(run[1])));
          } else {
            t.appendChild(el('span', 'rest', nr.text));
          }
          t.title = nr.text + (nr.node != null ? '  ·  note #' + nr.node : '');
          row.appendChild(t);
          row.appendChild(el('div', 'ns', nr.score.toFixed(2)));
          near.appendChild(row);
        });
        a2b.appendChild(near);
        a2b.appendChild(el('p', 'caption',
          'Solid: the words these share with yours. It judged none of them near ' +
          'enough to stand behind, so it said nothing rather than hand you the nearest.'));
      } else {
        a2b.appendChild(el('p', 'note-under',
          'Nothing in memory was near enough to this text for the engine even to list it.'));
      }
      acts.appendChild(a2b);
    }

    /* ── what it weighed, with the ladder one click below ────────────── */
    var w = x.weighing;
    if (w.routes.length) {
      // MEASURED: this act used to run 754-844px in every case — larger than
      // the chain above it, which is the flow this panel exists to show, and
      // 49% of the whole panel on an answer whose entire story is "it did the
      // sum". It is also the most technical content here (cost, floor, route,
      // grade). So the FACT that routes were weighed stays in one line, where
      // it belongs in the story, and the ladder itself is one click away.
      var a3 = act(++actNo, 'What it weighed', null);
      var won = null, empties = 0;
      w.routes.forEach(function (rt) {
        if (rt.state === 'won') won = rt;
        if (rt.state === 'empty') empties++;
      });
      var sum = el('p', 'tally');
      if (silent) {
        sum.innerHTML = 'It had <b>' + w.routes.length +
          '</b> different ways of reaching an answer, and not one of them came back ' +
          'with something it could stand behind. That is the whole reason it said nothing.';
      } else if (won) {
        // When the value was COMPUTED, the engine still credits whichever route
        // carried it into the answer — so the headline says "it worked the sum
        // out" while this line names a route about covering your sentence, and
        // the two read as the panel contradicting itself. Both are true; say
        // how they fit together rather than leaving the reader to guess.
        var computed = x.chain.links.some(function (l) {
          return l.move === 'evalComputation';
        });
        sum.innerHTML = (computed
          ? 'The value itself came from the arithmetic above. Of the <b>' +
            w.routes.length + '</b> ways it weighed for carrying that value into an ' +
            'answer, it took <b>' + won.label + '</b>'
          : 'It weighed <b>' + w.routes.length +
            '</b> different ways of reaching an answer and took this one: <b>' +
            won.label + '</b>') +
          (won.measured && won.grade != null
            ? ', at a cost of <b>' + won.grade + '</b> — the cheapest available.'
            : '.');
      } else {
        sum.innerHTML = 'It weighed <b>' + w.routes.length +
          '</b> different ways of reaching an answer.';
      }
      a3.appendChild(sum);
      a3.appendChild(el('p', 'caption',
        'Cost is what a route leaves unexplained plus the moves it takes. It is a ' +
        'cost, never a confidence — two routes can cost the same and one be wrong.'));

      var det3 = el('details', 'inline');
      det3.appendChild(el('summary', null,
        'What each of the ' + w.routes.length + ' routes cost'));
      var a3body = el('div', 'inline-body');
      if (w.regimePlain) a3body.appendChild(el('p', 'note-under', w.regimePlain));
      // TWO DIFFERENT NUMBERS, TWO DIFFERENT MARKS.  A route that RAN has a
      // cost; a route that did not has a FLOOR — the cheapest it could ever
      // have come out at. Drawing both as a filled bar on one axis is how the
      // winning route ends up with the longest bar under a heading that says
      // the cheapest wins. So: an evaluated cost is a filled bar, a floor is a
      // tick on an empty track, and the two can never be read as the same claim.
      var ran = { won: 1, empty: 1 };
      var worst = 1;
      w.routes.forEach(function (rt) { if (rt.grade != null && rt.grade > worst) worst = rt.grade; });
      var STATE = {
        won: 'took the answer', empty: 'ran, found nothing',
        ran: 'in play', outgunned: 'never run', blocked: 'cannot apply'
      };
      var ladder = el('div', 'ladder');
      w.routes.forEach(function (rt) {
        // A measured cost is a length spent; a floor is only a position on the
        // scale. One is a bar, the other a tick, and never the reverse.
        var evaluated = rt.measured;
        var row = el('div', 'rung ' + rt.state + (evaluated ? ' real' : ' floor'));
        var tp = el('div', 'top');
        var nm = el('span', 'name', upper(rt.label));
        nm.title = 'the engine calls this route “' + rt.name + '”';
        tp.appendChild(nm);
        tp.appendChild(el('span', 'stat', STATE[rt.state] || rt.state));
        tp.appendChild(el('span', 'grade', rt.grade == null
          ? '—'
          : (rt.measured ? 'cost ' : 'at best ') + rt.grade));
        row.appendChild(tp);
        if (rt.grade != null) {
          var bar = el('div', 'gauge');
          var pos = Math.max(3, Math.round(100 * rt.grade / worst));
          if (evaluated) {
            var fl = el('i');
            fl.style.width = pos + '%';
            bar.appendChild(fl);
          } else {
            var tick = el('i', 'tick');
            tick.style.left = 'calc(' + pos + '% - 1px)';
            bar.appendChild(tick);
          }
          row.appendChild(bar);
        }
        if (rt.why) row.appendChild(el('p', 'lead', rt.why));
        ladder.appendChild(row);
      });
      a3body.appendChild(ladder);
      var rules = el('div', 'rules');
      rules.appendChild(el('p', null,
        'A filled bar is what a route actually cost; a tick is only the cheapest ' +
        'it could ever have come out at, for a route that was not run. Shorter is ' +
        'cheaper either way.'));
      (w.rules || []).forEach(function (t) { rules.appendChild(el('p', null, t)); });
      a3body.appendChild(rules);
      det3.appendChild(a3body);
      a3.appendChild(det3);
      acts.appendChild(a3);
    }

    if (w.closeCall) {
      var flag = el('div', 'flag');
      flag.innerHTML = svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0z"/>', 14);
      var ft = el('div');
      ft.appendChild(el('b', null, 'Close call. '));
      ft.appendChild(document.createTextNode(
        'A rival line of reasoning came very near to winning (' + w.closeCall +
        '), so one more trained note could tip this the other way.'));
      flag.appendChild(ft);
      root.appendChild(flag);
    }

    /* ── what it tried and dropped ───────────────────────────────────── */
    if (x.rejected && x.rejected.length) {
      var det = el('details', 'more');
      if (silent) det.open = true;
      det.appendChild(el('summary', null,
        (silent ? 'What it tried — ' : 'Roads not taken — ') +
        plural(x.rejected.length, 'approach', 'approaches') + ' it ruled out'));
      var inner = el('div', 'inner');
      inner.appendChild(el('p', null, silent
        ? 'Each of these is a different way of arriving at an answer it could stand ' +
          'behind. All of them came back with nothing, which is precisely why it stayed quiet.'
        : 'Sema reports every approach that came up empty, not only the one that worked. ' +
          'This is what lets it stay silent instead of inventing something.'));
      x.rejected.forEach(function (s) {
        var rw = el('div', 'rej');
        rw.appendChild(el('b', null, s.label));
        rw.appendChild(document.createTextNode(s.plain));
        if (s.note) rw.appendChild(el('div', 'rej-raw', s.note));
        inner.appendChild(rw);
      });
      det.appendChild(inner);
      root.appendChild(det);
    }

    /* ── the complete trace, in the engine's own nesting ─────────────── */
    if (x.trace && x.trace.length) {
      var det2 = el('details', 'more');
      det2.appendChild(el('summary', null,
        (x.traceCapped ? 'The trace — ' : 'The complete trace — ') +
        plural(x.stepCount, 'step') +
        (x.trace.length < x.stepCount ? ', ' + x.trace.length + ' rows' : '')));
      var in2 = el('div', 'inner');
      in2.appendChild(el('p', null,
        'Every step the engine recorded, nothing grouped away. A mechanism is listed ' +
        'before everything it ran inside, with that work indented beneath it — so ' +
        'the first row is the whole response, not the first thing that happened.'));
      var tkey = el('div', 'tree-key');
      [['read', 'reading you'], ['recall', 'searching memory'], ['walk', 'reasoning'],
       ['weigh', 'choosing'], ['speak', 'answering']].forEach(function (k) {
        var s = el('span');
        s.appendChild(el('i', 'dotf ' + k[0]));
        s.appendChild(document.createTextNode(k[1]));
        tkey.appendChild(s);
      });
      var tree = el('div', 'tree');
      tree.appendChild(tkey);
      x.trace.forEach(function (t) {
        var row = el('div', 'trow');
        row.appendChild(el('div', 'ix', String(t.i)));
        var body = el('div', 'body');
        body.style.paddingLeft = Math.min(t.depth, 6) * 11 + 'px';
        var nm = el('div', 'nm');
        nm.appendChild(el('i', 'dotf ' + t.family));
        nm.appendChild(el('span', 'lbl', t.label));
        if (t.repeat > 1) {
          var rp = el('span', 'rep', '×' + t.repeat);
          rp.title = 'ran ' + t.repeat + ' times in a row, over different material';
          nm.appendChild(rp);
        }
        if (t.from && t.from.length) {
          var dp = el('span', 'dep', '←' + t.from.join(','));
          dp.title = 'built on the output of step ' + t.from.join(', ');
          nm.appendChild(dp);
        }
        body.appendChild(nm);
        if (t.plain) body.appendChild(el('div', 'plain', t.plain));
        if (t.io) {
          var io = el('div', 'io');
          var from = el('span', null, short(t.io[0]));
          var to = el('span', 'to', short(t.io[1]));
          from.dir = 'auto'; to.dir = 'auto';
          from.title = t.io[0]; to.title = t.io[1];
          io.appendChild(from);
          io.appendChild(document.createTextNode('→'));
          io.appendChild(to);
          body.appendChild(io);
        }
        if (t.note) body.appendChild(el('div', 'enote', t.note));
        row.appendChild(body);
        tree.appendChild(row);
      });
      in2.appendChild(tree);
      var folded = x.trace.some(function (t) { return t.repeat > 1; });
      if (folded || x.traceCapped) {
        in2.appendChild(el('p', 'note-under',
          (folded
            ? 'A run of identical steps in the same place is shown once, with the number ' +
              'of times it ran. '
            : '') +
          (x.traceCapped
            ? 'The trace stops after ' + group(x.trace.length) + ' rows; the engine ' +
              'emitted ' + group(x.stepCount) + ' steps in all.'
            : '')));
      }
      det2.appendChild(in2);
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
  /** Ready to type, without yanking the view: a plain focus() scrolls the
   *  focused element into view, which on arrival pulls the headline up under
   *  the header. */
  function focusComposer() {
    var q = $('q');
    try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
  }
  function toBottom() { scroller.scrollTop = scroller.scrollHeight; }

  // Reasoning over a multi-gigabyte store is not instant, so the header says
  // so too — the dots alone are easy to miss on a long page.
  function working(on) {
    setState(on ? 'thinking' : 'ready');
    $('dot').className = 'dot' + (on ? ' busy' : '');
  }

  /** The first question retires the pitch, not the tool. The hero and the
   *  caveat have been read by then; the explorer has not necessarily been
   *  finished with, and it holds whatever you typed into it. It stays, at the
   *  head of the scrollback, one scroll up. */
  function retireWelcome() {
    var w = log.querySelector('.welcome');
    if (!w || w.classList.contains('retired')) return;
    w.classList.add('retired');
    ['h2', '.caveat'].forEach(function (sel) {
      var n = w.querySelector(sel);
      if (n) n.remove();
    });
    var lead = w.querySelector(':scope > p');
    if (lead) lead.remove();
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
      asSheet = window.matchMedia('(max-width: 560px), (max-height: 560px)').matches;
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
        var head = panel.querySelector('h3');
        if (head) {
          head.tabIndex = -1;
          try { head.focus({ preventScroll: true }); } catch (e) { head.focus(); }
        } else {
          closer.focus();
        }
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

    retireWelcome();

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
        pending.bubble.textContent = '';
        pending.bubble.appendChild(el('p', 'err-line',
          /Failed to fetch|NetworkError|load failed/i.test(err.message)
            ? 'Could not reach the server. It may have stopped — check the terminal it was started from.'
            : err.message));
        // A failed turn must not be a dead end: offer the same question again.
        var again = el('button', 'linkbtn again on-error', 'Try again');
        again.onclick = function () {
          pending.msg.remove();
          $('q').value = text; resize(); send();
        };
        pending.bubble.appendChild(again);
      })
      .then(function () {
        busy = false; $('send').disabled = false; working(false); focusComposer(); toBottom();
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
    // Three wrapped lines of 11px beside a 44px button, on the screen with the
    // least room to spare. The narrow phrasing says the same thing.
    $('thread-txt').textContent = window.matchMedia('(max-width: 560px)').matches
      ? 'Reading ' + plural(turns - 1, 'earlier turn') + ' \u2014 answers can drift.'
      : 'Sema is also reading the ' + plural(turns - 1, 'earlier turn') +
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
    // scrollHeight is an integer and the line box is fractional (15.5 x 1.4),
    // so three lines want 85.1px and the clamp hands back 85 — the last line
    // disappears with no scrollbar and the caret off-screen. One px of slack.
    q.style.height = Math.min(q.scrollHeight + 1, maxField()) + 'px';
  }
  /** The field may never take so much of a short viewport that what you are
   *  typing is pushed off the bottom edge. */
  function maxField() {
    // In rem, like the CSS cap it mirrors, so a reader who has set larger
    // text gets a proportionally taller field rather than the same box.
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return Math.max(rem * 4.75, Math.min(rem * 9.375, Math.round(viewportH() * 0.28)));
  }
  function viewportH() {
    return (window.visualViewport && window.visualViewport.height) ||
      window.innerHeight || 600;
  }
  /** Keep the app exactly as tall as the space the browser is really giving it.
   *  This is the one thing that puts the composer above an on-screen keyboard
   *  on iOS, where the viewport meta hint is ignored. */
  (function trackViewport() {
    var vv = window.visualViewport;
    if (!vv) return;
    var tick = null, was = vv.height;
    function apply() {
      tick = null;
      document.documentElement.style.setProperty('--vvh', vv.height + 'px');
      resize();
      // ONLY when the viewport actually SHRANK, which is the keyboard opening.
      // Firing on every event scrolled the welcome screen to its own foot the
      // moment the composer took focus, hiding the headline above it.
      var shrank = vv.height < was - 80;
      was = vv.height;
      if (shrank && document.activeElement === $('q') && log.querySelector('.msg')) {
        toBottom();
      }
    }
    function schedule() { if (!tick) tick = requestAnimationFrame(apply); }
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    apply();
  })();

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
      log.innerHTML = ''; turns = 0; paintThread(); welcome(); focusComposer();
    }).catch(function (err) {
      var m = addMessage('ai', null);
      m.bubble.className = 'bubble silent err-bubble';
      m.bubble.textContent = '';
      m.bubble.appendChild(el('p', 'err-line', 'Could not start a new conversation (' +
        err.message + '). Your thread is still here — nothing was lost.'));
      // The same remedy a failed TURN offers: the reader should not have to go
      // hunting for the button that just failed.
      var again = el('button', 'linkbtn again on-error', 'Try again');
      again.onclick = function () { m.msg.remove(); resetThread(); };
      m.bubble.appendChild(again);
    });
  }
  $('reset').onclick = resetThread;
  $('thread-clear').onclick = resetThread;
  $('send').onclick = send;
  $('q').addEventListener('input', resize);
  var hardKeyboard = window.matchMedia('(pointer: fine)').matches;
  $('q').addEventListener('keydown', function (e) {
    if (!hardKeyboard) return;   // on touch, Enter is a newline
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
</script>
</body>
</html>`;
