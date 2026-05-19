# Eleara — slide deck & videos

**Full deck PDF:** Built automatically from `Eleara_pages-to-jpg-*.jpg` when you run `npm run dev` or `npm run build` → `Eleara-full-deck.pdf` (shown on the case study page).

**Flow videos:** Drop a screen recording here (MP4 or WebM, under 100MB for GitHub), then uncomment the `videos` entry in `data/projects.js`:

```js
{
  kind: "file",
  src: "/images/projects/eleara/Eleara-flow.mp4",
  label: "Companion app flow",
},
```

Recommended: show onboarding, risk state, and caregiver alert if applicable.
