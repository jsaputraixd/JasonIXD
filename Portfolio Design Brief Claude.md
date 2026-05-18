# Portfolio Design Brief
**Interaction / Visual Designer**
*Created: May 2026*

---

## Design Voice

| Dimension | Decision |
|-----------|----------|
| Feel | Studio mid-process — energetic, confident, precise |
| First impression goal | Excited. They want to collab now. |
| Work presentation | Gets out of the way. Work speaks for itself. |
| Designer intersection | Playful + technically sharp |
| Typography energy | Mixed — editorial, a little unexpected |

---

## Visual System

| Element | Decision |
|---------|----------|
| Color world | Dark base + turquoise/teal accent (used sparingly as a signature) |
| Motion style | Theatrical + intentional — precise and cinematic, nothing overshoots |
| Tech stack | Next.js + Tailwind + Framer Motion, built in Cursor |
| Content management | MDX or JSON flat files — full control, no CMS lock-in |

---

## Design Tokens (Locked)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#171717` | Base background |
| `--color-accent` | `#2DD4BF` | Teal — primary accent, used sparingly |
| `--color-text-primary` | `#FFFFFF` | Headings, primary text |
| `--color-text-secondary` | `#888888` | Body copy, captions (exact TBD) |
| `--color-surface` | TBD | Card/surface bg — slightly lighter than `#171717` |
| `--color-border` | TBD | Subtle borders — white at low opacity |

### Typography
| Token | Value | Notes |
|-------|-------|-------|
| `--font-display` | Bonbon | Name + hero headline only. Google Fonts. |
| `--font-body` | DM Sans | All body, UI, nav, subtitles. Google Fonts. |
| Subtitle style | DM Sans uppercase | Tracked, muted color, small size |
| Type scale | TBD | H1 → caption — to define in Tailwind config |

### Motion
| Token | Value | Notes |
|-------|-------|-------|
| Style | Precise + cinematic | Smooth ease-outs, no overshoot, film-like intentionality |
| Easing curve | TBD | Reference video to be matched |
| Duration scale | TBD | Fast UI (150ms) → hero entrance (800ms+) |

### Tailwind Config (Starter)
```js
// tailwind.config.js
fontFamily: {
  display: ['Bonbon', 'cursive'],
  body: ['DM Sans', 'sans-serif'],
},
colors: {
  bg: '#171717',
  accent: '#2DD4BF',
}
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Bonbon&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
```

---

## Motion Rules by Zone

### Hero / Entry
Theatrical. Big entrance. Sets the tone immediately. Staggered reveals, kinetic type, scroll-triggered statements.

### Navigation / Scroll
Fluid scroll cues that pull the user forward. Parallax layers, sticky elements that feel alive.

### Work Grid
Subtle. Hover lifts or reveals context. Nothing competes with the work itself.

### Case Study Pages
Clean scroll. Images fade in with weight. Motion serves clarity, not performance.

---

## Core Problems Being Solved

1. Current site doesn't feel like *me*
2. Work isn't shown in its best way — too much competing design around it
3. CMS (Framer) limits full customization of individual elements
4. Site feels static, lifeless

---

## Three Guiding Principles

1. **Motion with purpose** — drives scroll, creates energy, never decorates
2. **Simplicity when it matters** — especially in work presentation; design steps back
3. **Embody personality without distraction** — the site IS you, not a frame around you

---

## Ship Roadmap

### Step 1 — Design Token Doc
Before opening Cursor, define your visual system in one doc:
- Dark background hex
- Teal/turquoise accent hex (primary + hover states)
- 2–3 font pairings (editorial mix)
- Motion timing / easing curves you love
- Spacing scale

### Step 2 — Scaffold in Cursor
Spin up Next.js 14 + Tailwind with custom tokens baked in. Install Framer Motion immediately.

> Cursor prompt: *"Set up Next.js 14 with Tailwind, custom color tokens, and Framer Motion pre-installed"*

### Step 3 — Build the Hero First
Nail the theatrical entrance before touching anything else. This sets every design decision that follows.
- Kinetic headline
- Scroll-triggered reveal
- Teal accent doing one bold, singular thing

