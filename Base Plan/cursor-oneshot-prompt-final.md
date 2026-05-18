# Cursor One-Shot Prompt — Jason Saputra Portfolio
# FINAL VERSION — All decisions locked

Paste this entire prompt into Cursor Agent mode (Claude Opus) as your first message.

---

## THE PROMPT

Build me a Next.js 14 portfolio website from scratch. This is a complete scaffold — structure, config, components, styles, and placeholder content all included. Follow every detail below exactly.

---

## Concept

A creative studio space experienced as a cinematic scroll journey. The user enters through a theatrical croissant hero gate, lands in a parallax studio environment, and scrolls through distinct rooms — each with its own personality. No panning, no 2D canvas exploration — scroll is the only navigation method. Simple, accessible, consistent on both desktop and mobile.

---

## Stack
- Next.js 14 (app router)
- Tailwind CSS with custom tokens
- Framer Motion for ALL animation and scroll interactions
- GSAP ScrollTrigger for the scroll-scrub video mechanic in the hero
- Google Fonts: Bonbon (display), DM Sans (body)
- No TypeScript — plain JSX only
- No CMS — content in `/data/projects.js` and `/data/about.js`
- No external UI libraries beyond Framer Motion and GSAP

## Build Phases
**Phase 1 (ship this first):** Full scaffold with placeholder videos (🥐 emoji fallback), static flat desk layers (solid color placeholders), all scroll mechanics wired up, all sections content-complete.
**Phase 2 (polish pass):** Real croissant videos, illustrated Midjourney desk PNG layers, full mouse parallax on desk, final photography for Camera Roll.
Cursor should build Phase 1 completely. Phase 2 assets slot in without structural changes.

---

## Tailwind Config

```js
theme: {
  extend: {
    colors: {
      bg: '#171717',
      accent: '#2DD4BF',
      surface: '#1e1e1e',
      'surface-warm': '#1a1814',
      'text-primary': '#FFFFFF',
      'text-secondary': '#888888',
    },
    fontFamily: {
      display: ['Bonbon', 'cursive'],
      body: ['DM Sans', 'sans-serif'],
    },
    transitionTimingFunction: {
      cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      scroll: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
}
```

---

## Global Styles (globals.css)
- Background `#171717` on `<html>` and `<body>`
- Default font: DM Sans
- Custom scrollbar: thin, `#2DD4BF` thumb, `#111` track
- Do NOT hide the default cursor — system cursor stays visible. Teal ring enhancement is added via Cursor.jsx on hover only.
- `prefers-reduced-motion`: disable all transforms and transitions when active
- No white flash on load

---

## Custom Cursor (components/Cursor.jsx)
- 12px teal (`#2DD4BF`) circle, follows mouse with Framer Motion `useSpring` — `{ stiffness: 150, damping: 20 }`
- `data-cursor="hover"`: expands to 40px, opacity 0.4
- `data-cursor="project"`: expands to 80px, shows "view" in DM Sans 11px centered
- `data-cursor="enter"`: expands to 64px, shows "enter" label
- Hidden on touch devices: `@media (pointer: coarse)`

---

## Layout (app/layout.js)
- Google Fonts `<link>`: Bonbon + DM Sans 300/400/500
- `<Cursor />` and `<Nav />` globally included
- Dark bg, no flash

---

## Navigation (components/Nav.jsx)

A minimal vertical timeline/progress bar on the right edge of the screen.

- 5 dots stacked vertically, connected by a thin line
- Each dot represents a section: Hero · Studio · Sketchbook · Skills · Camera Roll
- Five dots total — Contact lives INSIDE Camera Roll, it is NOT a separate nav dot or section
- Active dot fills with `#2DD4BF`, others are `rgba(255,255,255,0.2)`
- Hovering a dot shows the section name as a small label to the left — DM Sans 12px, white
- Clicking a dot smooth-scrolls to that section
- Hidden during the hero gate (appears after user passes it)
- On mobile: bottom horizontal dots instead of vertical side bar — 5 small dots centered, same active state
- Animate in: `opacity: 0 → 1`, cinematic ease, 500ms

---

## Page Structure (app/page.js)

One single scrolling page, five sections stacked:

```jsx
<main>
  <HeroGate />    {/* id="hero" */}
  <Studio />      {/* id="studio" */}
  <Sketchbook />  {/* id="sketchbook" */}
  <Skills />      {/* id="skills" */}
  <CameraRoll />  {/* id="cameraroll" */}
</main>
```

---

## Section 1 — Hero Gate (components/HeroGate.jsx)

The cinematic entry. Two phases triggered by scroll.

