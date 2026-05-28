const P = "/images/projects";

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
  videosLayout: "full",
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
const KT_PAPER = `${KT}/Kits! – Paper Prototypes`;

const kitsHero = `${KT}/Kits Cover Image.jpg`;

const kitsPaperPdfs = Array.from({ length: 21 }, (_, idx) => {
  const n = idx + 2;
  return {
    label: `Paper prototype · page ${n}`,
    href: `${KT_PAPER}/Hobby Hole Kiosk Compressed.pdf - Page ${n} of 23.pdf`,
  };
});

const kitsPdfs = [
  { label: "High-fidelity deck · PDF", href: `${KT}/HighFidelity.pdf` },
  { label: "User flow · PDF", href: `${KT}/Kits! UserFlow.pdf` },
  { label: "Process notes · PDF", href: `${KT}/ProcessNotes.pdf` },
  { label: "Style guide · PDF", href: `${KT}/StyleGuide.pdf` },
  ...kitsPaperPdfs,
];

/** Rich layout: overview, narrative sections, embeds (used by work/[slug] when present). */
const kitsCaseStudyRich = {
  overview: {
    client: "Academic UX Project (Concept Service)",
    industry: "Community Sharing / Service Design / UX",
    timeline: "3 Weeks",
    role: "UX / Product Designer",
  },
  introParagraphs: [
    "The Hobby Sharing Kiosk – Kits! project explores a community-driven system that allows people to borrow and lend hobby kits through a public kiosk and companion digital interface. Many hobbies require expensive equipment, which creates a barrier for people who want to try new activities without committing to a purchase. The project proposes a shared access model where users can temporarily borrow curated hobby kits or contribute their own kits to the community.",
    "The system was designed around two primary user archetypes: borrowers, who want quick access to new activities, and lenders, who contribute kits for others to use. The design process focused on mapping the journeys of both roles, identifying friction points such as approval flows, kit processing, and motivation to participate. Research, journey mapping, paper prototyping, and wireframing were used to structure the interaction flows and optimize usability.",
  ],
  finalDesign: {
    images: [`${KT}/Kits Cover Image.jpg`, `${KT}/HighFidelity.png`],
  },
  /** YouTube watch/share URLs, or local files under /public (see Borrower/Lender .mov). */
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
  designSolution: [
    {
      title: "Paper Prototypes",
      images: [`${KT}/Paper Prototypes.png`],
    },
    {
      title: "Wireframing",
      images: [`${KT}/LowFidelityWireframes.png`, `${KT}/MediumFidelityWIreframes.png`],
    },
    {
      title: "Style Guide",
      images: [`${KT}/Style Guide.png`],
    },
  ],
  conclusion:
    "Kits! reinforced how service design scales through clarity — two roles, one kiosk, one app. Testing with paper prototypes early saved high-fidelity rework later, and separating borrower vs. lender flows kept permissions and mental models honest.",
};

/** Dairy Delight */
const DA = `${P}/dairy-delight`;
const dairyHero = `${DA}/Hero_Image.png`;

