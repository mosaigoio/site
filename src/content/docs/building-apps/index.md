---
title: Building mosaigo apps
description: The shell, theme, auth, and build conventions every mos-based app shares.
---

mosaigo ships three primitives every mos-based app composes:

1. **`mosaigo`** — the Go pipeline framework (controller, engines,
   topics, last-value stores, stepdefs, GraphQL gateway).
2. **`@mosaigo/studio-ui`** — the Preact component library that
   renders the operator shell (titlebar, Side Nav, runtime views,
   StatusBar, themes, auth widgets, docs flyout).
3. **`mosapp`** — the reference consumer. Fork it when starting a
   new app; its `cmd/mosapp/main.go` and `studio/spa/src/app.tsx`
   are the shortest path to a working mos SPA.

This section documents the contracts those primitives expose so
every mos-based app looks and behaves the same from the operator's
side, regardless of which repo it ships from.

## The pages

- **[Shell & feature flags](./shell)** — `MosShell`, the composite
  component your SPA's `app.tsx` reduces to. Includes every
  feature flag, how to prepend app-specific nav items, and how to
  opt out of shell pieces you don't want.
- **[Themes](./themes)** — the seven shared palettes, the `--mc-*`
  CSS variable contract every panel reads from, and how to add
  your own theme without touching studio-ui.
- **[Authentication](./auth)** — the `appauth` Go package, the
  `/api/auth/config` contract, OIDC + master-token flows, and the
  SPA bootstrap sequence.
- **[Versioning & builds](./versioning)** — the `srv v… · ui v…`
  footer convention, where build numbers come from, and the
  reusable GitHub Actions workflows every app can call into.