### Step 4 — Work Card Component
One reusable card component for all projects. Full control over hover states, image presentation, metadata. Build once, use everywhere.

### Step 5 — Case Study Page Template
MDX + next-mdx-remote for CMS-level flexibility without lock-in. One template, infinite customization per project.

### Step 6 — About + Contact
Where personality lives hardest. Short, real, specific. One photo, a few lines that sound like you, one clear CTA.

### Step 7 — Performance + Polish
- `prefers-reduced-motion` media query on all animations (non-negotiable)
- Optimize images with `next/image`
- Lighthouse score above 90 before shipping

### Step 8 — Deploy on Vercel
Connect GitHub repo → Vercel. Auto-deploys on every push. Custom domain in 5 minutes.

> Ship imperfect. Iterate in public.

---

## Site Concept — Jason's Studio

The site IS the concept. Not a portfolio with a theme — a creative space with distinct rooms. Each surface tells a different part of the story. The studio metaphor lives through layout, texture, and motion — not 3D or perspective rendering. One codebase, one experience, gorgeous on every screen.

### The Rooms ⚠️ Legacy reference — v1 cuts The Pinboard. See Final Decisions for canonical v1 scroll flow.

| Room | Route | Metaphor | Key Behaviour |
|------|-------|----------|---------------|
| The Studio | `/` | A designer's desk — entry point | Startup animation, Bonbon hero name, vertical scroll + horizontal work intersection, custom teal cursor |
| The Sketchbook | `/work` | Annotated sketchbook spreads | Project cards as taped-down pages, subtle texture surface, editorial typography |
| The Camera Roll | `/about` | Real photo dump, unfiltered | Asymmetric grid, slight image rotation, informal captions, native on mobile |
| The Pinboard | `/play` | Hobby work casually pinned up | Freeform masonry, mixed card sizes, hover lifts like a pin, most playful room |

### Three Principles
1. Metaphor through layout, not rendering — works at any screen size
2. Motion scales down gracefully — full scroll-driven on desktop, deliberate fade-and-slide on mobile
3. Mobile gets its own considered moments — don't shrink, rethink

---

## Motion Tokens (Locked)

| Token | Value | Usage |
|-------|-------|-------|
| Style | Precise + cinematic | Smooth ease-outs, no overshoot, film-like |
| Cinematic ease | `[0.16, 1, 0.3, 1]` | Hero entrances, room transitions |
| Scroll ease | `[0.25, 0.46, 0.45, 0.94]` | Scroll-driven element transforms |
| Fast | `0.2s` | UI micro — hover, tap |
| Mid | `0.5s` | Element entrances |
| Slow | `0.9s` | Hero / page transitions |

### Signature Motion Moments
- **Startup / Hero gate** — A 3D croissant fills the full screen. Scroll is the interaction. First scroll triggers a full spin. Continued scrolling splits the croissant open revealing "Dream, Think, Build" inside. "Jason Saputra" in Bonbon appears as the croissant fully parts. You scroll through it to enter the site.
- Custom teal cursor — reacts per context, grows on hover, labels on project cards
- Vertical text + horizontal work intersection on home scroll (below the hero gate)
- Room transitions — clip-path wipe or zoom-through (desktop), smooth fade (mobile)
- Pinboard hover — card lifts like a physical pin (v2 only)
- Camera Roll — slight rotation and asymmetry, scroll drift

### Hero Headline
> Dream, Think, Build

Revealed inside the croissant split. "Jason Saputra" in Bonbon appears as the croissant fully opens.

### Startup Asset
3D croissant model — to be created (Spline or Blender exported for Three.js or Spline embed). Scroll-driven via Framer Motion `useScroll` + `useTransform`. Placeholder reserved until asset is ready.

---

## Open Questions (To Resolve as We Build)

- [ ] Croissant 3D model — Spline or Blender? Need to decide tooling
- [x] Hero headline — LOCKED: "Dream, Think, Build"
- [x] Font pairing — LOCKED: Bonbon display, DM Sans body
- [x] Colors — LOCKED: #171717 bg, #2DD4BF accent
- [x] Projects — LOCKED: 3 case studies, dedicated pages at /work/[slug]
- [ ] Case study structure — still TBD
- [x] Navigation — LOCKED: vertical dot timeline right edge desktop, horizontal dots bottom mobile, 5 dots
- [x] Blog — NO, not in v1
- [x] Contact — LOCKED: email link only, mailto:Jsaputra.IXD@gmail.com, inside Camera Roll

