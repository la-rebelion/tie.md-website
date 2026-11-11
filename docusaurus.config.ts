import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";

// Hubspot account id
const hubspot = {
  accountId: "21339207",
};

const landingUrl =
  process.env.NODE_ENV === "development" ? "" : "https://tie.md";
const landingSection = (section: string) => `${landingUrl}/#${section}`;

const config: Config = {
  title: "tie.md",
  tagline: "A local-first visual control plane for SDD-first projects",
  favicon: "img/tie-mark.svg",
  future: { v4: true },
  url: "https://tie.md",
  baseUrl: "/",
  organizationName: "la-rebelion",
  projectName: "tie.md-website",
  trailingSlash: false,
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  markdown: { hooks: { onBrokenMarkdownLinks: "throw" } },
  i18n: { defaultLocale: "en", locales: ["en"] },
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "docs",
          editUrl: "https://github.com/la-rebelion/tie.md-website/edit/main/",
        },
        blog: {
          routeBasePath: "blog",
          showReadingTime: true,
          blogTitle: "tie.md notes",
          blogDescription:
            "Notes about visible, supervised, specification-driven development.",
          editUrl: "https://github.com/la-rebelion/tie.md-website/edit/main/",
          feedOptions: { type: ["rss", "atom"], xslt: true },
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: { customCss: "./src/css/custom.css" },
        gtag: {
          trackingID: "GTM-MSVN7V57",
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      } satisfies Preset.Options,
    ],
  ],
  scripts: [
    {
      src: "https://js.hsforms.net/forms/embed/v2.js",
      async: true,
    },
  ],
  headTags: [
    {
      tagName: "script",
      attributes: {
        async: "true",
        defer: "true",
        id: "hs-script-loader",
        src: `//js.hs-scripts.com/${hubspot.accountId}.js`,
        type: "text/javascript",
      },
    },
  ],
  themeConfig: {
    image: "img/tie-social-card.svg",
    metadata: [
      {
        name: "description",
        content:
          "tie.md makes OpenSpec projects visible, supervised, and traceable without replacing Markdown, Git, or your coding agent.",
      },
      { name: "theme-color", content: "#141a24" },
    ],
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "tie.md",
      logo: { alt: "tie.md bow-tie mark", src: "img/tie-mark.svg" },
      items: [
        {
          href: landingSection("how"),
          label: "How it works",
          position: "left",
        },
        {
          href: landingSection("principles"),
          label: "Principles",
          position: "left",
        },
        {
          href: landingSection("features"),
          label: "Features",
          position: "left",
        },
        { to: "/install", label: "Install", position: "left" },
        {
          href: landingSection("vision"),
          label: "Vision",
          position: "left",
        },
        { href: landingSection("faq"), label: "FAQ", position: "left" },
        {
          type: "docSidebar",
          sidebarId: "guideSidebar",
          label: "Docs",
          position: "right",
        },
        { to: "/blog", label: "Blog", position: "right" },
        {
          href: "https://github.com/la-rebelion/tie.md",
          label: "GitHub",
          position: "right",
          className: "navbar__github",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Product",
          items: [
            { label: "Install", to: "/install" },
            { label: "How it works", href: landingSection("how") },
            { label: "Principles", href: landingSection("principles") },
            { label: "Vision", href: landingSection("vision") },
          ],
        },
        {
          title: "Learn",
          items: [
            { label: "Documentation", to: "/docs" },
            { label: "Blog", to: "/blog" },
          ],
        },
        {
          title: "Source",
          items: [
            { label: "tie.md", href: "https://github.com/la-rebelion/tie.md" },
            {
              label: "Website",
              href: "https://github.com/la-rebelion/tie.md-website",
            },
            { label: "La Rebelion Labs", href: "https://rebelion.la" },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} La Rebelion Labs. Built in the open.`,
    },
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
