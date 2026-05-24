# Astrology Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three contemplative Vedic astrology teaching tools (Bodhidharma Scroll, Houses Wheel, Planet Cards) plus a landing page, deployable to GitHub Pages as pure HTML/CSS/JS with no build step.

**Architecture:** Scaffold-first — shared CSS, data JSON, and JS components are built before any tool. Each tool is a directory with its own `index.html`, `style.css`, and `script.js` that imports from `../shared/`. All paths are relative for GitHub Pages subpath compatibility. All DOM rendering uses `createElement`/`textContent`/`createElementNS` — no direct HTML string injection into the live DOM.

**Tech Stack:** HTML5, CSS3 (custom properties, animations), ES modules (no bundler), Google Fonts CDN (Noto Serif Tamil + Cormorant Garamond), SVG for wheel and figures, `DOMParser` for static SVG assets.

---

## File Map

**Shared:**
- `shared/styles.css` — CSS custom properties, paper aesthetic, all shared component styles
- `shared/invocation.js` — `renderInvocation(mountEl)` → void, builds Vinayagar block in DOM
- `shared/bodhidharma.js` — `renderBodhidharmaBlock(mountEl, w, h)` → void, inserts Pallava SVG
- `shared/symbols.js` — `createSymbol(id)` → SVGElement for each planet
- `shared/wheel.js` — `computeSectors(cx, cy, outerR, innerR)` (pure) + `buildWheel(svgEl, cx, cy, outerR, innerR, labels)` (DOM)
- `shared/data/signs.json`, `planets.json`, `elements.json`, `houses.json`, `annotations.json`

**Tests:**
- `tests/index.html`, `tests/assert.js`, `tests/test-wheel.js`, `tests/test-data.js`

**Tools:** `bodhidharma-scroll/`, `houses-wheel/`, `planet-cards/` — each with `index.html`, `style.css`, `script.js`

**Root:** `.gitignore`, `README.md`, `index.html`

---

## Task 1: Repo Scaffold

**Files:** `.gitignore`, `README.md`

- [ ] **Step 1: Write .gitignore**

```
.superpowers/
.DS_Store
```

- [ ] **Step 2: Write README.md**

```markdown
# Astrology Tools — ஜோதிட கருவிகள்

Contemplative learning tools for Vedic astrology beginners, designed in Tamil pedagogical tradition.

Live: https://vgnshlvnz.github.io/astrology-tools/

## Tools
- **போதிதர்மர் சுருள்** (Bodhidharma Scroll) — Two patterns of the zodiac revealed through contemplative interaction
- **பாவ சக்கரம்** (Houses Wheel) — The 12 houses of Jyotish with Tamil keywords
- **கிரக அட்டைகள்** (Planet Cards) — Nine planetary nature cards, front and back

These tools are offered in the spirit of Tamil Shaiva pedagogy, under the silent witness
of Kattravar Vinayagar and Bodhidharma.

*மௌனத்தில் போதி, செயலில் தர்மம்* — Bodhi in silence, dharma in action.

Built by Vignesh (vgnshlvnz). License: MIT
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "chore: repo scaffold"
```

---

## Task 2: Test Infrastructure

**Files:** `tests/index.html`, `tests/assert.js`, `tests/test-data.js`, `tests/test-wheel.js`

- [ ] **Step 1: Write tests/assert.js**

```js
export function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`PASS: ${message}`);
}

export function assertClose(actual, expected, message, tolerance = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    console.error(`FAIL: ${message} — expected ${expected}, got ${actual}`);
    throw new Error(message);
  }
  console.log(`PASS: ${message}`);
}
```

- [ ] **Step 2: Write tests/test-data.js**

```js
import { assert } from './assert.js';

async function run() {
  try {
    const signs = await fetch('../shared/data/signs.json').then(r => r.json());
    assert(signs.length === 12, 'signs: 12 entries');
    assert(signs[0].id === 'mesha', 'signs[0] is mesha');
    assert(signs[0].position === 0, 'mesha position 0');
    assert(signs[3].id === 'kataka', 'signs[3] is kataka');
    assert(signs[4].id === 'simha', 'signs[4] is simha');
    assert(signs[9].id === 'makara', 'signs[9] is makara');
    assert(signs.every(s => ['id','tamil','english','ruler','element','position'].every(k => k in s)), 'signs: all required fields');

    const planets = await fetch('../shared/data/planets.json').then(r => r.json());
    assert(planets.length === 9, 'planets: 9 entries');
    const surya = planets.find(p => p.id === 'surya');
    assert(surya.owns[0] === 'simha', 'surya owns simha');
    assert(surya.shadow === false, 'surya not shadow');
    const rahu = planets.find(p => p.id === 'rahu');
    assert(rahu.shadow === true, 'rahu is shadow');
    assert(rahu.owns.length === 0, 'rahu owns nothing');
    assert(planets.every(p => 'ownership_annotation' in p), 'planets: ownership_annotation field exists');

    const elements = await fetch('../shared/data/elements.json').then(r => r.json());
    assert(elements.length === 4, 'elements: 4 entries');
    assert(elements.every(e => e.signs.length === 3), 'each element has 3 signs');

    const houses = await fetch('../shared/data/houses.json').then(r => r.json());
    assert(houses.length === 12, 'houses: 12 entries');
    assert(houses[0].id === 1, 'first house id is 1');
    assert(houses.every(h => ['tamil','english_keywords','example_question'].every(k => k in h)), 'houses: required fields');

    const ann = await fetch('../shared/data/annotations.json').then(r => r.json());
    assert(typeof ann.ownership_master === 'string', 'annotations: ownership_master');
    assert(typeof ann.elements_master === 'string', 'annotations: elements_master');

    console.log('=== All data tests passed ===');
  } catch (e) {
    console.error('Data tests failed:', e.message);
  }
}
run();
```

