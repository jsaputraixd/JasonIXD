# Croissant Splash Screen — Video Generation Prompt
# For use with: Sora, Runway Gen-3, or Kling AI
# Two separate video clips needed

---

## CLIP 1 — The Intro (autoplay, ~3 seconds)
### What it does
Plays automatically on page load. Croissant falls from top, spins, locks into place. This is the theatrical opening — cinematic, confident, a little playful.

### Prompt
```
A single perfectly baked golden croissant falls slowly from the top of frame 
into the center of a completely dark background (#171717 near-black). 

As it falls, it rotates naturally on its own axis — a slow, elegant spin, 
like a product being revealed. The rotation is smooth, not chaotic. 

As it reaches the center of frame, it decelerates sharply — like a magnet 
snapping to place. It lands with a subtle physical bounce: slightly overshoots 
downward by a few pixels, then settles perfectly centered. After settling, 
it does one final slow proud rotation — a small flourish, like a bow — 
then locks completely still, facing forward.

The croissant is the only subject. Background is pure dark, near-black. 
No shadows except a very subtle soft drop shadow directly beneath the croissant. 
No text, no other elements, no camera movement.

Lighting: soft studio lighting from slightly above and to the left. 
The croissant's golden layers are clearly visible — warm amber tones, 
flaky buttery texture. Slight specular highlight on the top curve.

Style: cinematic product reveal. Clean, minimal, confident. 
Feels like an Apple product launch but warmer and more playful.

Resolution: 1920x1080. Duration: 3 seconds. 
The croissant should fill approximately 30–40% of the frame height when settled.
```

---

## CLIP 2 — The Scroll Scrub (scroll-controlled, ~4–5 seconds of footage)
### What it does
This clip is NOT autoplayed. It is controlled frame-by-frame by the user's scroll position. Scrolling down plays it forward, scrolling up plays it in reverse. The split and reveal happen as the user scrolls through the hero section.

### Prompt
```
A single perfectly baked golden croissant sits perfectly centered on a 
completely dark near-black background. It is still at the start of the clip — 
identical to the final frame of Clip 1 so the transition is seamless.

The animation plays out in three acts:

ACT 1 (0s – 1.5s): The croissant very slowly begins to pull apart — 
splitting along its natural horizontal seam, the way a real croissant 
breaks open. The two halves separate smoothly, moving outward 
(top half drifts up, bottom half drifts down). The motion is slow, 
deliberate, almost reverent. The interior of the croissant is visible — 
warm, layered, golden-brown honeycomb texture inside.

ACT 2 (1.5s – 3s): The two halves continue drifting outward until they 
reach the edges of the frame, acting like a curtain being pulled open. 
As they part, the space between them grows — this is where text will 
appear in the website (handled in code, not in the video). 
The split should feel like a reveal, like opening a stage curtain.

ACT 3 (3s – 4.5s): The croissant halves slow to a stop near the outer 
edges of frame, slightly out of focus. They gently pulse once — 
a slow breath — then hold still.

The background remains pure dark throughout. No camera movement. 
No other elements. The croissant's texture and layers should be clearly 
visible as it splits — buttery, warm, flaky.

Lighting: identical to Clip 1 — soft studio light from slightly above left. 
Consistent lighting throughout the split so it feels continuous with Clip 1.

Style: cinematic, precise, theatrical. Slow and intentional — 
this is scroll-controlled so every frame needs to look good in isolation.

Resolution: 1920x1080. Duration: 4–5 seconds. 
Render at high frame rate (60fps preferred) for smooth scroll scrubbing.
```

---

## Technical notes for implementation

### File specs
- Export both clips as `.mp4` (H.264, high bitrate)
- Clip 1: ~3s, autoplay, `muted`, `playsInline`, no controls
- Clip 2: ~4–5s, NOT autoplay — `currentTime` driven by scroll via GSAP
- Target file size: Clip 1 under 3MB, Clip 2 under 8MB (compress with Handbrake after export)
- Name them: `croissant-intro.mp4` and `croissant-scroll.mp4`
- Place in `/public/videos/`

### Seamless transition between clips
The last frame of Clip 1 and the first frame of Clip 2 must be identical — 
same croissant position, same lighting, same size. Test by pausing Clip 1 
at its last frame and comparing to frame 1 of Clip 2.

### After Effects alternative (if AI video isn't working)
If using After Effects instead:
- Import a 3D croissant model (free options: Sketchfab search "croissant", 
  export as .obj or .fbx, import via Element 3D plugin)
- Or use a high-res PNG of a croissant and fake 3D with CC Cylinder + 
  rotation keyframes for Clip 1
- For the split in Clip 2: duplicate the layer, use masks to separate 
  top/bottom halves, animate mask positions outward
- Add motion blur to all animations
- Export via Media Encoder: H.264, 1080p, high bitrate

### Tools that can generate this
1. **Sora** (OpenAI) — best quality, most cinematic
2. **Runway Gen-3 Alpha** — good for product-style clips
3. **Kling AI** — free tier available, good motion quality
4. **Pika Labs** — accessible, decent for simple object animation

### Prompt tips
- If the tool lets you upload a reference image: find a high-quality 
  photo of a croissant on a dark background and use it as the reference
- Run Clip 1 and Clip 2 in the same session with the same seed/style 
  if possible — keeps lighting and style consistent
- For Clip 2: generate multiple versions and pick the one where 
  the split feels most natural and slow
- If the background isn't dark enough: post-process in CapCut or 
  Premiere to crush the blacks
