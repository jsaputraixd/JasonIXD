const P = "/images/projects";

function projectImages(base, filenames) {
  return filenames.map((name) => ({
    src: `${base}/${name}`,
    alt: "",
  }));
}

function simpleGalleryCaseStudy({
  overview,
  introParagraphs,
  highlights,
  base,
  imageFiles,
  blockParagraphs,
  conclusion,
  sections,
  videos,
  videosPlacement,
  videosAfterSection,
  videosTitle,
  videosIntro,
  showJumpNav = false,
}) {
  const processSections =
    sections?.length > 0
      ? sections
      : [
          {
            title: "Work",
            blocks: [
              {
                title: "Visual overview",
                paragraphs: blockParagraphs,
                images: projectImages(base, imageFiles),
              },
            ],
          },
        ];

  return {
    overview,
    introParagraphs,
    highlights: highlights ?? [],
    heroFirst: true,
    imagesBeforeText: true,
    showJumpNav,
    showDeckEmbed: false,
    videos: videos ?? [],
    videosPlacement: videosPlacement ?? "afterIntro",
    videosAfterSection,
    videosTitle,
    videosIntro,
    processWork: {
      sections: processSections,
    },
    conclusionTitle: "Reflection",
    conclusion,
  };
}

/** Dream Detective */
const DD = `${P}/dream-detective`;

/** Built at dev/build from PDF Slides/*.pdf → Dream-Detective-full-deck.pdf */
const dreamDetectiveDeckPdf = {
  label: "Full slide deck (PDF, 17 pages)",
  href: `${DD}/Dream-Detective-full-deck.pdf`,
};

const dreamDetectiveHero = `${DD}/DreamDetectiveHero 1.jpg`;

function ddSlide(n) {
  const label = n === 1 ? "01" : String(n);
  return `${DD}/Dream Detective - ${label}.jpg`;
}

