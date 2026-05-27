import Link from "next/link";

/** Subtle JS-OS browser chrome — wraps case study content without crowding the work. */
export default function CaseStudyBrowserShell({ project, children, endcap }) {
  const fileName = `${project.slug}.case`;
  const address = `js-os://work/${project.slug}`;

  return (
    <main className="case-study-browser">
      <div className="case-study-browser__frame">
        <header className="case-study-browser__chrome">
          <div className="case-study-browser__titlebar">
            <span className="mobile-window-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="case-study-browser__title">{fileName}</span>
            <span className="case-study-browser__app" aria-hidden>
              JS-OS Browser
            </span>
          </div>
          <div className="case-study-browser__toolbar">
            <Link
              href="/"
              data-cursor="hover"
              className="case-study-browser__back"
            >
              ← Desktop
            </Link>
            <div
              className="case-study-browser__url"
              aria-label={`Address bar: ${address}`}
            >
              <span className="case-study-browser__url-lock" aria-hidden>
                ⌁
              </span>
              <span className="case-study-browser__url-text">{address}</span>
            </div>
            <span className="case-study-browser__rec" aria-hidden>
              ◉ Rec
            </span>
          </div>
        </header>

        <div className="case-study-browser__viewport">{children}</div>
      </div>

      {endcap}
    </main>
  );
}
