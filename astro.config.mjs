import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://mosaigo.io",
  integrations: [
    starlight({
      title: "mosaigo",
      customCss: ["./src/styles/custom.css"],
      defaultLocale: "root",
      logo: {
        src: "./public/favicon.svg",
        replacesTitle: false,
      },
      social: {
        github: "https://github.com/mosaigoio",
      },
      sidebar: [
        {
          label: "Getting Started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "Core Concepts",
          autogenerate: { directory: "concepts" },
        },
        {
          label: "Architecture",
          autogenerate: { directory: "architecture" },
        },
        {
          label: "API Reference",
          autogenerate: { directory: "api" },
        },
        {
          label: "Studio",
          autogenerate: { directory: "studio" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
        {
          label: "mosoptics",
          autogenerate: { directory: "docs-mosoptics" },
        },
        {
          label: "EyeMia",
          autogenerate: { directory: "docs-eyemia" },
        },
        {
          label: "Step Catalog",
          autogenerate: { directory: "steps" },
        },
      ],
    }),
  ],
});
