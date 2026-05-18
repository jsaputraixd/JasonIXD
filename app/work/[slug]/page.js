import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { about } from "@/data/about";
import ProjectPageListen from "@/components/ProjectPageListen";
import CaseStudyVideos from "@/components/CaseStudyVideos";

const ACCENT = "#FF7A29";

function CaseStudySectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`m-0 ${className}`}
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: ACCENT,
        textShadow: "0 0 8px rgba(255,122,41,0.35)",
        marginBottom: 14,
      }}
    >
      {children}
    </h2>
  );
}

function CaseStudySubTitle({ children }) {
  return (
    <h3
      className="m-0"
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: 12,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: ACCENT,
        textShadow: "0 0 8px rgba(255,122,41,0.28)",
        marginTop: 28,
        marginBottom: 12,
      }}
    >
      {children}
    </h3>
  );
}

function normalizeCaseStudyImage(entry) {
  if (typeof entry === "string") return { src: entry, alt: "" };
  return { src: entry.src, alt: entry.alt ?? "" };
}
const ACCENT_SOFT = "rgba(255, 180, 112, 0.85)";

function ContactEndIcon() {
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ opacity: 0.9 }}
    >
      <path
        d="M6.5 3h11c1 0 2 .9 2 2v14c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"
        fill="rgba(255,122,41,0.08)"
        stroke={ACCENT}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <path
        d="M9 6.5h6M10 18h4"
        stroke={ACCENT}
        strokeWidth={1.1}
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}

function CaseStudyEndcap({ nextProject, linkStyle, hasRichCaseStudy }) {
  const rowBase = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    borderRadius: 3,
    border: "1px solid rgba(255, 122, 41, 0.42)",
    background: "rgba(18, 12, 8, 0.92)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 122, 41, 0.12), 0 0 20px rgba(0,0,0,0.35)",
  };

  const labelStyle = {
    fontFamily: "'VT323', monospace",
    fontSize: 14,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    color: ACCENT_SOFT,
    textShadow: "0 0 8px rgba(255, 122, 41, 0.35)",
  };

  const valueLinkStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#e8e8e8",
    textDecoration: "none",
  };

  const rows = [
    {
      label: "Email",
      href: `mailto:${about.email}`,
      value: about.email,
    },
    {
      label: "LinkedIn",
      href: about.socials.linkedin,
      value: "linkedin.com/in/jasonixd",
    },
    {
      label: "Instagram",
      href: about.socials.instagram,
      value: "@jason.iv_s",
    },
  ];

  return (
    <footer
      className="mt-28 pt-16 pb-8 px-6 md:px-12"
      style={{
        /* Full-bleed from constrained parent: gradient spans entire viewport */
        width: "100vw",
        maxWidth: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        borderTop: "1px solid rgba(255, 122, 41, 0.28)",
        backgroundColor: "#171717",
        backgroundImage: [
          "radial-gradient(ellipse 130% 75% at 50% 0%, rgba(255, 122, 41, 0.14) 0%, transparent 58%)",
          "linear-gradient(to bottom, rgba(255, 122, 41, 0.06), transparent 52%)",
        ].join(", "),
      }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: 960 }}
      >
      <div
        className="flex flex-wrap items-center justify-between gap-6"
        style={{ marginBottom: 40 }}
      >
        <Link href="/#sketchbook" data-cursor="hover" style={linkStyle}>
          ← Back to home
        </Link>
        {nextProject ? (
          <Link
            href={`/work/${nextProject.slug}`}
            data-cursor="hover"
            style={linkStyle}
          >
            Next: {nextProject.title} →
          </Link>
        ) : (
          <span style={{ ...linkStyle, opacity: 0.35 }}>End of the reel</span>
        )}
      </div>

      <div className="flex flex-col items-center text-center" style={{ marginBottom: 36 }}>
        <ContactEndIcon />
        <h2
          className="mt-5 mb-3"
          style={{
            fontFamily: "'Bonbon', cursive",
            fontSize: "clamp(34px, 6.5vw, 56px)",
            lineHeight: 1.1,
            color: "#ffffff",
            textShadow: "0 0 28px rgba(255, 122, 41, 0.22)",
            maxWidth: 520,
            margin: "20px auto 12px",
          }}
        >
          Ready to build something together?
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            color: "#9a9a9a",
            lineHeight: 1.6,
            maxWidth: 420,
            margin: 0,
          }}
        >
          {hasRichCaseStudy
            ? "I’d love to hear what you’re making — collaborations, freelance, or a quick hello."
            : "Full process write-ups are on the way. Meanwhile, say hi — I’m open to new work."}
        </p>
      </div>

      <ul
        className="m-0 p-0 list-none flex flex-col gap-3"
        style={{ maxWidth: 640, margin: "0 auto" }}
      >
        {rows.map((row) => (
          <li key={row.label}>
            <a
              href={row.href}
              data-cursor="hover"
              rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={row.href.startsWith("http") ? "_blank" : undefined}
              style={{
                ...rowBase,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={labelStyle}>{row.label}</span>
              <span style={valueLinkStyle}>{row.value}</span>
            </a>
          </li>
        ))}
      </ul>
      </div>
    </footer>
  );
}

