import { renderInvocation }      from '../shared/invocation.js';
import { renderBodhidharmaBlock } from '../shared/bodhidharma.js';
import { buildWheel }             from '../shared/wheel.js';

const NS = 'http://www.w3.org/2000/svg';
const CX = 400, CY = 400, OUTER_R = 340, INNER_R = 185;

let signs = [], planets = [], elements = [], annotations = {};
let mode = 'ownership';
let activePlanets  = new Set();
let activeElements = new Set();
let wheelData = null;

async function init() {
  [signs, planets, elements, annotations] = await Promise.all([
    fetch('../shared/data/signs.json').then(r => r.json()),
    fetch('../shared/data/planets.json').then(r => r.json()),
    fetch('../shared/data/elements.json').then(r => r.json()),
    fetch('../shared/data/annotations.json').then(r => r.json()),
  ]);

  renderInvocation(document.getElementById('invocation-mount'));
  renderBodhidharmaBlock(document.getElementById('bodhidharma-mount'), 90, 120);

  const svgEl = document.getElementById('zodiac-wheel');
  wheelData = buildWheel(svgEl, CX, CY, OUTER_R, INNER_R, signs.map(s => ({ tamil: s.tamil, english: s.english })));

  document.getElementById('btn-ownership').addEventListener('click', () => setMode('ownership'));
  document.getElementById('btn-elements').addEventListener('click',  () => setMode('elements'));
  document.getElementById('reset-btn').addEventListener('click', resetAll);

  renderPicker();
}

function setMode(newMode) {
  mode = newMode;
  ['ownership','elements'].forEach(m => {
    const btn = document.getElementById(`btn-${m}`);
    btn.classList.toggle('active', mode === m);
    btn.setAttribute('aria-pressed', mode === m);
  });
  resetAll();
  renderPicker();
}

function renderPicker() {
  const mount      = document.getElementById('picker-mount');
  const shadowNote = document.getElementById('shadow-note');
  mount.textContent = '';

  if (mode === 'ownership') {
    shadowNote.style.display = '';
    planets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = `picker-btn${p.shadow ? ' shadow-planet' : ''}`;
      btn.dataset.id = p.id;
      if (p.shadow) { btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); }
      btn.setAttribute('aria-label', `${p.tamil} — ${p.english} (${p.englishName})`);

      const tSpan = document.createElement('span'); tSpan.className = 'planet-tamil';   tSpan.textContent = p.tamil;
      const eSpan = document.createElement('span'); eSpan.className = 'planet-english'; eSpan.textContent = p.english;
      btn.append(tSpan, eSpan);

      if (!p.shadow) btn.addEventListener('click', () => activatePlanet(p.id));
      mount.appendChild(btn);
    });
  } else {
    shadowNote.style.display = 'none';
    elements.forEach(el => {
      const btn = document.createElement('button');
      btn.className = 'picker-btn';
      btn.dataset.id = el.id;
      btn.setAttribute('aria-label', `${el.tamil} — ${el.english}`);

      const tSpan = document.createElement('span'); tSpan.className = 'planet-tamil';   tSpan.style.color = el.color; tSpan.textContent = el.tamil;
      const eSpan = document.createElement('span'); eSpan.className = 'planet-english'; eSpan.textContent = el.english;
      btn.append(tSpan, eSpan);

      btn.addEventListener('click', () => activateElement(el.id));
      mount.appendChild(btn);
    });
  }
}

function resetAll() {
  activePlanets.clear();
  activeElements.clear();
  hideAnnotation();

  Object.values(wheelData.sectorEls).forEach(({ tint, g }) => {
    tint.setAttribute('fill', 'transparent');
    g.querySelectorAll('.sector-seal').forEach(n => n.remove());
  });
  document.getElementById('zodiac-wheel').querySelectorAll('.element-line').forEach(n => n.remove());
  document.querySelectorAll('.picker-btn').forEach(b => b.classList.remove('active'));
}

function hideAnnotation() {
  const p = document.getElementById('annotation-panel');
  p.classList.remove('visible');
  p.textContent = '';
}

function showAnnotation(text) {
  const p = document.getElementById('annotation-panel');
  p.textContent = text;
  p.getBoundingClientRect(); // force reflow so CSS transition fires
  p.classList.add('visible');
}

