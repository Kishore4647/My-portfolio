// System schematics for each case study, rendered as inline SVG.
// Grid layout: c = column, r = row. key = highlighted (signal colour).

const CELL_W = 150;
const NODE_W = 126;
const NODE_H = 54;
const ROW_H = 124;
const TOP = 26;

export const DIAGRAMS = {
  evalai: {
    cols: 5,
    lanes: ['Evaluate', 'Generate'],
    nodes: [
      { id: 'a1', c: 0, r: 0, t: 'Answer sheet', s: 'handwritten scan' },
      { id: 'a2', c: 1, r: 0, t: 'Vision LLM', s: 'reads pages' },
      { id: 'a3', c: 2, r: 0, t: 'Map answers', s: 'to questions' },
      { id: 'a4', c: 3, r: 0, t: 'Mark', s: 'key + scheme', key: true },
      { id: 'a5', c: 4, r: 0, t: 'Teacher', s: 'finalises marks', key: true },
      { id: 'g1', c: 0, r: 1, t: 'NCERT RAG', s: '13k+ passages', key: true },
      { id: 'g2', c: 1, r: 1, t: 'Draft paper', s: 'board pattern' },
      { id: 'g3', c: 2, r: 1, t: 'Code checks', s: 'marks · sections' },
      { id: 'g4', c: 3, r: 1, t: 'AI moderator', s: 'flags errors', key: true },
      { id: 'g5', c: 4, r: 1, t: 'Print-ready', s: 'exact SVG figures' },
    ],
    edges: [
      ['a1', 'a2'], ['a2', 'a3'], ['a3', 'a4', { key: true }], ['a4', 'a5', { key: true }],
      ['g1', 'g2', { key: true }], ['g2', 'g3'], ['g3', 'g4'], ['g4', 'g5', { key: true }],
      ['g4', 'g2', { loop: true }],
    ],
  },

  eduprism: {
    cols: 4,
    lanes: ['Digitise', 'Examine'],
    nodes: [
      { id: 'd1', c: 0, r: 0, t: 'Scanned paper', s: 'Tamil · Eng · Maths' },
      { id: 'd2', c: 1, r: 0, t: 'Cloud Vision', s: 'OCR' },
      { id: 'd3', c: 2, r: 0, t: 'Gemini', s: 'structure + fonts', key: true },
      { id: 'd4', c: 3, r: 0, t: 'Question bank', s: '29% → 98%+ recall', key: true },
      { id: 'e1', c: 0, r: 1, t: 'Students', s: '770+ enrolled' },
      { id: 'e2', c: 1, r: 1, t: 'Postgres RLS', s: '5 roles' },
      { id: 'e3', c: 2, r: 1, t: 'CBT engine', s: '10k+ attempts', key: true },
      { id: 'e4', c: 3, r: 1, t: 'Offline runner', s: 'no lost answers' },
    ],
    edges: [
      ['d1', 'd2'], ['d2', 'd3', { key: true }], ['d3', 'd4', { key: true }],
      ['e1', 'e2'], ['e2', 'e3'], ['e3', 'e4', { key: true }],
      ['d4', 'e3', { key: true }],
    ],
  },

  nahla: {
    cols: 4,
    lanes: ['Sell', 'Service'],
    nodes: [
      { id: 's1', c: 0, r: 0, t: 'Lead', s: 'follow-up calendar' },
      { id: 's2', c: 1, r: 0, t: 'CRM', s: 'customer record' },
      { id: 's3', c: 2, r: 0, t: 'Invoice', s: 'immutable snapshot', key: true },
      { id: 's4', c: 3, r: 0, t: 'Payments', s: 'collected' },
      { id: 'v1', c: 0, r: 1, t: 'Inventory', s: 'machine BOM' },
      { id: 'v2', c: 1, r: 1, t: 'Service engine', s: 'recurring dates', key: true },
      { id: 'v3', c: 2, r: 1, t: 'Telecaller', s: 'queued pre-due' },
      { id: 'v4', c: 3, r: 1, t: 'WhatsApp + AI', s: 'Cloud API', key: true },
    ],
    edges: [
      ['s1', 's2'], ['s2', 's3', { key: true }], ['s3', 's4'],
      ['v1', 'v2'], ['v2', 'v3', { key: true }], ['v3', 'v4', { key: true }],
      ['s3', 'v2', { key: true }],
    ],
  },

  siddhar: {
    cols: 4,
    lanes: ['Checkout'],
    nodes: [
      { id: 'c1', c: 0, r: 0, t: 'Catalogue', s: 'React storefront' },
      { id: 'c2', c: 1, r: 0, t: 'Cart', s: 'FastAPI' },
      { id: 'c3', c: 2, r: 0, t: 'Razorpay', s: 'payment gateway', key: true },
      { id: 'c4', c: 3, r: 0, t: 'Order', s: 'Supabase Postgres' },
    ],
    edges: [['c1', 'c2'], ['c2', 'c3', { key: true }], ['c3', 'c4', { key: true }]],
  },

  emotion: {
    cols: 4,
    lanes: ['Recommend'],
    nodes: [
      { id: 'm1', c: 0, r: 0, t: 'Webcam', s: 'face frame' },
      { id: 'm2', c: 1, r: 0, t: 'Detect', s: 'facial emotion', key: true },
      { id: 'm3', c: 2, r: 0, t: 'Match mood', s: 'emotion → genre' },
      { id: 'm4', c: 3, r: 0, t: 'Playlist', s: 'Flask web app', key: true },
    ],
    edges: [['m1', 'm2', { key: true }], ['m2', 'm3'], ['m3', 'm4', { key: true }]],
  },
};

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, parent) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};

