const SVG_TEMPLATE = `<svg viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.88" aria-hidden="true">
  <path d="M29 20 Q31 10 45 10 Q59 10 61 20 Q63 26 60 28 Q52 32 45 31 Q38 32 30 28 Q27 26 29 20Z" fill="#d4c4a0" stroke="#2a1f17" stroke-width="1.8"/>
  <path d="M29 20 Q24 24 26 30" stroke="#2a1f17" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="45" cy="32" rx="13" ry="12" fill="#e0ccaa" stroke="#2a1f17" stroke-width="1.8"/>
  <path d="M37 32 Q40.5 30 44 32" stroke="#2a1f17" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M46 32 Q49.5 30 53 32" stroke="#2a1f17" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M37 29 Q40.5 27.5 44 29" stroke="#2a1f17" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M46 29 Q49.5 27.5 53 29" stroke="#2a1f17" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M40 43 Q45 45 50 43 L50 48 Q45 50 40 48Z" fill="#e0ccaa" stroke="#2a1f17" stroke-width="1.5"/>
  <path d="M22 58 Q24 50 38 48 Q45 47 52 48 Q66 50 68 58 L70 88 Q55 94 45 93 Q35 94 20 88Z" fill="#d9c99e" stroke="#2a1f17" stroke-width="1.8"/>
  <path d="M35 55 Q38 70 37 85" stroke="#2a1f17" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>
  <path d="M55 55 Q52 70 53 85" stroke="#2a1f17" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>
  <path d="M30 80 Q38 76 45 77 Q52 76 60 80 Q55 88 45 88 Q35 88 30 80Z" fill="#e0ccaa" stroke="#2a1f17" stroke-width="1.5"/>
  <path d="M20 88 Q28 102 35 100 Q45 104 55 100 Q62 102 70 88" stroke="#2a1f17" stroke-width="2" fill="#d9c99e" stroke-linecap="round"/>
  <ellipse cx="31" cy="101" rx="7" ry="4" fill="#d9c99e" stroke="#2a1f17" stroke-width="1.4" transform="rotate(-10 31 101)"/>
  <ellipse cx="59" cy="101" rx="7" ry="4" fill="#d9c99e" stroke="#2a1f17" stroke-width="1.4" transform="rotate(10 59 101)"/>
</svg>`;

const parser = new DOMParser();

export function renderBodhidharmaBlock(mountEl, width = 90, height = 120) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bodhidharma-corner';
  wrapper.setAttribute('aria-hidden', 'true');

  const doc = parser.parseFromString(SVG_TEMPLATE, 'image/svg+xml');
  const svgEl = doc.documentElement;
  svgEl.setAttribute('width', width);
  svgEl.setAttribute('height', height);
  wrapper.appendChild(svgEl);

  const tamilCap = document.createElement('span');
  tamilCap.className = 'bodhidharma-caption-tamil';
  tamilCap.textContent = 'போதிதர்மர்';

  const engCap = document.createElement('span');
  engCap.className = 'bodhidharma-caption-english';
  engCap.textContent = 'Bodhidharma · Tamil prince, silent witness';

  wrapper.append(tamilCap, engCap);
  mountEl.appendChild(wrapper);
}
