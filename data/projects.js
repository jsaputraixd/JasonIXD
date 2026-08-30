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
  scan,
  base,
  imageFiles,
  blockParagraphs,
  conclusion,
  nextSteps,
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
                title: "Artifacts",
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
    scan: scan ?? null,
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
    nextSteps,
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
  scan: {
    project: "Episodic audio mystery used as an alarm.",
    problem: "No stake at wake-up; oversleeping costs nothing.",
    role: null,
    hard: "Pairing story pull with real loss, not another streak counter.",
    change: "Cold Trail: snooze once and that morning's chapter is gone.",
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
  ],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
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
    "Interactive Figma prototype: spatial Office navigation and both wake-up outcomes, Intel Secured or locked out.",
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
              "Each morning unlocks the next audio clue in an ongoing case. Snooze triggers Cold Trail: that chapter locks permanently. You don't fall behind—you miss the beat.",
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
              "Wellness defaults to clean minimalism; this needed film-noir atmosphere and adventure-game UI. Typewriter typography reinforces the case-file metaphor.",
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
              "Version 1 was a minimal alarm and clue reveal—indistinguishable from competitors. Version 2 sold the world through the Office, Evidence Board, and Stakeout sleep audio.",
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
              "The morning alarm uses a high-contrast waveform and broadcast-fading copy.",
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
    "The concept is strongest when its fiction, interaction, and visual system all support the same behavioral decision.",
  nextSteps:
    "Test whether narrative FOMO beats a loud beep with real sleepy humans, then study whether a social Detective Rank strengthens the habit or ruins the solo mystery.",
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
  scan: {
    project: "Predictive vestibular companion: ear device plus app.",
    problem: "Vestibular episodes escalate before people can get help.",
    role: null,
    hard: "Zero to user-tested prototype in 72 hours, fully remote.",
    change: "Hold-to-SOS, a predictive GVS flow, and a team that stayed on the clock.",
  },
  introParagraphs: [
    "Eleara is a predictive vestibular companion, a wearable plus app that uses galvanic vestibular stimulation to counter dizziness before episodes escalate, and alerts emergency contacts when they do.",
    "Four-person design team: I led process, user-flow architecture, and feedback synthesis.",
  ],
  highlights: [],
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
            ],
            images: [
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
              "It locked the problem, solution, four core features, and accessibility requirements before anyone opened Figma.",
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
              "Grayscale layout pass: content hierarchy and actions per screen, without visual styling.",
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
              "My role shifted to feedback synthesis, reviewing screens as they arrived and aligning the team before hour-36 testing.",
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
              "The final login made HIPAA-compliant security certification visible before account creation.",
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
    "Eleara changed how I lead: establish shared constraints early, delegate by strength, and protect enough time for evidence to change the work.",
  nextSteps:
    "Cap ideation earlier and trust later iteration to compensate, then run another testing round focused on the changes prompted by the first sessions.",
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
  scan: {
    project: "Community hobby-kit sharing through a kiosk and app.",
    problem: "Trying a hobby dies at the checkout line for expensive kit.",
    role: null,
    hard: "Shared screens that pretend both roles see the same thing.",
    change: "Paper-tested borrower and lender flows before high-fidelity rework.",
  },
  introParagraphs: [
    "Kits! is a community-driven hobby sharing system, borrow curated kits from a public kiosk, or lend your own equipment for others to try. The goal is lowering the cost of entry for new hobbies without asking anyone to buy gear upfront.",
    "The design problem was service design at scale: two distinct roles, one physical touchpoint, one digital companion, and friction points like approval flows, kit processing, and motivation to participate on both sides.",
  ],
  highlights: [],
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
              "Existing entry points assume you buy tools first. Research and journey mapping framed the problem around two archetypes before any screens were drawn.",
            ],
            images: [],
          },
          {
            title: "Borrowers & lenders",
            paragraphs: [
              "Borrowers want quick access to new activities, browse, reserve, pick up, try, return. Lenders contribute kits to the community and need clear incentives, approval paths, and processing steps that don't feel like unpaid labor.",
              "Mapping both journeys exposed where the kiosk must lead, where the app carries continuity, and which states need explicit confirmation.",
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
              "The high-fidelity pass unified kiosk handoff states and role-specific app tasks under one visual voice.",
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
    "The service became clearer when physical handoff and digital continuity were treated as one experience.",
  nextSteps:
    "Test the complete kiosk-to-app handoff with borrowers and lenders, including returns, unavailable kits, and interrupted transactions.",
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
const dairyMobileDevice1 = `${DA}/iPhone 11 Render.png`;

const dairyCaseStudyRich = {
  overview: {
    client: "Project 02 · Visual Interaction Design (Academic)",
    industry: "Organic Food · Brand & Multi-Touchpoint",
    timeline: "3 weeks · Solo",
    role: "Brand identity, illustration, poster, web & app",
  },
  scan: {
    project: "Organic dairy brand across poster, web, and app.",
    problem: "Farm brands default to farmer's-market cliché.",
    role: null,
    hard: "One voice across print, web, and product without visual drift.",
    change: "A sun mark and a poster that feels like ice cream, not a lecture.",
  },
  introParagraphs: [
    "Dairy & Delight is an organic farm brand built around what they call the simple joys of nourishing living, milk, cheese, yogurt, and ice cream delivered direct to customers' homes.",
    "I chose this client over two alternatives because the brief wasn't just 'look fresh and clean.' It was a lifestyle proposition: what you eat and where it comes from matters, and pleasure and integrity belong in the same brand.",
  ],
  highlights: [],
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
              "Transparency and sustainability without pretension—an invitation to the table, not a lecture from a shelf.",
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
              "Three boards pulled from folk art, community posters, botanical illustration, and bold joyful graphics. Their overlap informed every downstream choice.",
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
              "The final uses a waffle cone, cherry, and “TASTE DELIGHT” following the spiral in Magenta. Typography animates the object.",
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
              "The hero reuses the poster art. Three pillars sit below it, followed by a testimonial on a yellow wave and a Navy footer.",
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
                src: dairyMobileDevice1,
                alt: "Mobile app, home screen on iPhone.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "This was my first serious brand design project and where my fine arts training became practical. The poster is the strongest result because it communicates the joy of ice cream before it explains the product.",
  nextSteps:
    "Extend the illustration system across packaging: milk bottles, cheese wrappers, and ice-cream pints.",
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
  scan: {
    project: "Adaptive fitness coaching on a smart mirror, not a phone.",
    problem: "Student athletes skip gyms because plans ignore their week and sweaty hands.",
    role: null,
    hard: "Coaching that fits a real calendar, and gestures that work mid-workout.",
    change: "AirTap instead of touch, calendar-aware plans, a live demo of the full loop.",
  },
  introParagraphs: [
    "Pulse is a smart-mirror fitness companion for busy students: personalized plans, calendar-aware slots, and AirTap gestures so sweaty hands never have to touch the glass.",
    "Three-person team: I led design, synthesis, the visual system, and the working prototype.",
  ],
  highlights: [],
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
    "Recorded browser demo with gesture friction visible at workout distance.",
  livePrototype: {
    href: "https://jsaputraixd.github.io/Pulse/",
    label: "Open live Pulse demo",
    intro: null,
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
              "I built the browser demo to stress-test ten-foot type, rest-timer collisions, and gesture logic under real interaction.",
              "The rest timer collided with navigation, and the gesture logic was clever enough to exit workouts by accident.",
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
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Pulse confirmed that I want to keep working where interface decisions must survive distance, bodies, and physical context.",
  nextSteps:
    "Unify AirTap into one selection gesture, enlarge type for ten-foot reading, and test whether calendar-suggested workout slots change behavior.",
};

/** Pawfect Match */
const PF = `${P}/Pawfect`;
const pawfectHero = `${PF}/Pawfect Match.png`;
const pawfectImages = [
  "Pawfect Match-01.png",
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
  scan: {
    project: "A pet meetup app. Swipe on dogs, then meet at the park.",
    problem: "Pet hangouts are chaos. Matching on owners first makes it worse.",
    role: "Solo UX and UI.",
    hard: "Warm profiles that don't turn into LinkedIn for Labs.",
    change: "Pets first, owners second.",
  },
  introParagraphs: [
    "Playful dating-app energy for pet people—profiles that feel warm, not corporate.",
  ],
  highlights: [
    {
      label: "Tone",
      value: "Friendly, bright, and approachable, built for dog-park energy.",
    },
  ],
  base: PF,
  imageFiles: pawfectImages,
  blockParagraphs: [
    "Screens across onboarding, pet profiles, the swipe stack, and deck presentation.",
  ],
  conclusion:
    "The current concept establishes a coherent visual direction, but the matching premise still needs behavioral validation.",
  nextSteps:
    "Test whether matching on temperament makes park meetups less chaotic, or merely more politely chaotic.",
});

/** Safe Space */
const SS = `${P}/Safe Space`;
const safeSpaceHero = `${SS}/SafeSpace.png`;
const safeSpaceImages = [
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
  scan: {
    project: "A private notebook for check-ins, not streak counters.",
    problem: "Notes apps are built for tasks. Feelings get treated like inbox zero.",
    role: "Solo UX and UI.",
    hard: "Almost no friction between 'I need to write this down' and doing it.",
    change: "User flow, wireframes, and a calmer visual direction.",
  },
  introParagraphs: [
    "A calmer notes surface for capturing thoughts and spotting patterns without the noise of a general-purpose tool.",
  ],
  highlights: [
    {
      label: "North star",
      value: "Private, gentle, and fast, journaling without performance.",
    },
  ],
  base: SS,
  imageFiles: safeSpaceImages,
  blockParagraphs: [
    "Wireframes, user flow diagrams, and high-fidelity screen explorations.",
  ],
  conclusion:
    "The artifacts define a focused capture flow; they cannot yet show whether it feels supportive during a difficult moment.",
  nextSteps:
    "Run real writing sessions to validate the interaction before adding another visual layer.",
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
];

const shiftOffCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Work-life Boundaries (Academic)",
    industry: "Wellness · Productivity · Service Design",
    timeline: "Multi-week · Solo",
    role: "UX / product design",
  },
  scan: {
    project: "End-of-day rituals so logging off actually means it.",
    problem: "Work follows you home: notifications, open loops, Sunday scaries.",
    role: "Solo UX and product design.",
    hard: "Making disconnect feel like care, not a prettier guilt trip.",
    change: "Rituals plus vault-locked work apps until morning review.",
  },
  introParagraphs: [
    "ShiftOff treats logging off as a designed behavior, not a willpower test.",
  ],
  highlights: [],
  base: SO,
  imageFiles: shiftOffImages,
  blockParagraphs: [
    "High-fidelity screens and device mockups from the ShiftOff concept, onboarding hurdles through dashboard, settings, and handoff flows.",
  ],
  conclusion:
    "Designing for disengagement means evaluating what people do after the interface disappears, not how long they remain inside it.",
  nextSteps:
    "Test whether the end-of-day rituals actually reduce after-hours Slack checking.",
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
  scan: {
    project: "First-floor wayfinding for a campus people get lost in.",
    problem: "Two numbering systems and prefixes that don't match ground-level walking.",
    role: null,
    hard: "Ground-level codes that match how you actually walk the hall.",
    change: "Airport-style hallway prefixes on an entrance-facing map.",
  },
  introParagraphs: [
    "New students get lost. I did. So did a lot of the people I interviewed. The front gate is locked. You walk around to the back of the main building, which nobody tells you.",
    "Inside, the portal map is the real system, and it still sends you hunting room by room. I scoped the first floor only.",
  ],
  highlights: [
    {
      label: "What broke",
      value: "4 out of 5 interviewees said room codes cause navigational issues.",
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
              "When lost, people pull the portal map. Homeroom, bathrooms, and the Nave came up in almost every interview.",
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
              "Digibop for voice, Quicksand for legibility. Purple, pink, cyan. Three sign types: entrance kiosk, crossway totem, and long-hall hanging pair.",
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
    "Interviews revealed that orientation and naming—not visual polish alone—were the core wayfinding problems.",
  nextSteps:
    "Install a full-size totem in the Nave and observe first-years at rush hour.",
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
  scan: {
    project: "An iPad AR mystery. Scan the room, follow the cues, catch the cook.",
    problem: "AR that explains itself with UI chrome instead of the world.",
    role: "Solo. Narrative, 3D, AR interaction.",
    hard: "Wayfinding with audio, light, and geometry. Almost no menus.",
    change: "Image-anchored scenes and invisible room-to-room triggers.",
  },
  introParagraphs: [
    "A Fowl Play turns an iPad into a detective kit—scan the room, step into a mystery, and catch the cook.",
    "Built in Reality Composer with RealityScan assets and Blender cleanup.",
  ],
  highlights: [
    {
      label: "VO",
      value: "ElevenLabs narration for scene handoffs.",
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
            "Tone-setter: look around, hear the monologue, walk to the door.",
          ],
          images: projectImages(AFP, [
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
  videosIntro: "Playthroughs from restaurant exploration through in-person testing.",
  conclusion:
    "Watching people solve the mystery through intuition showed that the environmental cues were carrying the experience.",
  nextSteps:
    "Stress-test the image anchors in brighter, busier rooms.",
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
  scan: {
    project: "Voice and screen companion wired to a physical pill dispenser.",
    problem: "Missed doses are a system problem, not a willpower poster.",
    role: null,
    hard: "Bridging app logic to hardware without turning it into a lecture.",
    change: "Soft reminders and a swinging door that hands you the dose.",
  },
  introParagraphs: [
    "Half of people with chronic conditions miss doses.",
  ],
  highlights: [
    {
      label: "Insight",
      value: "Flexibility beats rigid schedules for messy real routines.",
    },
    {
      label: "Form",
      value: "Funnel refill and status through an LED window.",
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
  videosIntro: "Prototype dispense and voice loops.",
  conclusion:
    "Voice interactions demand patience, while physical prototypes expose constraints that screen flows can hide.",
  nextSteps:
    "Complete a tighter industrial-design pass after the interaction model and servo behavior stabilize.",
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
  scan: {
    project: "A systems deck on what streets cost when people aren't the point.",
    problem: "Car-first design, then blame the pedestrian.",
    role: null,
    hard: "Making leverage points readable without a policy lecture.",
    change: "Iceberg models and a goal flip: safe human access over throughput.",
  },
  introParagraphs: [
    "The Price for Concrete asks what we actually pay when streets are engineered for cars first and people second. Not the asphalt invoice. The human one.",
    "Boards first—the argument is in the sequence.",
  ],
  highlights: [
    {
      label: "Spark",
      value: "Raquel Nelson's case: a family crossing after dark, and a system that criminalized the pedestrian.",
    },
  ],
  base: CN,
  imageFiles: concreteSlides.slice(1),
  blockParagraphs: [],
  conclusion:
    "Slide 11, “Changing the Goal,” is where the deck stops diagnosing and starts prescribing.",
  nextSteps:
    "Test whether the sequence persuades readers without a presenter supplying the argument.",
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
  scan: {
    project: "Your photo, sliced into a pop-up book you can tilt around.",
    problem: "A still image keeps the look and throws away the feeling of standing there.",
    role: null,
    hard: "Depth on the phone. Nothing leaves the device.",
    change: "Capture to paper cutouts in the browser, WebGPU with a WASM fallback.",
  },
  introParagraphs: [],
  highlights: [],
  base: FL,
  imageFiles: ["flippy-flow.png", "flippy-tech.png"],
  blockParagraphs: [
    "Process boards for the Flippy loop. Drop real device captures into this folder anytime. The live app is the proof.",
  ],
  conclusion:
    "The browser prototype proved that estimated depth can become an interaction rather than a post-processing effect.",
  nextSteps:
    "Refine the cutouts, add richer paper textures, and design a shareable moment format.",
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
  scan: {
    project: "Daily bluffing trivia inside a Reddit post. One truth, three lies.",
    problem: "A game that has to read in a feed and still feel like a party when you expand it.",
    role: null,
    hard: "Fair daily play for a public sub under 200 people, and lies that don't give themselves away.",
    change: "A sequential ten, a sticker system, and a writer that stopped wrapping tells in parentheses.",
  },
  introParagraphs: [
    "Designed for Reddit's Games with a Hook hackathon: loop, sticker system, and identity.",
  ],
  highlights: [
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
    intro: "Play today's ranked 10 in r/who_fiddled_dev.",
  },
  extraVideosAfterSection: "Playing it",
  extraVideosTitle: "The tap, the miss, the hit",
  extraVideosIntro: null,
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
              "If the first card does not feel tappable, nobody reaches Today's 10.",
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
    "The quality of the lies, not additional mechanics, is the game's central content challenge.",
  nextSteps:
    "Grow the prompt packs and study which lies actually fool people.",
};

/** Tama desk companion */
const TM = `${P}/Tama`;
const tamaHero = `${TM}/tama-hero-desk.jpg`;
const tamaAsset = (name) => `${TM}/${name}`;

const tamaCaseStudyRich = {
  overview: {
    client: "Independent project · CCA Hybrid Lab",
    industry: "Physical computing · Ambient interaction",
    timeline: "August 11 to 28, 2026 · Solo",
    role: "Product design, interaction, industrial design, prototyping",
  },
  scan: {
    project:
      "I built a physical companion with the presence of an object and the intelligence of a computer.",
    problem:
      "A corner-of-the-screen assistant would eat the workspace it was supposed to help with.",
    role: "I designed the behavior, the body, and the conversation loop so vision, voice, and face felt like one character.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Tama sits on the desk, watches the work in front of you, and answers out loud. I built it to test whether intelligence feels different when it has a body, a face, and a place in the room.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
  showDeckEmbed: false,
  videos: [
    {
      kind: "file",
      src: `${TM}/tama-demo-illustrator.mp4`,
      label: "Tama responds to work in Adobe Illustrator",
      layout: "wide",
      autoplaySound: true,
    },
    {
      kind: "file",
      src: `${TM}/tama-demo-outfit.mp4`,
      label: "Tama gives contextual outfit feedback",
      layout: "wide",
      autoplaySound: true,
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  extraVideos: [
    {
      kind: "file",
      src: `${TM}/tama-state-idle.mp4`,
      label: "Idle / observing",
      layout: "tile",
      loop: true,
    },
    {
      kind: "file",
      src: `${TM}/tama-state-listening.mp4`,
      label: "Listening",
      layout: "tile",
      loop: true,
    },
    {
      kind: "file",
      src: `${TM}/tama-state-thinking.mp4`,
      label: "Thinking",
      layout: "tile",
      loop: true,
    },
    {
      kind: "file",
      src: `${TM}/tama-state-speaking.mp4`,
      label: "Speaking",
      layout: "tile",
      loop: true,
    },
    {
      kind: "file",
      src: `${TM}/tama-state-sleep.mp4`,
      label: "Mute / sleep",
      layout: "tile",
      loop: true,
    },
  ],
  extraVideosAfterSection: "Final product",
  extraVideosTitle: "States and physical controls",
  extraVideosIntro: null,
  modelViewerAfterSection: "Final product",
  modelViewer: {
    title: "Explore Tama",
    intro:
      "I included an exterior and a cutaway so you can rotate the product or inspect its internal construction.",
    variants: [
      {
        label: "Exterior",
        src: `${TM}/tama-body-v6.glb`,
        alt: "Interactive 3D model of Tama's complete exterior.",
      },
      {
        label: "Cutaway",
        src: `${TM}/tama-cutaway-v6.glb`,
        alt: "Interactive cutaway model showing Tama's internal components and numbered callouts.",
      },
    ],
  },
  processWork: {
    sections: [
      {
        title: "Final product",
        blocks: [],
      },
      {
        title: "The starting point",
        blocks: [
          {
            title: "Giving visual intelligence a body",
            paragraphs: [
              "I started from Gemini Robotics because it could recognize objects and understand a changing scene, not just respond to text. I asked how that awareness could become a companion you can see, hear, and interact with in the same space — not another assistant.",
              "I built Tama as an experiment in embodiment. I connected visual understanding, conversation, expression, and physical form so the intelligence felt like one character rather than a collection of features.",
            ],
            images: [],
            videos: [
              {
                kind: "file",
                src: `${tamaAsset("tama-first-software-test.mp4")}?v=2`,
                poster: tamaAsset("tama-first-software-test.jpg"),
                label: "First software test",
                layout: "wide",
                autoplaySound: true,
              },
            ],
          },
        ],
      },
      {
        title: "Why physical",
        blocks: [
          {
            title: "Presence cannot be pinned to a corner",
            paragraphs: [
              "I considered making Tama a digital character that lived in the corner of the desktop. That would have been easier, but it would permanently consume screen space and compete with the work it was supposed to support.",
              "I made Tama physical so its face could meet your gaze, its voice could come from a place in the room, and it could stay present when the screen changed. That spatial continuity made the exchange feel more personal than talking to another panel inside the computer.",
            ],
            images: [
              {
                src: tamaAsset("tama-digital-vs-physical.png"),
                alt: "Comparison between a digital companion occupying the laptop screen and Tama existing as a separate presence in the room.",
              },
            ],
          },
        ],
      },
      {
        title: "Designing behavior",
        blocks: [
          {
            title: "Every state needed an answer",
            paragraphs: [
              "I mapped the end-to-end behavior before designing the expressions so every transition, fallback, and control response had a face state to communicate it.",
              "I designed each expression in Figma and mapped it to a system state. I used an open-source robotics face framework as the animation foundation, then used AI-assisted coding to integrate the state logic into the working software.",
            ],
            diagram: "behavior",
            images: [
              {
                src: tamaAsset("tama-face-states.png"),
                alt: "Complete Tama face system: idle, listening, thinking, speaking, blink, directional glances, sleep, wake, and wake-look reactions.",
              },
            ],
          },
        ],
      },
      {
        title: "Conversation design",
        blocks: [
          {
            title: "Latency is part of the personality",
            paragraphs: [
              "I treated response time as a design constraint because long pauses break the feeling of a conversation. I used Edge TTS and tuned the pipeline to keep the delay as short as possible without sacrificing the quality of the answer.",
              "I made Tama acknowledge the wait instead of going silent. I constrained responses to stay concise, personal, and expressive, using BMO from Adventure Time as the personality reference: playful and emotionally present, but still useful.",
            ],
            skim: "wait",
            images: [],
          },
          {
            title: "Measured wait",
            paragraphs: [
              "I timed the first successful Gemini call at 9.97 seconds of model time. I set thinking to minimal on the same frame to cut that to 4.05 seconds — about 59% faster thinking, with thinner scene detail as the tradeoff.",
              "I did not make the cloud faster by making Tama physical. I used trigger-only vision, a downscaled screenshot, local STT, and a face plus fillers so an 8–10 second wait felt like a creature thinking instead of a spinner.",
            ],
            skim: "latency",
            images: [],
          },
          {
            title: "API footprint",
            paragraphs: [
              "I kept the cloud cheap so Tama could stay a prototype. 40 requests over 28 days, every one succeeded, 9 cents on the chart.",
            ],
            skim: "api",
            images: [],
          },
        ],
      },
      {
        title: "Building the body",
        blocks: [
          {
            title: "Nine passes to make the form work",
            paragraphs: [
              "This was my first time designing a complete object in 3D. I worked through the front, sides, base, button opening, speaker grilles, and rear access as one form so the enclosure was not just a box around the electronics.",
            ],
            images: [
              {
                src: tamaAsset("tama-cad-iterations.jpg"),
                alt: "Nine CAD iterations developing Tama's enclosure, base, openings, speaker grilles, and rear hatch.",
              },
            ],
          },
          {
            title: "Designing from the inside out",
            paragraphs: [
              "I modeled every physical component at its real dimensions before printing so the display, Pico, speaker, controls, and wiring space became constraints inside the CAD model. I checked the real display against its digital stand-in before committing to the shell.",
              "I turned the rear hatch into a removable access panel and a sticky-note holder so a maintenance requirement became part of the desk experience.",
            ],
            images: [
              {
                src: tamaAsset("tama-hardware-development-v2.jpg"),
                alt: "Component-fit process from internal CAD and scale checks to the wired display and rear hatch.",
              },
            ],
          },
          {
            title: "From model to first fit",
            paragraphs: [
              "I printed the enclosure, learned to solder at the CCA Hybrid Lab, assembled the electronics, and installed everything in the shell. The first full print fit correctly, which validated the component measurements and internal layout before final assembly.",
            ],
            images: [],
            videos: [
              {
                kind: "file",
                src: tamaAsset("tama-printing.mp4"),
                label: "Printing the enclosure",
                layout: "wide",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "I had to make interaction design, industrial design, electronics, and conversation timing work as one system.",
  nextSteps:
    "I want to compare Tama with a screen-based version to test whether physical form changes how people engage with the same intelligence.",
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
    cardLine: "Wearable plus app that steadies dizziness before it hits.",
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
    cardLine: "Kiosk and app for borrowing hobby gear instead of buying it.",
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
    cardLine: "Organic dairy brand with farm charm and none of the kitsch.",
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
    cardLine: "Adaptive fitness mirror built around habit formation.",
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
    cardLine: "Campus wayfinding for a tangled art-school building.",
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
    cardLine: "Voice and screen companion wired to a physical pill dispenser.",
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
  {
    id: 15,
    title: "Tama",
    category: "Desk Companion",
    tagline: "A pet on the desk, not another tab.",
    cardLine: "Contextual feedback without leaving the work in front of you.",
    description:
      "A physical desk companion that can understand the workspace, answer aloud, and make its attention and privacy states visible.",
    tags: ["Product Design", "Interaction Design", "Physical Computing", "Voice UX"],
    slug: "tama",
    thumb: tamaHero,
    caseStudyHero: tamaHero,
    caseStudyGallery: [],
    caseStudyRich: tamaCaseStudyRich,
  },
];

const FEATURED_SLUGS = [
  "tama",
  "pulse",
  "eleara",
  "cca-pathfinding",
  "adherence",
  "kits",
];

/** Desktop 2×3: original 2×2 on the left, newer cards in the right column. */
const DESKTOP_FEATURED_SLUGS = [
  "eleara",
  "pulse",
  "tama",
  "adherence",
  "kits",
  "cca-pathfinding",
];

export const featuredProjects = FEATURED_SLUGS.map((slug) =>
  projects.find((p) => p.slug === slug)
).filter(Boolean);

export const desktopFeaturedProjects = DESKTOP_FEATURED_SLUGS.map((slug) =>
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
