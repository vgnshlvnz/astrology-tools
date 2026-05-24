export function renderInvocation(mountEl) {
  const inv = document.createElement('div');
  inv.className = 'invocation';

  const items = [
    ['div', 'suzhi',           'ஶ்ரீ'],
    ['div', 'om',              'ௐ'],
    ['div', 'vinayagar-tamil', 'கற்றவர் விநாயகர்'],
    ['div', 'chant',           'தொக்குதம் தொக்குதிம்'],
    ['div', 'gloss',           'Salutations to the lord of learning.'],
  ];
  items.forEach(([tag, cls, text]) => {
    const el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    inv.appendChild(el);
  });

  const thesis = document.createElement('div');
  thesis.className = 'thesis';

  const tTamil = document.createElement('span');
  tTamil.className = 'thesis-tamil';
  tTamil.textContent = 'மௌனத்தில் போதி, செயலில் தர்மம்';

  const tEng = document.createElement('span');
  tEng.className = 'thesis-english';
  tEng.textContent = 'Bodhi in silence, dharma in action.';

  thesis.append(tTamil, tEng);
  mountEl.append(inv, thesis);
}