- [ ] **Step 3: Write tests/test-wheel.js**

```js
import { computeSectors } from '../shared/wheel.js';
import { assert, assertClose } from './assert.js';

try {
  const s = computeSectors(400, 400, 340, 180);
  assert(s.length === 12, 'wheel: 12 sectors');
  assertClose(s[0].centerDeg, 0,   'mesha at 0deg (3 oclock)');
  assertClose(s[3].centerDeg, 270, 'kataka at 270deg (12 oclock)');
  assertClose(s[4].centerDeg, 240, 'simha at 240deg (upper-left)');
  assertClose(s[9].centerDeg, 90,  'makara at 90deg (6 oclock)');
  assertClose(s[3].centerDeg - s[4].centerDeg, 30, 'kataka and simha 30deg apart');
  assertClose(s[9].centerDeg - s[10].centerDeg, 30, 'makara and kumbha 30deg apart');
  const labelR = (340 + 180) / 2;
  assertClose(s[0].labelX, 400 + labelR, 'mesha labelX at east');
  assertClose(s[0].labelY, 400,          'mesha labelY at center');
  assert(s.every(x => ['centerDeg','leadDeg','trailDeg','pathData','labelX','labelY'].every(k => k in x)), 'all geometry fields present');
  console.log('=== All wheel tests passed ===');
} catch (e) {
  console.error('Wheel tests failed:', e.message);
}
```

- [ ] **Step 4: Write tests/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Tests</title></head>
<body>
  <p>Open the browser console to see results.</p>
  <script type="module">
    import './test-data.js';
    import './test-wheel.js';
  </script>