### Phase 1 — Intro animation (video)
- Full viewport, `object-fit: cover`, autoplay on load, muted, no controls, `playsInline`
- Video src: `/videos/croissant-intro.mp4`
- What the video shows: croissant falls from the top of screen, spins, snaps into center with a satisfying lock, does a small flourish/twirl
- While video plays: scroll is DISABLED (`overflow: hidden` on `<body>`)
- On video end: scroll re-enabled, Phase 2 begins

### Phase 2 — Scroll-scrubbed split
- Section height: `300vh` so the user scrolls slowly through it
- Video src: `/videos/croissant-scroll.mp4` — positioned `sticky, top: 0, height: 100vh`
- Use GSAP ScrollTrigger to map scroll progress (0→1) to `video.currentTime`
- At scroll progress 0.5: croissant splits open like a curtain (this is in the video itself)
- At scroll progress 0.6: "Dream, Think, Build" fades in — DM Sans 13px, uppercase, tracked 0.15em, `#2DD4BF`, centered over the split
- At scroll progress 0.8: "Jason Saputra" fades in — Bonbon 72px desktop / 44px mobile, white, centered below headline
- At scroll progress 1.0: entire hero section fades out, Studio section revealed beneath

### Placeholder state (no video files yet)
- Dark `#171717` full screen
- Centered: 🥐 emoji at 80px
- Below: "[ croissant video loads here ]" DM Sans 13px `#333`
- "Dream, Think, Build" and "Jason Saputra" still visible so layout is testable
- Scroll scrub still works — just no video

### Fallback (video load error)
Show headline and name immediately. Never block the user.

---

## Section 2 — The Studio (components/Studio.jsx)

A personal desk viewed at a slight angle — intimate, lived-in, distinctly Jason's space. Parallax depth faked through layered PNGs. No 3D, no canvas exploration. Mouse movement shifts layers at different rates to create spatial illusion.

### Parallax layer system
5 PNG layers stacked via `position: absolute`. Each moves at a different rate on `mousemove` using Framer Motion `useMotionValue` + `useTransform`:

