# Astrology Tools — Design Spec
**Date:** 2026-05-25
**Owner:** Vignesh (vgnshlvnz)
**Deployment:** GitHub Pages → `https://vgnshlvnz.github.io/astrology-tools/`
**Stack:** Pure HTML, CSS, JavaScript. ES modules. No framework. No build step.

---

## 1. Project Purpose

A set of three contemplative Vedic astrology teaching tools for two Malaysian Indian beginners attending a 75-minute Google Meet session. The tools are a digital expression of Tamil Shaiva pedagogy — they are not generic astrology apps. Every design decision serves the framing: three witnesses (Shiva, Kattravar Vinayagar, Bodhidharma), mouna (silence as teaching), and the thesis *மௌனத்தில் போதி, செயலில் தர்மம்* (Bodhi in silence, dharma in action).

---

## 2. Aesthetic System (Locked)

**Scroll aesthetic:** Lived-in paper (Option B from brainstorm).
- Base paper color: `#e8d8bc` (body), `#e0d0b0` (scroll container)
- Grain: SVG `feTurbulence` noise filter as data-URI background-image, opacity ~0.04
- Vignette: `inset box-shadow 0 0 60px rgba(90,55,15,0.12)` on scroll container
- Ambient seal stamp: 32×32px SVG square, ~3° rotation, `ஓம்` inside, top-right corner

**Color palette (CSS custom properties):**
```css
--ink:          #2a1f17;
--paper-body:   #ede0c8;
--paper-scroll: #e0d0b0;
--seal-red:     #7a2a1c;
--text-muted:   #6b4a2a;
--element-fire: #a83232;
--element-earth:#8b6914;
--element-air:  #7a8590;
--element-water:#2c4a6b;
```

**Typography:**
- Tamil: Noto Serif Tamil via Google Fonts CDN, weights 400 and 500
- English: Cormorant Garamond via Google Fonts CDN, regular and italic
- Tamil is always larger than English; Tamil is primary, English is the gloss
- No `.woff2` files bundled in repo

**Bodhidharma figure:** Pallava SVG silhouette (Option B from brainstorm).
- Hand-coded SVG paths: headcloth with cloth drape, closed eyes, robe with fold lines, folded hands in lap, feet visible from crossed legs
- Ink black `#2a1f17`, opacity 0.88
- `pointer-events: none` — he is a silent witness, not interactive
- Defined once in `shared/bodhidharma.js`, rendered via `renderBodhidharma(size)` wherever needed

**Pacing rules (non-negotiable):**
- Seal stamp: scale 1.4→1, opacity 0→1, 500ms CSS animation
- Annotation fade-in: opacity 0→1, 800ms CSS transition, triggered after 600ms delay
- Triangle edges: SVG `stroke-dashoffset` animation, 400ms per edge, sequential
- No progress bars. No points. No gamification. No urgency.

---

## 3. Architecture

**Build approach:** Scaffold-first. Shared infrastructure (`shared/`) is built before any tool. Each tool inherits the scaffold and adds only its own logic.

**File structure:**
```
astrology-tools/
├── .gitignore                       ← includes .superpowers/
├── README.md
├── index.html                       ← landing page
├── shared/
│   ├── styles.css                   ← CSS custom properties + all shared aesthetic
│   ├── invocation.js                ← renderInvocation() → HTML string
│   ├── bodhidharma.js               ← renderBodhidharma(width, height) → SVG string
│   ├── wheel.js                     ← buildWheel(cx, cy, outerR, innerR) → SVG elements
│   └── data/
│       ├── signs.json
│       ├── planets.json
│       └── houses.json
├── bodhidharma-scroll/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── houses-wheel/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── planet-cards/
    ├── index.html
    ├── style.css
    └── script.js
```

**ES modules:** All JS files use `type="module"`. Tools import from `../shared/` using relative paths. No bundler required — GitHub Pages serves them directly.

**Data loading:** Tools fetch JSON at load time via `fetch('../shared/data/signs.json')`. No data hardcoded in tool JS files.

**Paths:** All paths are relative (no leading `/`) so the site works under the `/astrology-tools/` GitHub Pages subpath.

