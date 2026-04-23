---
title: Versioning and builds
description: The srv v… · ui v… footer convention, where build numbers come from, and the reusable GitHub Actions workflows every app can call into.
---

Every mos-based app displays its version in the SPA footer as
`srv v<version>.<build> · ui v<version>.<build>` alongside the
connection dot and Wake-Lock toggle. Keeping the server and SPA
build numbers aligned is a hard contract: if they disagree, the SPA
has drifted from the binary and the operator needs to know.

## Version + build number format

```
<semver>.<build>
0.2.0.a92bbde         # local dev, short git sha
0.2.0.20260422.2229   # fallback UTC stamp (no git)
0.2.0.22fc80e         # CI build tagged with commit sha
```

The format is `<version>.<build>` — three dots, not four. The
version comes from the app's `VERSION` file; the build number is
resolved in priority order:

1. `MOSAPP_BUILD_NUMBER` (or `BUILD_NUMBER`) environment variable.
   CI sets this to the commit SHA.
2. `git rev-parse --short=7 HEAD`. Deterministic across developers
   at the same commit.
3. UTC stamp `YYYYMMDD.HHMM`. Last-resort fallback.

## The SPA side (Vite)

`studio/spa/vite.config.ts` reads the app's `VERSION` file and
resolves the build number. It injects `__UI_VERSION__` as a define:

```ts
import { execSync } from "node:child_process";

function readBuildNumber(): string {
  const env = process.env.MOSAPP_BUILD_NUMBER ?? process.env.BUILD_NUMBER;
  if (env) return env;
  try {
    return execSync("git rev-parse --short=7 HEAD").toString().trim();
  } catch { /* not a checkout */ }
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}.${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}

const UI_VERSION = `${readRepoVersion()}.${readBuildNumber()}`;

export default defineConfig({
  define: { __UI_VERSION__: JSON.stringify(UI_VERSION) },
  ...
});
```

The SPA entry point declares the type and passes it into `MosShell`:

```ts
declare const __UI_VERSION__: string;

<MosShell uiVersion={__UI_VERSION__} config={...} />
```

## The Go side (Makefile)

`mos.Version` and `mos.BuildNumber` are the canonical server-side
variables. The app Makefile plumbs both through `-ldflags`:

```make
VERSION      := $(shell cat VERSION)
BUILD_NUMBER ?= $(shell \
  if [ -n "$$MOSAPP_BUILD_NUMBER" ]; then echo $$MOSAPP_BUILD_NUMBER; \
  elif git rev-parse --short=7 HEAD 2>/dev/null; then :; \
  else date -u +%Y%m%d.%H%M; fi)
LDFLAGS := -X github.com/mosaigoio/mosaigo/mos.Version=$(VERSION) \
           -X github.com/mosaigoio/mosaigo/mos.BuildNumber=$(BUILD_NUMBER)

build-go:
	go build -trimpath -ldflags "$(LDFLAGS)" -o bin/<app> ./cmd/<app>
```

`make print-version` shows what the next build will stamp:

```
$ make print-version
version: 0.2.0
build:   22fc80e
full:    0.2.0.22fc80e
```

## Reusable GitHub Actions workflows

mosaigo publishes two reusable workflows every app can call. No app
needs to maintain its own CI YAML beyond a handful of lines
delegating to these.

### `reusable-app-ci.yml`

Runs vet + test + race + build for a mos-based app, handling the
sibling-repo checkout that every app's `replace
github.com/mosaigoio/mosaigo => ../mosaigo` directive requires.

```yaml
# <your-app>/.github/workflows/ci.yml
name: ci
on:
  workflow_dispatch:   # manual only — flip to push/pull_request when you have quota
jobs:
  build:
    uses: mosaigoio/mosaigo/.github/workflows/reusable-app-ci.yml@main
    with:
      app_repo: mosaigoio/<your-app>
      app_path: <your-app>
```

Inputs: `app_repo` (required), `app_path`, `go_version` (default
1.24), `node_version` (default 20), `mosaigo_ref` (default main),
`run_race` (default true).

### `reusable-app-image.yml`

Builds a multi-arch container image (linux/amd64 + linux/arm64) and
pushes to GHCR. Produces three tags: `:latest`, `:<version>`, and
`:<version>.<sha>`.

```yaml
# <your-app>/.github/workflows/release.yml
name: release
on:
  workflow_dispatch:
    inputs:
      version:
        description: "Release version (empty = VERSION file)"
        required: false
jobs:
  image:
    uses: mosaigoio/mosaigo/.github/workflows/reusable-app-image.yml@main
    with:
      app_repo: mosaigoio/<your-app>
      app_path: <your-app>
      image_name: ghcr.io/mosaigoio/<your-app>
      containerfile: <your-app>/docker/Containerfile
      build_context: .
      version_input: ${{ inputs.version }}
    secrets: inherit
```

Both workflows are `workflow_dispatch`-only by default — an operator
has to kick them off from the Actions tab. Flip the `on:` stanza to
include `push` / `pull_request` when you have Actions quota
headroom.

## Why this matters

The footer convention (`srv v… · ui v…`) is the single fastest way
for an operator on a call to say "I'm running 0.2.0.a92bbde" and
for the developer to know exactly which commit they're looking at.
Apps that skip the build number ("just 0.2.0") lose that
traceability the moment two rebuilds of the same version ship with
different content.
