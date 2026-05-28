import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import {
  projectHeroTransitionName,
  projectTitleTransitionName,
} from "@/lib/viewTransition";
import ProjectPageListen from "@/components/ProjectPageListen";
import CaseStudyVideos from "@/components/CaseStudyVideos";
import CaseStudyEndcap from "@/components/CaseStudyEndcap";
import CaseStudyBrowserShell from "@/components/CaseStudyBrowserShell";
import { projectCaseStudyHeroSrc } from "@/lib/projectMedia";

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

function sectionAnchor(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CaseStudyJumpNav({ sections, hasPrototype }) {
  const links = [
    ...sections.map((s) => ({ label: s.title, href: `#section-${sectionAnchor(s.title)}` })),
    ...(hasPrototype ? [{ label: "Prototype", href: "#section-prototype" }] : []),
    { label: "Reflection", href: "#section-reflection" },
  ];

  return (
    <nav className="case-study-jump-nav" aria-label="Case study sections">
      {links.map((link) => (
        <a key={link.href} href={link.href} data-cursor="hover" className="case-study-jump-nav__link">
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function CaseStudyHighlights({ items }) {
  if (!items?.length) return null;

  return (
    <div className="case-study-highlights">
      {items.map((item) => (
        <div key={item.label} className="case-study-highlights__item">
          <p className="case-study-highlights__label">{item.label}</p>
          <p className="case-study-highlights__value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function normalizeCaseStudyImage(entry) {
  if (typeof entry === "string") return { src: entry, alt: "" };
  return { src: entry.src, alt: entry.alt ?? "" };
}

function CaseStudyProcessBlock({ block, frameStyle, bodyStyle, imagesFirst = true }) {
  const images = (block.images ?? []).length > 0 ? (
    <div className={`flex flex-col gap-10 ${imagesFirst ? "mb-8" : "-mt-2 mb-4"}`}>
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
  ) : null;

  const paragraphs = (block.paragraphs ?? []).map((text, i) => (
    <p key={i} className="m-0 mb-8 last:mb-0 case-study-prose" style={bodyStyle}>
      {text}
    </p>
  ));

  return (
    <div key={block.title}>
      <CaseStudySubTitle>{block.title}</CaseStudySubTitle>
      {imagesFirst ? (
        <>
          {images}
          {paragraphs}
        </>
      ) : (
        <>
          {paragraphs}
          {images}
        </>
      )}
    </div>
  );
}

function CaseStudyHeroFade({ hero, slug }) {
  return (
    <div
      className="case-study-hero-fade"
      style={{ viewTransitionName: projectHeroTransitionName(slug) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="case-study-hero-fade__img"
        src={projectCaseStudyHeroSrc(hero)}
        alt=""
      />
      <div className="case-study-hero-fade__overlay" aria-hidden />
    </div>
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
    videosPlacement = "afterIntro",
    videosAfterSection,
    videosTitle,
    videosIntro,
    videosLayout,
    imagesBeforeText = true,
    highlights,
    showJumpNav = false,
    showDeckEmbed = true,
  } = rich;

  const bodyStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 18,
    color: "#bbb",
    lineHeight: 1.8,
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

  const processSections =
    processWork?.sections?.length > 0
      ? processWork.sections
      : processWork?.blocks?.length > 0
        ? [{ title: processWork.title || "Process Work", blocks: processWork.blocks }]
        : [];

  const videoSection =
    videos && videos.length > 0 ? (
      <div id="section-prototype" className="case-study-prototype-anchor">
        <CaseStudyVideos
          videos={videos}
          frameStyle={frameStyle}
          title={videosTitle}
          intro={videosIntro}
          layout={videosLayout}
        />
      </div>
    ) : null;

  const shouldShowJumpNav = showJumpNav && processSections.length > 1;

  return (
    <>
      {(introParagraphs ?? []).length > 0 ? (
      <div className="mt-10 flex flex-col gap-6">
        {(introParagraphs ?? []).map((text, i) => (
          <p key={i} className="m-0 case-study-prose case-study-summary" style={bodyStyle}>
            {text}
          </p>
        ))}
      </div>
      ) : null}

      <div className={(introParagraphs ?? []).length > 0 ? "mt-12" : "mt-12"}>
        <CaseStudySectionTitle>Project Overview</CaseStudySectionTitle>
        <div
          className="case-study-prose grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8"
        >
          {metaRows.map(([label, value]) => (
            <div key={label}>
              <p style={metaLabel}>{label}</p>
              <p style={metaValue}>{value}</p>
            </div>
          ))}
        </div>
        <CaseStudyHighlights items={highlights} />
      </div>

      {shouldShowJumpNav ? (
        <CaseStudyJumpNav
          sections={processSections}
          hasPrototype={Boolean(videos?.length) && videosPlacement === "afterSection"}
        />
      ) : null}

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

      {videosPlacement === "afterIntro" ? videoSection : null}

      {processSections.length > 0 ? (
        <div className={processWork?.sections?.length > 0 ? "mt-16 flex flex-col gap-16" : "mt-16"}>
          {processSections.map((section) => (
            <div
              key={section.title}
              id={`section-${sectionAnchor(section.title)}`}
              className="case-study-section-anchor"
            >
              <CaseStudySectionTitle>{section.title}</CaseStudySectionTitle>
              {section.blocks.map((block) => (
                <CaseStudyProcessBlock
                  key={block.title}
                  block={block}
                  frameStyle={frameStyle}
                  bodyStyle={bodyStyle}
                  imagesFirst={imagesBeforeText}
                />
              ))}
              {videosPlacement === "afterSection" &&
              videosAfterSection === section.title
                ? videoSection
                : null}
            </div>
          ))}
        </div>
      ) : null}

      {videosPlacement === "afterProcess" ? videoSection : null}

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

      {project.caseStudyDeckPdf ? (
        <div className="mt-16">
          <CaseStudySectionTitle>Full deck · PDF</CaseStudySectionTitle>
          <p
            className="m-0 mb-4 case-study-prose"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: "#888",
              lineHeight: 1.6,
            }}
          >
            {showDeckEmbed
              ? "Complete presentation in one file — scroll or download below."
              : "Full slide deck — download for the complete presentation."}
          </p>
          <a
            href={encodeURI(project.caseStudyDeckPdf.href)}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            style={{
              display: "inline-block",
              marginBottom: showDeckEmbed ? 16 : 0,
              fontFamily: "'VT323', monospace",
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#FF7A29",
              textDecoration: "none",
              border: "1px solid rgba(255, 122, 41, 0.45)",
              padding: "8px 14px",
              borderRadius: 2,
            }}
          >
            {project.caseStudyDeckPdf.label} ↗
          </a>
          {showDeckEmbed ? (
          <div
            style={{
              ...frameStyle,
              width: "100%",
              aspectRatio: "16 / 10",
              position: "relative",
              background: "#0a0a0a",
            }}
          >
            <iframe
              title={`${project.title} slide deck`}
              src={`${encodeURI(project.caseStudyDeckPdf.href)}#view=FitH`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            />
          </div>
          ) : null}
        </div>
      ) : null}

      {!project.caseStudyDeckPdf && project.caseStudyPdfs?.length > 0 ? (
        <div className="mt-16">
          <CaseStudySectionTitle>Downloads · PDF</CaseStudySectionTitle>
          <ul className="m-0 p-0 list-none flex flex-col gap-2 case-study-prose">
            {project.caseStudyPdfs.map((item) => (
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

      <div className="mt-16 case-study-section-anchor" id="section-reflection">
        <CaseStudySectionTitle>
          {conclusionTitle || "Conclusion"}
        </CaseStudySectionTitle>
        <p className="m-0 mt-0 case-study-prose" style={bodyStyle}>
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

  const gallery = project.caseStudyGallery ?? [];
  const pdfs = project.caseStudyPdfs ?? [];
  const hero = project.caseStudyHero ?? null;
  const rich = project.caseStudyRich ?? null;
  const hasRichCaseStudy =
    Boolean(hero) ||
    gallery.length > 0 ||
    pdfs.length > 0 ||
    Boolean(project.caseStudyDeckPdf) ||
    Boolean(rich);

  const frameStyle = {
    borderRadius: 3,
    border: "1px solid rgba(255, 122, 41, 0.22)",
    overflow: "hidden",
    background: "rgba(14, 10, 6, 0.92)",
  };

  const endcap = (
    <CaseStudyEndcap
      nextProject={nextProject}
      hasRichCaseStudy={hasRichCaseStudy}
    />
  );

  return (
    <CaseStudyBrowserShell project={project} endcap={endcap}>
      <div className="case-study-browser__content">
        {rich?.heroFirst && hero ? (
          <CaseStudyHeroFade hero={hero} slug={project.slug} />
        ) : null}

        <h1
          className="case-study-browser__heading"
          style={{
            viewTransitionName: projectTitleTransitionName(project.slug),
          }}
        >
          {project.title}
        </h1>

        {project.tagline ? (
          <p className="case-study-browser__tagline">{project.tagline}</p>
        ) : null}

        <ProjectPageListen project={project} />

        <p className="case-study-browser__lede">{project.description}</p>

        {rich ? (
          <CaseStudyRichLayout project={project} frameStyle={frameStyle} />
        ) : hero ? (
          <div
            className="mt-16 w-full"
            style={{
              ...frameStyle,
              viewTransitionName: projectHeroTransitionName(project.slug),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={projectCaseStudyHeroSrc(hero)}
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
              background: "rgba(14, 10, 6, 0.92)",
              borderRadius: 3,
              border: "1px solid rgba(255, 122, 41, 0.22)",
              viewTransitionName: projectHeroTransitionName(project.slug),
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
            <ul className="m-0 p-0 list-none flex flex-col gap-2 case-study-prose">
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
    </CaseStudyBrowserShell>
  );
}
