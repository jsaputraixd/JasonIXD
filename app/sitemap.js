import { projects } from "@/data/projects";
import { getSiteUrl } from "@/lib/siteUrl";

/** @returns {import("next").MetadataRoute.Sitemap} */
export default function sitemap() {
  const base = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${base}/work/${project.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