const dreamDetectiveCaseStudyRich = {
  overview: {
    client: "Concept · IXD Behaviors (Academic)",
    industry: "Health / Wellness · Behavior Change",
    timeline: "3 weeks · Solo",
    role: "End-to-end product design",
  },
  introParagraphs: [
    "Most alarm apps beg for willpower. Dream Detective bribes you with plot. Miss the wake-up and today's chapter dies. No snooze. No spoilers. No mercy.",
    "I owned this solo from research and behavioral framing through visual system, AI-assisted art direction, PRD, and interactive prototype.",
  ],
  highlights: [
    {
      label: "Core insight",
      value: "Sleep isn't a tracking problem for students, it's a motivation problem at wake-up time.",
    },
    {
      label: "Key mechanic",
      value: "Cold Trail: snooze once and that morning's chapter locks forever.",
    },
    {
      label: "Strategic gap",
      value: "Competitors use streaks or gamification, but none pair narrative pull with loss aversion.",
    },
    {
      label: "What I'd validate next",
      value: "Whether missing story beats outperforms a standard alarm in real wake-up tests.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [
    {
      kind: "file",
      src: `${DD}/Dream-Detective-App-Flow.mp4`,
      label: "Morning flow: success path vs. Cold Trail",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Design",
  videosTitle: "Interactive prototype",
  videosIntro:
    "Two-minute walkthrough of the core loop: alarm → mini-game → Evidence Board update, plus the locked-out path when you sleep in.",
  processWork: {
    sections: [
      {
        title: "Overview",
        blocks: [
          {
            title: "Problem",
            paragraphs: [
              "College students know sleep matters, but staying up late feels low-stakes, and alarms offer no reason to get up early. Snooze wins because nothing is at stake.",
              "The brief: design an app that creates lasting behavior change. I reframed it as motivation design, not notification design.",
            ],
            images: [
              {
                src: ddSlide(4),
                alt: "Problem framing, college students and sleep behavior.",
              },
            ],
          },
          {
            title: "Competitor analysis",
            paragraphs: [
              "I mapped behavioral patterns across Duolingo, Forest, Pokémon Sleep, Finch, and others. Duolingo's streak loss hurts more than consistency feels good (loss aversion). Forest makes you protect something you've built. Pokémon Sleep and Finch turn sleep into collectible output.",
              "The gap: no one combined narrative pull with irreversible consequence. Data and cute mascots exist, but nothing makes waking up the only way to find out what happens next.",
            ],
            images: [
              {
                src: ddSlide(5),
                alt: "Competitor analysis, behavioral design patterns across adjacent apps.",
              },
            ],
          },
          {
            title: "Solution",
            paragraphs: [
              "Replace the alarm with a daily episodic audio mystery. Each morning unlocks the next clue, unless you snooze, in which case that chapter is gone permanently.",
              "The Cold Trail penalty isn't shame or a broken streak. You don't fall behind, you miss the beat. That distinction keeps the mechanic fair while making oversleeping costly.",
            ],
            images: [
              {
                src: ddSlide(6),
                alt: "Proposal, episodic audio mystery alarm with Cold Trail penalty.",
              },
            ],
          },
        ],
      },
      {
        title: "Ideation",
        blocks: [
          {
            title: "Visual direction",
            paragraphs: [
              "Wellness apps default to clean minimalism. Dream Detective needed atmosphere, film noir contrast, Art Deco ornament, and adventure-game UI that feels like a world, not a dashboard. Typewriter typography reinforces the case-file metaphor.",
            ],
            images: [
              {
                src: ddSlide(8),
                alt: "Mood board, film noir, Art Deco, and adventure game references.",
              },
            ],
          },
          {
            title: "Exploring two directions",
            paragraphs: [
              "Version 1 was a minimal alarm + clue reveal, conceptually clear, but indistinguishable from a standard alarm app. Version 2 introduced the Office as home base, Evidence Board navigation, Stakeout sleep audio, and Detective Rank progress. That version sold the world.",
            ],
            images: [
              {
                src: ddSlide(9),
                alt: "Sketches. Version 1 and Version 2 mobile flow explorations.",
              },
            ],
          },
          {
            title: "Wireframes",
            paragraphs: [
              "Low-fidelity frames for home, stats, navigation, and the morning alert, structure before style. The goal was hierarchy: where sleep data lives, how users move between Office, Evidence Board, and Stakeout, and what the wake-up moment actually looks like.",
            ],
            images: [
              {
                src: ddSlide(10),
                alt: "Wireframes, main screen, stats, navigation, and notification states.",
              },
            ],
          },
        ],
      },
      {
        title: "Design",
        blocks: [
          {
            title: "UI system",
            paragraphs: [
              "Art Deco card frames, gold-on-crimson actions, and a handwritten navigation notebook carry the detective world across screens. Sleep stats become case metrics. Rest Logged, Evidence Secured, Cases Solved, so data feels native to the fiction.",
            ],
            images: [
              {
                src: ddSlide(12),
                alt: "UI elements, card frames, navigation notebook, and Detective Dossier panel.",
              },
            ],
          },
          {
            title: "Final screens",
            paragraphs: [
              "Environment art was generated with Gemini and Grok; UI and interaction design were built in Figma. Background illustration was scoped to AI, hand-illustrating full scenes wasn't feasible in three weeks.",
              "The morning alarm state is deliberately tense: high contrast, pulsing waveform, copy that signals a broadcast fading fast. The Evidence Board collects clues on a corkboard with red string, where the larger mystery takes shape.",
            ],
            images: [
              {
                src: ddSlide(13),
                alt: "Final screens. Office, Stakeout, New Breakthrough, and Evidence Board.",
              },
            ],
          },
          {
            title: "User flow",
            paragraphs: [
              "Day and night modes split at 6pm, the Office changes, and different actions unlock. Night path: Stakeout sleep audio → wake-up check → briefing + mini-game or Cold Trail. Day path: stats, alarm settings, and case notebook. Everything anchors back to the Office.",
            ],
            images: [
              {
                src: ddSlide(15),
                alt: "User flow chart, day/night modes and wake-up decision logic.",
              },
            ],
          },
          {
            title: "When AI wasn't enough",
            paragraphs: [
              "FigmaMake accelerated individual UI elements, but couldn't handle the core interaction, spatial, first-person navigation through the Office. I built that prototype manually in Figma, covering both wake-up outcomes: Intel Secured vs. locked out.",
            ],
            images: [
              {
                src: ddSlide(17),
                alt: "FigmaMake explorations. Simulate Morning, Intel Secured, and Sleep Audio player.",
              },
            ],
          },
        ],
      },
      {
        title: "Process",
        blocks: [
          {
            title: "PRD",
            paragraphs: [
              "I wrote a full PRD before high-fidelity screens, problem, features, user flow, and design specs. It kept scope honest: gamify curiosity, not guilt.",
            ],
            images: [
              {
                src: ddSlide(16),
                alt: "Product Requirement Document, problem, solution, and feature specs.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "I start with behavior, hunt for the angle everyone else skipped, then build a world weird enough to make the penalty feel fair. On paper Cold Trail slaps. Next up: prove narrative FOMO beats a loud beep with real sleepy humans. Also curious if a social Detective Rank helps the habit or just ruins the solo mystery.",
};

/** Eleara */
const EL = `${P}/eleara`;
const elearaGallery = Array.from({ length: 19 }, (_, i) => {
  const n = String(i + 1).padStart(4, "0");
  return `${EL}/Eleara_pages-to-jpg-${n}.jpg`;
});
/** Title slide, cards use optimized carousel URL; full res on case study. */
const elearaHero = elearaGallery[0];
/** 560px export for mobile carousel, source slide is 8000×4500 / ~20MB. */
const elearaCarouselThumb = `${EL}/eleara-carousel-thumb.jpg`;

/** Built at dev/build from slide JPGs → Eleara-full-deck.pdf */
const elearaDeckPdf = {
  label: "Full slide deck (PDF, 19 pages)",
  href: `${EL}/Eleara-full-deck.pdf`,
};

function elearaSlide(n) {
  return `${EL}/Eleara_pages-to-jpg-${String(n).padStart(4, "0")}.jpg`;
}

const elearaCaseStudyRich = {
  overview: {
    client: "FigBuild Hackathon · Team of 4",
    industry: "Health UX · Wearables",
    timeline: "72 hours · Remote sprint",
    role: "PM / UX Lead, process, user flow, feedback synthesis",
  },
  introParagraphs: [
    "Eleara is a predictive vestibular companion, a wearable plus app that uses galvanic vestibular stimulation to counter dizziness before episodes escalate, and alerts emergency contacts when they do.",
    "Built in 72 hours over Zoom with Willow Munaba, Amanda Yu, and Anny Long. I led process and contributed the user flow; every concept decision was collective, but keeping us moving was on me.",
  ],
  highlights: [
    {
      label: "The constraint",
      value: "Zero to research-backed, user-tested prototype in 72 hours, remotely.",
    },
    {
      label: "My contribution",
      value: "Sprint facilitation, PRD alignment, user flow architecture, and Day 2 feedback synthesis.",
    },
    {
      label: "Key design call",
      value: "Hold-to-trigger emergency button, prevents false SOS alerts without slowing real emergencies.",
    },
    {
      label: "What we'd validate next",
      value: "Whether GVS threshold calibration is intuitive for users during an active episode.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [],
  processWork: {
    sections: [
      {
        title: "The sprint",
        blocks: [
          {
            title: "72 hours, four people, one product",
            paragraphs: [
              "FigBuild is a design sprint where teams go from zero to a functional prototype in three days. Our team of four worked remotely over Zoom, coordination overhead most in-person teams never face.",
              "My role was product manager and process lead. I didn't dictate the concept, ideas came from the team. I set daily agendas, ran structured ideation, delegated by strength, unblocked whoever was stuck, and made schedule calls when time slipped.",
              "Day 1: ideation, PRD, user flow, wireframes, style guide. Day 2: first draft, user testing, iteration. Day 3: final screens, prototype recording, submission.",
            ],
            images: [
              {
                src: elearaSlide(1),
                alt: "Eleara title slide, ear device hero and wordmark.",
              },
              {
                src: elearaSlide(3),
                alt: "Day 1 section divider, ear device and geometric form.",
              },
            ],
          },
        ],
      },
      {
        title: "Day 1",
        blocks: [
          {
            title: "Brainstorming",
            paragraphs: [
              "Day 1 opened with a timed sticky-note sprint, 15 minutes, no filtering. Ideas ranged from ADHD fixation tools to chronoception tracking to a cave-diving-inspired CO₂ monitor for interoception.",
              "The shared instinct: work in the body's hidden signals, not surface metrics. That narrowed us to interoception, internal states including balance. Two concepts emerged: a Smart Sole for gait instability, and an ear-worn device using galvanic vestibular stimulation to counter vestibular mismatch. The Ear Thing won.",
              "Willow identified the core mechanic: dizziness on standing happens when inner-ear fluid shifts with blood pressure drops. GVS sends tiny currents to the vestibular nerve, muting the dizziness signal, replacing it with steadiness. Target users: anemic people, Meniere's patients, and women with period-linked vestibular episodes.",
            ],
            images: [
              {
                src: elearaSlide(4),
                alt: "Brainstorming sticky notes, stress, energy, ADHD, interoception ideas.",
              },
              {
                src: elearaSlide(5),
                alt: "Concept comparison. Smart Sole vs. ear-worn GVS device.",
              },
            ],
          },
          {
            title: "PRD",
            paragraphs: [
              "In a 72-hour sprint, a PRD isn't overhead, it's the single source of truth before anyone opens Figma. Without it, four people build four different products in parallel.",
              "It locked the problem (orthostatic challenges, vestibular mismatch), solution (GVS companion device), users, four core features (predictive warnings, emergency data collection, statistics, emergency button), and the design system upfront. Apple HIG foundation, Poppins/Inter typography, calm minimalist palette, flat illustration, dark mode, accessibility.",
            ],
            images: [
              {
                src: elearaSlide(6),
                alt: "PRD, problem, solution, and core features.",
              },
              {
                src: elearaSlide(7),
                alt: "PRD, target users and design system specs.",
              },
            ],
          },
          {
            title: "User flow",
            paragraphs: [
              "I led the user flow, one of my direct design contributions alongside PM work. Eleara had to handle daily use and emergency response without confusion between the two paths.",
              "Core logic branches on one question after login: is the user having an episode now? If yes → alert screen and optional emergency services notification. A persistent Emergency Button on home provides manual override anytime.",
              "Normal use flows through Profile (medical info, device settings, GVS threshold calibration), Contacts (emergency list with auto-notify toggles), and Dashboard (episode stats and pattern insights). Mapping this before wireframes meant nobody built a screen without a logical place in the system.",
            ],
            images: [
              {
                src: elearaSlide(8),
                alt: "User flow chart, daily use and emergency response paths.",
              },
            ],
          },
          {
            title: "Wireframes",
            paragraphs: [
              "With the flow mapped, wireframes were layout translation, content hierarchy and actions per screen, no visual styling. Covered splash, auth, home with GVS status and emergency button, profile tabs, contacts, and stats dashboard.",
              "The PRD's two-column card layout and persistent bottom nav were roughed in here. Grayscale intentionally, structure first, visuals in the style guide.",
            ],
            images: [
              {
                src: elearaSlide(9),
                alt: "Wireframes, login, home, dashboard, profile, and contacts.",
              },
            ],
          },
          {
            title: "Style guide",
            paragraphs: [
              "Built in parallel with wireframes so the team could produce high-fidelity screens independently without visual drift. Poppins for headings and data (geometric, confident at a glance), Inter for body text (legible at small sizes during an episode).",
              "Palette: soft periwinkle background, dusty blue primary, warm amber accent, deep teal for positive states, clinical but not cold. 8pt grid, 24pt margins, 20pt card gaps, 20pt drop shadows for depth without noise.",
            ],
            images: [
              {
                src: elearaSlide(10),
                alt: "Style guide, typography, color palette, logo, and spacing system.",
              },
            ],
          },
        ],
      },
      {
        title: "Day 2",
        blocks: [
          {
            title: "First draft",
            paragraphs: [
              "Day 2 opened with a FigmaMake build from a prompt encoding the full PRD, users, GVS mechanic, two-column layout, typography, features, HIPAA requirements, and every required screen.",
              "The draft had solid bones: Dashboard with GVS Score, episode stats, frequency chart, and trend line. Contacts with auto-notify toggles. Profile with personal info, medical records, and settings tabs. My role shifted to feedback synthesis, reviewing screens as they arrived and keeping the team aligned on what needed to change before user testing.",
            ],
            images: [
              {
                src: elearaSlide(12),
                alt: "FigmaMake prompt, encoded PRD requirements for AI-assisted build.",
              },
              {
                src: elearaSlide(13),
                alt: "First draft screens. Dashboard, Contacts, and Profile.",
              },
            ],
          },
          {
            title: "User testing",
            paragraphs: [
              "At hour 36 of 72, we tested with two participants. Tamiko R. and Thania R., navigating key flows while thinking aloud.",
              "Tamiko valued the home screen status color system but found dashboard cards too visually similar, she wanted distinct identities for GVS Score, Episodes, Duration, and Severe Events so she could scan without reading every label. She also suggested dynamic reminders: if dehydration triggers episodes, the app should suggest hydration, not just display data.",
              "Thania found the interface 'simple in the best way' and valued episode tracking for reflecting on health behavior, not just monitoring it. Both confirmed the core hypothesis: approachable interface, sensible information structure. Refinement problems, not structural ones, exactly what we needed to hear at hour 36.",
            ],
            images: [
              {
                src: elearaSlide(14),
                alt: "User feedback. Participant 1 annotated screens.",
              },
              {
                src: elearaSlide(15),
                alt: "User feedback. Participant 2 annotated screens.",
              },
            ],
          },
          {
            title: "Iterations",
            paragraphs: [
              "Six targeted changes before the final build:",
              "Softer color scheme throughout, less clinical, more companion-like. Proper onboarding flow added (skipped in first draft; essential for health data and device permissions). Emergency button changed to hold-to-trigger, prevents accidental SOS in public without slowing genuine emergencies.",
              "Explicit alert screen for episode detection, visually distinct from passive monitoring. 'Medical records' renamed to 'clinical documents' for clearer data sensitivity expectations. Dashboard card visual identity adjusted per Tamiko's scanning feedback.",
            ],
            images: [
              {
                src: elearaSlide(16),
                alt: "Iterations, before and after login screens.",
              },
            ],
          },
        ],
      },
      {
        title: "Day 3",
        blocks: [
          {
            title: "Final build",
            paragraphs: [
              "Day 3 was close-out: apply the iteration list, polish visuals, record the prototype walkthrough, submit.",
              "The final login screen shows the full system, periwinkle background, teal logo, Poppins typography, auth toggle, and HIPAA-compliant security certification visible before account creation. Hold-button emergency trigger, onboarding flow, and dynamic reminder concept all incorporated.",
              "Credible, research-backed, user-tested prototype, built from scratch in 72 hours by a remote team of four.",
            ],
            images: [
              {
                src: elearaSlide(17),
                alt: "Day 3, lifestyle shot with ear device.",
              },
              {
                src: elearaSlide(18),
                alt: "Final login screen with HIPAA certification.",
              },
              {
                src: elearaSlide(19),
                alt: "Final screens, completed prototype.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Eleara is where I learned what leading a design team actually means, not visual craft, but reading the room, making judgment calls under time pressure, and delegating to strengths instead of dividing work arbitrarily. What I'd do differently: ideation took six hours when I'd planned three. I should have capped it harder and trusted Day 2 to 3 iteration to compensate. What I'm proud of: we ran real user testing at hour 36 when most sprint teams skip it. Tamiko and Thania's feedback made the final product meaningfully better in ways we wouldn't have caught ourselves.",
};

/** Kits! */
const KT = `${P}/kits`;

const kitsHero = `${KT}/Kits Cover Image.jpg`;
const kitsPaperPrototypes = `${KT}/Paper Prototypes.png`;
const kitsLowFi = `${KT}/LowFidelityWireframes.png`;
const kitsMedFi = `${KT}/MediumFidelityWIreframes.png`;
const kitsStyleGuide = `${KT}/Style Guide.png`;
const kitsHighFidelity = `${KT}/HighFidelity.png`;

const kitsPdfs = [
  { label: "High-fidelity deck · PDF", href: `${KT}/HighFidelity.pdf` },
  { label: "User flow · PDF", href: `${KT}/Kits! UserFlow.pdf` },
];

/** Rich layout, same section treatment as Dream Detective / Eleara / Pulse. */
const kitsCaseStudyRich = {
  overview: {
    client: "Academic UX Project (Concept Service)",
    industry: "Community Sharing · Service Design · UX",
    timeline: "3 weeks · Solo",
    role: "UX / product design: research through high-fidelity",
  },
  introParagraphs: [
    "Kits! is a community-driven hobby sharing system, borrow curated kits from a public kiosk, or lend your own equipment for others to try. The goal is lowering the cost of entry for new hobbies without asking anyone to buy gear upfront.",
    "The design problem was service design at scale: two distinct roles, one physical touchpoint, one digital companion, and friction points like approval flows, kit processing, and motivation to participate on both sides.",
  ],
  highlights: [
    {
      label: "The barrier",
      value: "Hobbies require expensive equipment: casual experimentation dies at the checkout line.",
    },
    {
      label: "Two roles",
      value: "Borrowers want quick access; lenders need a reason to contribute kits back to the community.",
    },
    {
      label: "System scope",
      value: "Public kiosk plus mobile interface: shared access model across physical and digital.",
    },
    {
      label: "What paper saved",
      value: "Testing dual-role flows early before high-fidelity rework on approval and handoff states.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [
    {
      kind: "file",
      src: `${KT}/Borrower.mov`,
      label: "Borrower flow",
    },
    {
      kind: "file",
      src: `${KT}/Lender.mov`,
      label: "Lender flow",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Design",
  videosTitle: "Prototype walkthrough",
  videosIntro:
    "Borrower and lender flows through the kiosk and companion app, from kit discovery to return and contribution.",
  processWork: {
    sections: [
      {
        title: "Overview",
        blocks: [
          {
            title: "The problem",
            paragraphs: [
              "Many hobbies require expensive equipment, which creates a barrier for people who want to try new activities without committing to a purchase. Existing entry points assume you buy tools first. Kits! proposes shared access instead: temporarily borrow curated hobby kits, or contribute your own for others to use.",
              "Research and journey mapping framed the problem around two primary user archetypes before any screens were drawn.",
            ],
            images: [
              {
                src: kitsHero,
                alt: "Kits!, hobby sharing kiosk concept cover.",
              },
            ],
          },
          {
            title: "Borrowers & lenders",
            paragraphs: [
              "Borrowers want quick access to new activities, browse, reserve, pick up, try, return. Lenders contribute kits to the community and need clear incentives, approval paths, and processing steps that don't feel like unpaid labor.",
              "Mapping both journeys surfaced friction early: how kits get approved, how handoffs work at the kiosk, and what keeps lenders participating after the first drop-off.",
            ],
          },
        ],
      },
      {
        title: "Process",
        blocks: [
          {
            title: "Paper prototypes",
            paragraphs: [
              "Paper prototyping came before pixel polish. I walked through borrower and lender tasks on physical screens, reservation, pickup, kit intake, and return, to stress-test the flows without high-fidelity distraction.",
              "That pass clarified where the kiosk needed to lead vs. where the app should carry continuity, and which states needed explicit confirmation before moving on.",
            ],
            images: [
              {
                src: kitsPaperPrototypes,
                alt: "Paper prototypes, borrower and lender flow explorations.",
              },
            ],
          },
        ],
      },
      {
        title: "Design",
        blocks: [
          {
            title: "Wireframing",
            paragraphs: [
              "Low-fidelity wireframes established screen hierarchy and navigation, structure before visual style. Medium-fidelity passes added layout density, component placement, and clearer content blocks for both kiosk and mobile contexts.",
              "Separating borrower and lender paths in wireframes kept permissions and mental models honest, no shared screen pretending two roles see the same thing.",
            ],
            images: [
              {
                src: kitsLowFi,
                alt: "Low-fidelity wireframes, core screens and navigation.",
              },
              {
                src: kitsMedFi,
                alt: "Medium-fidelity wireframes, layout and component structure.",
              },
            ],
          },
          {
            title: "Style guide",
            paragraphs: [
              "The visual system needed to feel approachable and community-forward, bright enough for a public kiosk, legible at arm's length, consistent across touch and mobile. Typography, color, and component rules kept the two interfaces reading as one product.",
            ],
            images: [
              {
                src: kitsStyleGuide,
                alt: "Style guide, color, typography, and UI components.",
              },
            ],
          },
          {
            title: "Final screens",
            paragraphs: [
              "High-fidelity screens bring the full system together: kiosk discovery and handoff states alongside the companion app for reservations, kit management, and role-specific tasks. The final deliverable is one voice across physical and digital touchpoints.",
            ],
            images: [
              {
                src: kitsHighFidelity,
                alt: "High-fidelity screens, kiosk and mobile app final designs.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Kits! reinforced how service design scales through clarity, two roles, one kiosk, one app. Testing with paper prototypes early saved high-fidelity rework later, and separating borrower vs. lender flows kept permissions and mental models honest.",
};

/** Dairy Delight */
const DA = `${P}/dairy-delight`;
const dairyHero = `${DA}/Hero_Image.png`;
const dairyAudience = `${DA}/Audience.png`;
const dairyVibe = `${DA}/The vibe.png`;
const dairyMoodBoards = `${DA}/Slide 25.png`;
const dairyLogoRefinement = `${DA}/Logo Itteratons.png`;
const dairyStyleguide = `${DA}/Styleguide final.png`;
const dairyTouchpoints = `${DA}/the touch points checklist.png`;
const dairyPosterPrinciples = `${DA}/poster sketches.png`;
const dairyPosterFinals = `${DA}/poster design iterations.png`;
const dairyPosterFull = `${DA}/Dairy & Delight Poster 1.jpg`;
const dairyPosterMockup = `${DA}/Gemini_Generated_Image_m0ocmkm0ocmkm0oc 2.png`;
const dairyLanding = `${DA}/poster design used to refrence dashboard design.png`;
const dairyMobileScreens = `${DA}/mobile designs final.png`;
const dairyMobileDevices = `${DA}/Frame 7.png`;
const dairyMobileDevice1 = `${DA}/iPhone 11 Render.png`;
const dairyMobileDevice2 = `${DA}/iPhone 11 Render-1.png`;
const dairyAllTouchpoints = `${DA}/all designs touch point final.png`;

const dairyCaseStudyRich = {
  overview: {
    client: "Project 02 · Visual Interaction Design (Academic)",
    industry: "Organic Food · Brand & Multi-Touchpoint",
    timeline: "3 weeks · Solo",
    role: "Brand identity, illustration, poster, web & app",
  },
  introParagraphs: [
    "Dairy & Delight is an organic farm brand built around what they call the simple joys of nourishing living, milk, cheese, yogurt, and ice cream delivered direct to customers' homes.",
    "I chose this client over two alternatives because the brief wasn't just 'look fresh and clean.' It was a lifestyle proposition: what you eat and where it comes from matters, and pleasure and integrity belong in the same brand.",
  ],
  highlights: [
    {
      label: "Brand filter",
      value: "All-Natural, Uplifting, Communal, three words that gated every design decision.",
    },
    {
      label: "Logo process",
      value: "100+ sketch iterations before vector, two directions alive, one sun mark chosen.",
    },
    {
      label: "System scope",
      value: "Poster, landing page, and mobile app, one voice across print, web, and product.",
    },
    {
      label: "What I'd extend",
      value: "Packaging system and a fuller Recipes section where the Communal quality comes alive.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [],
  processWork: {
    sections: [
      {
        title: "The client",
        blocks: [
          {
            title: "Getting to know Dairy & Delight",
            paragraphs: [
              "Before opening Figma, I studied who buys from a farm like this, what they already believe, what it feels like to open their fridge in the morning. Foodies who love the outdoors: people who care about what they eat, feel drawn to the natural world, and treat food as communal, not just functional.",
              "The mission is rooted in real, all-natural food connecting people to the earth and to each other. That richness, lifestyle, not just category, is what made this a design problem worth choosing.",
            ],
          },
          {
            title: "Audience",
            paragraphs: [
              "The audience I designed for values transparency, sustainability, and quality, farm-to-table culture without the pretension. They want a brand that feels like an invitation to the table, not a lecture from a shelf.",
            ],
            images: [
              {
                src: dairyAudience,
                alt: "Audience, foodies who love the outdoors.",
              },
            ],
          },
        ],
      },
      {
        title: "Brand",
        blocks: [
          {
            title: "Defining the vibe",
            paragraphs: [
              "Three words became the filter: All-Natural, Uplifting, and Communal.",
              "All-Natural is a visual language, organic textures, earth-born color, forms that aren't perfectly geometric. Uplifting means the brand should make you feel something, actually joyful, not just trustworthy. Communal means inviting you in: a family table, not a store shelf.",
              "If it felt cold or corporate, it failed. If it felt generic-natural, it wasn't uplifting enough. Everything had to land in the overlap of all three.",
            ],
            images: [
              {
                src: dairyVibe,
                alt: "The vibe. All-Natural, Uplifting, and Communal.",
              },
            ],
          },
          {
            title: "Mood boards",
            paragraphs: [
              "I built three boards, one per vibe word, pulling from folk art, community poster design, eco-design, botanical illustration, and bold joyful graphic work. Communal drew from people eating together outdoors. All-Natural from organic typography and botanical reference. Uplifting from the kind of design that makes you smile before you read it.",
              "Where the three boards overlapped was where Dairy & Delight lived, and that territory informed every color, typeface, and illustration choice from here on.",
            ],
            images: [
              {
                src: dairyMoodBoards,
                alt: "Mood boards. Communal, All-Natural, and Uplifting references.",
              },
            ],
          },
        ],
      },
      {
        title: "Logo",
        blocks: [
          {
            title: "100 sketches to one mark",
            paragraphs: [
              "I don't start in software. I start in a sketchbook and don't stop until I've explored enough angles to know which direction is right. For Dairy & Delight, that meant over 100 iterations before a single vector: logotypes, icons, literal and abstract marks, dairy and natural imagery, combinations I knew wouldn't work, because exhausting the obvious is how the interesting stuff shows up.",
              "Two directions felt alive. A circular badge with a hand-drawn cow, warm, vintage, inviting. And a sun mark from alternating yellow and magenta rays, reading as both sun and the top of a dairy product. The sun won: bold at any scale, directly Uplifting, joyful without being precious.",
            ],
          },
          {
            title: "Refinement & lockups",
            paragraphs: [
              "Multiple refinement rounds on ray count, proportions, yellow-magenta balance, and wordmark integration. The final system includes the core mark plus five lockups for different contexts.",
              "The wordmark uses a rounded, slightly bouncy serif, warmth without childishness. The ampersand in 'Dairy & Delight' gets hand-lettered treatment. Every round was tested on a milk bottle, app icon, poster, and web header.",
            ],
            images: [
              {
                src: dairyLogoRefinement,
                alt: "Logo refinement tree, mark variants and final lockups.",
              },
            ],
          },
        ],
      },
      {
        title: "Brand system",
        blocks: [
          {
            title: "Color, type & illustration",
            paragraphs: [
              "Five colors, each doing specific work: Navy (#06327D) anchors legibility. Cyan (#74DEE6) is air, outdoors, morning light. Magenta (#E01C6F) carries energy and personality. Yellow (#FFD545) is warmth, sunlight, butter, cheese. Milk White (#FFF9EF) is the canvas, warm, never sterile.",
              "Headlines: Sausage Semibold, chunky, friendly, retro joy. Secondary: Poppins Regular. Body: Quicksand Light, airy and legible.",
              "The illustration system, rotary phone, cheese wedge, sunrise, heart, uses Yellow and Magenta two-color pairings so assets read instantly as Dairy & Delight. Playful without cartoonish; built for a kitchen wall or picnic blanket.",
            ],
            images: [
              {
                src: dairyStyleguide,
                alt: "Brand system, logo, color, typography, icons, and illustration.",
              },
            ],
          },
          {
            title: "Three touchpoints, one voice",
            paragraphs: [
              "With the system set, I designed three touchpoints: a print poster, a mobile app, and a landing page. Each serves a different format and purpose, but everything had to feel unmistakably like the same brand across contexts. That consistency across wildly different media is one of the harder problems in brand design.",
            ],
            images: [
              {
                src: dairyTouchpoints,
                alt: "Touchpoints, poster, landing page, and mobile app.",
              },
            ],
          },
        ],
      },
      {
        title: "Design",
        blocks: [
          {
            title: "The poster",
            paragraphs: [
              "The poster went through the most exploration. In class I applied ten visual principles to the same brief. Focus the Eye, Overwhelm, Simplify, Overlap, Assault the Surface, Activate the Diagonal, Manipulate Scale, Text as Image, Amplify, Tell a Story, two iterations each, twenty concepts by hand.",
              "The principle I kept returning to was Text as Image: words becoming the visual, 'Taste Delight' as 3D Swiss cheese, or wrapping a spiraling ice cream cone. The final poster I'm most proud of: a waffle cone with a cherry on top, 'TASTE DELIGHT' in Magenta following the spiral. Typography animates the object. Joy before you've read a word.",
            ],
            images: [
              {
                src: dairyPosterPrinciples,
                alt: "Poster explorations, ten design principles exercise grid.",
              },
              {
                src: dairyPosterFinals,
                alt: "Three final poster designs, cheese text, ice cream cone, and diagonal type.",
              },
              {
                src: dairyPosterFull,
                alt: "Final poster, ice cream cone with spiral typography.",
              },
              {
                src: dairyPosterMockup,
                alt: "Poster in context, framed print in a cafe setting.",
              },
            ],
          },
          {
            title: "Landing page",
            paragraphs: [
              "Translating brand energy to the web without flattening it. I sketched three layout directions before committing. The final blends doodle warmth with a cards layout: clean grid, wavy brand border, illustrations anchoring each feature section.",
              "Hero leads with the ice cream cone poster, double duty as brand hero. Three pillars below: Fresh Dairy Delivered, Visit Our Farm, Recipes for Simple Joy. Testimonial on yellow wave. Footer grounded in Navy.",
            ],
            images: [
              {
                src: dairyLanding,
                alt: "Landing page, layout sketches, poster reference, and full scroll mockup.",
              },
            ],
          },
          {
            title: "Mobile app",
            paragraphs: [
              "Three core sections: Discover (products and farm process), Create (recipes and guides using Dairy & Delight products), and Access (member privileges, early releases, farm tours, seasonal boxes).",
              "Natural progression: discover the brand, engage through cooking, deepen through membership. Sky-blue home with cloud quality, large pill CTAs, full-bleed illustrations per section, wavy header border tying app to web and poster.",
            ],
            images: [
              {
                src: dairyMobileScreens,
                alt: "Mobile app. Home, Discover, Create, and Access screens.",
              },
              {
                src: dairyMobileDevices,
                alt: "Mobile app, home and Access screens on device.",
              },
              {
                src: dairyMobileDevice1,
                alt: "Mobile app, home screen on iPhone.",
              },
              {
                src: dairyMobileDevice2,
                alt: "Mobile app. Discover and Create on iPhone.",
              },
            ],
          },
          {
            title: "Final deliverable",
            paragraphs: [
              "Poster, landing page, and app together, one visual voice from print to pocket. The system holds because the emotional filter was set before the first pixel: all-natural, uplifting, communal.",
            ],
            images: [
              {
                src: dairyAllTouchpoints,
                alt: "Final deliverable, poster, landing page, and mobile app together.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "This was my first serious brand design project, and where my fine arts training showed up in practice. Color theory isn't palette picking; it's emotional weight, relationships between hues, harmony and tension as tools. The poster is what I'm most proud of: not because it's the most structurally complex piece, but because you look at it and feel the joy of ice cream. That's the goal, not to describe the product, but to make you feel it. Next I'd design the packaging system, milk bottle, cheese wrapper, ice cream pint, the illustration system is already built for it.",
};
/** Project Pulse */
const PL = `${P}/Pulse`;
function pulseSlide(n) {
  return `${PL}/slides/pulse-slide-${String(n).padStart(2, "0")}.jpg`;
}
const pulseHero = `${PL}/Pulse-hero.jpg`;

const pulseCaseStudyRich = {
  overview: {
    client: "IXD Research · Project 03 · Team of 3",
    industry: "Health / Fitness · Gesture UX · Habit Formation",
    timeline: "Spring 2026 · March 30 to May 11",
    role: "Lead designer, synthesis, visual system, prototype",
  },
  introParagraphs: [
    "Pulse is a smart-mirror fitness companion for busy students: personalized plans, calendar-aware slots, and AirTap gestures so sweaty hands never have to touch the glass.",
    "Made with Annalise and Jason W. They ran a lot of the interviews. I helped write discussion guides, talked to participants, put the screening form together, and synthesized what we were hearing. I also prototyped the live demo and pushed for AirTap once we landed on a smart mirror.",
  ],
  highlights: [
    {
      label: "My role",
      value: "Lead designer. Helped steer the concept, synthesized research, and prototyped the working demo.",
    },
    {
      label: "Key design call",
      value: "AirTap over touch. Mid-workout, hands are sweaty. The glass shouldn't be a to-do list.",
    },
    {
      label: "Prototype",
      value: "Browser demo covering onboarding, calendar sync, plans, gesture tutorial, and a full workout loop.",
    },
    {
      label: "The team",
      value: "Annalise and Jason W. on interviews. We reviewed screening together before anything went out.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [
    {
      kind: "file",
      src: `${PL}/Pulse-prototype-demo.mp4?v=2`,
      label: "Prototype walkthrough",
      layout: "wide",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Build",
  videosTitle: "Prototype in motion",
  videosIntro:
    "A short pass through the live demo: onboarding, plans, and AirTap in a workout.",
  livePrototype: {
    href: "https://jsaputraixd.github.io/Pulse/",
    label: "Open live Pulse demo",
    intro:
      "Playable in the browser. Onboard, sync a calendar, pick a plan, and AirTap through a workout at arm's length.",
  },
  processWork: {
    sections: [
      {
        title: "The brief",
        blocks: [
          {
            title: "A fitness problem with no product yet",
            paragraphs: [
              "We started with a how-might-we, not a screen: how might we give busy students and professionals a low-friction fitness experience that actually survives a packed week.",
              "We stalled for a bit. Lots of problem, no object. I floated a few directions until a smart mirror felt right, a coach in the room instead of another phone app. It wasn't a finished idea I handed over. We talked it through until we had something we could actually build.",
            ],
            images: [
              {
                src: pulseSlide(1),
                alt: "Pulse title slide, 0-1 product project.",
              },
              {
                src: pulseSlide(5),
                alt: "Problem statement. How might we remove time and procrastination barriers to a lasting workout rhythm.",
              },
              {
                src: pulseSlide(6),
                alt: "Project timeline from framing through discovery, scoping, synthesis, and validation.",
              },
            ],
          },
        ],
      },
      {
        title: "Research",
        blocks: [
          {
            title: "Interviews together, synthesis after",
            paragraphs: [
              "Annalise and Jason W. ran most of the interviews. I wrote discussion guides, talked to people too, sent emails, and put the screening form together, then ran it by them before it went out.",
              "Crazy 8s and expert interviews (yoga, health-tech, fitness) gave us a pile of directions. I pulled that into personas and a plan we could design against: feature priority, how dense the mirror UI should be, how you'd interact, and where the thing would even live in a dorm or apartment.",
            ],
            images: [
              {
                src: pulseSlide(7),
                alt: "Research goals. Feature priorities, interface design, interaction methods, physical setup.",
              },
              {
                src: pulseSlide(11),
                alt: "Crazy 8s sketches, including an early workout-assistant mirror concept.",
              },
              {
                src: pulseSlide(12),
                alt: "Expert interviews with a yoga instructor, health-tech advisor, and fitness instructor.",
              },
              {
                src: pulseSlide(8),
                alt: "Persona Marin, a software engineer in SF who falls off after one missed gym session.",
              },
            ],
          },
        ],
      },
      {
        title: "Direction",
        blocks: [
          {
            title: "AirTap, because sweat is a constraint",
            paragraphs: [
              "Once we had a mirror, the interaction question was sweaty hands on glass. I pushed for AirTap, point, pinch, dwell, so you never have to poke the screen mid-set.",
              "We mapped the service from onboarding through coaching and recovery, then concept-tested calendar sync, facial tracking, and posture coaching with five people at CCA. Calendar-aware micro workouts landed. Camera tracking was useful and a little invasive. That tension is still in the prototype on purpose.",
            ],
            images: [
              {
                src: pulseSlide(14),
                alt: "Prototype mapping worksheet from onboarding through in-workout coaching and recovery.",
              },
              {
                src: pulseSlide(15),
                alt: "MVP concept testing. Calendar sync, facial tracking, and AI posture with five CCA participants.",
              },
            ],
          },
        ],
      },
      {
        title: "Build",
        blocks: [
          {
            title: "From deck to something you can play",
            paragraphs: [
              "I prototyped the live demo: onboarding, plans, calendar, gesture tutorial, workout loop, and the visual system the deck uses.",
              "Building it showed us the real smart-mirror problems: type that dies at 6 to 10 feet, a rest timer colliding with the nav, and gesture logic that was a little too clever. Those are bugs you only find when the thing actually runs.",
            ],
            images: [
              {
                src: pulseSlide(20),
                alt: "Visual barriers in the live UI. Small type at distance and overlapping rest and rep chrome.",
              },
            ],
          },
        ],
      },
      {
        title: "Testing",
        blocks: [
          {
            title: "We all ran sessions. Then we looked at the pile.",
            paragraphs: [
              "I ran usability sessions, and so did Annalise and Jason W. I synthesized what we heard: crowded UI, tiny type at workout distance, and gesture overload. People hated switching between point and pinch. They wanted one gesture, and tracking was jumpy enough to exit a workout by accident.",
              "AirTap was still the right constraint. The first version just had too many verbs. Next pass: one selection gesture, bigger type, camera guidance so the whole body stays in frame.",
            ],
            images: [
              {
                src: pulseSlide(18),
                alt: "Usability participants and the focus of each session.",
              },
              {
                src: pulseSlide(19),
                alt: "Executive summary. Crowded UI and unintuitive gestures, versus larger type and unified gesture logic.",
              },
              {
                src: pulseSlide(21),
                alt: "Interaction friction. Users wanted one pinch gesture instead of switching between point and pinch.",
              },
              {
                src: pulseSlide(22),
                alt: "Onboarding fatigue. Too much text, dead rest screens, and exercises that were hard to identify.",
              },
            ],
          },
        ],
      },
      {
        title: "What's next",
        blocks: [
          {
            title: "Honest about fit",
            paragraphs: [
              "A Sean Ellis-style survey put essential-to-disappointed at 33%. Not a product people would riot over losing yet. Half the group hadn't wired Pulse into a real week. That's the next design problem, not a branding problem: make the calendar slot so obviously the path of least resistance that skipping feels worse than starting.",
            ],
            images: [
              {
                src: pulseSlide(25),
                alt: "Product-market fit survey. Only 33% would be very disappointed if Pulse went away.",
              },
              {
                src: pulseSlide(26),
                alt: "Next-step recommendations across UI, gesture logic, onboarding, and camera coaching.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Pulse is the closest I've come to the work I want: product UX in physical space. I got to lead design on a three-person team, prototype the thing, and still hear that the first gesture set was too much. Next I'd unify AirTap into one selection, grow the type for 10-foot reading, and test whether a calendar-suggested slot actually changes whether a student works out.",
};

/** Pawfect Match */
const PF = `${P}/Pawfect`;
const pawfectHero = `${PF}/Pawfect Match.png`;
const pawfectImages = [
  "Pawfect Match.png",
  "Pawfect Match-01.png",
  "Pawfect Match-01.jpg",
  "Pawfect Match MockUps-01.jpg",
  "PawfectMatch Mockup 2.5.jpeg",
  "Modern App Portfolio Mockup Presentation.png",
  "mockuuups-free-iphone-15-pro-hand-mockup.png",
  "Screenshot 2024-12-18 at 2.01.16\u202fPM.png",
  "Screenshot 2025-01-14 at 1.03.51\u202fPM.png",
  "Screenshot 2025-01-14 at 1.05.28\u202fPM.png",
];

const pawfectCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Mobile App (Academic)",
    industry: "Social · Pets · Community",
    timeline: "Sprint · Solo",
    role: "UX / UI design",
  },
  introParagraphs: [
    "Pawfect Match is a playful dating-style app for pet owners, swipe, match, and meet up for park hangs based on compatible pets and personalities.",
    "Early exploration was about making pet profiles feel warm without turning into LinkedIn for Labs. Full write-up incoming. Until then, let the mockups do the talking.",
  ],
  highlights: [
    {
      label: "Hook",
      value: "Match on pets first, owners second.",
    },
    {
      label: "Tone",
      value: "Friendly, bright, and approachable, built for dog-park energy.",
    },
  ],
  base: PF,
  imageFiles: pawfectImages,
  blockParagraphs: [
    "Screen explorations, mockups, and presentation boards from the Pawfect Match concept. Full narrative write-up on the way.",
  ],
  conclusion:
    "WIP reflection. Visual direction is solid. Next question: does matching on temperament actually make park meetups less chaotic, or just more politely chaotic?",
});

/** Safe Space */
const SS = `${P}/Safe Space`;
const safeSpaceHero = `${SS}/SafeSpace.png`;
const safeSpaceImages = [
  "SafeSpace.png",
  "SafeSpace - V1thingydadaa.jpg",
  "SafeSpace Wireframes.png",
  "SafeSpace UserFlow.png",
  "Screenshot 2025-01-17 at 3.44.37\u202fPM.png",
  "mockuuups-female-hand-holding-iphone-14-pro-mockup.png",
  "1_JasonSaputra.jpg",
];

const safeSpaceCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Note-taking / Wellness (Academic)",
    industry: "Mental Health · Productivity",
    timeline: "Sprint · Solo",
    role: "UX / UI design",
  },
  introParagraphs: [
    "Safe Space is a note-taking and reflection app concept, a calmer place to capture thoughts, track emotional check-ins, and revisit patterns without the noise of a general-purpose notes tool.",
    "Wireframes and user flows explore how little friction you can keep between 'I need to write this down' and actually doing it. Detailed case study text is still in progress.",
  ],
  highlights: [
    {
      label: "North star",
      value: "Private, gentle, and fast, journaling without performance.",
    },
    {
      label: "Process",
      value: "User flow → wireframes → high-fidelity explorations.",
    },
  ],
  base: SS,
  imageFiles: safeSpaceImages,
  blockParagraphs: [
    "Wireframes, flows, and visual explorations from the Safe Space concept. More context coming in a future pass.",
  ],
  conclusion:
    "Early work, placeholder reflection until the full write-up lands. The interaction model prioritizes speed and emotional safety over feature breadth.",
});

/** ShiftOff */
const SO = `${P}/ShiftOff`;
const shiftOffHero = `${SO}/iPhone 16 Pro.png`;
const shiftOffImages = [
  "1.png",
  "1.5.png",
  "2.png",
  "3.png",
  "4.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
  "11.png",
  "12.png",
  "13.png",
  "14.png",
  "15.png",
  "16.png",
  "17.png",
  "18.png",
  "19.png",
  "20.png",
  "21.png",
  "iPhone 16 Pro.png",
];

const shiftOffCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Work-life Boundaries (Academic)",
    industry: "Wellness · Productivity · Service Design",
    timeline: "Multi-week · Solo",
    role: "UX / product design",
  },
  introParagraphs: [
    "ShiftOff helps knowledge workers actually disconnect, ritual builders, rumination redirects, and a morning review that closes the loop on what you carried home from work.",
    "The concept treats 'logging off' as a designed behavior, not a willpower test. Slide deck and narrative still in progress; images below are the current artifact set.",
  ],
  highlights: [
    {
      label: "Problem",
      value: "Work follows you home, notifications, open loops, and Sunday scaries.",
    },
    {
      label: "Mechanic",
      value: "End-of-day rituals + vault-locked work apps until morning review.",
    },
  ],
  base: SO,
  imageFiles: shiftOffImages,
  blockParagraphs: [
    "High-fidelity screens and device mockups from the ShiftOff concept, onboarding hurdles through dashboard, settings, and handoff flows.",
  ],
  conclusion:
    "WIP. ShiftOff tries to make logging off feel like care, not punishment. Next test: do end-of-day rituals actually cut after-hours Slack checking, or do we just invent prettier guilt?",
});

/** CCA Pathfinding */
const CCA = `${P}/CCA Pathfinding`;
const ccaHero = `${CCA}/30.jpg`;
const ccaSlide = (n) => `${CCA}/${n}.jpg`;

const ccaPathfindingCaseStudyRich = {
  overview: {
    client: "CCA · IXD Core: Systems",
    industry: "Systems design · Wayfinding · Campus",
    timeline: "March 2026 · Solo",
    role: "Research, numbering system, visual language, signage",
  },
  introParagraphs: [
    "New students get lost. I did. So did a lot of the people I interviewed. The front gate is locked. You walk around to the back of the main building, which nobody tells you.",
    "Inside, the portal map is the real system, and it's still a hunt: 21A, 21B, 21C, one by one. The second floor uses a different numbering system. I stayed on the first floor.",
  ],
  highlights: [
    {
      label: "My role",
      value: "Solo. Interviews, numbering, visual language, sign family.",
    },
    {
      label: "Key design call",
      value: "Hallways are the prefixes, like an airport. Map flipped 90 degrees to face the entrance.",
    },
    {
      label: "What broke",
      value: "Prefixes A, B, N, E, W don't mean anything on the ground. 4 out of 5 people said the codes cause issues.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: false,
  showJumpNav: true,
  showDeckEmbed: false,
  processWork: {
    sections: [
      {
        title: "The campus",
        blocks: [
          {
            title: "The building got a renovation. The signs didn't.",
            paragraphs: [
              "1111 8th St used to be a warehouse. The Nave is the postcard. Wayfinding is tape, floor stickers, silver plaques, and a number painted on wired glass. Some signs still point at rooms that don't exist.",
            ],
            images: [
              {
                src: ccaSlide(33),
                alt: "The Nave before and after renovation. Raw warehouse to finished hall.",
              },
              {
                src: ccaSlide(34),
                alt: "Current signage mapped onto the floor plan. Mixed styles, floor decals, hard-to-see type.",
              },
            ],
          },
        ],
      },
      {
        title: "The codes",
        blocks: [
          {
            title: "A, B, N, E, W. What does A even mean.",
            paragraphs: [
              "CCA numbers by section: A, B, N, E, W. N, E, W are cardinals. A and B aren't. Standing in the hall, none of that tells you where you are.",
              "You're also on the floor, not above it. The official map is a bird's-eye. From the entrance you rotate it 90 degrees before it matches what you see.",
            ],
            images: [
              {
                src: ccaSlide(35),
                alt: "Floor plan with North, East, West, and Nave coding. Prefixes that don't match ground-level walking.",
              },
              {
                src: ccaSlide(36),
                alt: "Problem statement. Intuitive wayfinding for 1111 8th St that still feels like CCA.",
              },
            ],
          },
        ],
      },
      {
        title: "Research",
        blocks: [
          {
            title: "Students and professors. Same scavenger hunt.",
            paragraphs: [
              "I interviewed 5 people, students and faculty: Anny, Peter, Dave, Leo, Willow. Same script, then I synthesized.",
              "4 out of 5 said the codes cause issues. First visits were walking until they found it. Lost, they pull the portal map. Homeroom, bathrooms, and the Nave came up over and over.",
            ],
            images: [
              {
                src: ccaSlide(39),
                alt: "Interview set. Anny, Peter, Dave, Leo, Willow.",
              },
              {
                src: ccaSlide(40),
                alt: "4 out of 5 participants said room codes cause navigational issues. Quote from Anny: yeah it's like it's random.",
              },
              {
                src: ccaSlide(46),
                alt: "4 out of 5 walked until they found the room on their first visit. Dave: checked everyplace.",
              },
            ],
          },
        ],
      },
      {
        title: "Direction",
        blocks: [
          {
            title: "Number like an airport.",
            paragraphs: [
              "The hallway is the code. Flip the map 90 degrees so it faces you at the entrance. Hallways become A, B, C. If the door opens onto hallway A, you're A1, A2, A3. Next to A but the door dumps into B? That's B.",
            ],
            images: [
              {
                src: ccaSlide(48),
                alt: "Mood board. Floor paths, chunky numerals, playful posts, topographic mark.",
              },
              {
                src: ccaSlide(52),
                alt: "Room numbering. Entrance-oriented plan, corridor prefixes, odd and even sides, split-room suffixes.",
              },
            ],
          },
        ],
      },
      {
        title: "The system",
        blocks: [
          {
            title: "Kiosk, crossways, hanging signs",
            paragraphs: [
              "Digibop for the voice, Quicksand for the read. Purple, pink, cyan. 3 objects: kiosk at the entrance, totems at the crossways, hanging signs in the long hall.",
            ],
            images: [
              {
                src: ccaSlide(54),
                alt: "Styleguide. Digibop, Quicksand, purple pink cyan, pixel wayfinding icons.",
              },
              {
                src: ccaSlide(55),
                alt: "Sign family. Entrance kiosk, directional totem, hanging EXIT and IXD HR signs.",
              },
            ],
          },
        ],
      },
      {
        title: "In the building",
        blocks: [
          {
            title: "Put it in the hall, not in a vacuum",
            paragraphs: [
              "Kiosk by the desk. Totem at the studio crossing, where IXD already has a taped arrow. Hanging pair over the Nave: EXIT one way, homeroom and toilets the other.",
            ],
            images: [
              {
                src: ccaSlide(56),
                alt: "Entrance kiosk mocked into the lobby corridor.",
              },
              {
                src: ccaSlide(57),
                alt: "Crossways totem in the studio, pointing to toilets, IXD homeroom, and the Nave.",
              },
              {
                src: ccaSlide(58),
                alt: "Hanging signs in the Nave. EXIT, IXD HR, toilets.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Next I'd put a totem at full size in the Nave and watch whether a first-year stops walking aimlessly.",
};

/** A Fowl Play (AR) */
const AFP = `${P}/AR Project A Fowl Play`;
const aFowlPlayHero = `${AFP}/355a7d22-b1c8-4402-9d86-dc0a92061da8.png`;

const aFowlPlayCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · AR Narrative (Academic)",
    industry: "AR / XR · Interactive Storytelling",
    timeline: "Studio project · Solo",
    role: "Narrative, 3D, AR interaction design",
  },
  introParagraphs: [
    "A Fowl Play turns an iPad into a detective kit. Scan the world, step into a mystery, and follow audio, light, and geometry cues like you're inside Half-Life: Alyx, just with more poultry and less gravity gloves.",
    "Built in Reality Composer with RealityScan assets and Blender cleanup. The story does the navigating. The UI stays quiet.",
  ],
  highlights: [
    {
      label: "Mechanic",
      value: "Image-anchored AR scenes with invisible triggers between rooms.",
    },
    {
      label: "Wayfinding",
      value: "Audio, visual, and spatial cues, borrowed from game design, not UI chrome.",
    },
    {
      label: "Tools",
      value: "Reality Composer, RealityScan, Blender, ElevenLabs VO.",
    },
  ],
  showJumpNav: true,
  sections: [
    {
      title: "Inspiration",
      blocks: [
        {
          title: "Navigation as storytelling",
          paragraphs: [
            "Before any scan, I studied how games push you forward without a giant arrow. Alyx won: environment, sound, and geometry do the pointing.",
          ],
          images: projectImages(AFP, [
            "Half-Life_Alyx_Navigational_Cues_Screenshot.png",
            "Half-Life_Alyx_Navigational_Cues.webp",
            "Half-Life_Alyx_Navigational_Cues_(1).webp",
          ]),
        },
      ],
    },
    {
      title: "World build",
      blocks: [
        {
          title: "Scan, clean, place",
          paragraphs: [
            "Sketchfab filled gaps. RealityScan pulled real props into the scene. Blender kept the polycount from melting the iPad.",
          ],
          images: projectImages(AFP, [
            "image.png",
            "image 1.png",
            "Screenshot_20251209_215456_RealityScan.jpg",
            "ba6bf4e6-6e4d-4f4d-b6a1-27e889781125.png",
          ]),
        },
      ],
    },
    {
      title: "Scenes",
      blocks: [
        {
          title: "Detective's office",
          paragraphs: [
            "Tone-setter. Look around, hear the monologue, walk to the door. Invisible trigger, next scene. No menu required.",
          ],
          images: projectImages(AFP, [
            "355a7d22-b1c8-4402-9d86-dc0a92061da8.png",
            "IMG_0182_from_Notion.jpg",
          ]),
        },
        {
          title: "Restaurant of suspicion",
          paragraphs: [
            "Three spaces, three cue types. Players stretch their legs and solve with instinct, not a checklist.",
          ],
          images: projectImages(AFP, [
            "7b6affab-7070-469b-bed3-d1cc959b25d6.png",
            "a607895c-bc9b-44a8-9cd5-d1ae70aebfaa.png",
          ]),
        },
      ],
    },
    {
      title: "Anchor",
      blocks: [
        {
          title: "Make the marker part of the joke",
          paragraphs: [
            "Horizontal plane anchors fought crowded rooms. An image anchor locked the scene, and version 2 swapped a wall of text for a face doodle Reality Composer could actually see.",
          ],
          images: projectImages(AFP, ["Untitled-1.jpg", "Ver2.jpg"]),
        },
      ],
    },
  ],
  videos: [
    {
      kind: "youtube",
      url: "https://youtu.be/ceq7c4e2jvw",
      label: "Restaurant exploration",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/X1klMHiKSDA",
      label: "Full scene pass",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/mMD_lQbTbmo",
      label: "Scene walkthrough",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/NeM5pf2HrwE",
      label: "In-person testing",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Scenes",
  videosTitle: "Playthroughs",
  videosIntro: "Scenes, anchors, and live playtests. Watch the mystery before reading more about it.",
  conclusion:
    "Simple tools plus clear cues beat complicated systems. Watching people solve the mystery with only intuition was the whole point. AR works when the world does the explaining.",
});

/** The Adherence Project */
const ADH = `${P}/The Adherence Project`;
const adherenceHero = `${ADH}/Adherence-hero.jpg`;

const adherenceCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Health Hardware (Academic)",
    industry: "Health · Physical Computing · Accessibility",
    timeline: "Studio project · Solo",
    role: "Product, interaction, physical prototype",
  },
  introParagraphs: [
    "Half of people with chronic conditions miss doses. Adherence is not a willpower poster. It is a system problem.",
    "This project pairs a soft digital companion with a physical pill dispenser: voice, screen, LEDs, and a door that hands you the dose instead of lecturing you about it.",
  ],
  highlights: [
    {
      label: "Insight",
      value: "Flexibility beats rigid schedules for messy real routines.",
    },
    {
      label: "Build",
      value: "ProtoPie + Blokdots bridging app logic to Arduino hardware.",
    },
    {
      label: "Form",
      value: "Funnel refill, swinging door dispense, status through an LED window.",
    },
  ],
  showJumpNav: true,
  sections: [
    {
      title: "Problem",
      blocks: [
        {
          title: "Missed doses, real cost",
          paragraphs: [
            "~125,000 preventable deaths a year in the US alone. The brief: soft reminders and an accessible path from refill to dispense.",
          ],
          images: projectImages(ADH, [
            "aa8e76d0-0dca-4b3d-9e7f-abf760410230.png",
            "persona-letter.png",
          ]),
        },
      ],
    },
    {
      title: "Flow",
      blocks: [
        {
          title: "Map the ritual",
          paragraphs: [
            "User flows clarified where voice helps and where it just slows people down. Clarity over speed. Fewer back-and-forths.",
          ],
          images: projectImages(ADH, ["flowchart.png"]),
        },
      ],
    },
    {
      title: "Prototype",
      blocks: [
        {
          title: "Digital meets door servo",
          paragraphs: [
            "ProtoPie talked to Blokdots. Loose wires lied. Wi-Fi lagged. Three hardware iterations later, the funnel angle and cable routing finally behaved.",
          ],
          images: projectImages(ADH, [
            "2865bf62-a8ff-4e12-a53d-a0ca5a1369cc.png",
            "image.png",
            "image 1.png",
            "20251130_122322.jpg",
          ]),
        },
      ],
    },
  ],
  videos: [
    {
      kind: "file",
      src: `${ADH}/20251126_151448.mp4`,
      label: "Physical prototype",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/tKnbTC_pZX4",
      label: "Finished design",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/W66TewjqzSI",
      label: "Interaction demo",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/WD1f59lN5vE",
      label: "System walkthrough",
    },
    {
      kind: "youtube",
      url: "https://youtu.be/oWKellnhqRs",
      label: "Full demo",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Prototype",
  videosTitle: "Prototype in motion",
  videosIntro: "Hardware dispense, voice loops, and the finished companion flow.",
  conclusion:
    "Multi-sensory beats app-only nagging. Voice wants patience. Hardware wants cable management. Next: a tighter industrial design pass once the interaction model stops surprising the servos.",
});

/** Concrete — The Price for Concrete */
const CN = `${P}/Concrete`;
const concreteHero = `${CN}/slides/concrete-slide-02.png`;
const concreteSlides = [
  "slides/concrete-slide-02.png", // title
  "slides/concrete-slide-01.png", // Raquel Nelson
  "slides/concrete-slide-03.png",
  "slides/concrete-slide-04.png",
  "slides/concrete-slide-05.png", // iceberg / the System
  "slides/concrete-slide-06.png",
  "slides/concrete-slide-07.png",
  "slides/concrete-slide-08.png",
  "slides/concrete-slide-09.png",
  "slides/concrete-slide-10.png",
  "slides/concrete-slide-11.png", // Changing the Goal
];

const concreteCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "IXD · Systems Thinking (Academic)",
    industry: "Urban Systems · Mobility · Policy Design",
    timeline: "Unit 4 · Solo · May 2026",
    role: "Systems research · visual narrative",
  },
  introParagraphs: [
    "The Price for Concrete asks what we actually pay when streets are engineered for cars first and people second. Not the asphalt invoice. The human one.",
    "A systems-thinking deck: iceberg models, mental models, and leverage points. Boards first. The argument is in the sequence.",
  ],
  highlights: [
    {
      label: "Spark",
      value: "Raquel Nelson's case: a family crossing after dark, and a system that criminalized the pedestrian.",
    },
    {
      label: "Lens",
      value: "Pattern → structure → mental model. Cars as 'normal' is the deepest layer.",
    },
    {
      label: "Leverage",
      value: "Rewrite the rules: safe human access over maximum throughput.",
    },
  ],
  base: CN,
  imageFiles: concreteSlides,
  blockParagraphs: [
    "Full board sequence from The Price for Concrete. Scroll the argument before you skim the labels.",
  ],
  conclusion:
    "If pedestrians stay 'criminals' in the mental model, concrete keeps getting poured for the wrong stakeholder. Change the goal, and the budget follows.",
});

/** Flippy */
const FL = `${P}/Flippy/portfolio`;
const flippyHero = `${FL}/flippy-hero.png`;

const flippyCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Personal · Experimental Web",
    industry: "AR-adjacent · Creative Coding · Photo",
    timeline: "Personal build · Solo",
    role: "Product design · front-end · ML integration",
  },
  introParagraphs: [
    "A photo captures what a moment looked like. Flippy captures what it felt like to stand there.",
    "Point the camera, estimate depth on-device, slice the frame into paper cutouts, and tilt to look around a pop-up book of your own life. Nothing leaves the phone.",
  ],
  highlights: [
    {
      label: "Pipeline",
      value: "Capture → Depth Anything V2 → FG/mid/BG cutouts → CSS 3D stand-up.",
    },
    {
      label: "Constraint",
      value: "On-device only. WebGPU with WASM fallback.",
    },
  ],
  base: FL,
  imageFiles: ["flippy-hero.png", "flippy-flow.png", "flippy-tech.png"],
  blockParagraphs: [
    "Process boards for the Flippy loop. Drop real device captures into this folder anytime. The live app is the proof.",
  ],
  conclusion:
    "Depth models finally make casual 3D memories feel possible in the browser. Next polish: tighter cutouts, richer paper textures, and a shareable moment format.",
});

/** Who Fiddled? */
const WF = `${P}/Who Fiddled`;
const whoFiddledHero = `${WF}/wf-hero-wordmark.jpg`;
const wfAsset = (name) => `${WF}/${name}`;

const whoFiddledCaseStudyRich = {
  overview: {
    client: "Reddit · Games with a Hook hackathon",
    industry: "Social games · Devvit · Community",
    timeline: "June 17 to July 15, 2026 · Solo",
    role: "Concept, visual system, interaction, identity",
  },
  introParagraphs: [
    "Who Fiddled? is a daily bluffing game that lives inside a Reddit post. Ten ranked questions. One truth, three lies. Fool the crowd or catch the fiddler.",
    "I designed the loop, the sticker system, and the identity for Reddit's Games with a Hook. It had to read on a phone inside a post, and still feel like a party game when you expand it.",
  ],
  highlights: [
    {
      label: "My role",
      value: "Solo. Concept, visual system, interaction, identity, and the UI inside the Reddit post.",
    },
    {
      label: "Key design call",
      value: "One pinned daily hub with a sequential 10. Community posts stay optional and unranked.",
    },
    {
      label: "Constraint",
      value: "The whole game has to read in a Reddit post, on a phone, without looking like a shrunk desktop.",
    },
    {
      label: "Look",
      value: "Cyan field, pink as the one primary action, navy outlines, Noot on the wordmark only.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: false,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [
    {
      kind: "youtube",
      url: "https://youtu.be/Qhi6wbqrLME",
      label: "Full loop inside a Reddit post",
    },
  ],
  videosPlacement: "afterIntro",
  videosTitle: "Full loop",
  videosIntro:
    "Hub to question to reveal to the next one. This is the game as it actually plays.",
  livePrototype: {
    href: "https://www.reddit.com/r/who_fiddled_dev",
    label: "Open r/who_fiddled_dev",
    intro:
      "Play inside a Reddit post. Expand the pinned Daily Trivia hub and run today's 10.",
  },
  extraVideosAfterSection: "Playing it",
  extraVideosTitle: "The tap, the miss, the hit",
  extraVideosIntro:
    "Radio stickers press down. Miss, and fiddles eat the post. Hit the truth and confetti does the talking.",
  extraVideos: [
    {
      kind: "file",
      src: `${WF}/wf-picking.mp4`,
      label: "Picking an answer",
      layout: "wide",
    },
    {
      kind: "file",
      src: `${WF}/wf-fiddled.mp4`,
      label: "You got fiddled",
      layout: "wide",
    },
    {
      kind: "file",
      src: `${WF}/wf-confetti.mp4`,
      label: "You found the truth",
      layout: "wide",
    },
  ],
  processWork: {
    sections: [
      {
        title: "In the feed",
        blocks: [
          {
            title: "It has to look like a Reddit post first",
            paragraphs: [
              "The game lives in a custom post, not a standalone site. Expand it, hit Play, then you're on the cyan. If that first card doesn't feel like a thing you tap, nobody reaches Today's 10.",
            ],
            images: [
              {
                src: wfAsset("wf-reddit-splash.png"),
                alt: "Who Fiddled splash inside a Reddit post. Play card, upvote chrome, u/who-fiddled.",
              },
            ],
          },
        ],
      },
      {
        title: "Daily 10",
        blocks: [
          {
            title: "Fair ranking needed one shared deck",
            paragraphs: [
              "The actual sport is Today's 10. Same ten questions for everyone that Pacific day, so the leaderboard is fair. One hero card, a row of pips, Start daily trivia. You don't pick from truncated teasers. You play the deck in order.",
              "Community sits under it, for fun, no ranked points. One question a day if you want to post. Ranked points never leak into that lane, or a popular lie-farm would beat people who just played the official ten.",
            ],
            images: [
              {
                src: wfAsset("wf-todays-10.png"),
                alt: "Hub home. Today's 10 with empty pips, Start daily trivia, Community empty state, Post a question.",
              },
            ],
          },
        ],
      },
      {
        title: "Playing it",
        blocks: [
          {
            title: "A tap had to feel like a tap",
            paragraphs: [
              "Answer cards are radio stickers, not static text. Lock it in stays dead until you pick something. The copy says Pick an answer first so the grey button isn't a mystery. Sixty seconds on the clock, fill reading as time left, not a loading bar.",
              "Once you select, the white face presses down and the navy shadow stays put. Switch answers and the old one pops back up. No checkmark. A checkmark shoved the copy and wrapped a word.",
            ],
            images: [
              {
                src: wfAsset("wf-question-idle.png"),
                alt: "Question 1 of 10. Four radio answers, timer at 55s, Lock it in disabled until a pick.",
              },
            ],
          },
        ],
      },
      {
        title: "Posting",
        blocks: [
          {
            title: "Type on the card players will see",
            paragraphs: [
              "The magenta card is the prompt. You type on it, not in a leftover field underneath. Extra context is optional and only shows after voting, so the backstory can't leak the truth. Draft saves as a quiet chip. Next takes you to the three lies.",
              "Two steps, not seven fields in one scroll. Personal questions and Write the lies are different jobs, so they got different tabs.",
            ],
            images: [
              {
                src: wfAsset("wf-post-question.png"),
                alt: "Post a question, step 1. Magenta prompt card, truth field, extra context, Next write your lies.",
              },
            ],
          },
        ],
      },
      {
        title: "After the ten",
        blocks: [
          {
            title: "The deck ends. The day doesn't.",
            paragraphs: [
              "Finish the ten and the card goes yellow, brand yellow, not a random green. Score up top. Correct, missed, and the deck bonus in one box so 2 correct and 8 missed actually add up. If you're #1, that line gets a trophy, not a footnote.",
              "Share my score is the pink action. View leaderboard is yellow. Next deck drops on a live Pacific countdown, so Check back tomorrow has a clock on it.",
            ],
            images: [
              {
                src: wfAsset("wf-deck-complete.png"),
                alt: "Deck complete. 250 pts, #1 on today's board, score breakdown, next deck countdown.",
              },
              {
                src: wfAsset("wf-leaderboard.png"),
                alt: "Daily leaderboard. Trophy header, Today and All time nested under Today and Leaderboard, sticky Your rank.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Hackathon rules wanted a 60-second demo inside a live post, public sub under 200 people. I seeded trivia so judges could play without waiting for a crowd. Generated lies used to give themselves away with parentheses. I made the writer stop doing that. Next I'd grow the prompt packs and watch which lies actually fool people. The game is only as good as the lie that almost sounded true.",
};

export const projects = [
  {
    id: 1,
    title: "Dream Detective",
    category: "iOS App",
    tagline: "Wake up or the plot dies.",
    description:
      "A mystery-alarm for college night owls. Get up and unlock today's chapter. Snooze, and that clue is gone for good.",
    tags: ["UX Design", "Product Design", "Prototyping", "Behavior Design"],
    slug: "dream-detective",
    thumb: dreamDetectiveHero,
    caseStudyHero: dreamDetectiveHero,
    caseStudyGallery: [],
    caseStudyDeckPdf: dreamDetectiveDeckPdf,
    caseStudyRich: dreamDetectiveCaseStudyRich,
  },
  {
    id: 2,
    title: "Eleara",
    category: "Health UX",
    tagline: "Steady the spin before it hits.",
    description:
      "Wearable + app that nudges the inner ear before dizziness spirals. Built remote in 72 hours, with real users testing at hour 36.",
    tags: ["UX Design", "Product Design", "Systems Design", "Team Lead"],
    slug: "eleara",
    thumb: elearaHero,
    mobileCarouselThumb: elearaCarouselThumb,
    caseStudyHero: elearaHero,
    caseStudyGallery: [],
    caseStudyDeckPdf: elearaDeckPdf,
    caseStudyRich: elearaCaseStudyRich,
  },
  {
    id: 3,
    title: "Kits!",
    category: "Product Design",
    tagline: "Borrow the gear. Skip the receipt.",
    description:
      "Kiosk + app for sharing hobby kits. Try ceramics, climbing, or film without buying a whole new personality first.",
    tags: ["Product Design", "UX Design"],
    slug: "kits",
    thumb: kitsHero,
    caseStudyHero: kitsHero,
    caseStudyGallery: [],
    caseStudyPdfs: kitsPdfs,
    caseStudyRich: kitsCaseStudyRich,
  },
  {
    id: 4,
    title: "Dairy Delight",
    category: "Brand / UX",
    tagline: "Farm charm, zero farmer's-market cliché.",
    description:
      "Brand system for an organic dairy: poster, web, and app. 100+ logo sketches later, it finally tasted like sunshine.",
    tags: ["Brand Design", "Visual Design", "UX Design"],
    slug: "dairy-delight",
    thumb: dairyHero,
    caseStudyHero: dairyHero,
    caseStudyGallery: [],
    caseStudyPdfs: [],
    caseStudyRich: dairyCaseStudyRich,
  },
  {
    id: 5,
    title: "Pulse",
    category: "Smart Mirror UX",
    tagline: "Coach in the glass, not in your pocket.",
    description:
      "Gesture-first workout coaching for student athletes. Calendar-aware plans on a smart mirror, because phones already ruin enough gyms.",
    tags: ["Lead Designer", "Prototyping", "Research", "Gesture UX"],
    slug: "pulse",
    thumb: pulseHero,
    caseStudyHero: pulseHero,
    caseStudyGallery: [],
    caseStudyRich: pulseCaseStudyRich,
  },
  {
    id: 6,
    title: "Pawfect Match",
    category: "Mobile App",
    tagline: "Tinder, but the dogs are cooler.",
    description:
      "Pet meetup matching for park chaos and new friends. Warm profiles, swipe energy, zero corporate dog-food energy.",
    tags: ["UX Design", "UI Design", "Mobile"],
    slug: "pawfect",
    thumb: pawfectHero,
    caseStudyHero: pawfectHero,
    caseStudyGallery: [],
    caseStudyRich: pawfectCaseStudyRich,
  },
  {
    id: 7,
    title: "Safe Space",
    category: "Wellness UX",
    tagline: "A notebook that doesn't yell 'ship it'.",
    description:
      "Private notes and soft check-ins. Built for feelings, not streak counters or inbox zero guilt.",
    tags: ["UX Design", "UI Design", "Wellness"],
    slug: "safe-space",
    thumb: safeSpaceHero,
    caseStudyHero: safeSpaceHero,
    caseStudyGallery: [],
    caseStudyRich: safeSpaceCaseStudyRich,
  },
  {
    id: 8,
    title: "ShiftOff",
    category: "Product Design",
    tagline: "Log off for real.",
    description:
      "End-of-day rituals and morning review for people whose brain keeps Slack open after 6pm. Close the laptop. Mean it.",
    tags: ["UX Design", "Product Design", "Wellness"],
    slug: "shift-off",
    thumb: shiftOffHero,
    caseStudyHero: shiftOffHero,
    caseStudyGallery: [],
    caseStudyRich: shiftOffCaseStudyRich,
  },
  {
    id: 9,
    title: "CCA Pathfinding",
    category: "Wayfinding",
    tagline: "Stop walking until you luck into class.",
    description:
      "Wayfinding for CCA's first floor. Hallway prefixes like an airport, a map that faces the entrance.",
    tags: ["Systems Design", "Wayfinding", "Visual Design"],
    slug: "cca-pathfinding",
    thumb: ccaHero,
    caseStudyHero: ccaHero,
    caseStudyGallery: [],
    caseStudyRich: ccaPathfindingCaseStudyRich,
  },
  {
    id: 10,
    title: "A Fowl Play",
    category: "AR Experience",
    tagline: "Solve a murder with an iPad and a hunch.",
    description:
      "Image-anchored AR mystery. Scan the room, follow game-style cues, and catch a restaurant owner before the trail goes cold.",
    tags: ["AR", "Narrative Design", "3D", "Prototyping"],
    slug: "a-fowl-play",
    thumb: aFowlPlayHero,
    caseStudyHero: aFowlPlayHero,
    caseStudyGallery: [],
    caseStudyRich: aFowlPlayCaseStudyRich,
  },
  {
    id: 11,
    title: "The Adherence Project",
    category: "Health Hardware",
    tagline: "Medicine that meets you halfway.",
    description:
      "Voice + screen companion wired to a physical pill dispenser. Soft reminders, swinging door, fewer missed doses.",
    tags: ["Product Design", "Physical Computing", "Accessibility"],
    slug: "adherence",
    thumb: adherenceHero,
    caseStudyHero: adherenceHero,
    caseStudyGallery: [],
    caseStudyRich: adherenceCaseStudyRich,
  },
  {
    id: 12,
    title: "The Price for Concrete",
    category: "Systems Thinking",
    tagline: "What streets cost when people aren't the point.",
    description:
      "Systems deck on car-first design, pedestrian blame, and the leverage points that could flip the goal from throughput to safe human access.",
    tags: ["Systems Design", "Visual Narrative", "Research"],
    slug: "concrete",
    thumb: concreteHero,
    caseStudyHero: concreteHero,
    caseStudyGallery: [],
    caseStudyRich: concreteCaseStudyRich,
  },
  {
    id: 13,
    title: "Flippy",
    category: "Experimental Web",
    tagline: "Your photo, as a pop-up book.",
    description:
      "On-device depth slices a moment into paper cutouts you can tilt around. Capture the feeling of being there, not just the pixels.",
    tags: ["Creative Coding", "Product Design", "ML"],
    slug: "flippy",
    thumb: flippyHero,
    caseStudyHero: flippyHero,
    caseStudyGallery: [],
    caseStudyRich: flippyCaseStudyRich,
  },
  {
    id: 14,
    title: "Who Fiddled?",
    category: "Social Game",
    tagline: "One truth. Three lies. Reddit decides.",
    description:
      "Daily bluffing trivia inside a Reddit post. Ranked 10, one truth, three lies. PRD, visual system, and interaction, shipped for Reddit's Games with a Hook.",
    tags: ["Game Design", "Visual Design", "Interaction"],
    slug: "who-fiddled",
    thumb: whoFiddledHero,
    caseStudyHero: whoFiddledHero,
    caseStudyGallery: [],
    caseStudyRich: whoFiddledCaseStudyRich,
  },
];

const FEATURED_SLUGS = ["eleara", "pulse", "adherence", "kits"];

export const featuredProjects = FEATURED_SLUGS.map((slug) =>
  projects.find((p) => p.slug === slug)
).filter(Boolean);

export const archiveProjects = projects.filter(
  (p) => !FEATURED_SLUGS.includes(p.slug)
);

/** All image paths for a project, used by Other stuff archive folders. */
export function projectGallerySources(project) {
  const seen = new Set();
  const out = [];

  const add = (src) => {
    if (src && !seen.has(src)) {
      seen.add(src);
      out.push(src);
    }
  };

  add(project.thumb);
  add(project.caseStudyHero);

  const rich = project.caseStudyRich;
  if (rich?.processWork?.sections) {
    for (const section of rich.processWork.sections) {
      for (const block of section.blocks ?? []) {
        for (const entry of block.images ?? []) {
          add(typeof entry === "string" ? entry : entry.src);
        }
      }
    }
  }

  for (const src of project.caseStudyGallery ?? []) {
    add(src);
  }

  return out;
}