</body>
</html>
```

- [ ] **Step 5: Open tests/index.html in browser — expect fetch errors (data files don't exist yet)**

- [ ] **Step 6: Commit**

```bash
git add tests/
git commit -m "test: browser-based test infrastructure"
```

---

## Task 3: Shared Data Files

**Files:** `shared/data/signs.json`, `planets.json`, `elements.json`, `houses.json`, `annotations.json`

- [ ] **Step 1: Write shared/data/signs.json**

```json
[
  {"id":"mesha",    "tamil":"மேஷம்",      "english":"Mesha",    "western":"Aries",       "ruler":"chevvai",  "element":"fire",  "modality":"movable","position":0},
  {"id":"rishaba",  "tamil":"ரிஷபம்",     "english":"Rishaba",  "western":"Taurus",      "ruler":"sukran",   "element":"earth", "modality":"fixed",  "position":1},
  {"id":"mithuna",  "tamil":"மிதுனம்",    "english":"Mithuna",  "western":"Gemini",      "ruler":"budhan",   "element":"air",   "modality":"dual",   "position":2},
  {"id":"kataka",   "tamil":"கடகம்",      "english":"Kataka",   "western":"Cancer",      "ruler":"chandra",  "element":"water", "modality":"movable","position":3},
  {"id":"simha",    "tamil":"சிம்மம்",    "english":"Simha",    "western":"Leo",         "ruler":"surya",    "element":"fire",  "modality":"fixed",  "position":4},
  {"id":"kanni",    "tamil":"கன்னி",      "english":"Kanni",    "western":"Virgo",       "ruler":"budhan",   "element":"earth", "modality":"dual",   "position":5},
  {"id":"thula",    "tamil":"துலாம்",     "english":"Thula",    "western":"Libra",       "ruler":"sukran",   "element":"air",   "modality":"movable","position":6},
  {"id":"vrischika","tamil":"விருச்சிகம்","english":"Vrischika","western":"Scorpio",     "ruler":"chevvai",  "element":"water", "modality":"fixed",  "position":7},
  {"id":"dhanus",   "tamil":"தனுசு",      "english":"Dhanus",   "western":"Sagittarius", "ruler":"devaguru", "element":"fire",  "modality":"dual",   "position":8},
  {"id":"makara",   "tamil":"மகரம்",      "english":"Makara",   "western":"Capricorn",   "ruler":"shani",    "element":"earth", "modality":"movable","position":9},
  {"id":"kumbha",   "tamil":"கும்பம்",    "english":"Kumbha",   "western":"Aquarius",    "ruler":"shani",    "element":"air",   "modality":"fixed",  "position":10},
  {"id":"meena",    "tamil":"மீனம்",      "english":"Meena",    "western":"Pisces",      "ruler":"devaguru", "element":"water", "modality":"dual",   "position":11}
]
```

- [ ] **Step 2: Write shared/data/planets.json**

```json
[
  {"id":"surya",    "tamil":"சூரியன்",    "english":"Surya",    "englishName":"Sun",     "nature_tamil":"அரசன், ஆத்மா",            "nature_english":"The king. The soul.",             "owns":["simha"],              "keyword":"Self, radiance, sovereignty",    "shadow":false,"symbol":"sun",     "ownership_annotation":"Surya owns Simha. The Sun is the king. The king sits on his own throne — the sign of pure radiance, kingship, and self-expression."},
  {"id":"chandra",  "tamil":"சந்திரன்",   "english":"Chandra",  "englishName":"Moon",    "nature_tamil":"இராணி, மனம்",              "nature_english":"The queen. The mind.",            "owns":["kataka"],             "keyword":"Emotion, nurturance, change",    "shadow":false,"symbol":"moon",    "ownership_annotation":"Chandra owns Kataka. The Moon, queen of the night sky, sits adjacent to the Sun. The two luminaries are the royal pair, side by side."},
  {"id":"chevvai",  "tamil":"செவ்வாய்",   "english":"Chevvai",  "englishName":"Mars",    "nature_tamil":"வீரன், போர்வீரன்",         "nature_english":"The warrior. The general.",       "owns":["mesha","vrischika"],  "keyword":"Action, courage, conflict",      "shadow":false,"symbol":"mars",    "ownership_annotation":"Chevvai takes the next position outward from the royal pair. The warrior protects the kingdom from both flanks."},
  {"id":"budhan",   "tamil":"புதன்",      "english":"Budhan",   "englishName":"Mercury", "nature_tamil":"தூதன், அமைச்சன்",          "nature_english":"The messenger. The minister.",    "owns":["mithuna","kanni"],    "keyword":"Speech, learning, exchange",     "shadow":false,"symbol":"mercury", "ownership_annotation":"Budhan, the messenger and closest planet to the Sun, sits as the minister on either side of the royal pair."},
  {"id":"devaguru", "tamil":"தேவகுரு",    "english":"Devaguru", "englishName":"Jupiter", "nature_tamil":"தேவர்களின் ஆசிரியர்",      "nature_english":"The teacher of the devas.",       "owns":["dhanus","meena"],     "keyword":"Wisdom, expansion, dharma",      "shadow":false,"symbol":"jupiter", "ownership_annotation":"Devaguru, the teacher of the devas, owns two signs nearly opposite the royal pair. Wisdom sits at distance from the throne."},
  {"id":"sukran",   "tamil":"சுக்கிரன்",  "english":"Sukran",   "englishName":"Venus",   "nature_tamil":"அசுர குரு, கலை",           "nature_english":"The teacher of the asuras. The arts.","owns":["rishaba","thula"],"keyword":"Beauty, harmony, pleasure",      "shadow":false,"symbol":"venus",   "ownership_annotation":"Sukran moves one step further out from the royal pair on each side. Beauty and harmony surround the throne."},
  {"id":"shani",    "tamil":"சனி",        "english":"Shani",    "englishName":"Saturn",  "nature_tamil":"பெரும் ஆசிரியர்",          "nature_english":"The great teacher. The judge.",   "owns":["makara","kumbha"],    "keyword":"Discipline, time, limit",        "shadow":false,"symbol":"saturn",  "ownership_annotation":"Shani owns two signs that sit together at the opposite end from the Sun and Moon. The discipline pole opposite the radiance pole. The zodiac is balanced."},
  {"id":"rahu",     "tamil":"ராகு",       "english":"Rahu",     "englishName":"Rahu",    "nature_tamil":"நிழல், ஆசை",               "nature_english":"The shadow. Desire.",             "owns":[],                     "keyword":"Obsession, foreign, sudden",     "shadow":true, "symbol":"rahu",    "ownership_annotation":""},
  {"id":"ketu",     "tamil":"கேது",       "english":"Ketu",     "englishName":"Ketu",    "nature_tamil":"நிழல், விடுபடல்",          "nature_english":"The shadow. Release.",            "owns":[],                     "keyword":"Detachment, spiritual, sudden",  "shadow":true, "symbol":"ketu",    "ownership_annotation":""}
]
```

- [ ] **Step 3: Write shared/data/elements.json**

```json
[
  {"id":"fire",  "tamil":"அக்னி","english":"Fire",  "color":"#a83232","signs":["mesha","simha","dhanus"],         "annotation":"Three signs of fire. Mesha begins fire — the spark of new action. Simha holds fire — the steady flame of the king. Dhanus releases fire — the arrow flying toward distant truth. Same element. Three movements."},
  {"id":"earth", "tamil":"பூமி", "english":"Earth", "color":"#8b6914","signs":["rishaba","kanni","makara"],        "annotation":"Three signs of earth. Rishaba — the fertile soil that builds. Kanni — the careful tending of what grows. Makara — the mountain that endures. Earth in three movements: build, refine, endure."},
  {"id":"air",   "tamil":"வாயு", "english":"Air",   "color":"#7a8590","signs":["mithuna","thula","kumbha"],        "annotation":"Three signs of air. Mithuna — the playful exchange of ideas. Thula — the weighing of opposing views. Kumbha — the vision that breaks open the old. Air in three movements: speak, balance, transform."},
  {"id":"water", "tamil":"ஜலம்", "english":"Water", "color":"#2c4a6b","signs":["kataka","vrischika","meena"],      "annotation":"Three signs of water. Kataka — the water that nurtures home. Vrischika — the deep water that transforms through intensity. Meena — the ocean that dissolves all distinctions. Water in three movements: hold, transform, dissolve."}
]
```

- [ ] **Step 4: Write shared/data/houses.json**

```json
[
  {"id":1,  "tamil":"தனு",        "english_keywords":"Self, body, appearance",             "example_question":"What is this person like at first glance?"},
  {"id":2,  "tamil":"தனம்",       "english_keywords":"Family, speech, wealth",             "example_question":"How do they speak? How do they hold wealth?"},
  {"id":3,  "tamil":"சகோதரம்",   "english_keywords":"Siblings, courage, communication",   "example_question":"What is their relationship to siblings? Are they bold?"},
  {"id":4,  "tamil":"தாய்",       "english_keywords":"Mother, home, comfort",              "example_question":"What is home for them?"},
  {"id":5,  "tamil":"சந்தானம்",  "english_keywords":"Children, intelligence, creativity", "example_question":"What do they create? What about children?"},
  {"id":6,  "tamil":"சத்ரு",     "english_keywords":"Enemies, disease, service",          "example_question":"What do they struggle against? How do they serve?"},
  {"id":7,  "tamil":"களத்திரம்", "english_keywords":"Spouse, partnership",                "example_question":"Who will they marry? What is their partner like?"},
  {"id":8,  "tamil":"ஆயுள்",     "english_keywords":"Longevity, transformation, hidden",  "example_question":"What hidden forces shape their life?"},
  {"id":9,  "tamil":"பாக்கியம்", "english_keywords":"Father, dharma, fortune",            "example_question":"What is their relationship to father? To dharma?"},
  {"id":10, "tamil":"கர்மம்",    "english_keywords":"Career, status, action",             "example_question":"What work will they be known for?"},
  {"id":11, "tamil":"லாபம்",     "english_keywords":"Gains, friends, desires fulfilled",  "example_question":"What gains come to them? Who are their friends?"},
  {"id":12, "tamil":"வ்யயம்",    "english_keywords":"Losses, liberation, expenditure",    "example_question":"Where do they spend themselves? What dissolves?"}
]
```

- [ ] **Step 5: Write shared/data/annotations.json**

```json
{
  "ownership_master": "Notice. The luminaries that bring light sit together at the top. Shani, who teaches limit, sits opposite, also together at the bottom. The other planets fan out between these two poles. The zodiac is not random. It is built on the polarity of radiance and limitation.",
  "elements_master": "Twelve signs, four elements, three signs each. The wheel divides itself by nature: fire, earth, air, water. The same elements your body is made of. The same elements that move the seasons. The same elements that move you."
}
```

- [ ] **Step 6: Open tests/index.html — data tests should all pass now**

Expected console:
```
PASS: signs: 12 entries
PASS: signs[0] is mesha
... (all data tests)
=== All data tests passed ===
```

Wheel tests will still fail (wheel.js not yet written).

- [ ] **Step 7: Commit**

```bash
git add shared/data/
git commit -m "data: all canonical JSON data files"
```

---

## Task 4: Shared CSS

**Files:** `shared/styles.css`

- [ ] **Step 1: Write shared/styles.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;500&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');

:root {
  --ink:          #2a1f17;
  --paper-body:   #ede0c8;
  --paper-scroll: #e0d0b0;
  --seal-red:     #7a2a1c;
  --text-muted:   #6b4a2a;
  --element-fire: #a83232;
  --element-earth:#8b6914;
  --element-air:  #7a8590;
  --element-water:#2c4a6b;
  --font-tamil:   'Noto Serif Tamil', serif;
  --font-english: 'Cormorant Garamond', Georgia, serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--paper-body);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  color: var(--ink);
  font-family: var(--font-english);
  min-height: 100vh;
}

.scroll-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  background: var(--paper-scroll);
  box-shadow: inset 0 0 60px rgba(90,55,15,0.12);
  position: relative;
  min-height: 100vh;
}

/* Ambient seal stamp, top-right corner */
.scroll-container::after {
  content: '';
  position: absolute;
  top: 12px; right: 16px;
  width: 32px; height: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect x='1' y='1' width='30' height='30' fill='none' stroke='%237a2a1c' stroke-width='1.5'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-family='serif' font-size='13' fill='%237a2a1c'%3Eஓம்%3C/text%3E%3C/svg%3E");
  transform: rotate(3deg);
  opacity: 0.7;
}

/* ── Invocation ── */
.invocation { text-align: center; padding: 28px 0 20px; }
.invocation .suzhi  { display:block; color:var(--seal-red); font-family:var(--font-tamil); font-size:24px; margin-bottom:10px; }
.invocation .om     { display:block; color:var(--ink); font-family:var(--font-tamil); font-size:28px; margin-bottom:8px; }
.invocation .vinayagar-tamil { display:block; font-family:var(--font-tamil); font-weight:500; font-size:22px; color:var(--ink); line-height:1.6; }
.invocation .chant  { display:block; font-family:var(--font-tamil); font-weight:500; font-size:22px; color:var(--ink); line-height:1.6; }
.invocation .gloss  { display:block; font-family:var(--font-english); font-style:italic; font-size:14px; color:var(--text-muted); margin-top:8px; }

/* ── Thesis ── */
.thesis { text-align:center; padding:18px 24px; border-top:1px solid rgba(110,75,45,0.2); border-bottom:1px solid rgba(110,75,45,0.2); margin:8px 0 28px; }
.thesis-tamil   { display:block; font-family:var(--font-tamil); font-weight:500; font-size:28px; color:var(--ink); }
.thesis-english { display:block; font-family:var(--font-english); font-style:italic; font-size:17px; color:var(--text-muted); margin-top:6px; }

/* ── Mode buttons ── */
.mode-buttons { display:flex; justify-content:center; gap:12px; margin:20px 0 16px; }
.mode-btn { padding:8px 24px; font-family:var(--font-english); font-size:15px; color:var(--ink); background:transparent; border:1px solid rgba(42,31,23,0.5); cursor:pointer; letter-spacing:0.5px; transition:border-color 200ms, color 200ms; }
.mode-btn.active { color:var(--seal-red); border-color:var(--seal-red); }
.mode-btn:focus-visible { outline:2px solid var(--seal-red); outline-offset:2px; }

/* ── Picker ── */
.picker { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:12px 0 20px; }
.picker-btn { min-width:44px; min-height:44px; padding:6px 14px; font-family:var(--font-tamil); font-size:14px; color:var(--ink); background:transparent; border:1px solid rgba(42,31,23,0.35); cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; transition:background 200ms, border-color 200ms; }
.picker-btn:hover:not(.shadow-planet) { border-color:rgba(42,31,23,0.7); }
.picker-btn.active { background:rgba(122,42,28,0.08); border-color:var(--seal-red); }
.picker-btn.shadow-planet { opacity:0.38; cursor:default; }
.picker-btn .planet-tamil   { font-family:var(--font-tamil); font-size:14px; line-height:1.2; }
.picker-btn .planet-english { font-family:var(--font-english); font-style:italic; font-size:11px; color:var(--text-muted); }

/* ── Annotation panel ── */
.annotation-panel { max-width:620px; margin:8px auto 16px; padding:16px 20px; border-left:2px solid rgba(122,42,28,0.25); font-family:var(--font-english); font-size:16px; line-height:1.75; color:var(--ink); opacity:0; transition:opacity 800ms ease-in; min-height:60px; }
.annotation-panel.visible { opacity:1; }

/* Reset */
.reset-btn { display:block; margin:4px auto 0; padding:5px 14px; font-family:var(--font-english); font-size:13px; color:var(--text-muted); background:transparent; border:1px solid rgba(110,75,45,0.3); cursor:pointer; }
.reset-btn:hover { border-color:rgba(110,75,45,0.6); }

/* ── Seal stamp animation ── */
@keyframes stamp { from { transform:scale(1.4); opacity:0; } to { transform:scale(1); opacity:1; } }
.seal-stamp { animation:stamp 500ms cubic-bezier(0.2,0.8,0.3,1) forwards; }

/* ── Bodhidharma ── */
.bodhidharma-corner { position:absolute; bottom:24px; left:16px; text-align:center; pointer-events:none; }
.bodhidharma-caption-tamil   { display:block; font-family:var(--font-tamil); font-size:13px; color:var(--ink); margin-top:5px; }
.bodhidharma-caption-english { display:block; font-family:var(--font-english); font-style:italic; font-size:10px; color:var(--text-muted); line-height:1.4; }

/* ── Planet cards ── */
.card-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin:24px auto; max-width:720px; }
.card-3d { perspective:1000px; height:220px; cursor:pointer; }
.card-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform 600ms ease; }
.card-3d.is-flipped .card-inner { transform:rotateY(180deg); }
.card-face { position:absolute; inset:0; backface-visibility:hidden; background:var(--paper-scroll); border:1px solid rgba(42,31,23,0.25); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; text-align:center; gap:8px; }
.card-back { transform:rotateY(180deg); align-items:flex-start; text-align:left; padding:12px 14px; justify-content:flex-start; gap:2px; overflow:hidden; }
.card-planet-tamil { font-family:var(--font-tamil); font-weight:500; font-size:24px; color:var(--ink); }
.card-planet-english-small { font-family:var(--font-english); font-style:italic; font-size:13px; color:var(--text-muted); }
.card-flip-hint { font-family:var(--font-english); font-style:italic; font-size:11px; color:var(--text-muted); margin-top:auto; }
.card-back-label { display:block; font-family:var(--font-english); font-size:10px; color:var(--seal-red); letter-spacing:0.8px; text-transform:uppercase; margin-top:6px; }
.card-back-value { display:block; font-family:var(--font-english); font-size:13px; color:var(--ink); line-height:1.4; }
.card-back-value-tamil { display:block; font-family:var(--font-tamil); font-size:13px; color:var(--ink); line-height:1.4; }

/* ── House panel ── */
.house-panel { max-width:680px; margin:12px auto 0; padding:20px 24px; border-top:1px solid rgba(42,31,23,0.15); background:rgba(224,208,176,0.4); }
.house-panel-number   { display:block; font-family:var(--font-english); font-size:12px; color:var(--seal-red); letter-spacing:1px; text-transform:uppercase; margin-bottom:4px; }
.house-panel-tamil    { display:block; font-family:var(--font-tamil); font-weight:500; font-size:26px; color:var(--ink); margin-bottom:4px; }
.house-panel-keywords { display:block; font-family:var(--font-english); font-size:17px; color:var(--ink); margin-bottom:10px; }
.house-panel-question { display:block; font-family:var(--font-english); font-style:italic; font-size:15px; color:var(--text-muted); }

/* ── Tool cards (landing) ── */
.tool-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin:32px auto; max-width:800px; }
.tool-card { display:block; padding:24px 20px; text-decoration:none; color:var(--ink); border:1px solid rgba(42,31,23,0.2); background:rgba(224,208,176,0.4); transition:border-color 200ms, background 200ms; }
.tool-card:hover { border-color:rgba(122,42,28,0.4); background:rgba(224,208,176,0.7); }
.tool-card-tamil   { display:block; font-family:var(--font-tamil); font-weight:500; font-size:20px; color:var(--ink); margin-bottom:4px; }
.tool-card-english { display:block; font-family:var(--font-english); font-style:italic; font-size:16px; color:var(--text-muted); margin-bottom:10px; }
.tool-card-desc { font-family:var(--font-english); font-size:14px; color:var(--ink); line-height:1.6; }

/* ── Triangle lines (Tool 1 elements mode) ── */
.element-line { stroke-linecap:round; fill:none; transition:stroke-dashoffset 400ms ease; }

/* ── Mobile ── */
@media (max-width:640px) {
  .scroll-container { padding:20px 12px 40px; }
  .invocation .vinayagar-tamil, .invocation .chant { font-size:18px; }
  .thesis-tamil { font-size:20px; }
  .thesis-english { font-size:14px; }
  .bodhidharma-corner { position:static; margin:28px auto 0; }
  .card-grid { grid-template-columns:1fr; }
  .tool-grid { grid-template-columns:1fr; }
  .house-panel { padding:14px 12px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/styles.css
git commit -m "style: shared CSS with paper aesthetic and all component styles"
```