function box(node) {
  const x = node.c * CELL_W + (CELL_W - NODE_W) / 2;
  const y = TOP + node.r * ROW_H;
  return { x, y, w: NODE_W, h: NODE_H, cx: x + NODE_W / 2, cy: y + NODE_H / 2, r: x + NODE_W, b: y + NODE_H };
}

function edgePath(A, B, opts) {
  if (opts.loop) {
    const drop = 38;
    return `M ${A.cx} ${A.b} C ${A.cx} ${A.b + drop}, ${B.cx} ${B.b + drop}, ${B.cx} ${B.b + 4}`;
  }
  if (A.y === B.y) return `M ${A.r} ${A.cy} H ${B.x - 4}`;
  if (A.x === B.x) return `M ${A.cx} ${A.b} V ${B.y - 4}`;
  const mid = A.b + (B.y - A.b) / 2;
  return `M ${A.cx} ${A.b} V ${mid} H ${B.cx} V ${B.y - 4}`;
}

export function renderDiagram(host, def, uid) {
  const rows = def.lanes.length;
  const hasLoop = def.edges.some((e) => e[2]?.loop);
  const W = def.cols * CELL_W;
  const H = TOP + (rows - 1) * ROW_H + NODE_H + (hasLoop ? 48 : 10);

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  const title = el('title', {}, svg);
  title.textContent = def.nodes.map((n) => n.t).join(' → ');

  const defs = el('defs', {}, svg);
  for (const [id, cls] of [[`ar-${uid}`, 'dg-arrow'], [`ark-${uid}`, 'dg-arrow is-key']]) {
    const m = el('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L8 4 L0 8 z', class: cls }, m);
  }

  def.lanes.forEach((label, r) => {
    const t = el('text', { x: 6, y: TOP + r * ROW_H - 10, class: 'dg-lane' }, svg);
    t.textContent = `${String(r + 1).padStart(2, '0')} · ${label}`;
  });

  const byId = Object.fromEntries(def.nodes.map((n) => [n.id, box(n)]));
  const edgeG = el('g', { class: 'dg-edges' }, svg);
  const pulseG = el('g', { class: 'dg-pulses' }, svg);

  def.edges.forEach(([a, b, opts = {}], i) => {
    const d = edgePath(byId[a], byId[b], opts);
    const cls = ['dg-edge', opts.key && 'is-key', opts.loop && 'is-loop'].filter(Boolean).join(' ');
    const marker = opts.key || opts.loop ? `ark-${uid}` : `ar-${uid}`;
    const p = el('path', { d, class: cls, 'marker-end': `url(#${marker})`, id: `e-${uid}-${i}` }, edgeG);
    if (!opts.loop) p.setAttribute('pathLength', '1');

    // Data packet moving along highlighted edges
    if (opts.key) {
      const c = el('circle', { r: 2.6, class: 'dg-pulse', opacity: 0 }, pulseG);
      const am = el('animateMotion', { dur: `${1.6 + (i % 3) * 0.35}s`, repeatCount: 'indefinite', begin: `${(i * 0.37) % 1.5}s` }, c);
      el('mpath', { href: `#e-${uid}-${i}` }, am);
    }
  });

  const nodeG = el('g', { class: 'dg-nodes' }, svg);
  def.nodes.forEach((n) => {
    const bx = byId[n.id];
    const g = el('g', { class: `dg-node${n.key ? ' is-key' : ''}` }, nodeG);
    el('rect', { x: bx.x, y: bx.y, width: bx.w, height: bx.h, rx: 2 }, g);
    el('rect', { x: bx.x, y: bx.y, width: 3, height: bx.h, rx: 0, style: `fill:${n.key ? 'var(--signal)' : 'var(--line-strong)'};stroke:none` }, g);
    const t = el('text', { x: bx.x + 12, y: bx.y + 23 }, g);
    t.textContent = n.t;
    const s = el('text', { x: bx.x + 12, y: bx.y + 40, class: 'dg-sub' }, g);
    s.textContent = n.s;
  });

  host.appendChild(svg);
  return svg;
}
