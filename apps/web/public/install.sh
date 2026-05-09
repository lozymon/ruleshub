#!/bin/sh
# RulesHub CLI installer
#
#   curl -fsSL https://ruleshub.dev/install.sh | sh
#
# Optional environment overrides:
#   RULESHUB_VERSION       — install a specific version (default: latest release)
#   RULESHUB_INSTALL_DIR   — install location (default: $HOME/.local/bin)
#   RULESHUB_REPO          — source repo (default: lozymon/ruleshub)

set -eu

REPO="${RULESHUB_REPO:-lozymon/ruleshub}"
INSTALL_DIR="${RULESHUB_INSTALL_DIR:-$HOME/.local/bin}"
VERSION="${RULESHUB_VERSION:-}"

err() { printf "error: %s\n" "$1" >&2; exit 1; }
log() { printf "%s\n" "$1"; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || err "missing required command: $1"; }

detect_target() {
    os="$(uname -s)"
    arch="$(uname -m)"

    case "$os" in
        Linux)
            case "$arch" in
                x86_64|amd64)   TARGET="x86_64-unknown-linux-musl" ;;
                aarch64|arm64)  TARGET="aarch64-unknown-linux-musl" ;;
                *) err "unsupported architecture: $arch" ;;
            esac
            ;;
        Darwin)
            case "$arch" in
                x86_64|amd64)   TARGET="x86_64-apple-darwin" ;;
                arm64|aarch64)  TARGET="aarch64-apple-darwin" ;;
                *) err "unsupported architecture: $arch" ;;
            esac
            ;;
        *) err "unsupported OS: $os (Windows users: use install.ps1)" ;;
    esac
}

get_latest_version() {
    log "fetching latest release tag from $REPO..."
    tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
        | grep '"tag_name"' | head -1 | cut -d '"' -f 4)
    [ -n "$tag" ] || err "could not determine latest release tag"
    VERSION="${tag#cli-v}"
}

sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | awk '{print $1}'
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$1" | awk '{print $1}'
    else
        err "no sha256 tool available (need sha256sum or shasum)"
    fi
}

main() {
    need_cmd curl
    need_cmd tar
    need_cmd awk

    detect_target
    [ -n "$VERSION" ] || get_latest_version

    archive="ruleshub-${VERSION}-${TARGET}.tar.gz"
    base="https://github.com/${REPO}/releases/download/cli-v${VERSION}"
    url="${base}/${archive}"
    sums_url="${base}/SHA256SUMS"

    log "installing ruleshub v${VERSION} for ${TARGET}..."

    tmp=$(mktemp -d 2>/dev/null || mktemp -d -t ruleshub)
    trap 'rm -rf "$tmp"' EXIT INT TERM

    log "downloading $url"
    curl -fsSL "$url" -o "$tmp/$archive"

    log "verifying checksum..."
    curl -fsSL "$sums_url" -o "$tmp/SHA256SUMS"
    expected=$(awk -v f="$archive" '$2 == f {print $1}' "$tmp/SHA256SUMS")
    [ -n "$expected" ] || err "no checksum found for $archive in SHA256SUMS"
    actual=$(sha256_of "$tmp/$archive")
    [ "$actual" = "$expected" ] || err "checksum mismatch for $archive"

    log "extracting..."
    tar xzf "$tmp/$archive" -C "$tmp"

    mkdir -p "$INSTALL_DIR"
    extracted="$tmp/ruleshub-${VERSION}-${TARGET}"
    install -m 755 "$extracted/ruleshub" "$INSTALL_DIR/ruleshub"

    log ""
    log "ok: ruleshub v${VERSION} installed to ${INSTALL_DIR}/ruleshub"

    case ":${PATH}:" in
        *":${INSTALL_DIR}:"*) ;;
        *)
            log ""
            log "warning: ${INSTALL_DIR} is not in your PATH"
            log "add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
            log "  export PATH=\"${INSTALL_DIR}:\$PATH\""
            ;;
    esac
}

main
