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
    showJumpNav: false,
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
    project:
      "I built an alarm that unlocks the next chapter of a mystery, so waking up is the only way to hear what happens next.",
    problem: "Oversleeping costs nothing, so snooze always wins.",
    role: "I designed the behavior, the Office world, and Cold Trail so missing the morning means missing the beat.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Most alarms ask for willpower. I used plot instead. Miss the wake-up and that morning's chapter dies.",
  ],
  highlights: [],
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
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
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
            title: "Nothing is at stake at 7am",
            paragraphs: [
              "College students know sleep matters, but staying up late feels cheap, and alarms give you no reason to get up. Snooze wins because nothing is lost.",
              "The brief asked for lasting behavior change. I treated it as a motivation problem at wake-up, not a better notification.",
            ],
            images: [
              {
                src: ddSlide(4),
                alt: "Problem framing, college students and sleep behavior.",
              },
            ],
          },
          {
            title: "What already works, and what doesn't",
            paragraphs: [
              "I mapped Duolingo, Forest, Pokémon Sleep, and Finch. Streak loss and protecting something you've built both work. Cute sleep output exists too.",
              "Nobody combined story pull with an irreversible miss. Nothing made waking up the only way to find out what happens next.",
            ],
            images: [
              {
                src: ddSlide(5),
                alt: "Competitor analysis, behavioral design patterns across adjacent apps.",
              },
            ],
          },
          {
            title: "Miss the morning, miss the beat",
            paragraphs: [
              "Each morning unlocks the next audio clue. Snooze triggers Cold Trail: that chapter locks for good. You don't fall behind. You miss the beat.",
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
        title: "Building the world",
        blocks: [
          {
            title: "Not another wellness app",
            paragraphs: [
              "Wellness defaults to clean minimalism. I needed film-noir atmosphere and adventure-game UI, with typewriter type so it reads like a case file.",
            ],
            images: [
              {
                src: ddSlide(8),
                alt: "Mood board, film noir, Art Deco, and adventure game references.",
              },
            ],
          },
          {
            title: "Two directions, one world",
            paragraphs: [
              "Version 1 was a thin alarm and clue reveal, too close to everything else. Version 2 sold the world through the Office, Evidence Board, and Stakeout sleep audio.",
            ],
            images: [
              {
                src: ddSlide(9),
                alt: "Sketches. Version 1 and Version 2 mobile flow explorations.",
              },
            ],
          },
          {
            title: "Structure before the noir",
            paragraphs: [
              "I framed home, stats, navigation, and the morning alert in low fidelity first, so I could lock hierarchy before style: where sleep data lives, how you move through the Office, and what wake-up looks like.",
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
            title: "The case file is the UI",
            paragraphs: [
              "Art Deco frames, gold-on-crimson actions, and a handwritten notebook carry the world across screens. Sleep stats become case metrics — Rest Logged, Evidence Secured, Cases Solved — so the data belongs to the fiction.",
            ],
            images: [
              {
                src: ddSlide(12),
                alt: "UI elements, card frames, navigation notebook, and Detective Dossier panel.",
              },
            ],
          },
          {
            title: "What I could draw, what I generated",
            paragraphs: [
              "I built the UI and interaction in Figma. I generated environment art with Gemini and Grok because hand-illustrating full scenes was not feasible in three weeks.",
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
            title: "Day and night, one Office",
            paragraphs: [
              "The Office flips at 6pm. Night is Stakeout audio, then a wake-up check, then briefing or Cold Trail. Day is stats, alarm, and the notebook. Everything still anchors back to the Office.",
            ],
            images: [
              {
                src: ddSlide(15),
                alt: "User flow chart, day/night modes and wake-up decision logic.",
              },
            ],
          },
          {
            title: "When the tool couldn't walk the room",
            paragraphs: [
              "FigmaMake sped up UI pieces, but it could not do first-person navigation through the Office. I built that loop by hand, both wake-up outcomes: Intel Secured and locked out.",
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
        title: "Keeping scope honest",
        blocks: [
          {
            title: "Write the product before the polish",
            paragraphs: [
              "I wrote a full PRD before high-fidelity screens — problem, features, flow, specs — so I would gamify curiosity, not guilt.",
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
    "The concept only works when the fiction, the interaction, and the visuals all push the same wake-up decision.",
  nextSteps:
    "I want to test whether narrative FOMO beats a loud beep with real sleepy people.",
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
    project:
      "I led a four-person remote sprint to a wearable plus app that counters dizziness before an episode escalates.",
    problem: "Vestibular episodes get worse before people can get help.",
    role: "I ran the clock, the user flow, and the feedback so four people shipped one product.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Eleara uses galvanic vestibular stimulation to steady you, and it can alert emergency contacts when that is not enough.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
  showDeckEmbed: false,
  videos: [],
  processWork: {
    sections: [
      {
        title: "Final product",
        blocks: [
          {
            title: "Ear device, app, and a hold-to-SOS",
            paragraphs: [
              "We shipped a predictive vestibular companion in 72 hours: daily monitoring, a GVS flow, and an emergency path that does not look like the rest of the app.",
            ],
            images: [
              {
                src: elearaSlide(17),
                alt: "Lifestyle shot with the Eleara ear device.",
              },
              {
                src: elearaSlide(18),
                alt: "Final login screen with HIPAA certification.",
              },
              {
                src: elearaSlide(19),
                alt: "Final screens from the completed prototype.",
              },
            ],
          },
        ],
      },
      {
        title: "The starting point",
        blocks: [
          {
            title: "72 hours, four people, one product",
            paragraphs: [
              "FigBuild asks a team to go from zero to a working prototype in three days. We did it over Zoom, which meant coordination most in-person teams never face.",
              "I was product manager and process lead. I did not pick the concept. I set the agendas, ran ideation, delegated by strength, and made the schedule calls when time slipped.",
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
            title: "Hidden signals, not surface metrics",
            paragraphs: [
              "We opened with 15 minutes of unfiltered sticky notes. Ideas ran from ADHD tools to a cave-diving CO₂ monitor. The shared instinct was interoception, the body's hidden states, including balance.",
              "Two concepts survived: a Smart Sole for gait, and an ear device using galvanic vestibular stimulation. The Ear Thing won. Willow named the mechanic: GVS sends a tiny current to the vestibular nerve so standing-up dizziness reads as steadiness.",
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
            title: "Write the product before Figma",
            paragraphs: [
              "In a 72-hour sprint, a PRD is the only way four people do not build four products. I locked the problem, the solution, four features, and accessibility before anyone opened a frame.",
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
            title: "One question after login",
            paragraphs: [
              "I led the user flow. After login the product asks one thing: are you having an episode now? Yes goes to an alert and optional emergency services. Home keeps a persistent Emergency Button for override.",
              "Daily use is Profile, Contacts, and Dashboard. Mapping that first meant nobody designed a screen without a place in the system.",
            ],
            images: [
              {
                src: elearaSlide(8),
                alt: "User flow chart, daily use and emergency response paths.",
              },
            ],
          },
          {
            title: "Structure first, color later",
            paragraphs: [
              "I roughed login, home, dashboard, profile, and contacts in grayscale so hierarchy and the two-column cards could settle before style.",
            ],
            images: [
              {
                src: elearaSlide(9),
                alt: "Wireframes, login, home, dashboard, profile, and contacts.",
              },
            ],
          },
          {
            title: "A system four people could share",
            paragraphs: [
              "I built the style guide next to the wireframes so screens would not drift. Poppins for headings and data. Inter for body text you can still read during an episode.",
              "Soft periwinkle, dusty blue, warm amber, deep teal. Clinical enough to trust, not cold enough to scare.",
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
            title: "Prompt the PRD, then synthesize",
            paragraphs: [
              "Day 2 started with a FigmaMake build from a prompt that encoded the PRD, the GVS mechanic, the layout, HIPAA, and every required screen.",
              "My job shifted to feedback. I reviewed screens as they landed and aligned the team before hour-36 testing.",
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
            title: "Hour 36, two people, think-aloud",
            paragraphs: [
              "We tested with Tamiko R. and Thania R. Tamiko liked the home status colors but could not scan dashboard cards that all looked the same. She also wanted the app to suggest hydration if dehydration triggers her episodes, not just chart them.",
              "Thania called the interface simple in the best way. Both confirmed the structure. The problems were refinement, which is what you want to hear at hour 36.",
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
            title: "Six changes before the last night",
            paragraphs: [
              "We softened the palette so it felt like a companion. We added onboarding we had skipped. We changed SOS to hold-to-trigger so a pocket press would not call help in public.",
              "We made the episode alert look unlike monitoring. We renamed medical records to clinical documents. We gave dashboard cards distinct identities after Tamiko's scan test.",
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
            title: "Apply the list, then submit",
            paragraphs: [
              "Day 3 was close-out. We applied the iteration list, polished, recorded the walkthrough, and submitted. The login now shows HIPAA-compliant security certification before you create an account.",
            ],
            images: [],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Eleara changed how I lead: lock shared constraints early, delegate by strength, and leave time for evidence to change the work.",
  nextSteps:
    "I want to cap ideation earlier next time, then run a second test focused on the changes the first sessions asked for.",
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
    project:
      "I designed a kiosk and app so you can try a hobby kit without buying the gear first.",
    problem: "A new hobby dies at the checkout for an expensive kit.",
    role: "I mapped borrower and lender as two products that share one physical handoff.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Kits! lets you borrow a curated hobby kit from a public kiosk, or lend your own gear so someone else can try it.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
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
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  processWork: {
    sections: [
      {
        title: "Final product",
        blocks: [
          {
            title: "One kiosk, two roles, one voice",
            paragraphs: [
              "I unified kiosk handoff states and role-specific app tasks so borrower and lender feel like one service, not two apps taped together.",
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
      {
        title: "The starting point",
        blocks: [
          {
            title: "Buy the tools first, or don't start",
            paragraphs: [
              "Existing entry points assume you purchase gear before you know if you like the hobby. I framed the problem around two archetypes before I drew a screen.",
            ],
            images: [],
          },
          {
            title: "Borrowers and lenders are not the same person",
            paragraphs: [
              "Borrowers want browse, reserve, pick up, try, return. Lenders need incentives, approval, and processing that does not feel like unpaid labor.",
              "Mapping both journeys showed where the kiosk must lead, where the app carries continuity, and which states need an explicit yes before you move on.",
            ],
          },
        ],
      },
      {
        title: "Paper before pixels",
        blocks: [
          {
            title: "Walk the desk, not the file",
            paragraphs: [
              "I paper-prototyped reservation, pickup, kit intake, and return so I could break the flows without high-fidelity distraction.",
              "That pass locked where the kiosk leads versus where the app continues, and which states needed confirmation first.",
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
            title: "Two paths, no shared lie",
            paragraphs: [
              "Low-fidelity locked hierarchy. Medium-fidelity added density for kiosk reach and phone thumbs.",
              "I kept borrower and lender on separate paths so no screen pretended both roles see the same thing.",
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
            title: "Bright at arm's length",
            paragraphs: [
              "I needed a public kiosk that still felt like a community, not a ticket machine. Type, color, and components keep touch and mobile reading as one product.",
            ],
            images: [
              {
                src: kitsStyleGuide,
                alt: "Style guide, color, typography, and UI components.",
              },
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "The service got clear when I treated the physical handoff and the app as one experience.",
  nextSteps:
    "I want to test the full kiosk-to-app handoff with borrowers and lenders, including returns, empty kits, and interrupted transactions.",
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
    project:
      "I built an organic dairy brand that has to hold together on a poster, a site, and a phone.",
    problem: "Farm brands default to farmer's-market cliché.",
    role: "I designed the sun mark and the touchpoints so pleasure and integrity read as one voice.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Dairy & Delight delivers milk, cheese, yogurt, and ice cream to your door. I chose the brief because it asked for lifestyle, not just look fresh.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
  showDeckEmbed: false,
  videos: [],
  processWork: {
    sections: [
      {
        title: "Final product",
        blocks: [
          {
            title: "Taste Delight before you read the farm",
            paragraphs: [
              "The poster is a waffle cone, a cherry, and TASTE DELIGHT following the spiral in Magenta. Type animates the object. It should feel like ice cream before it explains the product.",
            ],
            images: [
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
            title: "The same voice on the web",
            paragraphs: [
              "I sketched three layouts, then kept doodle warmth on a clean card grid. The hero reuses the poster. Three pillars sit below it, then a testimonial on a yellow wave and a Navy footer.",
            ],
            images: [
              {
                src: dairyLanding,
                alt: "Landing page, layout sketches, poster reference, and full scroll mockup.",
              },
            ],
          },
          {
            title: "Discover, cook, then join",
            paragraphs: [
              "The app is Discover, Create, and Access: products and farm process, recipes, then member tours and seasonal boxes. Sky-blue home, large pill CTAs, and a wavy header that ties the phone to the poster.",
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
      {
        title: "The starting point",
        blocks: [
          {
            title: "Lifestyle, not a category",
            paragraphs: [
              "Before Figma I studied who buys from a farm like this. Foodies who love the outdoors, treat food as communal, and already care where it comes from.",
              "That richness is why I picked this brief over two alternatives. Pleasure and integrity had to live in the same brand.",
            ],
          },
          {
            title: "An invitation, not a lecture",
            paragraphs: [
              "Transparency and sustainability without pretension. I wanted a seat at the table, not a lecture from a shelf.",
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
            title: "All-Natural, Uplifting, Communal",
            paragraphs: [
              "Three words became the filter. All-Natural is texture and earth-born color, not perfect geometry. Uplifting means actually joyful, not just trustworthy. Communal means a family table, not a store shelf.",
              "If it felt cold, it failed. If it felt generic-natural, it was not uplifting enough.",
            ],
            images: [
              {
                src: dairyVibe,
                alt: "The vibe. All-Natural, Uplifting, and Communal.",
              },
            ],
          },
          {
            title: "Three boards, one overlap",
            paragraphs: [
              "I pulled folk art, community posters, botanical illustration, and bold joyful graphics. Their overlap drove every choice after.",
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
              "I start in a sketchbook. For Dairy & Delight that meant over 100 iterations before a single vector, because exhausting the obvious is how the interesting stuff shows up.",
              "Two directions felt alive: a circular cow badge, and a sun from alternating yellow and magenta rays. The sun won. Bold at any scale, joyful without being precious.",
            ],
          },
          {
            title: "Then lock it to a bottle and a header",
            paragraphs: [
              "I refined ray count, proportions, yellow-magenta balance, and the wordmark. The system is the core mark plus five lockups.",
              "Rounded serif, hand-lettered ampersand. Every round had to survive a milk bottle, an app icon, a poster, and a web header.",
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
            title: "Five colors, each with a job",
            paragraphs: [
              "Navy for legibility. Cyan for morning air. Magenta for energy. Yellow for butter and sun. Milk White for a canvas that is never sterile.",
              "Sausage Semibold for headlines, Poppins for secondary, Quicksand Light for body. Illustrations pair Yellow and Magenta so a cheese wedge or a sunrise reads as the brand on a kitchen wall.",
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
              "With the system set I designed a poster, a landing page, and an app. Different formats. Same brand. That consistency across media is the hard part.",
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
            title: "Twenty posters by hand",
            paragraphs: [
              "In class I applied ten visual principles to the same brief, two iterations each. Focus the Eye, Overwhelm, Simplify, Overlap, Assault the Surface, Activate the Diagonal, Manipulate Scale, Text as Image, Amplify, Tell a Story.",
              "Three directions made the short list: cheese as type, a diagonal lockup, and the cone. The cone is the one I shipped.",
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
            ],
          },
        ],
      },
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "This was my first serious brand project, and where fine arts training became practical. The poster is the strongest piece because it sells joy before it explains dairy.",
  nextSteps:
    "I want to put the illustration system on packaging: milk bottles, cheese wrappers, and ice-cream pints.",
};
/** Project Pulse */
const PL = `${P}/Pulse`;
function pulseSlide(n) {
  return `${PL}/slides/pulse-slide-${String(n).padStart(2, "0")}.jpg`;
}
const pulseHero = `${PL}/Pulse-hero.png`;

const pulseCaseStudyRich = {
  overview: {
    client: "IXD Research · Project 03 · Team of 3",
    industry: "Health / Fitness · Gesture UX · Habit Formation",
    timeline: "Spring 2026 · March 30 to May 11",
    role: "Lead designer, synthesis, visual system, prototype",
  },
  scan: {
    project:
      "I led the design of a smart-mirror coach so a packed week still has a workout you never have to touch.",
    problem: "Plans ignore the calendar, and sweaty hands cannot poke glass.",
    role: "I owned synthesis, the visual system, and the browser prototype the team could play.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Pulse is a mirror in the room, not another phone app: calendar-aware slots and AirTap so you never have to touch the glass mid-set.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
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
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  livePrototype: {
    href: "https://jsaputraixd.github.io/Pulse/",
    label: "Open live Pulse demo",
    intro: null,
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
            title: "A fitness problem with no object yet",
            paragraphs: [
              "We started with a how-might-we, not a screen: how might busy students keep a workout that survives a packed week.",
              "We stalled. Lots of problem, no product. I floated directions until a smart mirror felt right, a coach in the room instead of another app. We talked it through until we had something we could build.",
            ],
            images: [
              {
                src: pulseSlide(5),
                alt: "Problem statement. How might we remove time and procrastination barriers to a lasting workout rhythm.",
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
              "Annalise and Jason W. ran most of the interviews. I wrote the guides, talked to people too, sent the emails, and built the screening form before it went out.",
              "I pulled Crazy 8s and expert interviews into a plan we could design against: feature priority, how dense the mirror UI should be, how you interact, and where it lives in a dorm.",
            ],
            images: [
              {
                src: pulseSlide(7),
                alt: "Research goals. Feature priorities, interface design, interaction methods, physical setup.",
              },
            ],
          },
          {
            title: "Eight sketches and three experts",
            paragraphs: [
              "Crazy 8s put an early workout-assistant mirror on paper. Yoga, health-tech, and fitness instructors told us what a coach in the room would actually have to do.",
            ],
            images: [
              {
                src: pulseSlide(11),
                alt: "Crazy 8s sketches, including an early workout-assistant mirror concept.",
              },
              {
                src: pulseSlide(12),
                alt: "Expert interviews with a yoga instructor, health-tech advisor, and fitness instructor.",
              },
            ],
          },
          {
            title: "Marin falls off after one miss",
            paragraphs: [
              "I wrote Marin as the person we were designing for: a software engineer in SF who loses the gym the week after she skips one session.",
            ],
            images: [
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
              "Once we had a mirror, the question was sweaty hands on glass. I pushed for AirTap, point, pinch, dwell, so you never poke the screen mid-set.",
            ],
            images: [
              {
                src: pulseSlide(14),
                alt: "Prototype mapping worksheet from onboarding through in-workout coaching and recovery.",
              },
            ],
          },
          {
            title: "Useful, and a little invasive",
            paragraphs: [
              "We concept-tested calendar sync, facial tracking, and posture coaching with five people at CCA. Calendar-aware micro workouts landed. Camera tracking was useful and a little invasive. That tension is still in the prototype on purpose.",
            ],
            images: [
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
              "I built the browser demo to stress-test ten-foot type, rest-timer collisions, and gesture logic under real use.",
              "The rest timer collided with navigation. The gesture logic was clever enough to exit a workout by accident.",
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
            title: "We all ran sessions. Then I looked at the pile.",
            paragraphs: [
              "I ran usability sessions, and so did Annalise and Jason W. I synthesized what we heard: crowded UI, tiny type at workout distance, and gesture overload.",
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
            ],
          },
          {
            title: "One gesture, not a switch",
            paragraphs: [
              "People hated switching between point and pinch. They wanted one gesture. Tracking was jumpy enough to exit a workout by accident.",
            ],
            images: [
              {
                src: pulseSlide(21),
                alt: "Interaction friction. Users wanted one pinch gesture instead of switching between point and pinch.",
              },
            ],
          },
          {
            title: "Onboarding that talks too much",
            paragraphs: [
              "Too much text up front, dead rest screens, and exercises that were hard to identify from the mirror.",
            ],
            images: [
              {
                src: pulseSlide(22),
                alt: "Onboarding fatigue. Too much text, dead rest screens, and exercises that were hard to identify.",
              },
            ],
          },
        ],
      },
      {
        title: "What we learned",
        blocks: [
          {
            title: "Honest about fit",
            paragraphs: [
              "A Sean Ellis-style survey put essential-to-disappointed at 33%. Half the group had not wired Pulse into a real week. That is the next design problem: make the calendar slot the path of least resistance.",
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
    "Pulse confirmed that I want to keep working where interface decisions have to survive distance, bodies, and a real room.",
  nextSteps:
    "I want to unify AirTap into one gesture, enlarge type for ten-foot reading, and test whether a calendar-suggested slot changes behavior.",
};

/** Pawfect Match */
const PF = `${P}/Pawfect`;
const pawfectHero = `${PF}/Pawfect Match.png`;

const pawfectCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Mobile App (Academic)",
    industry: "Social · Pets · Community",
    timeline: "Sprint · Solo",
    role: "UX / UI design",
  },
  scan: {
    project:
      "I designed a pet app that leads with the animal: profiles, a missing-pets map, and an AR preview in your living room.",
    problem: "Pet hangouts get chaotic when the owner profile comes first.",
    role: "I designed the quiz, the home, and the AR loop so the pet stays the subject.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Warm profiles and park energy, not a corporate dog-food feed. I wanted the animal on screen before the owner resume.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [
        {
          title: "Pets first, owners second",
          paragraphs: [
            "I designed onboarding, home, and pet profiles so you meet Lui the Maine Coon before you meet whoever listed them.",
          ],
          images: projectImages(PF, [
            "Pawfect Match-01.png",
            "Pawfect Match MockUps-01.jpg",
            "PawfectMatch Mockup 2.5.jpeg",
            "mockuuups-free-iphone-15-pro-hand-mockup.png",
          ]),
        },
      ],
    },
    {
      title: "The starting point",
      blocks: [
        {
          title: "Eight frames before the orange",
          paragraphs: [
            "I sketched onboarding, home, profiles, an adoption form, an AR viewer, community, a post-adoption hub, and a browse grid before I picked a palette.",
          ],
          images: projectImages(PF, [
            "Screenshot 2024-12-18 at 2.01.16\u202fPM.png",
          ]),
        },
      ],
    },
    {
      title: "Design",
      blocks: [
        {
          title: "Missing pets on a map you can scan",
          paragraphs: [
            "I put last-seen pins and pet cards on one screen so you can scan Nearby, Recent, and Urgent without opening a thread.",
          ],
          images: projectImages(PF, [
            "Screenshot 2025-01-14 at 1.03.51\u202fPM.png",
          ]),
        },
        {
          title: "See the dog on your rug first",
          paragraphs: [
            "I designed an AR loop that finds the floor, then drops a shepherd or a cat into the room so scale is a fact, not a guess.",
          ],
          images: projectImages(PF, [
            "Screenshot 2025-01-14 at 1.05.28\u202fPM.png",
          ]),
        },
      ],
    },
  ],
  conclusion:
    "The visual direction holds. The matching premise still needs people at a real park.",
  nextSteps:
    "I want to test whether leading with the pet makes a meetup less chaotic, or just more politely chaotic.",
});

/** Safe Space */
const SS = `${P}/Safe Space`;
const safeSpaceHero = `${SS}/SafeSpace.png`;

const safeSpaceCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Note-taking / Wellness (Academic)",
    industry: "Mental Health · Productivity",
    timeline: "Sprint · Solo",
    role: "UX / UI design",
  },
  scan: {
    project:
      "I designed a private check-in app so a hard day does not have to become an inbox.",
    problem: "Notes apps are built for tasks. Feelings get treated like inbox zero.",
    role: "I designed the flow, the wireframes, and a calmer visual direction.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "A quieter surface for how the day went, then exercises and people if you want them. Not a streak counter.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [
        {
          title: "How was your day, then keep going",
          paragraphs: [
            "I designed a three-beat loop: mood, stress, and energy sliders, a home that says you are doing great, then an exercise list you can search.",
          ],
          images: projectImages(SS, [
            "SafeSpace UserFlow.png",
            "1_JasonSaputra.jpg",
            "mockuuups-female-hand-holding-iphone-14-pro-mockup.png",
          ]),
        },
      ],
    },
    {
      title: "The starting point",
      blocks: [
        {
          title: "Structure before the planets",
          paragraphs: [
            "I framed home, a non-invasive daily quiz, exercises, and campus connections in grayscale first, with Roboto for body and Lato for headings.",
          ],
          images: projectImages(SS, ["SafeSpace Wireframes.png"]),
        },
      ],
    },
  ],
  conclusion:
    "The flow is focused. I still need to know if it feels supportive in a difficult moment, not just pretty on a desk.",
  nextSteps:
    "I want to run real writing sessions before I add another visual layer.",
});

/** ShiftOff */
const SO = `${P}/ShiftOff`;
const shiftOffHero = `${SO}/iPhone 16 Pro.png`;

const shiftOffCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "Concept · Work-life Boundaries (Academic)",
    industry: "Wellness · Productivity · Service Design",
    timeline: "April 2026 · Solo",
    role: "UX / product design",
  },
  scan: {
    project:
      "I designed an end-of-day companion so logging off is a handoff, not a willpower test.",
    problem: "The desk stays in sight from the couch, and work thoughts come with you.",
    role: "I researched the pull, then designed a ritual that offloads open loops before the vault locks.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "ShiftOff replaces a missing commute with a psychological threshold: offload, disconnect, recover.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [
        {
          title: "The Great Reset, then the morning",
          paragraphs: [
            "I designed a decompression sequence you tap into after the shift, and a morning dashboard that is ready to begin again without reopening Slack.",
          ],
          images: projectImages(SO, ["21.png", "iPhone 16 Pro.png"]),
        },
      ],
    },
    {
      title: "Research",
      blocks: [
        {
          title: "Design the right thing first",
          paragraphs: [
            "I asked about the workday, shared devices, leftover rituals, and a recent time they were off the clock but still at work. Evidence before a prettier guilt trip.",
          ],
          images: projectImages(SO, ["4.png"]),
        },
        {
          title: "Four people, same square meter",
          paragraphs: [
            "I talked to a UX architect, an analyst, a creative director, and an engineer in a 350-square-foot studio. The desk and the bed share a room.",
          ],
          images: projectImages(SO, ["6.png"]),
        },
        {
          title: "The desk is still in the shot",
          paragraphs: [
            "7 of 8 worked in a space visible from the couch or bed. That sightline is a low-level pull even when they are not working.",
          ],
          images: projectImages(SO, ["7.png"]),
        },
        {
          title: "Eight of eight still at work",
          paragraphs: [
            "All eight had involuntary work thoughts after hours: replaying conversations, or solving unfinished tasks. Both wreck sleep and presence.",
          ],
          images: projectImages(SO, ["10.png"]),
        },
      ],
    },
    {
      title: "Direction",
      blocks: [
        {
          title: "A commute you can still take",
          paragraphs: [
            "I framed Karya as a psychological threshold. Cognitive offloading, not digital deprivation. Capture the open loops, then a definitive end-of-day handoff so guilt does not follow you to the couch.",
          ],
          images: projectImages(SO, ["14.png"]),
        },
      ],
    },
    {
      title: "Design",
      blocks: [
        {
          title: "Splash, ritual, seal the day",
          paragraphs: [
            "I wired splash to onboarding to dashboard to a three-step handoff: brain dump, a fake commute, then Day Complete. Evening capture and morning review sit on the other side of the seal.",
          ],
          images: projectImages(SO, ["18.png"]),
        },
      ],
    },
  ],
  conclusion:
    "Disengagement is what people do after the interface disappears, not how long they stay inside it.",
  nextSteps:
    "I want to test whether the handoff actually cuts after-hours Slack checking.",
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
    project:
      "I designed first-floor wayfinding for a campus people get lost in, including me.",
    problem: "Two numbering systems and prefixes that do not match how you walk the hall.",
    role: "I researched the scavenger hunt, then numbered rooms like an airport and put the signs in the building.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "New students get lost. I did. The front gate is locked, you walk around to the back, and the portal map still sends you hunting room by room. I scoped the first floor only.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
  showDeckEmbed: false,
  processWork: {
    sections: [
      {
        title: "Final product",
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
      {
        title: "The campus",
        blocks: [
          {
            title: "The building got a renovation. The signs didn't.",
            paragraphs: [
              "1111 8th St used to be a warehouse. The Nave is the postcard. I found wayfinding as tape, floor stickers, silver plaques, and a number painted on wired glass. Some signs still point at rooms that do not exist.",
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
              "CCA numbers by section: A, B, N, E, W. N, E, W are cardinals. A and B are not. Standing in the hall, none of that told me where I was.",
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
              "I made the hallway the code. I flipped the map 90 degrees so it faces you at the entrance. Hallways become A, B, C. If the door opens onto hallway A, you are A1, A2, A3. Next to A but the door dumps into B? That is B.",
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
              "I used Digibop for voice and Quicksand for legibility. Purple, pink, cyan. Three sign types: entrance kiosk, crossway totem, and a long-hall hanging pair.",
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
    ],
  },
  conclusionTitle: "Reflection",
  conclusion:
    "Interviews showed that orientation and naming, not polish, were the wayfinding problem.",
  nextSteps:
    "I want to install a full-size totem in the Nave and watch first-years at rush hour.",
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
    project:
      "I built an iPad AR mystery you solve by scanning the room, not by reading a menu.",
    problem: "AR that explains itself with UI chrome instead of the world.",
    role: "I wrote the story, built the scenes, and hid the wayfinding in audio, light, and geometry.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "A Fowl Play turns an iPad into a detective kit. I built it in Reality Composer with RealityScan props and Blender cleanup.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [],
    },
    {
      title: "Inspiration",
      blocks: [
        {
            title: "Navigation as storytelling",
            paragraphs: [
              "Before any scan I studied how games push you forward without a giant arrow. Alyx won. Environment, sound, and geometry do the pointing.",
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
              "I used Sketchfab for gaps, RealityScan for real props, and Blender so the polycount would not melt the iPad.",
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
              "I used the office as a tone-setter: look around, hear the monologue, walk to the door.",
            ],
          images: projectImages(AFP, [
            "IMG_0182_from_Notion.jpg",
          ]),
        },
        {
            title: "Restaurant of suspicion",
            paragraphs: [
              "Three spaces, three cue types. I wanted players to stretch their legs and solve with instinct, not a checklist.",
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
              "Horizontal plane anchors fought crowded rooms. I locked the scene to an image, then swapped a wall of text for a face doodle Reality Composer could actually see.",
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
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  conclusion:
    "Watching people solve it by instinct showed the environmental cues were carrying the experience.",
  nextSteps:
    "I want to stress-test the image anchors in brighter, busier rooms.",
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
    project:
      "I built a voice and screen companion wired to a physical pill dispenser.",
    problem: "Missed doses are a system problem, not a willpower poster.",
    role: "I designed the reminders, the flow, and a swinging door that hands you the dose.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Half of people with chronic conditions miss doses. I designed soft reminders and an accessible path from refill to dispense.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [],
    },
    {
      title: "Problem",
      blocks: [
        {
            title: "Missed doses, real cost",
            paragraphs: [
              "About 125,000 preventable deaths a year in the US alone. The brief asked for soft reminders and an accessible path from refill to dispense.",
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
              "I mapped the ritual so I could see where voice helps and where it just slows people down. Clarity over speed. Fewer back-and-forths.",
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
              "I connected ProtoPie to Blokdots. Loose wires lied. Wi-Fi lagged. Three hardware iterations later, the funnel angle and cable routing finally behaved.",
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
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  conclusion:
    "Voice needs patience. Hardware shows the constraints a screen flow can hide.",
  nextSteps:
    "I want a tighter industrial-design pass once the servo behavior stays honest.",
});

/** Concrete — The Price for Concrete */
const CN = `${P}/Concrete`;
const concreteHero = `${CN}/slides/concrete-slide-02.png`;

const concreteCaseStudyRich = simpleGalleryCaseStudy({
  overview: {
    client: "IXD · Systems Thinking (Academic)",
    industry: "Urban Systems · Mobility · Policy Design",
    timeline: "Unit 4 · Solo · May 2026",
    role: "Systems research · visual narrative",
  },
  scan: {
    project:
      "I built a systems deck on what streets cost when people are not the point.",
    problem: "Car-first design, then blame the pedestrian.",
    role: "I used an iceberg and a goal flip so the leverage points read without a policy lecture.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "The Price for Concrete asks what we pay when streets are built for cars first. Not the asphalt invoice. The human one.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [
        {
          title: "Change the goal, not the paint",
          paragraphs: [
            "I ended on Changing the Goal: rewrite the rules, fund safe human access instead of maximum throughput, and treat pedestrians as the primary stakeholder, not the criminal.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-11.png"]),
        },
      ],
    },
    {
      title: "The starting point",
      blocks: [
        {
          title: "A family, a street, a conviction",
          paragraphs: [
            "I started with Raquel Nelson. After dark, home across the street, a mile-long detour. A van killed her four-year-old. The driver served six months. She was convicted of vehicular homicide for jaywalking.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-01.png"]),
        },
      ],
    },
    {
      title: "How it is now",
      blocks: [
        {
          title: "Liberation became necessity",
          paragraphs: [
            "290 million cars on US roads. 87% daily car use. A ten-year growth trend. Happiness drops once driving is more than half the day, and most people have no other choice.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-04.png"]),
        },
        {
          title: "The event is just the tip",
          paragraphs: [
            "I used an iceberg. Above water: I see a lot of cars today. Below it: a decade of more vehicles, zoning that forces long trips, and a mental model that the car is the only normal way to move.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-05.png"]),
        },
        {
          title: "Policy funds highways that fund isolation",
          paragraphs: [
            "I mapped the loop: policy funds highways, highways become barriers, barriers force longer trips, longer trips demand more car-centric funding. Seniors, low-income people, and young adults miss healthcare, jobs, and school.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-06.png"]),
        },
        {
          title: "Wider roads are a fix that fails",
          paragraphs: [
            "Congestion gets a wider road. Crossings become impossible. Liability and emergency costs rise. The symptom eases for a minute. The structure gets worse.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-07.png"]),
        },
        {
          title: "Inclusion is the actual problem",
          paragraphs: [
            "The systemic prioritization of automobiles inhibits social inclusion, cuts mobility, and makes financial independence impossible for anyone who depends on transit.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-08.png"]),
        },
      ],
    },
    {
      title: "A rule you can build",
      blocks: [
        {
          title: "The 100-foot rule",
          paragraphs: [
            "I proposed a pairing rule: no transit stop stays without a pedestrian crosswalk within 100 feet, plus lighting, signaled crossings, and protective medians.",
          ],
          images: projectImages(CN, ["slides/concrete-slide-10.png"]),
        },
      ],
    },
  ],
  conclusion:
    "Changing the Goal is where the deck stops diagnosing and starts prescribing.",
  nextSteps:
    "I want to test whether the sequence persuades someone without me in the room.",
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
    project:
      "I built a browser toy that slices your photo into a pop-up book you can tilt.",
    problem: "A still image keeps the look and throws away the feeling of standing there.",
    role: "I designed the loop and ran depth on the phone so nothing leaves the device.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "Capture, depth, slice, stand up. The live app is the proof.",
  ],
  highlights: [],
  sections: [
    {
      title: "Final product",
      blocks: [
        {
          title: "The loop",
          paragraphs: [
            "I designed three beats: point at a moment, cut it into hard-edged foreground, mid, and background bands, then stand them up so tilt reads like a paper book.",
          ],
          images: projectImages(FL, ["flippy-flow.png"]),
        },
      ],
    },
    {
      title: "On device",
      blocks: [
        {
          title: "Nothing leaves the phone",
          paragraphs: [
            "I ran Depth Anything V2 Small through transformers.js, rendered with CSS 3D and a spring-smoothed look, and drove the feel with gyroscope plus drag.",
          ],
          images: projectImages(FL, ["flippy-tech.png"]),
        },
      ],
    },
  ],
  conclusion:
    "Estimated depth became an interaction, not a filter you apply after the fact.",
  nextSteps:
    "I want richer paper textures, cleaner cutouts, and a moment you can share.",
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
    project:
      "I designed a daily bluffing trivia game that lives inside a Reddit post: one truth, three lies.",
    problem: "It has to read in a feed and still feel like a party when you expand it.",
    role: "I designed the loop, the sticker system, and the identity so ranked play stayed fair in a small public sub.",
    hard: null,
    change: null,
  },
  introParagraphs: [
    "One truth, three lies, ten questions a day, inside a Reddit post. I designed the loop, the stickers, and the identity for Games with a Hook.",
  ],
  highlights: [],
  heroFirst: true,
  imagesBeforeText: true,
  showJumpNav: false,
  showDeckEmbed: false,
  videos: [
    {
      kind: "youtube",
      url: "https://youtu.be/Qhi6wbqrLME",
      label: "Full loop inside a Reddit post",
    },
  ],
  videosPlacement: "afterSection",
  videosAfterSection: "Final product",
  videosTitle: null,
  videosIntro: null,
  livePrototype: {
    href: "https://www.reddit.com/r/who_fiddled_dev",
    label: "Open r/who_fiddled_dev",
    intro: "Play today's ranked 10 in r/who_fiddled_dev.",
  },
  extraVideosAfterSection: "Final product",
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
        title: "Final product",
        blocks: [],
      },
      {
        title: "In the feed",
        blocks: [
          {
            title: "It has to look like a Reddit post first",
            paragraphs: [
              "I designed the first card to feel tappable in the feed. If it does not, nobody reaches Today's 10.",
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
              "The actual sport is Today's 10. I gave everyone the same ten questions that Pacific day so the leaderboard is fair. One hero card, a row of pips, Start daily trivia. You play the deck in order. You do not pick from truncated teasers.",
              "Community sits under it, for fun, no ranked points. Ranked points never leak into that lane, or a popular lie-farm would beat people who just played the official ten.",
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
              "I made answer cards radio stickers, not static text. Lock it in stays dead until you pick something. The copy says Pick an answer first so the grey button is not a mystery. Sixty seconds on the clock, fill reading as time left, not a loading bar.",
              "Once you select, the white face presses down and the navy shadow stays put. Switch answers and the old one pops back up. I skipped the checkmark. A checkmark shoved the copy and wrapped a word.",
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
              "I put the prompt on the magenta card so you type on it, not in a leftover field underneath. Extra context is optional and only shows after voting, so the backstory cannot leak the truth.",
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
              "Finish the ten and the card goes brand yellow, not a random green. I put score, correct, missed, and the deck bonus in one box so 2 correct and 8 missed actually add up. If you are #1, that line gets a trophy, not a footnote.",
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
    "The quality of the lies, not extra mechanics, is the real content problem.",
  nextSteps:
    "I want to grow the prompt packs and study which lies actually fool people.",
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

/** Desktop heroes — two large case-study windows. */
const DESKTOP_FEATURED_SLUGS = ["tama", "pulse"];

const HERO_SLUGS = DESKTOP_FEATURED_SLUGS;

export const featuredProjects = FEATURED_SLUGS.map((slug) =>
  projects.find((p) => p.slug === slug)
).filter(Boolean);

export const desktopFeaturedProjects = DESKTOP_FEATURED_SLUGS.map((slug) =>
  projects.find((p) => p.slug === slug)
).filter(Boolean);

export const heroProjects = desktopFeaturedProjects;

export const carouselProjects = projects.filter(
  (p) => !HERO_SLUGS.includes(p.slug)
);

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
