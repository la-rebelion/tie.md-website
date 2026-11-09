import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./index.module.css";

const github = "https://github.com/la-rebelion/tie.md";

const steps = [
  {
    title: "Run it where your work already is",
    body: "Open one OpenSpec repository. tie.md detects the project, Git, agents, and skills before it writes anything.",
    file: "~/code/my-app — shell",
    screen: `$ cd ~/code/my-app
$ tie serve

  ✓ OpenSpec 1.16.0        openspec/ · 6 active · 2 archived
  ✓ Git                    main · 3 uncommitted
  ✓ .tie/config.yaml       workspace layer
  ✓ ~/.tie/config.yaml     user layer · workspace wins conflicts
  ✓ Agents                 5 from 2 sources
  ✓ Skills                 6 from 2 sources

  → http://127.0.0.1:4317   local only · no account`,
  },
  {
    title: "See every change on one board",
    body: "Draft, ready, active, review, and archive readiness are projections of real files and evidence—not another status field.",
    file: "tie.md · Board",
    screen: ` DRAFT 2        READY 1        IN PROGRESS 1    REVIEW 1
 ─────────────  ─────────────  ───────────────  ─────────────
 trust-gate     run-attrib.    board-view       shared-sources
 ○ 2 missing    ✓ valid 0/6    ✓ 3/7 · Builder  ↻ stale 6/6

 READY TO ARCHIVE 1
 ──────────────────
 atomic-writes · ✓ 5/5 reviewed

 Drag a card → see the real action or the evidence still missing.`,
  },
  {
    title: "Assign an agent and its skills",
    body: "Choose a teammate and only the capabilities it may use. The assignment stays in a small, reviewable sidecar.",
    file: "openspec/changes/agent-run-attribution/.tie.yaml",
    screen: `agent: workspace:builder          # agent-roster/builder.md
reviewers:
  - company:qa                    # shared · trusted
skills:
  - workspace:typescript
  - shared:test-strategy          # referenced, never copied
history:
  - at: 2026-11-09
    by: you
    agent: workspace:builder`,
  },
  {
    title: "Approve, then watch it work",
    body: "Inspect the instruction and exact command first. Observe one mutating run, stop it, and review the actual file diff.",
    file: "run r-0042 · apply · codex",
    screen: `› tie    adapter codex · cwd ~/code/my-app
› tie    skills typescript, test-strategy
› tie    snapshot: 412 files hashed
› codex  reading proposal.md
› codex  editing src/runs/snapshot.ts
› codex  running tests
› codex  updating tasks.md
› tie    watcher: 4 files changed · 0 outside workspace
› tie    process exited 0

  Evidence comes from the snapshot—not the agent's summary.`,
  },
  {
    title: "Trace it, then archive",
    body: "Follow each requirement through design, tasks, code, tests, and delivery evidence. Gaps remain visible until resolved or waived.",
    file: "tie.md · Traceability",
    screen: ` REQ                       TASKS  CODE          TESTS      STAGE
 ─────────────────────────  ─────  ────────────  ─────────  ─────────
 sources/relative          2/2    resolve.ts    ✓ 2/2      Tested
 sources/duplicate-ids     1/1    ids.ts        ✕ 0/1      Built
 board/derived-columns     1/1    project.ts    ✓ 1/1      Tested
 board/archived-view       —      —             —          Pending

 Gap: archived-view has no implementation task
 Impact of ids.ts → 2 requirements · 2 tests to rerun`,
  },
];

const features = [
  [
    "Evidence-derived board",
    "Cards reflect artifacts, tasks, validation, trace links, and run evidence. A drag opens a guard instead of inventing status.",
    "openspec/ + validation",
  ],
  [
    "Supervised agent runs",
    "Preview the adapter, instruction, skills, and command. Approve, watch, cancel, and review the real changed files.",
    "Codex · Claude · Copilot",
  ],
  [
    "Roster and reusable skills",
    "Define agents in Markdown and reference SKILL.md directories across workspaces without silently copying or changing them.",
    "agent-roster/ · skills/",
  ],
  [
    "Traceability matrix",
    "Move in both directions from requirement to design, task, code, test, defect, and release evidence.",
    "declared links + visible gaps",
  ],
  [
    "Trust gate",
    "External agents and skills remain inspect-only until their canonical source and content identity are explicitly trusted.",
    "path + content identity",
  ],
  [
    "Local-first by design",
    "Loopback by default, fully useful offline, no required account, atomic writes, and no silent conflict overwrite.",
    "Windows · macOS · Linux",
  ],
];

