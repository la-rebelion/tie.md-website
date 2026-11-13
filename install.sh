#!/bin/sh
set -eu

VERSION="${TIE_VERSION:-v0.1.0}"
REPOSITORY="la-rebelion/tie.md"
INSTALL_DIR="${TIE_INSTALL_DIR:-${HOME}/.local/bin}"

if ! printf '%s\n' "$VERSION" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "tie.md installer: invalid version '$VERSION' (expected vMAJOR.MINOR.PATCH)" >&2
  exit 2
fi

command -v curl >/dev/null 2>&1 || {
  echo "tie.md installer: curl is required" >&2
  exit 1
}

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  linux) PLATFORM="linux" ;;
  darwin) PLATFORM="macos" ;;
  *)
    echo "tie.md installer: unsupported operating system '$OS'; use install.ps1 on Windows" >&2
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCHITECTURE="x64" ;;
  arm64|aarch64) ARCHITECTURE="arm64" ;;
  *)
    echo "tie.md installer: unsupported architecture '$ARCH'" >&2
    exit 1
    ;;
esac

ASSET="tie-${VERSION}-${PLATFORM}-${ARCHITECTURE}"
BASE_URL="https://github.com/${REPOSITORY}/releases/download/${VERSION}"
TEMP_DIRECTORY=$(mktemp -d "${TMPDIR:-/tmp}/tie-install.XXXXXX")
trap 'rm -rf "$TEMP_DIRECTORY"' EXIT HUP INT TERM

echo "Installing tie.md ${VERSION} for ${PLATFORM}-${ARCHITECTURE}"
if ! curl --fail --silent --show-error --location "$BASE_URL/$ASSET" --output "$TEMP_DIRECTORY/$ASSET"; then
  echo "tie.md installer: could not download $ASSET" >&2
  echo "Release: https://github.com/${REPOSITORY}/releases/tag/${VERSION}" >&2
  exit 1
fi
if ! curl --fail --silent --show-error --location "$BASE_URL/SHA256SUMS" --output "$TEMP_DIRECTORY/SHA256SUMS"; then
  echo "tie.md installer: could not download SHA256SUMS for ${VERSION}" >&2
  exit 1
fi

EXPECTED=$(awk -v asset="$ASSET" '$2 == asset || $2 == "artifacts/" asset { print $1; exit }' "$TEMP_DIRECTORY/SHA256SUMS")
if [ -z "$EXPECTED" ]; then
  echo "tie.md installer: SHA256SUMS does not contain $ASSET" >&2
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL=$(sha256sum "$TEMP_DIRECTORY/$ASSET" | awk '{ print $1 }')
elif command -v shasum >/dev/null 2>&1; then
  ACTUAL=$(shasum -a 256 "$TEMP_DIRECTORY/$ASSET" | awk '{ print $1 }')
else
  echo "tie.md installer: sha256sum or shasum is required to verify the download" >&2
  exit 1
fi

EXPECTED=$(printf '%s' "$EXPECTED" | tr '[:upper:]' '[:lower:]')
ACTUAL=$(printf '%s' "$ACTUAL" | tr '[:upper:]' '[:lower:]')
if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "tie.md installer: checksum verification failed" >&2
  echo "Expected: $EXPECTED" >&2
  echo "Actual:   $ACTUAL" >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
STAGED="$INSTALL_DIR/.tie.install.$$"
cp "$TEMP_DIRECTORY/$ASSET" "$STAGED"
chmod 0755 "$STAGED"
mv -f "$STAGED" "$INSTALL_DIR/tie"

echo "Verified SHA-256 and installed tie to $INSTALL_DIR/tie"
"$INSTALL_DIR/tie" --version

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo "Add this directory to PATH before running tie from another shell:"
    echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac
