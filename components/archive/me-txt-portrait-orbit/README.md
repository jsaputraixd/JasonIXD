# me.txt portrait skills orbit (archived)

Desktop hover on the me.txt portrait reveals a 3D elliptical skill orbit (`SkillsPlanet` with `showGlobe={false}`).

## Restore

1. Copy `useMeTxtSkillsFocus.js` to `components/` (or import from archive).
2. Copy `MeTxtPortraitOrbit.jsx` to `components/`.
3. In `components/Desktop.jsx`:
   - Import `useMeTxtSkillsFocus` and `MeTxtPortraitOrbit`.
   - Call the hook in `Desktop` and destructure `{ skillsFocused, openSkillsFocus, closeSkillsFocus }`.
   - On the me.txt `Window`: set `zIndex={skillsFocused ? 36 : zOf("me", 13)}`.
   - Pass to `MeTxtBody`:
     - `portraitActive={skillsFocused}`
     - `onPortraitHoverStart={openSkillsFocus}`
     - `onPortraitHoverEnd={closeSkillsFocus}`
4. In `MeTxtBody`, wire portrait hover handlers and render `<MeTxtPortraitOrbit active={portraitActive} inner={inner} />` inside the portrait box (before the portrait image).

Orbit styles live in `app/globals.css` (`.skills-orbit-label--portrait-in`, constellation animations). `SkillsPlanet` and `portraitOrbitBox` remain in the main tree for the decorative desktop globe and mobile scroll reveal.