---

## 4. Shared Data Files

### `shared/data/signs.json`
12 entries. Fields per sign:
```json
{
  "id": "mesha",
  "tamil": "மேஷம்",
  "english": "Mesha",
  "western": "Aries",
  "ruler": "chevvai",
  "element": "fire",
  "modality": "movable",
  "position": 0
}
```
`position` is 0-based counter-clockwise from Mesha (3 o'clock). Used to compute wheel angles.

### `shared/data/planets.json`
9 entries (7 traditional + Rahu + Ketu). Fields:
```json
{
  "id": "surya",
  "tamil": "சூரியன்",
  "english": "Surya",
  "englishName": "Sun",
  "nature_tamil": "அரசன், ஆத்மா",
  "nature_english": "The king. The soul.",
  "owns": ["simha"],
  "keyword": "Self, radiance, sovereignty",
  "shadow": false
}
```
Rahu and Ketu have `"shadow": true` and `"owns": []`.

### `shared/data/houses.json`
12 entries. Fields:
```json
{
  "id": 1,
  "tamil": "தனு",
  "english_keywords": "Self, body, appearance",
  "example_question": "What is this person like at first glance?"
}
```

---

## 5. Shared Components

### `shared/invocation.js`
Exports `renderInvocation()` returning:
```html
<div class="invocation">
  <div class="suzhi">ஶ்ரீ</div>
  <div class="om">ௐ</div>
  <div class="vinayagar-tamil">கற்றவர் விநாயகர்</div>
  <div class="chant">தொக்குதம் தொக்குதிம்</div>
  <div class="gloss">Salutations to the lord of learning.</div>
</div>
```
Styles live in `shared/styles.css`. The chant is never translated — it is the embodied rhythm.

### `shared/bodhidharma.js`
Exports `renderBodhidharma(width, height)` returning the Pallava SVG silhouette string with `viewBox="0 0 90 120"` scaled to requested dimensions. Caption (`போதிதர்மர்` + English subtitle) rendered separately by caller.

---

## 6. Tool 1 — Bodhidharma Scroll

### Wheel geometry
`buildWheel(cx, cy, outerR, innerR)` computes all 12 sector boundaries.
- Mesha at angle 0° (3 o'clock, East)
- Signs proceed counter-clockwise visually. In SVG coordinate space (Y-down), counter-clockwise visual motion = negative angle direction. Formula: `svgAngle = -position × 30°` in degrees, converted to radians for `cos()`/`sin()`. Equivalently: `(360 - position * 30) % 360`. This places Kataka (position 3) at -90° (12 o'clock, top-right) and Simha (position 4) at -120° (upper-left), adjacent at the top; Makara (position 9) at -270° = 90° (6 o'clock, bottom) and Kumbha (position 10) at -300° = 60°, adjacent at the bottom
- Sign label positions computed at `labelR = (outerR + innerR) / 2`, at sector midpoint angle
- All coordinates generated in JS; no hardcoded values in SVG markup

### Brush-line treatment
A single SVG filter `id="brush-feel"`:
```xml
<filter id="brush-feel">
  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04"
    numOctaves="3" seed="7" stitchTiles="stitch"/>
  <feDisplacementMap in="SourceGraphic" scale="2"
    xChannelSelector="R" yChannelSelector="G"/>
</filter>
```
Applied to the `<g>` containing all radial lines, sector boundaries, and ring circles. Clean geometric coordinates underneath; filter provides organic irregularity. Not applied to text labels (text remains crisp).

### Pattern A — Ownership interactions
State: `activePlanets = new Set()`.

`activatePlanet(planetId)`:
1. For each sign owned by planet: append seal SVG to sector, trigger CSS `stamp` animation (scale 1.4→1, opacity 0→1, 500ms), apply sector tint `rgba(122,42,28,0.08)`
2. `setTimeout(showAnnotation, 600)` → annotation panel fades in (opacity 0→1, 800ms)
3. If planet already active: remove seal, clear tint, hide annotation
4. After each activation: if `activePlanets.size === 7`, show master annotation after 600ms delay

Rahu and Ketu rendered greyed-out in the planet picker with tooltip: "Rahu and Ketu are shadow planets — they do not own signs."

### Pattern B — Elements interactions
State: `activeElements = new Set()`.

`activateElement(elementId)`:
1. Tint the three sign sectors in element color at 15% opacity
2. Draw triangle: three `<line>` elements connecting sector label positions. Each line starts with `stroke-dasharray = length; stroke-dashoffset = length`, then CSS transition sets `stroke-dashoffset = 0` over 400ms. Lines triggered sequentially with 400ms gaps
3. After third edge: `setTimeout(showAnnotation, 600)` → fade in
4. If element already active: remove tint, remove lines, hide annotation
5. When `activeElements.size === 4`: all four triangles visible simultaneously (the interlocking star), master annotation shown

### Mode switching
Two buttons: `[ Ownership ] [ Elements ]`. On switch: all active state cleared, planet/element picker re-rendered, annotation panel cleared. No animation on mode switch — instant, clean reset.

### Mobile (≤640px)
- Wheel shrinks to fit `min(100vw - 32px, 480px)`
- Bodhidharma moves from absolute bottom-left to centered below wheel
- Annotations stack below controls, full width
- Planet/element picker wraps to 3 columns
- All tap targets ≥44×44px

### Accessibility
- Planet and element buttons: `aria-label="சூரியன் — Surya (Sun)"`
- Annotation container: `aria-live="polite"` — announcements for screen readers
- Keyboard navigation: all buttons reachable via Tab, activated via Enter/Space
- Color never the only signal: stamped signs also show the seal glyph, not just background tint

---

## 7. Tool 2 — Houses Wheel

Same scroll aesthetic, same invocation block. Simpler than Tool 1 — one mode, no pattern reveal.

**Wheel:** Same `buildWheel()` function (imported from shared utils). 12 house sectors, numbered 1–12 with Tamil and English labels.

**Interaction:** Clicking a house opens an info panel. On mobile: panel slides up from bottom. On desktop: panel appears as a side column.

**Panel content per house:** Tamil name, English keywords, one-line meaning, one example question.

**Bodhidharma:** Include at 70×93px, bottom-left, same as Tool 1. He watches over all tools.

---

## 8. Tool 3 — Planet Cards

Same scroll aesthetic, same invocation block. No wheel — just 9 cards in a 3×3 grid (desktop) or single-column scroll (mobile).

**Card flip:** CSS `transform: rotateY(180deg)` on `.card-inner` inside `.card`. `perspective: 1000px` on `.card`. Front and back both positioned absolutely. Triggered on click/tap (toggle class `.is-flipped`).

**Card front:** Tamil planet name (large, Noto Serif Tamil 500), planetary symbol (simple brushed SVG — sun disc, moon crescent, etc., hand-coded, not icon library).

**Card back:** English name, nature in Tamil + English, signs owned (or shadow note), keyword.

**No Bodhidharma** on this tool — three figures across the site is enough; keep him where he carries weight (Tools 1 and 2, landing page).

---

## 9. Landing Page (`index.html`)

Three tool cards in a simple grid. Same scroll aesthetic. Invocation block at top. Bodhidharma in bottom-left corner.

Each card: Tamil tool name, English tool name, one-line description, link.

---

## 10. Deployment

1. `git init` in project root, push to `github.com/vgnshlvnz/astrology-tools`
2. GitHub Pages: Settings → Pages → Source: Deploy from branch → `main` → root `/`
3. All paths relative — no leading `/`
4. `.gitignore` includes `.superpowers/`

---

## 11. What Success Looks Like

Opening the Bodhidharma Scroll on a phone should feel like unrolling a manuscript. The Tamil invocation comes first. The wheel appears below it, slightly irregular lines, warm paper. Tapping "Ownership" and then a planet: the seal stamps, a pause, the annotation breathes in. No urgency. No noise. Bodhidharma sits in the corner, eyes closed.

A Malaysian Indian student should feel: *"This is my tradition, taught with respect."*

**மௌனத்தில் போதி, செயலில் தர்மம்.**
