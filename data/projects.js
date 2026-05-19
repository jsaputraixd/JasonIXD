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
    client: "Academic UX Project (Concept App)",
    industry: "Health / Wellness · Mobile",
    timeline: "3 Weeks",
    role: "UX & Interaction Designer",
  },
  introParagraphs: [
    "Dream Detective is an iOS alarm app that replaces the snooze button with a daily episodic audio mystery. Each morning, users wake up to the next chapter of a story — but only if they get up. Snoozing doesn’t pause the narrative: it locks that day’s chapter permanently, using loss aversion to make oversleeping feel like missing a plot beat, not just being late.",
    "The design challenge was making a punitive mechanic feel fair and motivating. I mapped the wake-up journey, prototyped audio-first interactions, and shaped a visual system that reads clearly at 6 AM — high contrast, minimal steps, and obvious consequences before the user commits to snooze.",
  ],
  finalDesign: {
    images: [
      {
        src: dreamDetectiveHero,
        alt: "Dream Detective hero — alarm screen with mystery chapter branding.",
      },
    ],
  },
  videos: [
    // Add your screen recording here, then uncomment:
    // {
    //   kind: "file",
    //   src: `${DD}/DreamDetective-flow.mp4`,
    //   label: "Alarm & chapter flow",
    // },
  ],
  processWork: {
    title: "Process & deck",
    blocks: [
      {
        title: "Concept & problem framing",
        paragraphs: [
          "Early slides establish the insight: standard alarms train users to snooze without consequence. Dream Detective reframes waking up as serial storytelling — progress is the reward, and skipping a day is irreversible.",
        ],
        images: [ddSlide(1), ddSlide(2), ddSlide(3), ddSlide(4)],
      },
      {
        title: "Journey & interaction model",
        paragraphs: [
          "User flows explore how someone discovers the app, sets their first mystery, experiences the alarm, and faces the snooze decision. The interaction model keeps audio central while UI supports scan-ability in low-light, half-awake moments.",
        ],
        images: [ddSlide(5), ddSlide(6), ddSlide(7), ddSlide(8)],
      },
      {
        title: "Visual & UI direction",
        paragraphs: [
          "Mood, typography, and screen layouts evolve toward a noir-adjacent tone without sacrificing legibility. Components are sized for thumb reach, with clear hierarchy between “start chapter,” timer, and destructive snooze actions.",
        ],
        images: [ddSlide(9), ddSlide(10), ddSlide(11), ddSlide(12)],
      },
      {
        title: "Final screens & alarm experience",
        paragraphs: [
          "High-fidelity screens show the chapter player, daily lock state, and library of past episodes. The system communicates what you’ll lose if you snooze before the user taps — making the mechanic legible, not hidden.",
        ],
        images: [ddSlide(13), ddSlide(14), ddSlide(15), ddSlide(16), ddSlide(17)],
      },
    ],
  },
  conclusion:
    "Dream Detective was an exercise in designing behavior change through narrative stakes. The strongest lesson: when the product goal is to disrupt a habit (snoozing), the interface has to make tradeoffs obvious early — and the story has to be good enough that missing a chapter actually hurts.",
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
    client: "Academic UX Project (Concept System)",
    industry: "Health Tech · Wearables",
    timeline: "3 Weeks",
    role: "UX & Systems Designer",
  },
  introParagraphs: [
    "Eleara is a predictive vestibular companion for people who experience dizziness and balance risk. The system combines wearable sensing, a support network, and adaptive stimulation to catch episodes early — and help users feel steadier in everyday movement.",
    "I designed across hardware touchpoints, caregiver alerts, and a companion app. The work focused on trust: users need to understand what the device is doing, when it will intervene, and who gets notified — without adding anxiety to an already stressful health experience.",
  ],
  finalDesign: {
    images: [
      {
        src: elearaHero,
        alt: "Eleara overview — wearable companion and app ecosystem.",
      },
    ],
  },
  videos: [
    // Add your flow recording here, then uncomment:
    // {
    //   kind: "file",
    //   src: `${EL}/Eleara-flow.mp4`,
    //   label: "Companion app flow",
    // },
  ],
  processWork: {
    title: "Process & deck",
    blocks: [
      {
        title: "Problem & stakeholders",
        paragraphs: [
          "The deck opens on vestibular disorders as an invisible, episodic problem — and the gap between clinical visits and daily life. Stakeholders include the wearer, clinicians, and family or caregivers who may receive alerts.",
        ],
        images: [elearaSlide(2), elearaSlide(3), elearaSlide(4)],
      },
      {
        title: "Research & product vision",
        paragraphs: [
          "Research synthesis and personas ground the concept in real constraints: battery life, skin contact, false positives, and social stigma of wearing a medical device. The vision positions Eleara as proactive, not punitive.",
        ],
        images: [elearaSlide(5), elearaSlide(6), elearaSlide(7), elearaSlide(8)],
      },
      {
        title: "Wearable & system architecture",
        paragraphs: [
          "Hardware explorations and system diagrams show how sensing, risk scoring, and stimulation map to physical form. The goal is a device that feels like gear, not a hospital bracelet — while still signaling medical credibility.",
        ],
        images: [elearaSlide(9), elearaSlide(10), elearaSlide(11), elearaSlide(12)],
      },
      {
        title: "App experience & alerts",
        paragraphs: [
          "Mobile flows cover onboarding, daily check-ins, alert thresholds, and caregiver views. Information density is tuned for quick scanning during an episode — large type, calm color, and explicit next steps.",
        ],
        images: [elearaSlide(13), elearaSlide(14), elearaSlide(15), elearaSlide(16)],
      },
      {
        title: "Final vision",
        paragraphs: [
          "Closing frames summarize the end-to-end experience: wearable + app + network, and how Eleara supports confidence in movement over time.",
        ],
        images: [elearaSlide(17), elearaSlide(18), elearaSlide(19)],
      },
    ],
  },
  conclusion:
    "Eleara pushed me to design for uncertainty — predictions fail, users panic, caregivers overreact. The interface work that mattered most was calibrating language and alert severity so the system feels like a partner, not an alarm bell on your wrist.",
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
    tagline: "Episodic audio-mystery alarms.",
    description:
      "An app that replaces standard alarms with a daily episodic audio-mystery. It uses loss aversion to enforce wakefulness by permanently locking the day\u2019s chapter if the user snoozes.",
    tags: ["UX Design", "Interaction Design"],
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
    category: "Wearable",
    tagline: "A predictive vestibular companion.",
    description:
      "A predictive vestibular companion that monitors risk, alerts support networks, and uses adaptive stimulation to maintain balance and prevent dizziness episodes.",
    tags: ["UX Design", "Systems Design"],
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
