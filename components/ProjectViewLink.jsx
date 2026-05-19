"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { withViewTransition } from "@/lib/viewTransition";

/** Project links with View Transitions on supported browsers (hero/title morph). */
export default function ProjectViewLink({
  href,
  children,
  onClick,
  prefetch = true,
  ...rest
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      prefetch={prefetch}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        withViewTransition(() => {
          router.push(href);
        });
      }}
    >
      {children}
    </Link>
  );
}