---

## Task 5: Shared Invocation, Bodhidharma, and Symbols

**Files:** `shared/invocation.js`, `shared/bodhidharma.js`, `shared/symbols.js`

- [ ] **Step 1: Write shared/invocation.js**

```js
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
```

- [ ] **Step 2: Write shared/bodhidharma.js**

```js
// Pallava SVG silhouette — headcloth, closed eyes, robe folds, folded hands, feet.
// Built from a static SVG string parsed via DOMParser (no script execution risk).
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
```

- [ ] **Step 3: Write shared/symbols.js**

```js
// Planet symbol SVGs — static art, parsed via DOMParser.
// Each symbol is a brushed-style SVG glyph, hand-coded paths.
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
```

- [ ] **Step 4: Commit**

```bash
git add shared/invocation.js shared/bodhidharma.js shared/symbols.js
git commit -m "feat: shared invocation, Bodhidharma, and planet symbol components"
```

---

## Task 6: Shared Wheel Geometry

**Files:** `shared/wheel.js`

- [ ] **Step 1: Write shared/wheel.js**

```js
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

// DOM builder — appends to svgEl, returns { sectors, sectorEls }
export function buildWheel(svgRoot, cx, cy, outerR, innerR, labels) {
  // Brush filter via createElementNS — no HTML string injection
  const defs   = document.createElementNS(NS, 'defs');
  const filter = document.createElementNS(NS, 'filter');
  filter.id = 'brush-feel';
  ['x','-5%','y','-5%','width','110%','height','110%'].reduce((_, v, i, a) => i % 2 === 0 && filter.setAttribute(v, a[i+1]), null);

  const turb = svgEl('feTurbulence', { type:'fractalNoise', baseFrequency:'0.02 0.04', numOctaves:'3', seed:'7', stitchTiles:'stitch' });
  const disp = svgEl('feDisplacementMap', { in:'SourceGraphic', scale:'2', xChannelSelector:'R', yChannelSelector:'G' });
  filter.append(turb, disp);
  defs.appendChild(filter);
  svgRoot.appendChild(defs);

  // Brushed lines group
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

  // Sector groups (labels outside brush filter — text must stay crisp)
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

  // Bindu (center point)
  svgRoot.appendChild(svgEl('circle', { cx, cy, r:'7',  fill:'#7a2a1c' }));
  svgRoot.appendChild(svgEl('circle', { cx, cy, r:'14', fill:'none', stroke:'#7a2a1c', 'stroke-width':'0.8', opacity:'0.5' }));

  return { sectors, sectorEls };
}
```