function CaseStudyRichLayout({ project, frameStyle }) {
  const rich = project.caseStudyRich;
  if (!rich) return null;

  const {
    overview,
    introParagraphs,
    finalDesign,
    videos,
    processWork,
    designSolution,
    conclusion,
    conclusionTitle,
  } = rich;

  const bodyStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 18,
    color: "#bbb",
    lineHeight: 1.8,
    maxWidth: 680,
  };

  const metaLabel = {
    fontFamily: "'VT323', monospace",
    fontSize: 12,
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: ACCENT,
    opacity: 0.92,
    marginBottom: 8,
    textShadow: "0 0 8px rgba(255,122,41,0.28)",
  };

  const metaValue = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: "#d0d0d0",
    lineHeight: 1.55,
    margin: 0,
  };

  const metaRows = [
    ["Client", overview.client],
    ["Industry", overview.industry],
    ["Timeline", overview.timeline],
    ["My role", overview.role],
  ];

  return (
    <>
      <div className="mt-12">
        <CaseStudySectionTitle>Project Overview</CaseStudySectionTitle>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8"
          style={{ maxWidth: 680 }}
        >
          {metaRows.map(([label, value]) => (
            <div key={label}>
              <p style={metaLabel}>{label}</p>
              <p style={metaValue}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-8">
        {introParagraphs.map((text, i) => (
          <p key={i} className="m-0" style={bodyStyle}>
            {text}
          </p>
        ))}
      </div>

      {(finalDesign?.images ?? []).length > 0 ? (
      <div className="mt-16">
        <CaseStudySectionTitle>Final Design</CaseStudySectionTitle>
        <div className="flex flex-col gap-10">
          {(finalDesign.images ?? []).map((entry) => {
            const { src, alt } = normalizeCaseStudyImage(entry);
            return (
              <div key={src} style={frameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(src)}
                  alt={alt}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      ) : null}

      {videos && videos.length > 0 ? (
        <CaseStudyVideos videos={videos} frameStyle={frameStyle} />
      ) : null}

      {processWork?.blocks?.length > 0 ? (
        <div className="mt-16">
          <CaseStudySectionTitle>
            {processWork.title || "Process Work"}
          </CaseStudySectionTitle>
          {processWork.blocks.map((block) => (
            <div key={block.title}>
              <CaseStudySubTitle>{block.title}</CaseStudySubTitle>
              {(block.paragraphs ?? []).map((text, i) => (
                <p key={i} className="m-0 mb-8 last:mb-0" style={bodyStyle}>
                  {text}
                </p>
              ))}
              {(block.images ?? []).length > 0 ? (
                <div className="flex flex-col gap-10 -mt-2 mb-4">
                  {(block.images ?? []).map((entry) => {
                    const { src, alt } = normalizeCaseStudyImage(entry);
                    return (
                      <div key={src} style={frameStyle}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={encodeURI(src)}
                          alt={alt}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {designSolution?.length > 0 ? (
        <div className="mt-16">
          <CaseStudySectionTitle>Design Solution</CaseStudySectionTitle>
          {designSolution.map((block) => (
            <div key={block.title}>
              <CaseStudySubTitle>{block.title}</CaseStudySubTitle>
              <div className="flex flex-col gap-10">
                {(block.images ?? []).map((entry) => {
                  const { src, alt } = normalizeCaseStudyImage(entry);
                  return (
                    <div key={src} style={frameStyle}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={encodeURI(src)}
                        alt={alt}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-16">
        <CaseStudySectionTitle>
          {conclusionTitle || "Conclusion"}
        </CaseStudySectionTitle>
        <p className="m-0 mt-0" style={bodyStyle}>
          {conclusion}
        </p>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Work — Jason Saputra" };
  return {
    title: `${project.title} — Jason Saputra`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(idx + 1) % projects.length];

  const linkStyle = {
    fontFamily: "'VT323', monospace",
    fontSize: 16,
    color: "#FF7A29",
    textTransform: "uppercase",
    letterSpacing: "0.28em",
    textShadow: "0 0 8px rgba(255,122,41,0.4)",
  };

  const gallery = project.caseStudyGallery ?? [];
  const pdfs = project.caseStudyPdfs ?? [];
  const hero = project.caseStudyHero ?? null;
  const rich = project.caseStudyRich ?? null;
  const hasRichCaseStudy =
    Boolean(hero) || gallery.length > 0 || pdfs.length > 0 || Boolean(rich);

  const frameStyle = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
    background: "#1e1e1e",
  };

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: "#171717", color: "#ffffff" }}
    >
      <div className="mx-auto px-6 md:px-12 py-24" style={{ maxWidth: 960 }}>
        <Link
          href="/#sketchbook"
          data-cursor="hover"
          style={linkStyle}
        >
          ← Back to home
        </Link>

        <h1
          className="mt-8"
          style={{
            fontFamily: "'Bonbon', cursive",
            fontSize: "clamp(48px, 8vw, 88px)",
            lineHeight: 1.05,
          }}
        >
          {project.title}
        </h1>

        <ProjectPageListen project={project} />

        <p
          className="mt-10"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            color: "#bbb",
            lineHeight: 1.8,
            maxWidth: 680,
          }}
        >
          {project.description}
        </p>

        {rich ? (
          <CaseStudyRichLayout project={project} frameStyle={frameStyle} />
        ) : hero ? (
          <div className="mt-16 w-full" style={frameStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeURI(hero)}
              alt=""
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                verticalAlign: "middle",
              }}
            />
          </div>
        ) : (
          <div
            className="mt-16 w-full overflow-hidden"
            style={{
              aspectRatio: "16 / 9",
              background: "#1e1e1e",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,122,41,0.08), rgba(255,122,41,0))",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                case study coming soon
              </span>
            </div>
          </div>
        )}

        {!rich && gallery.length > 0 ? (
          <div className="mt-12 flex flex-col gap-10">
            {gallery.map((src, i) => (
              <div key={src} style={frameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(src)}
                  alt={`${project.title} — frame ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        ) : null}

        {pdfs.length > 0 ? (
          <div className="mt-16">
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#FF7A29",
                textShadow: "0 0 8px rgba(255,122,41,0.35)",
                marginBottom: 14,
              }}
            >
              Slides · PDF
            </p>
            <ul
              className="m-0 p-0 list-none flex flex-col gap-2"
              style={{ maxWidth: 680 }}
            >
              {pdfs.map((item) => (
                <li key={item.href}>
                  <a
                    href={encodeURI(item.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: "#bbb",
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <CaseStudyEndcap
        nextProject={nextProject}
        linkStyle={linkStyle}
        hasRichCaseStudy={hasRichCaseStudy}
      />
    </main>
  );
}
