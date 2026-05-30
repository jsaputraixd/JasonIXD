import Image from "next/image";

const ASCII_PORTRAIT_SRC = "/images/ascii-portrait.png";
const ASCII_PORTRAIT_W = 6591;
const ASCII_PORTRAIT_H = 6624;

export default function WelcomeAsciiPortrait({ sizes, style, priority = false }) {
  return (
    <Image
      src={ASCII_PORTRAIT_SRC}
      alt="ASCII portrait of Jason Saputra"
      width={ASCII_PORTRAIT_W}
      height={ASCII_PORTRAIT_H}
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
