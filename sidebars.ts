import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  guideSidebar: [
    "intro",
    "getting-started",
    {
      type: "category",
      label: "Concepts",
      link: { type: "doc", id: "concepts/index" },
      collapsed: false,
      items: [
        "concepts/spec-driven-development",
        "concepts/openspec",
        "concepts/coding-agents-and-skills",
        "concepts/requirements-traceability",
        "concepts/tie-md-model",
        "concepts/glossary",
      ],
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        "project-model",
        "agents-and-skills",
        "traceability",
        "configuration",
        "safety-and-local-first",
      ],
    },
  ],
};

export default sidebars;
