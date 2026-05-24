import { renderInvocation } from '../shared/invocation.js';
import { createSymbol }      from '../shared/symbols.js';

async function init() {
  const planets = await fetch('../shared/data/planets.json').then(r => r.json());
  renderInvocation(document.getElementById('invocation-mount'));

  const mount = document.getElementById('cards-mount');
  planets.forEach(p => {
    const card = buildCard(p);
    mount.appendChild(card);
  });
}

function buildCard(p) {
  const card = document.createElement('div');
  card.className = 'card-3d';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${p.tamil} — ${p.englishName}. Click to flip.`);

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  // Front
  const front = document.createElement('div');
  front.className = 'card-face';

  const symbol = createSymbol(p.symbol);
  symbol.classList.add('card-planet-symbol');

  const tName = document.createElement('span');
  tName.className = 'card-planet-tamil';
  tName.textContent = p.tamil;

  const eName = document.createElement('span');
  eName.className = 'card-planet-english-small';
  eName.textContent = p.english;

  const hint = document.createElement('span');
  hint.className = 'card-flip-hint';
  hint.textContent = 'tap to reveal';

  front.append(symbol, tName, eName, hint);

  // Back
  const back = document.createElement('div');
  back.className = 'card-face card-back';

  const makeRow = (label, value, isTamil = false) => {
    const l = document.createElement('span'); l.className = 'card-back-label'; l.textContent = label;
    const v = document.createElement('span'); v.className = isTamil ? 'card-back-value-tamil' : 'card-back-value'; v.textContent = value;
    return [l, v];
  };

  const ownsText = p.shadow ? 'Shadow — no rulership' : (p.owns.length ? p.owns.join(', ') : '—');

  back.append(
    ...makeRow('Planet',       `${p.englishName} (${p.english})`),
    ...makeRow('Nature',       p.nature_tamil, true),
    ...makeRow('',             p.nature_english),
    ...makeRow('Signs Owned',  ownsText),
    ...makeRow('Keyword',      p.keyword),
  );

  inner.append(front, back);
  card.appendChild(inner);

  const flip = () => card.classList.toggle('is-flipped');
  card.addEventListener('click', flip);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

  return card;
}

init();
