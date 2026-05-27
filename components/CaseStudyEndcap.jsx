import Link from "next/link";
import { about } from "@/data/about";

const ACCENT = "#FF7A29";

const linkStyle = {
  fontFamily: "'VT323', monospace",
  fontSize: 16,
  color: ACCENT,
  textTransform: "uppercase",
  letterSpacing: "0.28em",
  textShadow: "0 0 8px rgba(255,122,41,0.4)",
  textDecoration: "none",
};

const CONTACT_ROWS = [
  {
    label: "Email",
    href: `mailto:${about.email}`,
    value: about.email,
  },
  {
    label: "LinkedIn",
    href: about.socials.linkedin,
    value: "linkedin.com/in/jasonixd",
    external: true,
  },
  {
    label: "Instagram",
    href: about.socials.instagram,
    value: "@jason.iv_s",
    external: true,
  },
];

export default function CaseStudyEndcap({ nextProject, hasRichCaseStudy }) {
  return (
    <footer className="case-study-endcap">
      <div className="case-study-endcap__inner">
        <nav className="case-study-endcap__nav" aria-label="Case study navigation">
          <Link href="/" data-cursor="hover" style={linkStyle}>
            ← Desktop
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
            <span style={{ ...linkStyle, opacity: 0.35 }}>End of reel</span>
          )}
        </nav>

        <div className="case-study-endcap__rule" aria-hidden />

        <section
          className="case-study-contact-window"
          aria-labelledby="case-study-contact-title"
        >
          <div className="case-study-contact-window__scanlines" aria-hidden />
          <div className="case-study-contact-window__titlebar">
            <span className="mobile-window-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span id="case-study-contact-title" className="case-study-contact-window__title">
              contact.msg
            </span>
            <span className="case-study-contact-window__badge" aria-hidden>
              open
            </span>
          </div>

          <div className="case-study-contact-window__body">
            <p className="case-study-contact-window__status">
              <span className="case-study-contact-window__prompt" aria-hidden>
                &gt;{" "}
              </span>
              open_for_work: <strong>true</strong>
            </p>

            <p className="case-study-contact-window__lead">
              {hasRichCaseStudy
                ? "Collaborations, freelance, or a quick hello — send a line and tell me what you're making."
                : "Full write-ups are still loading in. Meanwhile, say hi — I'm open to new work."}
            </p>

            <ul className="case-study-contact-window__list">
              {CONTACT_ROWS.map((row) => (
                <li key={row.label}>
                  <a
                    href={row.href}
                    data-cursor="hover"
                    className="case-study-contact-window__row"
                    rel={row.external ? "noopener noreferrer" : undefined}
                    target={row.external ? "_blank" : undefined}
                  >
                    <span className="case-study-contact-window__row-label">
                      {row.label}
                    </span>
                    <span className="case-study-contact-window__row-value">
                      {row.value}
                    </span>
                    <span className="case-study-contact-window__row-arrow" aria-hidden>
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </footer>
  );
}
