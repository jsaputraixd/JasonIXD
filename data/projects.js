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

const dreamDetectivePdfs = Array.from({ length: 17 }, (_, i) => ({
  label: `Slide ${dreamDetectiveSlideBase(i)} · PDF`,
  href: `${DD_PDF}/${dreamDetectiveSlideBase(i)}.pdf`,
}));

const dreamDetectiveHero = `${DD}/DreamDetectiveHero 1.jpg`;

/** Eleara */
const EL = `${P}/eleara`;
const elearaGallery = Array.from({ length: 19 }, (_, i) => {
  const n = String(i + 1).padStart(4, "0");
  return `${EL}/Eleara_pages-to-jpg-${n}.jpg`;
});
const elearaHero = elearaGallery[0];
const elearaCaseStudyGallery = elearaGallery.slice(1);

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
    "This project was quite the journey — conducting research, testing, and iteration upon iteration really shows the amount of detail that goes into perfecting the experience of an app for all users, both borrower and lender. Each component is carefully designed and thought out to ensure proper understanding and minimize confusion. This project has opened my mind to receiving feedback from others and acting upon it, understanding that there will always be improvements to be made, and grasping that will open your doors to becoming a better designer. Design is everywhere you go: seek it out and learn from it, ask a friend and maybe get together and talk about your ideas. Getting opinions from others is one of the best ways to understand how your users might react to using your interface or to how the home screen layout looks to them, and even how the color gives them a certain feeling that might be fitting or flat out bad for the app.",
};

/** Dairy Delight */
const DA = `${P}/dairy-delight`;
const dairyHero = `${DA}/Dairy & Delight Poster 1.jpg`;

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
    caseStudyGallery: dreamDetectiveGallery,
    caseStudyPdfs: dreamDetectivePdfs,
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
    caseStudyGallery: elearaCaseStudyGallery,
    caseStudyPdfs: [],
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
    caseStudyHero: null,
    caseStudyGallery: [],
    caseStudyPdfs: [],
    caseStudyRich: dairyCaseStudyRich,
  },
];
