const SVGS = {
  sun: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="9" stroke="#2a1f17" stroke-width="1.8"/>
    <circle cx="20" cy="20" r="2.5" fill="#2a1f17"/>
    <line x1="20" y1="3"  x2="20" y2="8"  stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="20" y1="32" x2="20" y2="37" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="3"  y1="20" x2="8"  y2="20" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="32" y1="20" x2="37" y2="20" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="7"  y1="7"  x2="11" y2="11" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="29" y1="29" x2="33" y2="33" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="33" y1="7"  x2="29" y2="11" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="11" y1="29" x2="7"  y2="33" stroke="#2a1f17" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  moon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 10 A12 12 0 1 0 26 30 A8 8 0 1 1 26 10 Z" stroke="#2a1f17" stroke-width="1.8"/>
  </svg>`,
  mars: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="17" cy="23" r="10" stroke="#2a1f17" stroke-width="1.8"/>
    <line x1="24" y1="16" x2="34" y2="6" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <polyline points="28,6 34,6 34,12" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  mercury: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="22" r="9" stroke="#2a1f17" stroke-width="1.8"/>
    <line x1="20" y1="31" x2="20" y2="38" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="15" y1="35" x2="25" y2="35" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M13 13 Q20 6 27 13" stroke="#2a1f17" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`,
  jupiter: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8 Q10 8 10 18 Q10 26 24 26" stroke="#2a1f17" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <line x1="6"  y1="26" x2="34" y2="26" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="24" y1="8"  x2="24" y2="38" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  venus: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="14" r="10" stroke="#2a1f17" stroke-width="1.8"/>
    <line x1="20" y1="24" x2="20" y2="36" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="13" y1="31" x2="27" y2="31" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  saturn: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="4"  x2="20" y2="36" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M20 18 Q30 12 28 22 Q26 30 20 28" stroke="#2a1f17" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <line x1="12" y1="4"  x2="22" y2="4"  stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  rahu: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 28 Q20 10 32 28" stroke="#2a1f17" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="8"  cy="28" r="3" fill="#2a1f17"/>
    <circle cx="32" cy="28" r="3" fill="#2a1f17"/>
  </svg>`,
  ketu: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12 Q20 30 32 12" stroke="#2a1f17" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <line x1="14" y1="32" x2="26" y2="32" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="20" y1="26" x2="20" y2="38" stroke="#2a1f17" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
};

const parser = new DOMParser();

export function createSymbol(id) {
  const src = SVGS[id] || SVGS.sun;
  const doc = parser.parseFromString(src, 'image/svg+xml');
  return doc.documentElement;
}