const faqs = [
  [
    "What is tie.md?",
    "tie.md is a local-first visual control plane for OpenSpec projects. It makes changes, assignments, supervised agent runs, validation, and requirements traceability legible without replacing the files underneath.",
  ],
  [
    "Does tie.md replace OpenSpec or my coding agent?",
    "No. OpenSpec remains authoritative. Codex, Claude, or GitHub Copilot continue to run through their own interfaces. tie.md resolves the work, shows the effective command, and records evidence around the run.",
  ],
  [
    "What happens if I stop using it?",
    "Your repository remains a normal OpenSpec and Git repository. The portable configuration and assignment metadata are ordinary YAML and Markdown; there is no proprietary export step.",
  ],
  [
    "Does my repository leave my machine?",
    "The MVP is designed to bind to loopback, work offline, and require no hosted account. Repository content remains local unless another tool you explicitly run has its own network behavior.",
  ],
  [
    "Can an agent change things without approval?",
    "Not through the intended tie.md flow. Mutating runs, archive operations, destructive replacement, and similar transitions require explicit human confirmation.",
  ],
  [
    "Which platforms are planned?",
    "Windows, macOS, and Linux are MVP release targets, with both an npm CLI and compiled-binary distribution planned. Availability will be announced in the repository.",
  ],
  [
    "How much will it cost?",
    "Pricing and licensing have not been announced. The product is currently being shaped in the open; watch the GitHub repository for release and license decisions.",
  ],
];

function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`mark-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2cc7bf" />
          <stop offset="1" stopColor="#1193b0" />
        </linearGradient>
      </defs>
      <path
        d="M27 28 13 19.5Q9 17.2 9 21.8v20.4q0 4.6 4 2.3L27 36"
        fill="none"
        stroke={`url(#mark-${size})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m37 28 14-8.5q4-2.3 4 2.3v20.4q0 4.6-4 2.3L37 36"
        fill="none"
        stroke="#ff8a45"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="27" y="25" width="10" height="14" rx="3.5" fill="currentColor" />
    </svg>
  );
}