- **Layer 1 — Wall background** (~2% mouse offset): Dark wall, floating shelf with books, ambient teal-tinted light. Placeholder: `#111` rectangle.
- **Layer 2 — Monitor + speakers** (~4%): Dark monitor with SOLID BLACK screen area (HTML overlay goes here), small speakers either side. Placeholder: dark rounded rect labeled "[ monitor ]".
- **Layer 3 — Desk surface** (~7%): Keyboard, mouse, pens, coffee, swatches, handwritten notes on dark matte desk. Placeholder: mid-tone shapes.
- **Layer 4 — Interactive objects** (~10%): Three objects — Notebook (#sketchbook), Polaroid stack (#cameraroll), Coffee cup/envelope (mailto) — each a SEPARATE DOM element with its own animation. Placeholder: rounded rects with labels.
- **Layer 5 — Foreground** (~13%): Plant leaves top-left, lamp arm bottom-right, partially cropped. Placeholder: dark edge shapes.

All layers: `position: absolute`, `width: 100%`, `height: 100%`, `will-change: transform`, `pointer-events: none` (except Layer 4 interactive elements).

### Monitor HTML overlay
A `<div>` positioned PRECISELY over the black screen area of the Layer 2 monitor image. This is a live animated element — not part of any image.

Animation sequence (auto-plays on page load, no user interaction needed):
1. `0.5s delay` → "Hello :D" fades in — Bonbon font, 28px, `#2DD4BF`, centered in monitor
2. `1.5s` → "Welcome" fades in below — DM Sans 400, 14px, white, centered
3. `3s` → both lines fade out
4. `3.5s` → first project thumbnail crossfades in, fills monitor screen, slight zoom Ken Burns effect
5. Every `3s` → next project thumbnail crossfades in, loops through all 3 projects indefinitely

Use Framer Motion `AnimatePresence` for the crossfade transitions.
Project thumbnails sourced from `/data/projects.js` (same data as Sketchbook section).

### Interactive elements on Layer 4
Three objects the user can click. Each:
- **Pulse on load**: `scale: 1 → 1.04 → 1`, infinite loop, 2.5s, ease-in-out — feedforward signal
- **On hover**: scale → `1.08`, pulse stops, cinematic ease, label fades in below
- **On click/tap**: smooth scroll to corresponding section
- `data-cursor="enter"` on each

The three elements:
1. **The Notebook** → `#sketchbook`. Label: "The Sketchbook" DM Sans 11px `#2DD4BF`
2. **The Polaroid Stack** → `#cameraroll`. Label: "The Camera Roll"
3. **A coffee cup / envelope object** → opens `mailto:Jsaputra.IXD@gmail.com` directly. Label: "Get in touch" DM Sans 11px `#2DD4BF`. `data-cursor="hover"`

Placeholder for each: `bg-surface` rounded rect, `border: 1px solid rgba(255,255,255,0.1)`, label beneath.

### Name + title overlay
- "Jason Saputra" — Bonbon 56px desktop / 36px mobile, white, top-left, generous padding
- "Interaction & Visual Designer" — DM Sans 14px `#888`, below name
- These do NOT parallax — fixed relative to section

### Mobile behavior
No mouse parallax on touch devices. Layers stack statically with correct z-index. Interactive elements still pulse and are tappable. Monitor animation still plays.

### Section height
`100vh` — full viewport. User scrolls DOWN to exit to Sketchbook.

---

## Section 3 — The Sketchbook (components/Sketchbook.jsx)

### Transition into this section
As user scrolls down from Studio, a zoom-in transition plays:
- An image of a hand holding a notebook starts small (scale ~0.3) at the bottom of the viewport
- As scroll progress increases, the notebook scales up to fill the entire screen (`scale: 1.0`)
- At full scale: the notebook snaps into place and STAYS as a visible frame/border around all case study content. The notebook cover opens (animate via clip-path or opacity) to reveal the warm paper interior. Case studies are read literally inside the notebook. The notebook frame persists through all Sketchbook scrolling.
- Use Framer Motion `useScroll` + `useTransform` for the scale-on-scroll mechanic (NOT GSAP — GSAP is used only for the hero video scrub)
- Placeholder: grey rectangle labeled "[ notebook zoom transition ]" with scale behavior working

### Sketchbook content
- Background: `#1a1814` (warm dark, paper-like)
- Padding: 120px top/bottom
- Room label: "The Sketchbook" — DM Sans 11px, uppercase, tracked, `#2DD4BF`
- Heading: "Selected work." — Bonbon 48px desktop / 32px mobile, white, mb-64px

**3 project cards** from `/data/projects.js`:
- Single column mobile, 2-col grid desktop (3rd card centered)
- Each card:
  - 16:9 thumbnail placeholder (`bg-surface`, border-radius 8px)
  - Title: DM Sans 500 20px white, mt-20px
  - Description: DM Sans 400 14px `#888`, lh-1.7, mt-8px
  - Tags: `border: 1px solid #2DD4BF`, `color: #2DD4BF`, DM Sans 11px uppercase, border-radius 99px, padding 2px 10px
  - Card border: `1px solid rgba(255,255,255,0.07)`, border-radius 12px, padding 20px
  - Hover: `y: -6px`, border → `rgba(45,212,191,0.2)`, cinematic ease
  - `data-cursor="project"`
- Entrance: stagger `opacity: 0 → 1`, `y: 50 → 0`, 0.15s between, cinematic ease, `whileInView once`

**`/data/projects.js`:**
```js
export const projects = [
  {
    id: 1,
    title: 'Dream Detective',
    description: 'An app that replaces standard alarms with a daily episodic audio-mystery. It uses loss aversion to enforce wakefulness by permanently locking the day's chapter if the user snoozes.',
    tags: ['UX Design', 'Interaction Design'],
    slug: 'dream-detective'
  },
  {
    id: 2,
    title: 'Eleara',
    description: 'A predictive vestibular companion that monitors risk, alerts support networks, and uses adaptive stimulation to maintain balance and prevent dizziness episodes.',
    tags: ['UX Design', 'Systems Design'],
    slug: 'eleara'
  },
  {
    id: 3,
    title: 'Kits!',
    description: 'A system that allowed people to easily try new hobbies without committing to expensive equipment purchases. Existing hobby entry points require buying tools upfront, creating a barrier to casual experimentation.',
    tags: ['Product Design', 'UX Design'],
    slug: 'kits'
  },
]
```

---

## Section 4 — Skills (components/Skills.jsx)

Transition moment between work and about. The croissant reappears as a recurring motif — the source of Jason's skills.

- Background: `#171717`
- `min-height: 100vh`, centered, overflow hidden

### Center element — the croissant
- `<img>` src: `/images/croissant.png` — placeholder: 🥐 emoji at 80px, dead center
- Enters: `scale: 0, opacity: 0` → `scale: 1, opacity: 1`, cinematic ease, 800ms on scroll into view
- Center statement below: "What I bring to the table" — Bonbon 36px desktop / 24px mobile, white, fades in 300ms after croissant
- Subtext: "...literally 🥐" — DM Sans 13px, `#555`, italic, fades in 200ms after statement (optional easter egg line, adds personality)

### Skill tags — explosion + orbit
10 tags: Product Design, UX Design, UI Design, Interaction Design, Visual Design, Design Systems, User Research, Branding, Motion Design, Pathfinding Design

**Phase 1 — Explosion (500ms after croissant appears):**
All tags start at center (`x:0, y:0, opacity:0`), animate outward to pre-set scattered positions around the croissant. `opacity: 0→1`, cinematic ease, 600ms, 60ms stagger between tags. Positions distributed evenly at mixed radii (120px–240px from center).

**Phase 2 — Orbit (begins after explosion):**
CSS `@keyframes` orbital rotation per tag. Three orbit rings:
- Inner (~130px radius): 3 tags, 8s period
- Mid (~190px radius): 4 tags, 12s period
- Outer (~250px radius): 3 tags, 16s period
Counter-rotate each tag label so text stays upright while orbiting.

**Tag style:**
- `background: rgba(45,212,191,0.1)`, `border: 1px solid #2DD4BF`, `color: #2DD4BF`
- DM Sans 13px, padding 6px 16px, border-radius 99px
- Hover: `background: rgba(45,212,191,0.2)`, `scale: 1.05`, cinematic ease

**Mobile:** Reduce all orbit radii by 40%. Tags 11px. Statement 20px.

---

## Section 5 — The Camera Roll (components/CameraRoll.jsx)

About + contact. Personal, human, warmest room.

- Background: `#171717`
- Padding: 120px top, 160px bottom
- Room label: "The Camera Roll" — same label style

**Photo grid:**
- 4 placeholder image boxes (these will be real personal/candid photos of Jason — face visible, life shots, genuine camera roll energy. Placeholder: grey boxes with labels "[ photo of me ]")
- Desktop: `grid-template-columns: 2fr 1fr 1fr 2fr`, row height 280px
- Mobile: 2-col equal grid
- Alternating rotation: `rotate(2deg)` / `rotate(-1.5deg)` — intentional imperfection
- Captions: DM Sans 12px `#444` — "studio hours", "reference hunting", "when figma crashes", "the good stuff"
- Hover: rotation → `0deg`, `scale(1.02)`, cinematic ease

**Bio block** — mt-80px, max-w-520px:
- DM Sans 16px `#888`, lh-1.9
- Placeholder: "Designer based in San Francisco, originally from Bali. I focus on providing unforgettable experiences through thoughtful, accessible design — combining research, speed, and empathy. Powered by exactly two oat-milk lattes a day. Currently open to new work."

**Contact CTA** — mt-100px, centered. Add `id="contact"` as an anchor for direct linking but do NOT add to nav:
- "Let's make something." — Bonbon 64px desktop / 40px mobile, white
- Animate in on scroll: `opacity: 0 → 1`, `y: 40 → 0`, cinematic ease, 900ms
- Email link: DM Sans 15px `#2DD4BF`, underline on hover — `Jsaputra.IXD@gmail.com`
- Below email, two secondary links in DM Sans 13px `#555`, underline on hover:
  - LinkedIn: `https://linkedin.com/in/jasonixd` — open in new tab (`target="_blank" rel="noopener noreferrer"`)
  - Instagram: `https://instagram.com/jason.iv_s` — open in new tab (`target="_blank" rel="noopener noreferrer"`)
- `data-cursor="hover"` on email

---

## Framer Motion patterns (use consistently)

```js
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }
}
const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}
// All whileInView: viewport={{ once: true, margin: "-80px" }}
// All animations: respect prefers-reduced-motion
// GSAP is used ONLY in HeroGate.jsx for scroll-scrub video — nowhere else
// Do not remove GSAP thinking it is redundant with Framer — they serve different roles
```

---

## File Structure

```
/app
  layout.js
  page.js
  globals.css
  /work
    /[slug]
      page.js
/components
  Cursor.jsx
  Nav.jsx
  HeroGate.jsx
  Studio.jsx
  Sketchbook.jsx
  CameraRoll.jsx
  Skills.jsx
  {/* Pinboard.jsx — reserved for v2, do not scaffold in Phase 1 */}
/data
  projects.js
  about.js
/public
  /videos
    .gitkeep
  /images
    .gitkeep
  /layers
    .gitkeep  ← studio parallax PNGs go here when ready
tailwind.config.js
next.config.js
package.json
```

---

## Final Rules
- Every component is its own file — nothing monolithic
- Mobile-first — Tailwind default = mobile, `md:` = desktop
- All interactive elements have `data-cursor` attributes
- All animations respect `prefers-reduced-motion`
- No Lorem Ipsum — use exact copy specified above
- Everything should work and be testable WITHOUT the video files present
- Console log a 🥐 on load
