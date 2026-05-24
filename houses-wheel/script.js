import { renderInvocation }      from '../shared/invocation.js';
import { renderBodhidharmaBlock } from '../shared/bodhidharma.js';
import { buildWheel }             from '../shared/wheel.js';

const NS = 'http://www.w3.org/2000/svg';
const CX = 400, CY = 400, OUTER_R = 340, INNER_R = 185;
let activeHouse = null;

async function init() {
  const houses = await fetch('../shared/data/houses.json').then(r => r.json());

  renderInvocation(document.getElementById('invocation-mount'));
  renderBodhidharmaBlock(document.getElementById('bodhidharma-mount'), 70, 93);

  const svgEl = document.getElementById('houses-wheel');
  const { sectorEls } = buildWheel(svgEl, CX, CY, OUTER_R, INNER_R, houses.map(h => ({ tamil: h.tamil, english: '' })));

  houses.forEach((house, i) => {
    const { labelX, labelY, g } = sectorEls[i];

    const numText = document.createElementNS(NS, 'text');
    numText.setAttribute('x', labelX); numText.setAttribute('y', labelY - 24);
    numText.setAttribute('text-anchor', 'middle'); numText.setAttribute('dominant-baseline', 'middle');
    numText.setAttribute('font-family', 'Cormorant Garamond, Georgia, serif');
    numText.setAttribute('font-size', '16'); numText.setAttribute('fill', '#7a2a1c');
    numText.setAttribute('class', 'house-num-label');
    numText.textContent = house.id;
    g.appendChild(numText);

    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `House ${house.id}: ${house.tamil} — ${house.english_keywords}`);

    const activate = () => showPanel(house, i, sectorEls);
    g.addEventListener('click', activate);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
}

function showPanel(house, pos, sectorEls) {
  if (activeHouse !== null) sectorEls[activeHouse].tint.setAttribute('fill', 'transparent');

  if (activeHouse === pos) {
    activeHouse = null;
    document.getElementById('house-panel').style.display = 'none';
    return;
  }

  activeHouse = pos;
  sectorEls[pos].tint.setAttribute('fill', 'rgba(122,42,28,0.08)');

  const panel = document.getElementById('house-panel');
  panel.textContent = '';

  const makeSpan = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
  panel.append(
    makeSpan('house-panel-number',   `House ${house.id}`),
    makeSpan('house-panel-tamil',    house.tamil),
    makeSpan('house-panel-keywords', house.english_keywords),
    makeSpan('house-panel-question', `"${house.example_question}"`),
  );
  panel.style.display = '';
}

init();