function HarnessDiagram() {
  const inputs = [
    "openspec/",
    "AGENTS.md",
    "skills/SKILL.md",
    "your agent CLI",
    "git",
  ];
  const outputs = [
    "Work board",
    "Supervised runs",
    "Validation",
    "Traceability",
  ];
  const inputY = [38, 113, 188, 263, 338];
  const outputY = [68, 148, 228, 308];
  const incomingPaths = [
    "M236 60 C360 60 380 210 452 210",
    "M236 135 C360 135 380 210 452 210",
    "M236 210 C340 210 400 210 452 210",
    "M236 285 C360 285 380 210 452 210",
    "M236 360 C360 360 380 210 452 210",
  ];
  const outgoingPaths = [
    "M548 210 C620 210 640 90 770 90",
    "M548 210 C620 210 640 170 770 170",
    "M548 210 C620 210 640 250 770 250",
    "M548 210 C620 210 640 330 770 330",
  ];
  return (
    <figure className={styles.harness}>
      <figcaption className="sr-only">
        Existing developer tools tie into one local control plane that presents
        a board, supervised runs, validation, and traceability.
      </figcaption>
      <svg
        className={styles.desktopHarness}
        viewBox="0 0 1000 420"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desktop-input" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2cc7bf" />
            <stop offset="1" stopColor="#1193b0" />
          </linearGradient>
          <linearGradient id="desktop-mark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2cc7bf" />
            <stop offset="1" stopColor="#1193b0" />
          </linearGradient>
        </defs>
        <g>
          {incomingPaths.map((path) => (
            <path
              className={`${styles.flowLine} ${styles.flowIn}`}
              d={path}
              key={path}
              stroke="url(#desktop-input)"
            />
          ))}
          {outgoingPaths.map((path) => (
            <path
              className={`${styles.flowLine} ${styles.flowOut}`}
              d={path}
              key={path}
              stroke="#ff8a45"
            />
          ))}
        </g>
        <g className={styles.diagramLabels}>
          {inputs.map((input, index) => (
            <g key={input}>
              <rect x="40" y={inputY[index]} width="196" height="44" rx="10" />
              <text x="58" y={inputY[index] + 28}>
                {input}
              </text>
            </g>
          ))}
        </g>
        <g className={styles.diagramOutputs}>
          {outputs.map((output, index) => (
            <g key={output}>
              <rect
                x="770"
                y={outputY[index]}
                width="190"
                height="44"
                rx="10"
              />
              <text x="790" y={outputY[index] + 28}>
                {output}
              </text>
            </g>
          ))}
        </g>
        <circle className={styles.diagramHalo} cx="500" cy="210" r="76" />
        <circle className={styles.diagramCore} cx="500" cy="210" r="66" />
        <g
          transform="translate(452 162) scale(1.5)"
          className={styles.diagramMark}
        >
          <path
            d="M27 28 13 19.5Q9 17.2 9 21.8v20.4q0 4.6 4 2.3L27 36"
            fill="none"
            stroke="url(#desktop-mark)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m37 28 14-8.5q4-2.3 4 2.3v20.4q0 4.6-4 2.3L37 36"
            fill="none"
            stroke="#ff8a45"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="27" y="25" width="10" height="14" rx="3.5" />
        </g>
      </svg>

      <svg
        className={styles.mobileHarness}
        viewBox="0 0 360 570"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mobile-input" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2cc7bf" />
            <stop offset="1" stopColor="#1193b0" />
          </linearGradient>
          <linearGradient id="mobile-mark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2cc7bf" />
            <stop offset="1" stopColor="#1193b0" />
          </linearGradient>
        </defs>
        <g>
          {[
            "M92 64 C92 155 128 205 151 252",
            "M268 64 C268 155 232 205 209 252",
            "M92 129 C102 195 132 225 157 256",
            "M268 129 C258 195 228 225 203 256",
            "M180 194 C180 218 180 232 180 246",
          ].map((path) => (
            <path
              className={`${styles.flowLine} ${styles.flowIn}`}
              d={path}
              key={path}
              stroke="url(#mobile-input)"
            />
          ))}
          {[
            "M148 354 C112 382 92 400 92 430",
            "M212 354 C248 382 268 400 268 430",
            "M137 340 C80 382 92 456 92 500",
            "M223 340 C280 382 268 456 268 500",
          ].map((path) => (
            <path
              className={`${styles.flowLine} ${styles.flowOut}`}
              d={path}
              key={path}
              stroke="#ff8a45"
            />
          ))}
        </g>
        <g className={styles.diagramLabels}>
          {inputs.slice(0, 4).map((input, index) => {
            const x = index % 2 === 0 ? 10 : 185;
            const y = index < 2 ? 20 : 85;
            return (
              <g key={input}>
                <rect x={x} y={y} width="165" height="44" rx="10" />
                <text x={x + 14} y={y + 28}>
                  {input}
                </text>
              </g>
            );
          })}
          <rect x="10" y="150" width="340" height="44" rx="10" />
          <text x="24" y="178">
            git
          </text>
        </g>
        <circle className={styles.diagramHalo} cx="180" cy="305" r="66" />
        <circle className={styles.diagramCore} cx="180" cy="305" r="57" />
        <g
          transform="translate(132 257) scale(1.5)"
          className={styles.diagramMark}
        >
          <path
            d="M27 28 13 19.5Q9 17.2 9 21.8v20.4q0 4.6 4 2.3L27 36"
            fill="none"
            stroke="url(#mobile-mark)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m37 28 14-8.5q4-2.3 4 2.3v20.4q0 4.6-4 2.3L37 36"
            fill="none"
            stroke="#ff8a45"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="27" y="25" width="10" height="14" rx="3.5" />
        </g>
        <g className={styles.diagramOutputs}>
          {outputs.map((output, index) => {
            const x = index % 2 === 0 ? 10 : 185;
            const y = index < 2 ? 430 : 500;
            return (
              <g key={output}>
                <rect x={x} y={y} width="165" height="44" rx="10" />
                <text x={x + 14} y={y + 28}>
                  {output}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
  );
}

function Terminal({ active }: { active: number }) {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <i />
        <i />
        <i />
        <span>{steps[active].file}</span>
      </div>
      <pre aria-live="polite" key={active}>
        {steps[active].screen}
      </pre>
    </div>
  );
}

function CopyCommand({ dark = false }: { dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText("tie serve");
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button
      className={dark ? styles.commandButton : styles.commandButtonLight}
      onClick={copy}
      type="button"
      aria-label="Copy the planned tie serve command"
    >
      <code>$ tie serve</code>
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "tie.md",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      url: "https://tie.md",
      description: "A local-first visual control plane for OpenSpec projects.",
      codeRepository: github,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([name, text]) => ({
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      })),
    },
  ],
};

export default function Home(): ReactNode {
  const [activeStep, setActiveStep] = useState(0);
  function moveStep(current: number, direction: 1 | -1) {
    const next = (current + direction + steps.length) % steps.length;
    setActiveStep(next);
    requestAnimationFrame(() =>
      document.getElementById(`workflow-step-${next}`)?.focus(),
    );
  }
  return (
    <Layout
      title="Don't replace your stack. Tie it."
      description="A local-first visual control plane for OpenSpec projects."
    >
      <Head>
        <link rel="canonical" href="https://tie.md/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="tie.md — Don't replace your stack. Tie it."
        />
        <meta
          property="og:description"
          content="Make OpenSpec work visible, supervised, and traceable—without replacing Markdown, Git, or your coding agent."
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <main className={styles.landing}>
        <header className={styles.hero}>
          <div className={styles.wrap}>
            <div className={styles.heroCopy}>
              <span className={styles.pill}>
                <i />
                Local-first · Markdown-native · in development
              </span>
              <h1>
                Don&apos;t replace your stack.
                <br />
                <em>Tie it.</em>
              </h1>
              <p>
                Specification-driven development, your coding agent, reusable
                skills, and Git are already useful on their own.
                <strong>tie.md</strong> brings them into one visible, supervised
                harness—local, file-based, and yours to untie.
              </p>
              <div className={styles.actions}>
                <Link
                  className={styles.primaryAction}
                  to="/docs/getting-started"
                >
                  Explore the workflow <span aria-hidden="true">→</span>
                </Link>
                <Link className={styles.ghostAction} href={github}>
                  Follow development on GitHub
                </Link>
              </div>
              <small>
                Planned for Windows · macOS · Linux · no hosted account required
              </small>
            </div>
            <HarnessDiagram />
          </div>
          <div className={styles.compatibility}>
            <span>Works with what you have</span>
            {[
              "OpenSpec",
              "OpenAI Codex",
              "Claude",
              "GitHub Copilot",
              "AGENTS.md",
              "SKILL.md",
              "Git",
            ].map((item) => (
              <code key={item}>{item}</code>
            ))}
          </div>
        </header>

        <section className={`${styles.section} ${styles.problem}`}>
          <div className={styles.wrap}>
            <div className={styles.heading}>
              <span className={styles.eyebrowOrange}>The problem</span>
              <h2>Great tools. Loose ends.</h2>
              <p>
                Specification-driven development with coding agents works.
                Reconstructing the state of that work every time you return does
                not.
              </p>
            </div>
            <div className={styles.problemGrid}>
              {[
                [
                  "01",
                  "State lives in five places",
                  "Shell output, nested Markdown, Git history, and an agent conversation. Active, valid, blocked—you rebuild the picture by hand.",
                ],
                [
                  "02",
                  "“Done” is not evidence",
                  "Which agent ran, which skills it used, which command it executed, and which files actually changed should be inspectable.",
                ],
                [
                  "03",
                  "The line from spec to test disappears",
                  "Without trace links, it is hard to distinguish planned, built, tested, delivered, stale, and out-of-scope work.",
                ],
              ].map(([number, title, body]) => (
                <article className={styles.card} key={number}>
                  <code>loose end {number}</code>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.how}`} id="how">
          <div className={styles.wrap}>
            <div className={styles.heading}>
              <span className={styles.eyebrow}>How it works</span>
              <h2>One command. Five clear decisions. Same repository.</h2>
            </div>
            <div className={styles.stepsLayout}>
              <div
                className={styles.stepList}
                role="tablist"
                aria-label="tie.md workflow"
              >
                {steps.map((step, index) => (
                  <button
                    key={step.title}
                    id={`workflow-step-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={activeStep === index}
                    aria-controls="workflow-terminal"
                    onClick={() => setActiveStep(index)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "ArrowDown" ||
                        event.key === "ArrowRight"
                      ) {
                        event.preventDefault();
                        moveStep(index, 1);
                      }
                      if (
                        event.key === "ArrowUp" ||
                        event.key === "ArrowLeft"
                      ) {
                        event.preventDefault();
                        moveStep(index, -1);
                      }
                    }}
                    tabIndex={activeStep === index ? 0 : -1}
                  >
                    <span>{index + 1}</span>
                    <span>
                      <strong>{step.title}</strong>
                      <small>{step.body}</small>
                    </span>
                  </button>
                ))}
              </div>
              <div id="workflow-terminal" role="tabpanel">
                <Terminal active={activeStep} />
              </div>
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.promise}`}
          id="principles"
        >
          <div className={styles.wrap}>
            <div className={styles.promiseCopy}>
              <span className={styles.eyebrowOrange}>The promise</span>
              <h2>
                A knot, not a cage.
                <br />
                Untie anytime.
              </h2>
              <p>
                Files are the product data. Stop using tie.md tomorrow and keep
                working with OpenSpec, your editor, your agent, and Git—nothing
                to export or migrate.
              </p>
              <ul>
                <li>
                  <b>✓</b>
                  <span>
                    OpenSpec stays authoritative; tie.md invokes and reflects
                    it.
                  </span>
                </li>
                <li>
                  <b>✓</b>
                  <span>
                    Any cache is disposable and rebuildable from project files.
                  </span>
                </li>
                <li>
                  <b>✓</b>
                  <span>
                    Your coding agent keeps its own interface and account.
                  </span>
                </li>
                <li>
                  <b>✓</b>
                  <span>Consequential transitions remain human-approved.</span>
                </li>
              </ul>
            </div>
            <div className={styles.terminal}>
              <div className={styles.terminalBar}>
                <i />
                <i />
                <i />
                <span>everything tie.md adds</span>
              </div>
              <pre>{`my-app/