---

*This document is a living brief — update as decisions are made.*

## Final Decisions (Locked)

### Domain
`jasonixd.com` — custom domain currently on Framer. Will be re-pointed to Vercel on deploy. No new domain needed.

### Navigation
Scroll-primary — the entire site is one continuous vertical scroll. Minimal vertical dot timeline on the right edge (desktop) or horizontal dots bottom-center (mobile). Each dot represents a section, active dot fills teal. Appears after hero gate is passed. Clicking a dot smooth-scrolls to that section.

### Room Order (Scroll Flow) ⚠️ Superseded — see Full Confirmed Scroll Flow table below
1. **Hero Gate** — croissant falls from top, spins, snaps into place, flourishes. Scroll splits it like a curtain revealing the Studio beneath. "Dream, Think, Build" + "Jason Saputra" revealed at scroll progress 0.6–0.8.
2. **The Studio** — parallax layered PNG environment (4–5 layers, mouse-driven depth). Three interactive elements pulse on load (feedforward). Clicking or scrolling past navigates to each room.
3. **The Sketchbook** — entered via notebook zoom-in transition (hand holding notebook scales to fill screen, snaps into content). Warm dark surface `#1a1814`. 3 case study cards.
4. **The Pinboard** — hobby/personal work. Freeform masonry, slight rotations, most playful room.
5. **The Camera Roll** — about, asymmetric photo grid, bio, contact CTA at very bottom.

### Projects
3 case studies to start.

### Contact CTA
Bottom of The Camera Roll. Email link only — `Jsaputra.IXD@gmail.com`. No form.

### Tech Stack (Final)
- Next.js 14 (app router)
- Tailwind CSS
- Framer Motion (animations, parallax, scroll interactions)
- GSAP ScrollTrigger (scroll-scrubbed video in hero)
- Built in Cursor using Claude Opus (fresh context from May 17th)

### Pending Assets (needed before full launch, not before scaffold)
- Croissant video x2 (intro clip + scroll-scrub split clip) — After Effects
- Studio parallax illustration (4–5 layered PNGs) — to be commissioned or illustrated
- 3 project case study content + images
- Personal photos for Camera Roll
- About me blurb in own voice

---

## Studio Scene Update — Desk (Not Full Room)

### Concept shift
The Studio parallax scene is a **personal desk** viewed at a slight angle (like the reference image), not a full studio room. More intimate, more personal, easier to generate convincingly.

### Desk specs
- Surface: black/dark matte — matches `#171717`, minimal and precise
- Angle: slight perspective, not full bird's eye
- Vibe: clean but lived-in, a designer's actual workspace

### Monitor element
The monitor is a **live HTML element** overlaid on the illustration (not baked into the image). It plays a short animated sequence on load:
1. "Hello :D" fades in — Bonbon font, teal `#2DD4BF`
2. "Welcome" fades in below — DM Sans, white
3. Project thumbnails begin cycling as a slow slideshow — one at a time, crossfade transition
This makes the monitor always live and editable without touching the illustration.

