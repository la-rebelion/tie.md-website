import { afterAll, describe, expect, test } from "bun:test";
import { chmod, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const shell = await Bun.file("static/install.sh").text();
const powershell = await Bun.file("static/install.ps1").text();
const page = await Bun.file("src/pages/install.tsx").text();
const temporaryRoots: string[] = [];

afterAll(async () => {
  await Promise.all(
    temporaryRoots.map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("binary installers", () => {
  test("pins v0.1.0 and verifies checksums from the matching GitHub release", () => {
    for (const source of [shell, powershell]) {
      expect(source).toContain("v0.1.0");
      expect(source).toContain("la-rebelion/tie.md");
      expect(source).toContain("SHA256SUMS");
      expect(source.toLocaleLowerCase()).toContain("checksum");
    }
    expect(shell).toContain("sha256sum");
    expect(shell).toContain("shasum -a 256");
    expect(powershell).toContain("Get-FileHash -Algorithm SHA256");
  });

  test("covers every supported direct binary without escalating privileges", () => {
    for (const target of ["linux", "macos", "windows-x64"]) {
      expect(`${shell}\n${powershell}`).toContain(target);
    }
    expect(shell).toContain('x86_64|amd64) ARCHITECTURE="x64"');
    expect(shell).toContain('arm64|aarch64) ARCHITECTURE="arm64"');
    expect(shell).not.toMatch(/\bsudo\b/u);
    expect(powershell).not.toMatch(/Start-Process.+RunAs/iu);
  });

  test("publishes static, inspectable commands and script links", () => {
    expect(page).toContain("https://tie.md/install.sh");
    expect(page).toContain("https://tie.md/install.ps1");
    expect(page).toContain('href="/install.sh"');
    expect(page).toContain('href="/install.ps1"');
    expect(page).toContain("Release candidate");
  });

  test("has valid POSIX syntax and installs only a checksum-matching fixture", async () => {
    if (process.platform === "win32") return;
    const root = await mkdtemp(join(tmpdir(), "tie-website-installer-"));
    temporaryRoots.push(root);
    const installDir = join(root, "installed");
    await Bun.write(
      join(root, "curl"),
      `#!/bin/sh
set -eu
output=""
url=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --output) output="$2"; shift 2 ;;
    http*) url="$1"; shift ;;
    *) shift ;;
  esac
done
case "$url" in
  *SHA256SUMS)
    asset=$(find "$(dirname "$output")" -type f ! -name SHA256SUMS | head -n 1)
    if [ "\${FAKE_BAD_HASH:-0}" = "1" ]; then
      hash=0000000000000000000000000000000000000000000000000000000000000000
    elif command -v sha256sum >/dev/null 2>&1; then
      hash=$(sha256sum "$asset" | awk '{ print $1 }')
    else
      hash=$(shasum -a 256 "$asset" | awk '{ print $1 }')
    fi
    printf '%s  artifacts/%s\n' "$hash" "$(basename "$asset")" > "$output"
    ;;
  *) printf '#!/bin/sh\necho tie.md 0.1.0 fixture\n' > "$output" ;;
esac
`,
    );
    await chmod(join(root, "curl"), 0o755);

    const syntax = Bun.spawn(["sh", "-n", "static/install.sh"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await syntax.exited).toBe(0);

    const run = Bun.spawn(["sh", "static/install.sh"], {
      env: {
        ...Bun.env,
        HOME: root,
        PATH: `${root}:${Bun.env.PATH ?? ""}`,
        TIE_INSTALL_DIR: installDir,
        TIE_VERSION: "v0.1.0",
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(run.stdout).text();
    expect(await run.exited).toBe(0);
    expect(output).toContain("Verified SHA-256");
    expect(await Bun.file(join(installDir, "tie")).exists()).toBe(true);

    await rm(join(installDir, "tie"));
    const rejected = Bun.spawn(["sh", "static/install.sh"], {
      env: {
        ...Bun.env,
        FAKE_BAD_HASH: "1",
        HOME: root,
        PATH: `${root}:${Bun.env.PATH ?? ""}`,
        TIE_INSTALL_DIR: installDir,
        TIE_VERSION: "v0.1.0",
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await rejected.exited).not.toBe(0);
    expect(await Bun.file(join(installDir, "tie")).exists()).toBe(false);
  });
});