const dairyCaseStudyRich = {
  overview: {
    client: "Academic UX Project (Brand Experience)",
    industry: "Organic Food / Direct-to-Consumer Dairy",
    timeline: "3 Weeks",
    role: "Brand & UX Designer",
  },
  introParagraphs: [
    "Dairy & Delight is an organic dairy farm brand focused on delivering fresh milk, cheese, yogurt, and ice cream directly to consumers. The challenge was to create a brand identity and digital ecosystem that communicates the farm’s values — natural food, community, and connection to the land — while appealing to food-focused consumers who enjoy outdoor lifestyles and farm-to-table culture.",
    "The project involved designing a cohesive brand system and experience across multiple touchpoints, including marketing posters, a landing page, and a mobile app. The goal was to create an uplifting, communal, and all-natural brand presence that strengthens the relationship between the farm and its customers while encouraging engagement with products, recipes, and farm experiences.",
  ],
  finalDesign: {
    images: [
      {
        src: dairyHero,
        alt: "Poster design for Dairy & Delight featuring ice cream and playful brand graphics.",
      },
    ],
  },
  processWork: {
    title: "Process Work",
    blocks: [
      {
        title: "Audience",
        paragraphs: [
          "The primary audience consists of food-focused consumers who value fresh ingredients, outdoor lifestyles, and farm-to-table culture. These users are interested in knowing where their food comes from and prefer products that emphasize transparency, sustainability, and quality.",
        ],
      },
      {
        title: "Visual & emotional direction",
        paragraphs: [
          "The visual and emotional direction of the brand was defined through three core attributes: all-natural, uplifting, and communal. The brand experience is intended to feel welcoming and energetic while reinforcing the authenticity of organic farming.",
        ],
      },
      {
        title: "Mood boards",
        paragraphs: [
          "Mood boards were developed to explore visual inspiration tied to nature, community, and organic agriculture. These references helped establish the tone of the brand and informed decisions around color, typography, and imagery.",
        ],
        images: [`${DA}/Gemini_Generated_Image_m0ocmkm0ocmkm0oc 2.png`],
      },
      {
        title: "Color palette",
        paragraphs: [
          "The color palette uses warm yellow and milk white as primary colors to evoke freshness, sunlight, and dairy products. Cyan, magenta, and navy are used as accent tones to introduce visual contrast and energy across digital and print materials.",
        ],
      },
      {
        title: "Touchpoints",
        paragraphs: [
          "The brand experience extends across multiple platforms including posters, a marketing landing page, and a mobile app. Each touchpoint reinforces the same visual identity while serving different functions — promotion, product discovery, and community engagement.",
        ],
      },
      {
        title: "Initial sketches",
        paragraphs: [
          "Initial sketches explored layout structures and communication strategies for both print and digital interfaces. These rough concepts allowed rapid iteration before moving into refined digital designs.",
        ],
        images: [`${DA}/Frame 7.png`],
      },
      {
        title: "Landing page",
        paragraphs: [
          "The landing page introduces the brand and communicates the core offerings of Dairy & Delight. Key sections highlight product delivery, recipes, and farm visits, guiding users through the brand story while encouraging deeper engagement.",
        ],
        images: [
          `${DA}/Slide 23.png`,
          `${DA}/Slide 24.png`,
          `${DA}/Slide 25.png`,
          `${DA}/Slide 28.png`,
        ],
      },
      {
        title: "Mobile interface",
        paragraphs: [
          "The mobile interface extends the brand ecosystem by allowing users to browse products, access recipes, and unlock member benefits directly from their phones. The design prioritizes clarity and ease of navigation while maintaining the brand’s playful, uplifting tone.",
        ],
        images: [
          `${DA}/Mobile Screens.png`,
          `${DA}/iPhone 11 Render.png`,
          `${DA}/iPhone 11 Render-1.png`,
        ],
      },
      {
        title: "Further screen explorations",
        paragraphs: [
          "Additional iterations refined typography, layout, and campaign compositions across devices.",
        ],
        images: [
          `${DA}/Slide 29.png`,
          `${DA}/Slide 30.png`,
          `${DA}/Slide 31.png`,
          `${DA}/Slide 32.png`,
          `${DA}/Slide 33.png`,
          `${DA}/Slide 34.png`,
          `${DA}/Slide 35.png`,
        ],
      },
    ],
  },
  conclusionTitle: "Thank You",
  conclusion:
    "Thanks for taking the time to explore Dairy & Delight — a project about building a warm, transparent farm story across poster, web, and mobile. I’m always open to conversations about brand systems and multi-touchpoint experiences.",
};

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
    caseStudyHero: null,
    caseStudyGallery: [],
    caseStudyPdfs: kitsPdfs,
    caseStudyRich: kitsCaseStudyRich,
  },
  {
    id: 4,
    title: "Dairy Delight",
    category: "Brand / Product",
    tagline: "Organic farm-to-table brand across poster, web, and mobile.",
    description:
      "Dairy & Delight is a brand and digital experience designed for an organic dairy farm that delivers fresh milk, cheese, yogurt, and ice cream directly to consumers. The project focused on building a cohesive brand identity and multi-platform experience that communicates the farm’s values of natural food, community, and transparency.",
    tags: ["Brand", "Product Design"],
    slug: "dairy-delight",
    thumb: dairyHero,
    caseStudyHero: dairyHero,
    caseStudyGallery: [],
    caseStudyPdfs: [],
    caseStudyRich: dairyCaseStudyRich,
  },
];
