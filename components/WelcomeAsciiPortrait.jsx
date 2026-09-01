import Image from "next/image";

const PORTRAIT_SRC = "/images/Website Avatar.png";
const PORTRAIT_W = 4648;
const PORTRAIT_H = 5394;

export default function WelcomeAsciiPortrait({ sizes, style, priority = false }) {
  return (
    <Image
      src={PORTRAIT_SRC}
      alt="Portrait of Jason Saputra"
      width={PORTRAIT_W}
      height={PORTRAIT_H}
      sizes={sizes}
      priority={priority}
      draggable={false}
      style={{
        display: "block",
        boxSizing: "border-box",
        maxWidth: "100%",
        objectFit: "contain",
        objectPosition: "top center",
        filter: "drop-shadow(0 0 12px rgba(255, 122, 41, 0.28))",
        ...style,
      }}
    />
  );
}
