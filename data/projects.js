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
}) {
  return {
    overview,
    introParagraphs,
    highlights: highlights ?? [],
    heroFirst: true,
    imagesBeforeText: true,
    showJumpNav: false,
    showDeckEmbed: false,
    videos: [],
    processWork: {
      sections: [
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
      ],
    },
    conclusionTitle: "Reflection",
    conclusion,
  };
}

/** Dream Detective */
const DD = `${P}/dream-detective`;
const DD_PDF = `${DD}/PDF Slides`;

function dreamDetectiveSlideBase(i) {
  const n = i === 0 ? "01" : String(i + 1);
  return `Dream Detective - ${n}`;
}

const dreamDetectiveGallery = Array.from({ length: 17 }, (_, i) => {
  return `${DD}/${dreamDetectiveSlideBase(i)}.jpg`;
});

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
    "Most alarm apps ask for willpower. Dream Detective asks for curiosity — a daily audio mystery where snoozing doesn't pause the story, it kills today's chapter forever.",
    "I owned this solo from research and behavioral framing through visual system, AI-assisted art direction, PRD, and interactive prototype.",
  ],
  highlights: [
    {
      label: "Core insight",
      value: "Sleep isn't a tracking problem for students — it's a motivation problem at wake-up time.",
    },
    {
      label: "Key mechanic",
      value: "Cold Trail — snooze once and that morning's chapter is permanently locked.",
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
      label: "Morning flow — success path vs. Cold Trail",
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
              "College students know sleep matters — but staying up late feels low-stakes, and alarms offer no reason to get up early. Snooze wins because nothing is at stake.",
              "The brief: design an app that creates lasting behavior change. I reframed it as motivation design, not notification design.",
            ],
            images: [
              {
                src: ddSlide(4),
                alt: "Problem framing — college students and sleep behavior.",
              },
            ],
          },
          {
            title: "Competitor analysis",
            paragraphs: [
              "I mapped behavioral patterns across Duolingo, Forest, Pokémon Sleep, Finch, and others. Duolingo's streak loss hurts more than consistency feels good (loss aversion). Forest makes you protect something you've built. Pokémon Sleep and Finch turn sleep into collectible output.",
              "The gap: no one combined narrative pull with irreversible consequence. Data and cute mascots exist — but nothing makes waking up the only way to find out what happens next.",
            ],
            images: [
              {
                src: ddSlide(5),
                alt: "Competitor analysis — behavioral design patterns across adjacent apps.",
              },
            ],
          },
          {
            title: "Solution",
            paragraphs: [
              "Replace the alarm with a daily episodic audio mystery. Each morning unlocks the next clue — unless you snooze, in which case that chapter is gone permanently.",
              "The Cold Trail penalty isn't shame or a broken streak. You don't fall behind — you miss the beat. That distinction keeps the mechanic fair while making oversleeping costly.",
            ],
            images: [
              {
                src: ddSlide(6),
                alt: "Proposal — episodic audio mystery alarm with Cold Trail penalty.",
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
              "Wellness apps default to clean minimalism. Dream Detective needed atmosphere — film noir contrast, Art Deco ornament, and adventure-game UI that feels like a world, not a dashboard. Typewriter typography reinforces the case-file metaphor.",
            ],
            images: [
              {
                src: ddSlide(8),
                alt: "Mood board — film noir, Art Deco, and adventure game references.",
              },
            ],
          },
          {
            title: "Exploring two directions",
            paragraphs: [
              "Version 1 was a minimal alarm + clue reveal — conceptually clear, but indistinguishable from a standard alarm app. Version 2 introduced the Office as home base, Evidence Board navigation, Stakeout sleep audio, and Detective Rank progress. That version sold the world.",
            ],
            images: [
              {
                src: ddSlide(9),
                alt: "Sketches — Version 1 and Version 2 mobile flow explorations.",
              },
            ],
          },
          {
            title: "Wireframes",
            paragraphs: [
              "Low-fidelity frames for home, stats, navigation, and the morning alert — structure before style. The goal was hierarchy: where sleep data lives, how users move between Office, Evidence Board, and Stakeout, and what the wake-up moment actually looks like.",
            ],
            images: [
              {
                src: ddSlide(10),
                alt: "Wireframes — main screen, stats, navigation, and notification states.",
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
              "Art Deco card frames, gold-on-crimson actions, and a handwritten navigation notebook carry the detective world across screens. Sleep stats become case metrics — Rest Logged, Evidence Secured, Cases Solved — so data feels native to the fiction.",
            ],
            images: [
              {
                src: ddSlide(12),
                alt: "UI elements — card frames, navigation notebook, and Detective Dossier panel.",
              },
            ],
          },
          {
            title: "Final screens",
            paragraphs: [
              "Environment art was generated with Gemini and Grok; UI and interaction design were built in Figma. Background illustration was scoped to AI — hand-illustrating full scenes wasn't feasible in three weeks.",
              "The morning alarm state is deliberately tense: high contrast, pulsing waveform, copy that signals a broadcast fading fast. The Evidence Board collects clues on a corkboard with red string — where the larger mystery takes shape.",
            ],
            images: [
              {
                src: ddSlide(13),
                alt: "Final screens — Office, Stakeout, New Breakthrough, and Evidence Board.",
              },
            ],
          },
          {
            title: "User flow",
            paragraphs: [
              "Day and night modes split at 6pm — the Office changes, and different actions unlock. Night path: Stakeout sleep audio → wake-up check → briefing + mini-game or Cold Trail. Day path: stats, alarm settings, and case notebook. Everything anchors back to the Office.",
            ],
            images: [
              {
                src: ddSlide(15),
                alt: "User flow chart — day/night modes and wake-up decision logic.",
              },
            ],
          },
          {
            title: "When AI wasn't enough",
            paragraphs: [
              "FigmaMake accelerated individual UI elements, but couldn't handle the core interaction — spatial, first-person navigation through the Office. I built that prototype manually in Figma, covering both wake-up outcomes: Intel Secured vs. locked out.",
            ],
            images: [
              {
                src: ddSlide(17),
                alt: "FigmaMake explorations — Simulate Morning, Intel Secured, and Sleep Audio player.",
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
              "I wrote a full PRD before high-fidelity screens — problem, features, user flow, and design specs. It kept scope honest: gamify curiosity, not guilt.",
            ],
            images: [
              {
                src: ddSlide(16),
                alt: "Product Requirement Document — problem, solution, and feature specs.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "This project shows how I work: start from behavioral research, find a defensible angle competitors missed, then design a world coherent enough to carry a punitive mechanic without feeling unfair. The concept is strong on paper — the next step is testing whether narrative FOMO actually beats an annoying alarm with real users. I'd also explore whether a social Detective Rank layer reinforces the habit or dilutes the solo mystery.",
};

/** Eleara */
const EL = `${P}/eleara`;
const elearaGallery = Array.from({ length: 19 }, (_, i) => {
  const n = String(i + 1).padStart(4, "0");
  return `${EL}/Eleara_pages-to-jpg-${n}.jpg`;
});
const elearaHero = elearaGallery[0];

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
    role: "PM / UX Lead — process, user flow, feedback synthesis",
  },
  introParagraphs: [
    "Eleara is a predictive vestibular companion — a wearable plus app that uses galvanic vestibular stimulation to counter dizziness before episodes escalate, and alerts emergency contacts when they do.",
    "Built in 72 hours over Zoom with Willow Munaba, Amanda Yu, and Anny Long. I led process and contributed the user flow; every concept decision was collective, but keeping us moving was on me.",
  ],
  highlights: [
    {
      label: "The constraint",
      value: "Zero to research-backed, user-tested prototype in 72 hours — remotely.",
    },
    {
      label: "My contribution",
      value: "Sprint facilitation, PRD alignment, user flow architecture, and Day 2 feedback synthesis.",
    },
    {
      label: "Key design call",
      value: "Hold-to-trigger emergency button — prevents false SOS alerts without slowing real emergencies.",
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
              "FigBuild is a design sprint where teams go from zero to a functional prototype in three days. Our team of four worked remotely over Zoom — coordination overhead most in-person teams never face.",
              "My role was product manager and process lead. I didn't dictate the concept — ideas came from the team. I set daily agendas, ran structured ideation, delegated by strength, unblocked whoever was stuck, and made schedule calls when time slipped.",
              "Day 1: ideation, PRD, user flow, wireframes, style guide. Day 2: first draft, user testing, iteration. Day 3: final screens, prototype recording, submission.",
            ],
            images: [
              {
                src: elearaSlide(1),
                alt: "Eleara title slide — ear device hero and wordmark.",
              },
              {
                src: elearaSlide(3),
                alt: "Day 1 section divider — ear device and geometric form.",
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
              "Day 1 opened with a timed sticky-note sprint — 15 minutes, no filtering. Ideas ranged from ADHD fixation tools to chronoception tracking to a cave-diving-inspired CO₂ monitor for interoception.",
              "The shared instinct: work in the body's hidden signals, not surface metrics. That narrowed us to interoception — internal states including balance. Two concepts emerged: a Smart Sole for gait instability, and an ear-worn device using galvanic vestibular stimulation to counter vestibular mismatch. The Ear Thing won.",
              "Willow identified the core mechanic: dizziness on standing happens when inner-ear fluid shifts with blood pressure drops. GVS sends tiny currents to the vestibular nerve — muting the dizziness signal, replacing it with steadiness. Target users: anemic people, Meniere's patients, and women with period-linked vestibular episodes.",
            ],
            images: [
              {
                src: elearaSlide(4),
                alt: "Brainstorming sticky notes — stress, energy, ADHD, interoception ideas.",
              },
              {
                src: elearaSlide(5),
                alt: "Concept comparison — Smart Sole vs. ear-worn GVS device.",
              },
            ],
          },
          {
            title: "PRD",
            paragraphs: [
              "In a 72-hour sprint, a PRD isn't overhead — it's the single source of truth before anyone opens Figma. Without it, four people build four different products in parallel.",
              "It locked the problem (orthostatic challenges, vestibular mismatch), solution (GVS companion device), users, four core features (predictive warnings, emergency data collection, statistics, emergency button), and the design system upfront — Apple HIG foundation, Poppins/Inter typography, calm minimalist palette, flat illustration, dark mode, accessibility.",
            ],
            images: [
              {
                src: elearaSlide(6),
                alt: "PRD — problem, solution, and core features.",
              },
              {
                src: elearaSlide(7),
                alt: "PRD — target users and design system specs.",
              },
            ],
          },
          {
            title: "User flow",
            paragraphs: [
              "I led the user flow — one of my direct design contributions alongside PM work. Eleara had to handle daily use and emergency response without confusion between the two paths.",
              "Core logic branches on one question after login: is the user having an episode now? If yes → alert screen and optional emergency services notification. A persistent Emergency Button on home provides manual override anytime.",
              "Normal use flows through Profile (medical info, device settings, GVS threshold calibration), Contacts (emergency list with auto-notify toggles), and Dashboard (episode stats and pattern insights). Mapping this before wireframes meant nobody built a screen without a logical place in the system.",
            ],
            images: [
              {
                src: elearaSlide(8),
                alt: "User flow chart — daily use and emergency response paths.",
              },
            ],
          },
          {
            title: "Wireframes",
            paragraphs: [
              "With the flow mapped, wireframes were layout translation — content hierarchy and actions per screen, no visual styling. Covered splash, auth, home with GVS status and emergency button, profile tabs, contacts, and stats dashboard.",
              "The PRD's two-column card layout and persistent bottom nav were roughed in here. Grayscale intentionally — structure first, visuals in the style guide.",
            ],
            images: [
              {
                src: elearaSlide(9),
                alt: "Wireframes — login, home, dashboard, profile, and contacts.",
              },
            ],
          },
          {
            title: "Style guide",
            paragraphs: [
              "Built in parallel with wireframes so the team could produce high-fidelity screens independently without visual drift. Poppins for headings and data (geometric, confident at a glance), Inter for body text (legible at small sizes during an episode).",
              "Palette: soft periwinkle background, dusty blue primary, warm amber accent, deep teal for positive states — clinical but not cold. 8pt grid, 24pt margins, 20pt card gaps, 20pt drop shadows for depth without noise.",
            ],
            images: [
              {
                src: elearaSlide(10),
                alt: "Style guide — typography, color palette, logo, and spacing system.",
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
              "Day 2 opened with a FigmaMake build from a prompt encoding the full PRD — users, GVS mechanic, two-column layout, typography, features, HIPAA requirements, and every required screen.",
              "The draft had solid bones: Dashboard with GVS Score, episode stats, frequency chart, and trend line. Contacts with auto-notify toggles. Profile with personal info, medical records, and settings tabs. My role shifted to feedback synthesis — reviewing screens as they arrived and keeping the team aligned on what needed to change before user testing.",
            ],
            images: [
              {
                src: elearaSlide(12),
                alt: "FigmaMake prompt — encoded PRD requirements for AI-assisted build.",
              },
              {
                src: elearaSlide(13),
                alt: "First draft screens — Dashboard, Contacts, and Profile.",
              },
            ],
          },
          {
            title: "User testing",
            paragraphs: [
              "At hour 36 of 72, we tested with two participants — Tamiko R. and Thania R. — navigating key flows while thinking aloud.",
              "Tamiko valued the home screen status color system but found dashboard cards too visually similar — she wanted distinct identities for GVS Score, Episodes, Duration, and Severe Events so she could scan without reading every label. She also suggested dynamic reminders: if dehydration triggers episodes, the app should suggest hydration, not just display data.",
              "Thania found the interface 'simple in the best way' and valued episode tracking for reflecting on health behavior, not just monitoring it. Both confirmed the core hypothesis: approachable interface, sensible information structure. Refinement problems, not structural ones — exactly what we needed to hear at hour 36.",
            ],
            images: [
              {
                src: elearaSlide(14),
                alt: "User feedback — Participant 1 annotated screens.",
              },
              {
                src: elearaSlide(15),
                alt: "User feedback — Participant 2 annotated screens.",
              },
            ],
          },
          {
            title: "Iterations",
            paragraphs: [
              "Six targeted changes before the final build:",
              "Softer color scheme throughout — less clinical, more companion-like. Proper onboarding flow added (skipped in first draft; essential for health data and device permissions). Emergency button changed to hold-to-trigger — prevents accidental SOS in public without slowing genuine emergencies.",
              "Explicit alert screen for episode detection — visually distinct from passive monitoring. 'Medical records' renamed to 'clinical documents' for clearer data sensitivity expectations. Dashboard card visual identity adjusted per Tamiko's scanning feedback.",
            ],
            images: [
              {
                src: elearaSlide(16),
                alt: "Iterations — before and after login screens.",
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
              "The final login screen shows the full system — periwinkle background, teal logo, Poppins typography, auth toggle, and HIPAA-compliant security certification visible before account creation. Hold-button emergency trigger, onboarding flow, and dynamic reminder concept all incorporated.",
              "Credible, research-backed, user-tested prototype — built from scratch in 72 hours by a remote team of four.",
            ],
            images: [
              {
                src: elearaSlide(17),
                alt: "Day 3 — lifestyle shot with ear device.",
              },
              {
                src: elearaSlide(18),
                alt: "Final login screen with HIPAA certification.",
              },
              {
                src: elearaSlide(19),
                alt: "Final screens — completed prototype.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Eleara is where I learned what leading a design team actually means — not visual craft, but reading the room, making judgment calls under time pressure, and delegating to strengths instead of dividing work arbitrarily. What I'd do differently: ideation took six hours when I'd planned three. I should have capped it harder and trusted Day 2–3 iteration to compensate. What I'm proud of: we ran real user testing at hour 36 when most sprint teams skip it. Tamiko and Thania's feedback made the final product meaningfully better in ways we wouldn't have caught ourselves.",
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

/** Rich layout — same section treatment as Dream Detective / Eleara / Pulse. */
const kitsCaseStudyRich = {
  overview: {
    client: "Academic UX Project (Concept Service)",
    industry: "Community Sharing · Service Design · UX",
    timeline: "3 weeks · Solo",
    role: "UX / product design — research through high-fidelity",
  },
  introParagraphs: [
    "Kits! is a community-driven hobby sharing system — borrow curated kits from a public kiosk, or lend your own equipment for others to try. The goal is lowering the cost of entry for new hobbies without asking anyone to buy gear upfront.",
    "The design problem was service design at scale: two distinct roles, one physical touchpoint, one digital companion, and friction points like approval flows, kit processing, and motivation to participate on both sides.",
  ],
  highlights: [
    {
      label: "The barrier",
      value: "Hobbies require expensive equipment — casual experimentation dies at the checkout line.",
    },
    {
      label: "Two roles",
      value: "Borrowers want quick access; lenders need a reason to contribute kits back to the community.",
    },
    {
      label: "System scope",
      value: "Public kiosk plus mobile interface — shared access model across physical and digital.",
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
    "Borrower and lender flows through the kiosk and companion app — from kit discovery to return and contribution.",
  processWork: {
    sections: [
      {
        title: "Overview",
        blocks: [
          {
            title: "The problem",
            paragraphs: [
              "Many hobbies require expensive equipment, which creates a barrier for people who want to try new activities without committing to a purchase. Existing entry points assume you buy tools first — Kits! proposes shared access instead: temporarily borrow curated hobby kits, or contribute your own for others to use.",
              "Research and journey mapping framed the problem around two primary user archetypes before any screens were drawn.",
            ],
            images: [
              {
                src: kitsHero,
                alt: "Kits! — hobby sharing kiosk concept cover.",
              },
            ],
          },
          {
            title: "Borrowers & lenders",
            paragraphs: [
              "Borrowers want quick access to new activities — browse, reserve, pick up, try, return. Lenders contribute kits to the community and need clear incentives, approval paths, and processing steps that don't feel like unpaid labor.",
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
              "Paper prototyping came before pixel polish. I walked through borrower and lender tasks on physical screens — reservation, pickup, kit intake, and return — to stress-test the flows without high-fidelity distraction.",
              "That pass clarified where the kiosk needed to lead vs. where the app should carry continuity, and which states needed explicit confirmation before moving on.",
            ],
            images: [
              {
                src: kitsPaperPrototypes,
                alt: "Paper prototypes — borrower and lender flow explorations.",
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
              "Low-fidelity wireframes established screen hierarchy and navigation — structure before visual style. Medium-fidelity passes added layout density, component placement, and clearer content blocks for both kiosk and mobile contexts.",
              "Separating borrower and lender paths in wireframes kept permissions and mental models honest — no shared screen pretending two roles see the same thing.",
            ],
            images: [
              {
                src: kitsLowFi,
                alt: "Low-fidelity wireframes — core screens and navigation.",
              },
              {
                src: kitsMedFi,
                alt: "Medium-fidelity wireframes — layout and component structure.",
              },
            ],
          },
          {
            title: "Style guide",
            paragraphs: [
              "The visual system needed to feel approachable and community-forward — bright enough for a public kiosk, legible at arm's length, consistent across touch and mobile. Typography, color, and component rules kept the two interfaces reading as one product.",
            ],
            images: [
              {
                src: kitsStyleGuide,
                alt: "Style guide — color, typography, and UI components.",
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
                alt: "High-fidelity screens — kiosk and mobile app final designs.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Kits! reinforced how service design scales through clarity — two roles, one kiosk, one app. Testing with paper prototypes early saved high-fidelity rework later, and separating borrower vs. lender flows kept permissions and mental models honest.",
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
    "Dairy & Delight is an organic farm brand built around what they call the simple joys of nourishing living — milk, cheese, yogurt, and ice cream delivered direct to customers' homes.",
    "I chose this client over two alternatives because the brief wasn't just 'look fresh and clean.' It was a lifestyle proposition: what you eat and where it comes from matters, and pleasure and integrity belong in the same brand.",
  ],
  highlights: [
    {
      label: "Brand filter",
      value: "All-Natural, Uplifting, Communal — three words that gated every design decision.",
    },
    {
      label: "Logo process",
      value: "100+ sketch iterations before vector — two directions alive, one sun mark chosen.",
    },
    {
      label: "System scope",
      value: "Poster, landing page, and mobile app — one voice across print, web, and product.",
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
              "Before opening Figma, I studied who buys from a farm like this — what they already believe, what it feels like to open their fridge in the morning. Foodies who love the outdoors: people who care about what they eat, feel drawn to the natural world, and treat food as communal, not just functional.",
              "The mission is rooted in real, all-natural food connecting people to the earth and to each other. That richness — lifestyle, not just category — is what made this a design problem worth choosing.",
            ],
          },
          {
            title: "Audience",
            paragraphs: [
              "The audience I designed for values transparency, sustainability, and quality — farm-to-table culture without the pretension. They want a brand that feels like an invitation to the table, not a lecture from a shelf.",
            ],
            images: [
              {
                src: dairyAudience,
                alt: "Audience — foodies who love the outdoors.",
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
              "All-Natural is a visual language — organic textures, earth-born color, forms that aren't perfectly geometric. Uplifting means the brand should make you feel something — actually joyful, not just trustworthy. Communal means inviting you in: a family table, not a store shelf.",
              "If it felt cold or corporate, it failed. If it felt generic-natural, it wasn't uplifting enough. Everything had to land in the overlap of all three.",
            ],
            images: [
              {
                src: dairyVibe,
                alt: "The vibe — All-Natural, Uplifting, and Communal.",
              },
            ],
          },
          {
            title: "Mood boards",
            paragraphs: [
              "I built three boards — one per vibe word — pulling from folk art, community poster design, eco-design, botanical illustration, and bold joyful graphic work. Communal drew from people eating together outdoors. All-Natural from organic typography and botanical reference. Uplifting from the kind of design that makes you smile before you read it.",
              "Where the three boards overlapped was where Dairy & Delight lived — and that territory informed every color, typeface, and illustration choice from here on.",
            ],
            images: [
              {
                src: dairyMoodBoards,
                alt: "Mood boards — Communal, All-Natural, and Uplifting references.",
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
              "I don't start in software — I start in a sketchbook and don't stop until I've explored enough angles to know which direction is right. For Dairy & Delight, that meant over 100 iterations before a single vector: logotypes, icons, literal and abstract marks, dairy and natural imagery, combinations I knew wouldn't work — because exhausting the obvious is how the interesting stuff shows up.",
              "Two directions felt alive. A circular badge with a hand-drawn cow — warm, vintage, inviting. And a sun mark from alternating yellow and magenta rays, reading as both sun and the top of a dairy product. The sun won: bold at any scale, directly Uplifting, joyful without being precious.",
            ],
          },
          {
            title: "Refinement & lockups",
            paragraphs: [
              "Multiple refinement rounds on ray count, proportions, yellow-magenta balance, and wordmark integration. The final system includes the core mark plus five lockups for different contexts.",
              "The wordmark uses a rounded, slightly bouncy serif — warmth without childishness. The ampersand in 'Dairy & Delight' gets hand-lettered treatment. Every round was tested on a milk bottle, app icon, poster, and web header.",
            ],
            images: [
              {
                src: dairyLogoRefinement,
                alt: "Logo refinement tree — mark variants and final lockups.",
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
              "Five colors, each doing specific work: Navy (#06327D) anchors legibility. Cyan (#74DEE6) is air, outdoors, morning light. Magenta (#E01C6F) carries energy and personality. Yellow (#FFD545) is warmth, sunlight, butter, cheese. Milk White (#FFF9EF) is the canvas — warm, never sterile.",
              "Headlines: Sausage Semibold — chunky, friendly, retro joy. Secondary: Poppins Regular. Body: Quicksand Light — airy and legible.",
              "The illustration system — rotary phone, cheese wedge, sunrise, heart — uses Yellow and Magenta two-color pairings so assets read instantly as Dairy & Delight. Playful without cartoonish; built for a kitchen wall or picnic blanket.",
            ],
            images: [
              {
                src: dairyStyleguide,
                alt: "Brand system — logo, color, typography, icons, and illustration.",
              },
            ],
          },
          {
            title: "Three touchpoints, one voice",
            paragraphs: [
              "With the system set, I designed three touchpoints: a print poster, a mobile app, and a landing page. Each serves a different format and purpose — but everything had to feel unmistakably like the same brand across contexts. That consistency across wildly different media is one of the harder problems in brand design.",
            ],
            images: [
              {
                src: dairyTouchpoints,
                alt: "Touchpoints — poster, landing page, and mobile app.",
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
              "The poster went through the most exploration. In class I applied ten visual principles to the same brief — Focus the Eye, Overwhelm, Simplify, Overlap, Assault the Surface, Activate the Diagonal, Manipulate Scale, Text as Image, Amplify, Tell a Story — two iterations each, twenty concepts by hand.",
              "The principle I kept returning to was Text as Image: words becoming the visual — 'Taste Delight' as 3D Swiss cheese, or wrapping a spiraling ice cream cone. The final poster I'm most proud of: a waffle cone with a cherry on top, 'TASTE DELIGHT' in Magenta following the spiral. Typography animates the object. Joy before you've read a word.",
            ],
            images: [
              {
                src: dairyPosterPrinciples,
                alt: "Poster explorations — ten design principles exercise grid.",
              },
              {
                src: dairyPosterFinals,
                alt: "Three final poster designs — cheese text, ice cream cone, and diagonal type.",
              },
              {
                src: dairyPosterFull,
                alt: "Final poster — ice cream cone with spiral typography.",
              },
              {
                src: dairyPosterMockup,
                alt: "Poster in context — framed print in a cafe setting.",
              },
            ],
          },
          {
            title: "Landing page",
            paragraphs: [
              "Translating brand energy to the web without flattening it. I sketched three layout directions before committing. The final blends doodle warmth with a cards layout: clean grid, wavy brand border, illustrations anchoring each feature section.",
              "Hero leads with the ice cream cone poster — double duty as brand hero. Three pillars below: Fresh Dairy Delivered, Visit Our Farm, Recipes for Simple Joy. Testimonial on yellow wave. Footer grounded in Navy.",
            ],
            images: [
              {
                src: dairyLanding,
                alt: "Landing page — layout sketches, poster reference, and full scroll mockup.",
              },
            ],
          },
          {
            title: "Mobile app",
            paragraphs: [
              "Three core sections: Discover (products and farm process), Create (recipes and guides using Dairy & Delight products), and Access (member privileges — early releases, farm tours, seasonal boxes).",
              "Natural progression: discover the brand, engage through cooking, deepen through membership. Sky-blue home with cloud quality, large pill CTAs, full-bleed illustrations per section, wavy header border tying app to web and poster.",
            ],
            images: [
              {
                src: dairyMobileScreens,
                alt: "Mobile app — Home, Discover, Create, and Access screens.",
              },
              {
                src: dairyMobileDevices,
                alt: "Mobile app — home and Access screens on device.",
              },
              {
                src: dairyMobileDevice1,
                alt: "Mobile app — home screen on iPhone.",
              },
              {
                src: dairyMobileDevice2,
                alt: "Mobile app — Discover and Create on iPhone.",
              },
            ],
          },
          {
            title: "Final deliverable",
            paragraphs: [
              "Poster, landing page, and app together — one visual voice from print to pocket. The system holds because the emotional filter was set before the first pixel: all-natural, uplifting, communal.",
            ],
            images: [
              {
                src: dairyAllTouchpoints,
                alt: "Final deliverable — poster, landing page, and mobile app together.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "This was my first serious brand design project — and where my fine arts training showed up in practice. Color theory isn't palette picking; it's emotional weight, relationships between hues, harmony and tension as tools. The poster is what I'm most proud of: not because it's the most structurally complex piece, but because you look at it and feel the joy of ice cream. That's the goal — not to describe the product, but to make you feel it. Next I'd design the packaging system — milk bottle, cheese wrapper, ice cream pint — the illustration system is already built for it.",
};
/** Project Pulse */
const PL = `${P}/Pulse`;
const pulseScreen = (time) => `Screenshot 2026-05-10 at ${time}\u202fPM.png`;
const pulseHero = `${PL}/${pulseScreen("4.28.02")}`;
const pulseScreen2 = `${PL}/${pulseScreen("4.29.59")}`;
const pulseScreen3 = `${PL}/${pulseScreen("4.30.11")}`;

const pulseDeckPdf = {
  label: "Full slide deck · PDF",
  href: `${PL}/Pulse Slide Deck.pdf`,
};

const pulseCaseStudyRich = {
  overview: {
    client: "Concept · Smart Mirror Fitness (Academic)",
    industry: "Health / Fitness · Gesture UX · Habit Formation",
    timeline: "Multi-week · Solo",
    role: "UX research, interaction design, prototyping",
  },
  introParagraphs: [
    "Pulse is a smart-mirror fitness companion for student athletes — personalized workout plans, calendar-aware scheduling, and distance-friendly gesture controls so you can start a session without touching a screen.",
    "The project spans research, habit-formation framing, usability testing, and a fully interactive prototype exploring pinch-to-select, dwell interactions, and Google Calendar integration for finding real workout windows between classes.",
  ],
  highlights: [
    {
      label: "Core idea",
      value: "A mirror that coaches you — not another phone app fighting for attention between lectures.",
    },
    {
      label: "Key interaction",
      value: "AirTap gestures — point, pinch, and dwell so sweaty hands never need the glass.",
    },
    {
      label: "Smart scheduling",
      value: "Google Calendar sync to surface open slots for workouts in a packed student week.",
    },
    {
      label: "Shipped artifact",
      value: "Live interactive prototype — onboarding through workout completion, in the browser.",
    },
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: true,
  showDeckEmbed: false,
  videos: [],
  livePrototype: {
    href: "https://jsaputraixd.github.io/Pulse/",
    label: "Open Pulse prototype",
    intro:
      "Hi, welcome to Pulse — your smart mirror workout buddy! Fully interactive concept: onboarding, personalized plans, calendar sync, gesture tutorials, and a complete workout loop.",
  },
  processWork: {
    sections: [
      {
        title: "Overview",
        blocks: [
          {
            title: "Problem & opportunity",
            paragraphs: [
              "Student athletes know consistency matters — but motivation drops when workouts feel bolted onto an already overloaded schedule. Most fitness tools assume you'll open a phone app, log in, and manually plan around classes and meetings.",
              "Pulse reframes fitness as ambient coaching on a shared dorm mirror: quick sessions, calendar-aware suggestions, and interactions designed for distance — not touch.",
            ],
          },
          {
            title: "Research & testing",
            paragraphs: [
              "Research covered fitness-tech habit formation, prototyping plans, and moderated usability sessions. Testing surfaced where gesture tutorials needed to be clearer, how users interpreted plan recommendations, and what 'good enough' scheduling felt like when calendar data was sparse.",
              "Full research artifacts live in the project deck — this page is a visual snapshot while the written case study is still in progress.",
            ],
          },
        ],
      },
      {
        title: "Design",
        blocks: [
          {
            title: "Mirror experience",
            paragraphs: [
              "The UI system balances glanceability at mirror distance with playful energy — sky gradients, bold plan cards, and a workout loop that keeps form feedback and rest timers legible from across the room.",
              "Selected screens below; the live prototype is the best way to feel the gesture layer and end-to-end flow.",
            ],
            images: [
              {
                src: pulseHero,
                alt: "Pulse — smart mirror home and personalized plans.",
              },
              {
                src: pulseScreen2,
                alt: "Pulse — onboarding and calendar connection.",
              },
              {
                src: pulseScreen3,
                alt: "Pulse — workout session and gesture controls.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Pulse is the project closest to where I want my career to go — product UX that meets people in physical space, not just on a phone. The live prototype is early and imperfect, but it proves the loop: onboard, connect your calendar, pick a plan, and work out with gestures that actually make sense at arm's length. Next I'd validate whether calendar-suggested slots change real adherence in a dorm setting.",
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
    "Pawfect Match is a playful dating-style app for pet owners — swipe, match, and meet up for park hangs based on compatible pets and personalities.",
    "Early exploration focused on making pet profiles feel warm and trustworthy without turning into a generic social clone. Case study copy coming soon — for now, the visuals tell most of the story.",
  ],
  highlights: [
    {
      label: "Hook",
      value: "Match on pets first — owners second.",
    },
    {
      label: "Tone",
      value: "Friendly, bright, and approachable — built for dog-park energy.",
    },
  ],
  base: PF,
  imageFiles: pawfectImages,
  blockParagraphs: [
    "Screen explorations, mockups, and presentation boards from the Pawfect Match concept. Full narrative write-up on the way.",
  ],
  conclusion:
    "Placeholder reflection — I'll expand this once the case study script is written. The visual direction holds up; next step is validating whether matching on pet temperament actually changes meetup quality.",
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
    "Safe Space is a note-taking and reflection app concept — a calmer place to capture thoughts, track emotional check-ins, and revisit patterns without the noise of a general-purpose notes tool.",
    "Wireframes and user flows explore how little friction you can keep between 'I need to write this down' and actually doing it. Detailed case study text is still in progress.",
  ],
  highlights: [
    {
      label: "North star",
      value: "Private, gentle, and fast — journaling without performance.",
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
    "Early work — placeholder reflection until the full write-up lands. The interaction model prioritizes speed and emotional safety over feature breadth.",
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
    "ShiftOff helps knowledge workers actually disconnect — ritual builders, rumination redirects, and a morning review that closes the loop on what you carried home from work.",
    "The concept treats 'logging off' as a designed behavior, not a willpower test. Slide deck and narrative still in progress; images below are the current artifact set.",
  ],
  highlights: [
    {
      label: "Problem",
      value: "Work follows you home — notifications, open loops, and Sunday scaries.",
    },
    {
      label: "Mechanic",
      value: "End-of-day rituals + vault-locked work apps until morning review.",
    },
  ],
  base: SO,
  imageFiles: shiftOffImages,
  blockParagraphs: [
    "High-fidelity screens and device mockups from the ShiftOff concept — onboarding hurdles through dashboard, settings, and handoff flows.",
  ],
  conclusion:
    "Placeholder reflection — ShiftOff is about making boundaries feel supportive instead of punitive. I'd next test whether ritual prompts change after-hours Slack checking in a real cohort.",
});

/** CCA Pathfinding */
const CCA = `${P}/CCA Pathfinding`;
const ccaHero = `${CCA}/30.jpg`;
const ccaImages = Array.from({ length: 29 }, (_, i) => `${30 + i}.jpg`);

const ccaPathfindingCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "CCA · Pathfinding Design Program",
    industry: "Education · Career Design · Service Design",
    timeline: "Program project · Team",
    role: "Visual / interaction design",
  },
  introParagraphs: [
    "CCA Pathfinding is a program-scale exploration of how art and design students navigate career uncertainty — mapping services, touchpoints, and interventions across the Pathfinding curriculum.",
    "This gallery collects presentation slides from the project. Written case study context is coming later; treat this as a visual archive for now.",
  ],
  highlights: [
    {
      label: "Scope",
      value: "Program-level service design — not a single app screen.",
    },
    {
      label: "Audience",
      value: "CCA students finding their creative path without a linear roadmap.",
    },
  ],
  base: CCA,
  imageFiles: ccaImages,
  blockParagraphs: [
    "Full slide sequence from the CCA Pathfinding presentation — research synthesis through proposed interventions.",
  ],
  conclusion:
    "Placeholder reflection — Pathfinding work sits at the intersection of education design and career anxiety. I'll add the full narrative when the layout doc is ready.",
});

export const projects = [
  {
    id: 1,
    title: "Dream Detective",
    category: "iOS App",
    tagline: "Cracking the Sleep Code.",
    description:
      "A narrative alarm app for college students — wake up to unlock the next clue, or snooze and lose today's chapter forever.",
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
    tagline: "A predictive vestibular companion.",
    description:
      "A wearable + app that uses galvanic vestibular stimulation to counter dizziness — built in a 72-hour remote sprint with user testing at hour 36.",
    tags: ["UX Design", "Product Design", "Systems Design", "Team Lead"],
    slug: "eleara",
    thumb: elearaHero,
    caseStudyHero: elearaHero,
    caseStudyGallery: [],
    caseStudyDeckPdf: elearaDeckPdf,
    caseStudyRich: elearaCaseStudyRich,
  },
  {
    id: 3,
    title: "Kits!",
    category: "Product Design",
    tagline: "Try new hobbies without commitment.",
    description:
      "Kits! needed a system that allowed people to easily try new hobbies without committing to expensive equipment purchases. Existing hobby entry points require buying tools upfront, creating a barrier for casual experimentation. I designed a kiosk-based sharing platform and mobile interface that lets users borrow or lend curated hobby kits — lowering the cost of entry while encouraging community participation and discovery of new activities.",
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
    tagline: "Simple joys of nourishing living.",
    description:
      "Organic farm brand identity across poster, web, and app — all-natural, uplifting, communal, from 100+ logo sketches to final touchpoints.",
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
    tagline: "Your smart mirror workout buddy.",
    description:
      "Gesture-driven fitness coaching for student athletes — personalized plans, Google Calendar-aware scheduling, and a live interactive prototype built for the mirror, not the phone.",
    tags: ["UX Design", "Product Design", "Prototyping", "Research"],
    slug: "pulse",
    thumb: pulseHero,
    caseStudyHero: pulseHero,
    caseStudyGallery: [],
    caseStudyDeckPdf: pulseDeckPdf,
    caseStudyRich: pulseCaseStudyRich,
  },
  {
    id: 6,
    title: "Pawfect Match",
    category: "Mobile App",
    tagline: "Swipe right for your pet's new best friend.",
    description:
      "A playful pet-matching app concept — connect owners and pets for park meetups through warm profiles and swipe-first discovery.",
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
    tagline: "Notes that feel like a deep breath.",
    description:
      "A reflection and note-taking concept — private, gentle capture for thoughts and emotional check-ins without productivity-app noise.",
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
      "A work-life boundary app concept — end-of-day rituals, rumination redirects, and morning review to help knowledge workers disconnect.",
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
    category: "Service Design",
    tagline: "Designing the path through pathfinding.",
    description:
      "Program-scale service design for CCA Pathfinding — helping art and design students navigate career uncertainty with clearer touchpoints and support.",
    tags: ["Service Design", "Visual Design", "Education"],
    slug: "cca-pathfinding",
    thumb: ccaHero,
    caseStudyHero: ccaHero,
    caseStudyGallery: [],
    caseStudyRich: ccaPathfindingCaseStudyRich,
  },
];

const FEATURED_SLUGS = ["eleara", "kits", "dairy-delight", "dream-detective"];

export const featuredProjects = FEATURED_SLUGS.map((slug) =>
  projects.find((p) => p.slug === slug)
).filter(Boolean);

export const archiveProjects = projects.filter(
  (p) => !FEATURED_SLUGS.includes(p.slug)
);

/** All image paths for a project — used by Other stuff archive folders. */
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