// ── Pattern A: Ownership ──────────────────────────────────────────────
function activatePlanet(planetId) {
  const planet = planets.find(p => p.id === planetId);
  if (!planet || planet.shadow) return;

  const { sectorEls } = wheelData;
  const btn = document.querySelector(`.picker-btn[data-id="${planetId}"]`);

  if (activePlanets.has(planetId)) {
    activePlanets.delete(planetId);
    btn.classList.remove('active');
    planet.owns.forEach(signId => {
      const pos = signs.findIndex(s => s.id === signId);
      if (pos < 0) return;
      sectorEls[pos].tint.setAttribute('fill', 'transparent');
      sectorEls[pos].g.querySelectorAll('.sector-seal').forEach(n => n.remove());
    });
    hideAnnotation();
    return;
  }

  activePlanets.add(planetId);
  btn.classList.add('active');

  planet.owns.forEach(signId => {
    const pos = signs.findIndex(s => s.id === signId);
    if (pos < 0) return;
    const { tint, g, labelX, labelY } = sectorEls[pos];
    tint.setAttribute('fill', 'rgba(122,42,28,0.08)');

    // Seal stamp
    const sealG = document.createElementNS(NS, 'g');
    sealG.setAttribute('class', 'sector-seal seal-stamp');
    sealG.setAttribute('pointer-events', 'none');

    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', labelX); circle.setAttribute('cy', labelY - 24);
    circle.setAttribute('r', '13');
    circle.setAttribute('fill', 'rgba(122,42,28,0.12)');
    circle.setAttribute('stroke', '#7a2a1c'); circle.setAttribute('stroke-width', '1.2');

    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', labelX); text.setAttribute('y', labelY - 24);
    text.setAttribute('text-anchor', 'middle'); text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', 'Noto Serif Tamil, serif'); text.setAttribute('font-size', '10');
    text.setAttribute('fill', '#7a2a1c');
    text.textContent = planet.tamil[0];

    sealG.append(circle, text);
    g.appendChild(sealG);
  });

  if (planet.ownership_annotation) {
    setTimeout(() => showAnnotation(planet.ownership_annotation), 600);
  }
  if (activePlanets.size === 7) {
    setTimeout(() => showAnnotation(annotations.ownership_master), 800);
  }
}

// ── Pattern B: Elements ───────────────────────────────────────────────
function hexToRgb(hex) {
  return [1,3,5].map(i => parseInt(hex.slice(i, i+2), 16)).join(',');
}

function activateElement(elementId) {
  const element = elements.find(e => e.id === elementId);
  if (!element) return;

  const { sectorEls } = wheelData;
  const svgRoot = document.getElementById('zodiac-wheel');
  const btn = document.querySelector(`.picker-btn[data-id="${elementId}"]`);

  if (activeElements.has(elementId)) {
    activeElements.delete(elementId);
    btn.classList.remove('active');
    element.signs.forEach(signId => {
      const pos = signs.findIndex(s => s.id === signId);
      if (pos >= 0) sectorEls[pos].tint.setAttribute('fill', 'transparent');
    });
    svgRoot.querySelectorAll(`.element-line[data-element="${elementId}"]`).forEach(n => n.remove());
    hideAnnotation();
    return;
  }

  activeElements.add(elementId);
  btn.classList.add('active');

  const positions = element.signs.map(id => signs.findIndex(s => s.id === id));
  const rgb = hexToRgb(element.color);
  positions.forEach(pos => {
    if (pos >= 0) sectorEls[pos].tint.setAttribute('fill', `rgba(${rgb},0.15)`);
  });

  const corners = positions.map(pos => ({ x: sectorEls[pos].labelX, y: sectorEls[pos].labelY }));
  [[0,1],[1,2],[2,0]].forEach(([a, b], i) => {
    const from = corners[a], to = corners[b];
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('class', 'element-line');
    line.setAttribute('data-element', elementId);
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);   line.setAttribute('y2', to.y);
    line.setAttribute('stroke', element.color); line.setAttribute('stroke-width', '1.5'); line.setAttribute('opacity', '0.8');
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    svgRoot.appendChild(line);
    setTimeout(() => { line.style.strokeDashoffset = 0; }, i * 400 + 50);
  });

  setTimeout(() => showAnnotation(element.annotation), 3 * 400 + 600);
  if (activeElements.size === 4) {
    setTimeout(() => showAnnotation(annotations.elements_master), 3 * 400 + 800);
  }
}

init();