├── src/
├── openspec/                  unchanged · authoritative
│   └── changes/add-billing/
│       ├── proposal.md
│       ├── tasks.md
│       └── .tie.yaml          ← assignment metadata
├── agent-roster/              plain Markdown
├── skills/                    SKILL.md directories
├── .tie/config.yaml           ← sources and defaults
├── .tie/rtm.yaml              ← trace links and baselines
└── AGENTS.md                  unchanged

~/.tie/config.yaml             shared sources and trust`}</pre>
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.features}`}
          id="features"
        >
          <div className={styles.wrap}>
            <div className={styles.heading}>
              <span className={styles.eyebrow}>What gets tied</span>
              <h2>A familiar board on top. Real evidence underneath.</h2>
            </div>
            <div className={styles.featureGrid}>
              {features.map(([title, body, proof], index) => (
                <article className={styles.featureCard} key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <code>{proof}</code>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.audiences}`}>
          <div className={styles.wrap}>
            <div className={styles.heading}>
              <span className={styles.eyebrowOrange}>Who it is for</span>
              <h2>One control plane. Three ways into the truth.</h2>
            </div>
            <div className={styles.audienceGrid}>
              <article>
                <b>Builders</b>
                <p>
                  Return to the next useful task quickly, then hand approved
                  work to an agent with explicit skills and boundaries.
                </p>
              </article>
              <article>
                <b>Product leads</b>
                <p>
                  Read proposals, decisions, assignments, validation, and
                  progress without reconstructing the repository from a
                  terminal.
                </p>
              </article>
              <article>
                <b>QA and analysts</b>
                <p>
                  See requirement-level coverage, stale evidence, scope changes,
                  and impact paths before archive or release.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.vision}`} id="vision">
          <div className={styles.wrap}>
            <div className={styles.headingDark}>
              <span className={styles.eyebrowLight}>The direction</span>
              <h2>
                From a loose toolkit to an <em>AI software factory</em>—one
                approved knot at a time.
              </h2>
              <p>
                The MVP starts deliberately small: one person, one workspace,
                one supervised mutating run. The same files can later support
                isolated workspaces, agent handoffs, and independent
                verification gates.
              </p>
            </div>
            <div className={styles.roadmap}>
              {[
                [
                  "Now · MVP",
                  "One supervised run",
                  "One workspace, one operator, one approved mutating agent run at a time.",
                ],
                [
                  "Next",
                  "Parallel workspaces",
                  "Isolated work with explicit merge and independent verification gates.",
                ],
                [
                  "Then",
                  "Agent teams",
                  "Planner, builder, and QA handoffs with visible queues and policy-based review.",
                ],
                [
                  "Later",
                  "The factory",
                  "Scripts, MCP inventory, model routing by risk, and Git-host integrations.",
                ],
              ].map(([tag, title, body], index) => (
                <article
                  className={index === 0 ? styles.roadmapActive : ""}
                  key={tag}
                >
                  <code>{tag}</code>
                  <b>{title}</b>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <small>
              Direction, not a release commitment. Human approval remains the
              invariant.
            </small>
          </div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} id="faq">
          <div className={styles.wrapNarrow}>
            <span className={styles.eyebrow}>FAQ</span>
            <h2>Questions, answered plainly.</h2>
            <div>
              {faqs.map(([question, answer], index) => (
                <details key={question} open={index === 0}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.wrap}>
            <div className={styles.finalCard}>
              <BrandMark size={74} />
              <h2>Keep your tools. Tie them together.</h2>
              <p>
                Follow the open development of a calmer, inspectable way to
                supervise specification-driven work.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primaryAction} href={github}>
                  Watch the repository <span aria-hidden="true">→</span>
                </Link>
                <CopyCommand dark />
              </div>
              <small>
                <code>tie serve</code> is the planned local CLI entry point;
                release availability will be announced on GitHub.
              </small>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
