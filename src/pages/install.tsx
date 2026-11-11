import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./install.module.css";

const shellCommand = "curl -fsSL https://tie.md/install.sh | sh";
const powershellCommand = "irm https://tie.md/install.ps1 | iex";

const targets = [
  ["Linux", "x64, arm64", "~/.local/bin/tie"],
  ["macOS", "Intel x64, Apple silicon", "~/.local/bin/tie"],
  ["Windows", "x64", "%LOCALAPPDATA%\\Programs\\tie.md\\bin\\tie.exe"],
];

function InstallCommand({
  command,
  label,
}: {
  command: string;
  label: string;
}) {
  return (
    <div className={styles.command} aria-label={label}>
      <code>{command}</code>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Layout
      title="Install tie.md"
      description="Install the verified tie.md v0.1.0 binary on Linux, macOS, or Windows."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>tie.md v0.1.0</p>
            <h1>Install the local-first OpenSpec control plane</h1>
            <p className={styles.lede}>
              The installer selects the binary for your platform, downloads it
              from the immutable GitHub release, verifies its SHA-256 checksum,
              and installs it without requiring Bun or Node.js.
            </p>
          </div>
        </section>

        <div className={`${styles.wrap} ${styles.content}`}>
          <aside className={styles.candidate} aria-label="Release status">
            <strong>Release candidate</strong>
            <span>
              These commands become available when v0.1.0 is published. Until
              then, GitHub will return a clear “release not found” error.
            </span>
          </aside>

          <section
            className={styles.installGrid}
            aria-labelledby="quick-install"
          >
            <div>
              <p className={styles.step}>Linux and macOS</p>
              <h2 id="quick-install">Install with a POSIX shell</h2>
              <InstallCommand
                command={shellCommand}
                label="Linux and macOS installation command"
              />
              <p>
                By default, Tie installs to <code>~/.local/bin/tie</code>.
                Override the version or destination with{" "}
                <code>TIE_VERSION</code> and <code>TIE_INSTALL_DIR</code>.
              </p>
              <div className={styles.links}>
                <a href="/install.sh">Read install.sh</a>
                <a href="/install.sh" download>
                  Download script
                </a>
              </div>
            </div>

            <div>
              <p className={styles.step}>Windows PowerShell</p>
              <h2>Install for the current user</h2>
              <InstallCommand
                command={powershellCommand}
                label="Windows installation command"
              />
              <p>
                The installer writes to your local application directory and
                adds that directory to your user PATH. v0.1.0 supports Windows
                x64.
              </p>
              <div className={styles.links}>
                <a href="/install.ps1">Read install.ps1</a>
                <a href="/install.ps1" download>
                  Download script
                </a>
              </div>
            </div>
          </section>

          <section
            className={styles.integrity}
            aria-labelledby="integrity-title"
          >
            <div>
              <p className={styles.step}>Integrity first</p>
              <h2 id="integrity-title">Know what the installer does</h2>
            </div>
            <ol>
              <li>
                Detects only a documented operating system and architecture.
              </li>
              <li>
                Downloads the binary and SHA256SUMS from the same tagged GitHub
                release.
              </li>
              <li>
                Refuses installation when the expected checksum is absent or
                mismatched.
              </li>
              <li>
                Installs in a user-owned directory by default and never invokes
                sudo.
              </li>
              <li>
                Runs the installed binary with <code>--version</code> before
                reporting success.
              </li>
            </ol>
            <p>
              Prefer reviewing scripts before piping them into a shell. v0.1.0
              binaries are not code-signed; checksum verification is required.
            </p>
          </section>

          <section className={styles.matrix} aria-labelledby="platform-title">
            <p className={styles.step}>Supported binaries</p>
            <h2 id="platform-title">Platform matrix</h2>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Operating system</th>
                    <th>Architectures</th>
                    <th>Default destination</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map(([platform, architectures, destination]) => (
                    <tr key={platform}>
                      <th scope="row">{platform}</th>
                      <td>{architectures}</td>
                      <td>
                        <code>{destination}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className={styles.alternatives}
            aria-labelledby="alternatives-title"
          >
            <p className={styles.step}>Other installation paths</p>
            <h2 id="alternatives-title">npm or direct download</h2>
            <div className={styles.alternativeGrid}>
              <div>
                <h3>npm launcher</h3>
                <InstallCommand
                  command="npm install --global @tie-md/cli@0.1.0"
                  label="npm installation command"
                />
                <p>
                  Requires Node.js 20+ only for selecting and starting the
                  native package.
                </p>
              </div>
              <div>
                <h3>Release assets</h3>
                <p>
                  Download a binary, <code>SHA256SUMS</code>, and the
                  machine-readable release manifest directly from GitHub.
                </p>
                <Link
                  className={styles.releaseLink}
                  href="https://github.com/la-rebelion/tie.md/releases"
                >
                  Browse GitHub releases
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
