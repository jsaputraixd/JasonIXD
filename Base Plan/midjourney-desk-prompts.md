# Midjourney Prompts — Desk Parallax Layers
# Jason Saputra Portfolio — jasonixd.com
# Updated: Desk scene, slight angle, dark matte surface

## Setup Notes
- Use Midjourney v6
- Slight angle perspective throughout — like looking at a desk from sitting position, slightly above
- Dark matte black desk surface `#171717` tone throughout
- Collage / mixed media aesthetic — textured, eclectic, handmade feel
- After generating: remove backgrounds with remove.bg or Photoshop
- Export each layer as PNG with transparency
- Save into `/public/layers/` in your Next.js project
- Upscale every image before downloading (hit U1–U4 in Midjourney)
- Add `--sref [URL of Layer 1]` to all subsequent prompts for style consistency

---

## Style anchor (add to END of every prompt)
`, inflated 3D claymation style, soft rounded forms, bubbly surfaces, subtle inner glow, smooth gradient shading on all objects, dark near-black background, teal accent lighting, slight angle perspective, clean and minimal, no texture noise, no photorealism --ar 16:9 --v 6`

## Style notes
The visual language is "bubbly inflated 3D" — think clay render meets inflated UI design.
Every object looks slightly puffed up, with soft rounded edges and smooth gradient fills.
This is NOT photorealistic. It's illustrative but dimensional.
Reference styles: Claymation UI, inflated 3D icons, soft render Blender aesthetics.
Colors are muted and dark overall with teal (`#2DD4BF`) as the accent light source.

---

## LAYER 1 — Background wall (moves slowest ~2%)
The room behind the desk. No desk objects — just atmosphere and depth.

```
abstract dark space environment, deep dark gradient background fading from 
#1a1a2e at top to #171717 at bottom, dozens of tiny soft glowing particles 
floating at different depths, some teal (#2DD4BF) some white, very subtle, 
no walls no room no furniture, pure atmosphere, 
inflated 3D claymation style, soft bubbly aesthetic, 
wide shot --ar 16:9 --v 6
```

---

## LAYER 2 — Monitor + speakers (moves ~4%)
Mid-back desk objects. The monitor frame is here — leave the screen area DARK/EMPTY 
so a real HTML element can sit over it later.

```
inflated 3D claymation style desk setup, slight angle view, 
large rounded bubbly monitor with completely black screen (screen must be solid black),
small rounded puffy studio speakers on each side, 
dark rounded desk surface with soft inner shadow, 
smooth gradient surfaces, soft teal rim lighting, 
isolated objects transparent background, no keyboard no hand items,
bubbly inflated aesthetic, soft render, dark tones --ar 16:9 --v 6
```

**Important:** The monitor screen MUST be solid black/empty. This is where the live HTML 
animation ("Hello :D" → project slideshow) will be overlaid in code.

---

## LAYER 3 — Main desk surface (moves ~7%)
The central desk — tools, texture, personality. No interactive clickable items yet.

```
inflated 3D claymation style desk objects, slight angle view,
rounded puffy mechanical keyboard, chubby wireless mouse on soft mousepad,
small rounded pens scattered, a bubbly coffee cup with steam,
soft open notebook with rounded pages, all objects inflated and rounded,
smooth gradient shading, soft teal accent lighting,
isolated objects transparent background, dark tones,
bubbly inflated 3D aesthetic, soft render --ar 16:9 --v 6
```

---

## LAYER 4 — Interactive elements (moves ~10%)
Generate these THREE SEPARATELY as individual PNGs. 
Each will be its own DOM element in code with pulse animation and hover expand.

### 4a — The Notebook (→ links to Sketchbook / work section)
```
a single closed notebook, inflated 3D claymation style,
rounded puffy cover with soft gradient shading, slightly angled,
bubbly rounded corners, smooth matte surface with subtle teal highlight,
isolated on transparent background, slight top-down angle,
soft render, dark warm tones, no other objects --v 6
```

### 4b — The Polaroid Stack (→ links to Camera Roll / about section)
```
small stack of polaroid photos fanned out slightly,
inflated 3D claymation style, rounded puffy photo borders,
soft gradient shading on each polaroid, slight angle view,
isolated on transparent background, warm tones,
bubbly inflated aesthetic, soft render,
no other objects in frame --v 6
```

### 4c — The Pinboard piece (→ links to Pinboard / play section)
```
a small rounded coffee cup and saucer, inflated 3D claymation style,
bubbly puffy form, soft steam rising, teal accent on rim,
smooth gradient shading, isolated on transparent background,
slight angle view, soft render, dark warm tones,
no other objects in frame --v 6
```

Note: This is the mailto/contact hotspot — a coffee cup fits the "get in touch over coffee" metaphor.

---

## LAYER 5 — Foreground (moves fastest ~13%)
Extreme foreground — partially cropped, creates depth illusion.

```
extreme close foreground desk elements partially cropped at screen edges, 
trailing plant leaves from top left corner, minimal desk lamp arm bottom right, 
dark silhouette style, isolated transparent background, 
only edges and corners of frame, no centre objects, 
collage mixed media aesthetic, dark tones --ar 16:9 --v 6 --style raw
```

---

## Monitor HTML overlay (NOT a Midjourney asset)
The monitor screen content is a live `<div>` in code — not part of any image.
It sits precisely over the dark monitor screen in Layer 2.

Animation sequence on page load:
1. 0.5s delay → "Hello :D" fades in — Bonbon font, `#2DD4BF`, centered
2. 1.5s → "Welcome" fades in below — DM Sans 400, white, smaller
3. 3s → text fades out, project thumbnail 1 crossfades in
4. Every 3s → next project thumbnail crossfades in, loops

This is handled entirely in the `Studio.jsx` component with Framer Motion.

---

## Tips for best results

1. **Run Layer 1 first** — get it looking right, then use its URL as `--sref` for all others
   Example: `--sref https://cdn.midjourney.com/yourimage.png`

2. **Background removal** — use remove.bg for objects, Photoshop for complex scenes

3. **Upscale everything** — always hit U1–U4 before downloading

4. **Monitor screen must be BLACK** — if Midjourney adds content to the screen, 
   manually paint it out in Photoshop or Figma before exporting

5. **Iteration** — run each prompt 2–3 times, pick the best variation

6. **Test the stack early** — once you have Layer 1 and 3, drop them in Figma 
   with different opacities to check if the depth feels right before generating all 5

---

## File naming for project

```
/public/layers/
  layer-1-wall.png
  layer-2-monitor.png
  layer-3-desk.png
  layer-4a-notebook.png
  layer-4b-polaroids.png
  layer-4c-pinboard.png
  layer-5-foreground.png
```