- [ ] **Step 2: Open tests/index.html — wheel tests should now pass**

Expected:
```
PASS: wheel: 12 sectors
PASS: mesha at 0deg (3 oclock)
PASS: kataka at 270deg (12 oclock)
PASS: simha at 240deg (upper-left)
PASS: makara at 90deg (6 oclock)
PASS: kumbha at 60°
PASS: kataka and simha 30deg apart
PASS: makara and kumbha 30deg apart
PASS: mesha labelX at east
PASS: mesha labelY at center
PASS: all geometry fields present
=== All wheel tests passed ===
```

- [ ] **Step 3: Fix any failures before proceeding**

- [ ] **Step 4: Commit**

```bash
git add shared/wheel.js
git commit -m "feat: shared wheel geometry and DOM builder"
```

---

## Task 7: Tool 1 — HTML and CSS

**Files:** `bodhidharma-scroll/index.html`, `bodhidharma-scroll/style.css`

- [ ] **Step 1: Write bodhidharma-scroll/index.html**

```html
<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>போதிதர்மர் சுருள் — Bodhidharma Scroll</title>
  <link rel="stylesheet" href="../shared/styles.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="scroll-container">
    <div id="invocation-mount"></div>

    <div class="wheel-section">
      <svg id="zodiac-wheel"
           viewBox="0 0 800 800"
           style="width:100%;max-width:720px;display:block;margin:0 auto;"
           role="img"
           aria-label="Zodiac wheel with 12 signs">
      </svg>
    </div>

    <div class="controls">
      <div class="mode-buttons" role="group" aria-label="Select mode">
        <button class="mode-btn active" id="btn-ownership" aria-pressed="true">Ownership</button>
        <button class="mode-btn"        id="btn-elements"  aria-pressed="false">Elements</button>
      </div>
      <div id="shadow-note" style="display:none;text-align:center;font-size:13px;color:#6b4a2a;font-style:italic;margin-top:4px;">
        Rahu and Ketu are shadow planets — they do not own signs.
      </div>
      <div id="picker-mount" class="picker" role="group" aria-label="Select planet or element"></div>
      <div id="annotation-panel" class="annotation-panel" aria-live="polite" aria-atomic="true"></div>
      <button class="reset-btn" id="reset-btn">Reset</button>
    </div>

    <div id="bodhidharma-mount"></div>
  </div>
  <script type="module" src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write bodhidharma-scroll/style.css**

```css
.wheel-section { display:flex; justify-content:center; margin-bottom:8px; }
.controls { max-width:700px; margin:0 auto; }
.sector-seal { font-family:'Noto Serif Tamil',serif; font-size:10px; fill:#7a2a1c; pointer-events:none; }
```

- [ ] **Step 3: Open bodhidharma-scroll/index.html — verify warm paper, empty SVG, mode buttons, no console errors**

- [ ] **Step 4: Commit**

```bash
git add bodhidharma-scroll/index.html bodhidharma-scroll/style.css
git commit -m "feat: Tool 1 HTML/CSS structure"
```

---

## Task 8: Tool 1 — Script (Wheel Render + Ownership Mode)

**Files:** `bodhidharma-scroll/script.js`

- [ ] **Step 1: Write bodhidharma-scroll/script.js**

```js
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
```

- [ ] **Step 2: Open bodhidharma-scroll/index.html and run the verification checklist**

- [ ] Invocation block: ஶ்ரீ in red, Tamil text, thesis inscription
- [ ] Wheel: 12 sectors, Mesha at 3 o'clock, Kataka/Simha adjacent at top, Makara/Kumbha adjacent at bottom
- [ ] Ownership mode: click Surya → Simha tints, seal stamps, annotation fades in after pause
- [ ] Click all 7 planets → master annotation appears
- [ ] Reset clears everything
- [ ] Elements mode: click Fire → 3 signs tint, 3 triangle edges draw one by one
- [ ] All 4 elements → interlocking star + master annotation
- [ ] Bodhidharma figure in bottom-left corner, `pointer-events:none`

- [ ] **Step 3: Commit**

```bash
git add bodhidharma-scroll/script.js
git commit -m "feat: Tool 1 Bodhidharma Scroll complete — ownership and elements modes"
```

---

## Task 9: Tool 2 — Houses Wheel

**Files:** `houses-wheel/index.html`, `houses-wheel/style.css`, `houses-wheel/script.js`

- [ ] **Step 1: Write houses-wheel/index.html**

```html
<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>பாவ சக்கரம் — Houses Wheel</title>
  <link rel="stylesheet" href="../shared/styles.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="scroll-container">
    <div id="invocation-mount"></div>
    <div style="display:flex;justify-content:center;">
      <svg id="houses-wheel" viewBox="0 0 800 800"
           style="width:100%;max-width:680px;display:block;"
           role="img" aria-label="12 houses of Jyotish"></svg>
    </div>
    <div id="house-panel" class="house-panel" aria-live="polite" aria-atomic="true" style="display:none;"></div>
    <div id="bodhidharma-mount"></div>
  </div>
  <script type="module" src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write houses-wheel/style.css**

```css
/* House number label inside sector */
.house-num-label { pointer-events:none; }
```

- [ ] **Step 3: Write houses-wheel/script.js**

```js
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
```

- [ ] **Step 4: Open houses-wheel/index.html and verify**

- [ ] Invocation and thesis render
- [ ] 12 house sectors with Tamil names and house numbers
- [ ] Clicking a house tints it and shows panel with Tamil name, keywords, question
- [ ] Clicking same house again closes panel
- [ ] Bodhidharma figure present

- [ ] **Step 5: Commit**

```bash
git add houses-wheel/
git commit -m "feat: Tool 2 Houses Wheel complete"
```

---

## Task 10: Tool 3 — Planet Cards

**Files:** `planet-cards/index.html`, `planet-cards/style.css`, `planet-cards/script.js`

- [ ] **Step 1: Write planet-cards/index.html**

```html
<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>கிரக அட்டைகள் — Planet Cards</title>
  <link rel="stylesheet" href="../shared/styles.css">
</head>
<body>
  <div class="scroll-container" style="padding-bottom:48px;">
    <div id="invocation-mount"></div>
    <div id="cards-mount" class="card-grid"></div>
  </div>
  <script type="module" src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write planet-cards/script.js**

```js
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
```

- [ ] **Step 3: Open planet-cards/index.html and verify**

- [ ] Invocation renders
- [ ] 9 cards in 3×3 grid (desktop)
- [ ] Card fronts: Tamil name, planet symbol, English name
- [ ] Clicking a card flips smoothly (600ms 3D rotation)
- [ ] Card backs: nature in Tamil + English, signs owned, keyword
- [ ] Rahu and Ketu show "Shadow — no rulership"
- [ ] Mobile (≤640px): single column

- [ ] **Step 4: Commit**

```bash
git add planet-cards/
git commit -m "feat: Tool 3 Planet Cards with CSS 3D flip"
```

---

## Task 11: Landing Page

**Files:** `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ஜோதிட கருவிகள் — Astrology Tools</title>
  <link rel="stylesheet" href="shared/styles.css">
</head>
<body>
  <div class="scroll-container" style="padding-bottom:80px;">
    <div id="invocation-mount"></div>

    <nav class="tool-grid" aria-label="Tools">
      <a class="tool-card" href="bodhidharma-scroll/">
        <span class="tool-card-tamil">போதிதர்மர் சுருள்</span>
        <span class="tool-card-english">Bodhidharma Scroll</span>
        <span class="tool-card-desc">Two patterns hidden in the zodiac — ownership and elements — revealed through contemplative interaction.</span>
      </a>
      <a class="tool-card" href="houses-wheel/">
        <span class="tool-card-tamil">பாவ சக்கரம்</span>
        <span class="tool-card-english">Houses Wheel</span>
        <span class="tool-card-desc">The 12 houses of Jyotish — Tamil keywords and the questions each house answers.</span>
      </a>
      <a class="tool-card" href="planet-cards/">
        <span class="tool-card-tamil">கிரக அட்டைகள்</span>
        <span class="tool-card-english">Planet Cards</span>
        <span class="tool-card-desc">Nine planets, nine natures — flip each card to see what each planet carries.</span>
      </a>
    </nav>

    <div id="bodhidharma-mount"></div>
  </div>

  <script type="module">
    import { renderInvocation }      from './shared/invocation.js';
    import { renderBodhidharmaBlock } from './shared/bodhidharma.js';
    renderInvocation(document.getElementById('invocation-mount'));
    renderBodhidharmaBlock(document.getElementById('bodhidharma-mount'), 80, 107);
  </script>
</body>
</html>
```

- [ ] **Step 2: Open index.html — verify invocation, three tool cards, Bodhidharma corner**

Note: opening `index.html` directly from the filesystem will fail because ES module imports need a server. Run a local server first:

```bash
cd /home/vgnshlvnz/Documents/astrology-tools
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

- [ ] **Step 3: Verify all links work (relative paths, no leading /)**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: landing page with tool grid"
```

---

## Task 12: Deployment

- [ ] **Step 1: Create GitHub repo and push**

```bash
git remote add origin https://github.com/vgnshlvnz/astrology-tools.git
git push -u origin main
```

- [ ] **Step 2: Enable GitHub Pages**

GitHub → repo Settings → Pages → Source: Deploy from branch → Branch: `main` → Folder: `/ (root)` → Save. Wait ~2 min.

- [ ] **Step 3: Verify live URL**

Open `https://vgnshlvnz.github.io/astrology-tools/` and run the full checklist:
- [ ] Landing page loads with Tamil fonts from Google Fonts
- [ ] All three tool links navigate correctly
- [ ] `bodhidharma-scroll/` — wheel renders, Ownership and Elements modes both work
- [ ] `houses-wheel/` — house click shows panel
- [ ] `planet-cards/` — cards flip
- [ ] Test on a phone (or DevTools device simulation at 390px width)

- [ ] **Step 4: Update README with final live URL and commit**

```bash
git add README.md
git commit -m "docs: final README"
git push
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Lived-in paper aesthetic (grain, vignette, ambient seal) | Task 4 |
| CSS custom properties palette | Task 4 |
| Google Fonts CDN | Task 4 |
| Bodhidharma Pallava SVG silhouette | Task 5 |
| Invocation block (suzhi, OM, Vinayagar, chant, gloss) | Task 5 |
| Thesis inscription | Task 5 |
| Planet symbols (brushed SVG) | Task 5 |
| Wheel geometry — Mesha 3 o'clock, CCW, Kataka/Simha at top | Task 6 |
| Brush-line SVG filter | Task 6 |
| All JSON data files (signs, planets, elements, houses, annotations) | Task 3 |
| Ownership mode — seals, tints, annotation timing (600ms + 800ms) | Task 8 |
| Master ownership annotation at 7 planets | Task 8 |
| Rahu/Ketu greyed-out | Task 8 |
| Elements mode — triangle stroke-dashoffset animation, 400ms/edge | Task 8 |
| Master elements annotation at 4 elements | Task 8 |
| Mode switch clears all state | Task 8 |
| Tool 2 — Houses Wheel, panel, Bodhidharma | Task 9 |
| Tool 3 — Planet Cards, 3D flip, all 9 planets | Task 10 |
| Landing page, tool grid | Task 11 |
| Mobile ≤640px layout (Bodhidharma repositions, grids reflow) | Task 4 (CSS) |
| Accessibility — aria-label, aria-live, keyboard nav | Tasks 7–10 |
| All paths relative (no leading /) | Tasks 7, 9, 10, 11 |
| .gitignore includes .superpowers/ | Task 1 |
| GitHub Pages deployment | Task 12 |

All spec sections covered. No gaps.
