const NS = 'http://www.w3.org/2000/svg';
const toRad = d => d * Math.PI / 180;
const fmt   = n => n.toFixed(3);
const ptOn  = (cx, cy, r, deg) => ({ x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) });

function sectorPath(cx, cy, outerR, innerR, leadDeg, trailDeg) {
  const o1 = ptOn(cx, cy, outerR, leadDeg),  o2 = ptOn(cx, cy, outerR, trailDeg);
  const i1 = ptOn(cx, cy, innerR, trailDeg), i2 = ptOn(cx, cy, innerR, leadDeg);
  return [
    `M ${fmt(o1.x)},${fmt(o1.y)}`,
    `A ${outerR} ${outerR} 0 0 0 ${fmt(o2.x)},${fmt(o2.y)}`,
    `L ${fmt(i1.x)},${fmt(i1.y)}`,
    `A ${innerR} ${innerR} 0 0 1 ${fmt(i2.x)},${fmt(i2.y)}`,
    'Z',
  ].join(' ');
}

// Pure function — tested in tests/test-wheel.js
export function computeSectors(cx, cy, outerR, innerR) {
  return Array.from({ length: 12 }, (_, i) => {
    const centerDeg = (360 - i * 30) % 360;
    const leadDeg   = (360 - i * 30 + 15) % 360;
    const trailDeg  = (360 - i * 30 - 15 + 360) % 360;
    const labelR    = (outerR + innerR) / 2;
    const lp        = ptOn(cx, cy, labelR, centerDeg);
    return { position: i, centerDeg, leadDeg, trailDeg, pathData: sectorPath(cx, cy, outerR, innerR, leadDeg, trailDeg), labelX: lp.x, labelY: lp.y };
  });
}

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// DOM builder — appends to svgRoot, returns { sectors, sectorEls }
export function buildWheel(svgRoot, cx, cy, outerR, innerR, labels) {
  const defs   = document.createElementNS(NS, 'defs');
  const filter = document.createElementNS(NS, 'filter');
  filter.id = 'brush-feel';
  filter.setAttribute('x', '-5%');
  filter.setAttribute('y', '-5%');
  filter.setAttribute('width', '110%');
  filter.setAttribute('height', '110%');

  const turb = svgEl('feTurbulence', { type:'fractalNoise', baseFrequency:'0.02 0.04', numOctaves:'3', seed:'7', stitchTiles:'stitch' });
  const disp = svgEl('feDisplacementMap', { in:'SourceGraphic', scale:'2', xChannelSelector:'R', yChannelSelector:'G' });
  filter.append(turb, disp);
  defs.appendChild(filter);
  svgRoot.appendChild(defs);

  const brushGroup = svgEl('g', { filter:'url(#brush-feel)' });
  brushGroup.appendChild(svgEl('circle', { cx, cy, r:outerR, fill:'none', stroke:'#2a1f17', 'stroke-width':'1.2' }));
  brushGroup.appendChild(svgEl('circle', { cx, cy, r:innerR, fill:'none', stroke:'#2a1f17', 'stroke-width':'1.2' }));

  const sectors = computeSectors(cx, cy, outerR, innerR);
  sectors.forEach(s => {
    const from = ptOn(cx, cy, innerR, s.leadDeg);
    const to   = ptOn(cx, cy, outerR, s.leadDeg);
    brushGroup.appendChild(svgEl('line', { x1:fmt(from.x), y1:fmt(from.y), x2:fmt(to.x), y2:fmt(to.y), stroke:'#2a1f17', 'stroke-width':'1' }));
  });
  svgRoot.appendChild(brushGroup);

  const sectorEls = {};
  sectors.forEach((s, i) => {
    const g = svgEl('g', { 'data-position': i });
    g.style.cursor = 'pointer';

    const tint = svgEl('path', { d: s.pathData, fill:'transparent', stroke:'none', 'pointer-events':'none', class:'sector-tint' });
    const hit  = svgEl('path', { d: s.pathData, fill:'transparent', stroke:'none', class:'sector-hit' });
    g.append(hit, tint);

    if (labels) {
      const tText = svgEl('text', { x:fmt(s.labelX), y:fmt(s.labelY - 7), 'text-anchor':'middle', 'dominant-baseline':'middle', 'font-family':'Noto Serif Tamil, serif', 'font-weight':'500', 'font-size':'13', fill:'#2a1f17' });
      tText.textContent = labels[i].tamil;

      const eText = svgEl('text', { x:fmt(s.labelX), y:fmt(s.labelY + 9), 'text-anchor':'middle', 'dominant-baseline':'middle', 'font-family':'Cormorant Garamond, Georgia, serif', 'font-style':'italic', 'font-size':'11', fill:'#6b4a2a' });
      eText.textContent = labels[i].english;

      g.append(tText, eText);
    }

    sectorEls[i] = { g, tint, pathData: s.pathData, labelX: s.labelX, labelY: s.labelY, centerDeg: s.centerDeg };
    svgRoot.appendChild(g);
  });

  svgRoot.appendChild(svgEl('circle', { cx, cy, r:'7',  fill:'#7a2a1c' }));
  svgRoot.appendChild(svgEl('circle', { cx, cy, r:'14', fill:'none', stroke:'#7a2a1c', 'stroke-width':'0.8', opacity:'0.5' }));

  return { sectors, sectorEls };
}