### Parallax layers (updated for desk)
- Layer 1 — Background wall (moves slowest ~2%): dark wall, shelf, ambient light
- Layer 2 — Back desk objects (~4%): monitor frame, speakers, books on shelf
- Layer 3 — Main desk surface (~7%): keyboard, mouse, scattered tools, coffee
- Layer 4 — Interactive elements (~10%): notebook (→ #sketchbook), polaroid stack (→ #cameraroll), coffee cup/envelope (→ mailto) — separate PNGs, individually animated
- Layer 5 — Foreground (~13%): plant, lamp arm, desk edge partially cropped

---

## Full Confirmed Scroll Flow (Final)

| # | Section | Key Interaction |
|---|---------|----------------|
| 1 | Hero Gate | Croissant falls, spins, snaps. Scroll splits it open. "Dream, Think, Build" + "Jason Saputra" revealed. |
| 2 | The Desk | Parallax desk, monitor greeting animation, 3 interactive pulsing objects. |
| 3 | The Sketchbook | Notebook in hand zooms in, fills screen, stays as frame. Case studies inside. |
| 4 | Skills | Notebook shrinks/exits. Croissant center. Skills explode + orbit. "What I bring to the table." |
| 5 | The Camera Roll | Personal candid photos, bio, Contact CTA at bottom (inside this section, not a separate nav item). |

## Skills Section Details
- Triggered between Sketchbook exit and Camera Roll entry
- Croissant is the center element — recurring motif that ties the whole site together
- On scroll into section: croissant appears, skill tags fly out from center in all directions
- After exploding out: tags slow down and begin a slow gentle orbit around the croissant
- Tags: Product Design, UX Design, UI Design, Interaction Design, Visual Design, Design Systems, User Research, Branding, Motion Design, Pathfinding Design
- Center statement: LOCKED — "What I bring to the table" (with optional "...literally 🥐" subtext as easter egg)
- Background: `#171717`, tags restyled to match new palette — `#2DD4BF` teal on dark, not orange
- Implementation: Framer Motion with custom orbital animation paths per tag

## Additional Locked Decisions

| Decision | Value |
|----------|-------|
| Pinboard | Cut entirely from v1. Add in v2 if needed. `Pinboard.jsx` not scaffolded. |
| Desk hotspot 3 | Coffee cup or envelope object → opens `mailto:Jsaputra.IXD@gmail.com` directly |
| Contact section | Lives inside Camera Roll. `id="contact"` anchor only. NOT a nav dot. Five nav dots total. |
| Notebook frame | Stays visible as frame around case studies — you read work literally inside the notebook |
| Project click | Dedicated page — `/work/project-one` (dynamic route) |
| Camera Roll photos | Personal and candid — real photos of Jason, face visible, genuine life shots |
| City | San Francisco (originally from Bali) — both mentioned in bio |
| Skills statement | "What I bring to the table" + optional "...literally 🥐" easter egg subtext |
| Build phases | Phase 1: full scaffold + placeholders. Phase 2: real videos + illustrated desk layers. |
| Framer vs GSAP | Framer for all UI/layout animation + notebook zoom transition. GSAP exclusively for scroll-scrubbed video in HeroGate only. |


---

## Real Content (from jasonixd.com)

### Projects (pick 3 of 4 for v1)
| Title | Description | Tags | Slug |
|-------|-------------|------|------|
| Dream Detective | App replacing alarms with daily episodic audio-mystery. Uses loss aversion to enforce wakefulness. | UX Design, Interaction | dream-detective |
| Eleara | Predictive vestibular companion — monitors risk, alerts support networks, adaptive stimulation. | UX Design, Systems | eleara |
| Kits! | System for trying hobbies without expensive equipment commitments. | Product Design, UX | kits |
| Dairy & Delight | Brand and digital experience for organic dairy farm. | Visual Design, Branding | dairy-delight |

### Contact
- Email: `Jsaputra.IXD@gmail.com`
- LinkedIn: `https://linkedin.com/in/jasonixd` (target="_blank")
- Instagram: `https://instagram.com/jason.iv_s` (target="_blank")

### Bio (updated voice)
"Designer based in San Francisco, originally from Bali. I focus on providing unforgettable experiences through thoughtful, accessible design — combining research, speed, and empathy. Powered by exactly two oat-milk lattes a day. Currently open to new work."

### FAQ (to include in Camera Roll section)
1. What is your typical design process? — User research, wireframing, high-fidelity UI, interaction design. AI tools for rapid prototyping and iterative refinement.
2. How do you keep yourself motivated? — Exactly two oat-milk lattes a day. Any more and the designs get too chaotic.
3. Do you handle development? — Yes. Foundational CS training + AI tools for code generation.
4. Can you help with a pitch deck? — Yes. Brand strategy presentations and presentation design.
5. How do we get started? — Email with project details. Include a Spotify playlist or your Overwatch 2 main.

### Photos for Camera Roll
- Photo of Jason (face visible, purple background — from current site)
- Camera/photography shot (hand holding purple camera)
- Pets photo (dog and cat — personal touch)
- One more personal/candid to be added
