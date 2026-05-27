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

function normalizeCaseStudyImage(entry) {
  if (typeof entry === "string") return { src: entry, alt: "" };
  return { src: entry.src, alt: entry.alt ?? "" };
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
          className="case-study-prose grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8"
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
          <p key={i} className="m-0 case-study-prose" style={bodyStyle}>
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
                <p key={i} className="m-0 mb-8 last:mb-0 case-study-prose" style={bodyStyle}>
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
            Complete presentation in one file — scroll or download below.
          </p>
          <a
            href={encodeURI(project.caseStudyDeckPdf.href)}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            style={{
              display: "inline-block",
              marginBottom: 16,
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

      <div className="mt-16">
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
        <h1
          className="case-study-browser__heading"
          style={{
            viewTransitionName: projectTitleTransitionName(project.slug),
          }}
        >
          {project.title}
        </h1>

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
