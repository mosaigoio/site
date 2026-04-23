---
title: Shell and feature flags
description: The MosShell composite component — how every mos-based SPA renders the same operator shell with one import.
---

`MosShell` from `@mosaigo/studio-ui` is the full operator shell as a
single Preact component. It renders a titlebar, collapsible Side Nav,
right-side documentation flyout, runtime views, and a bottom StatusBar
with build + connection info. mosapp's `app.tsx` is the canonical
consumer:

```tsx
import { MosShell, type RuntimeNavKey } from "@mosaigo/studio-ui";

declare const __UI_VERSION__: string;

const RUNTIME_KEYS: RuntimeNavKey[] = [
  "runtime.system",
  "runtime.templates",
  "runtime.config",
  "runtime.topology",
  "runtime.engines",
  "runtime.topics",
  "runtime.stores",
  "runtime.events",
  "runtime.latency",
  "runtime.health",
  "runtime.graphql",
  "runtime.logs",
];

export function App() {
  return (
    <MosShell
      uiVersion={__UI_VERSION__}
      config={{
        appName: "mosapp",
        titlePrefix: "mos",
        titleSuffix: "app",
        tagline: "reference mosaigo application",
        runtimeKeys: RUNTIME_KEYS,
        initialViewKey: "runtime.system",
      }}
    />
  );
}
```

That's the whole file — forty lines with imports, no state plumbing.

## What the shell takes care of

- **Theme bootstrap**: applies the saved theme cookie, installs the
  `data-theme` attribute on `<html>`, and renders the `ThemePicker`
  in the titlebar.
- **Storage namespacing**: every localStorage / sessionStorage key
  used by studio-ui gets prefixed with your `appName` so two mos
  apps on the same host don't share preferences.
- **Auth discovery**: polls `/api/auth/config` on mount and renders
  the Sign-in button + Master-token input only when the backend
  reports auth is configured. Apps without a `mosaigo.KeycloakConfig`
  entity get a clean auth-free UI automatically.
- **Fetch wrapper**: installs a global `window.fetch` wrapper that
  attaches `Authorization: Bearer <token>` on same-origin requests,
  so every panel authenticates without forking.
- **Runtime views + docs**: drops in the full set of runtime views
  (System / Templates / Config / Topology / Engines / Topics /
  Stores / Events / Latency / Health / GraphiQL / Logs), each with
  context-sensitive documentation in the right-side DocsPanel.
- **Status bar**: polled `/healthz` connection dot, server version,
  UI version, and a Wake Lock toggle.

## Feature flags

Every shell piece is opt-out via `features`. Mos-based apps with
deliberate minimal shells can turn individual pieces off:

```tsx
<MosShell
  config={{...}}
  features={{
    auth: true,          // Sign-in / Master-token / identity pill
    docs: true,          // Docs toggle + right-side DocsPanel
    themePicker: true,   // palette picker in titlebar
    wakeLock: true,      // "keep UI alive" mug in status bar
    connectionDot: true, // /healthz indicator in status bar
  }}
/>
```

All default to `true`. Typical reasons to flip one off:

- `auth: false` — for a private, on-host utility where master-token
  entry would just be noise.
- `docs: false` — for an app that has no domain-specific docs yet
  and doesn't want the Docs button staring at users.
- `wakeLock: false` — for server-facing control planes that don't
  display camera feeds (no need to prevent screen blanking).

## Adding your own nav items

Apps with domain views prepend them via `config.appNav` + `appViews`:

```tsx
<MosShell
  config={{
    appName: "mosoptics",
    appNav: [
      { key: "vision", label: "Vision", icon: <VisionIcon /> },
    ],
    appViews: [
      { key: "vision", render: () => <VisionPanel /> },
    ],
    appDocs: {
      vision: {
        breadcrumbs: ["mosoptics", "Vision"],
        title: "Vision",
        body: "Live camera feeds and gaze-tracking pipeline output.",
        related: [{ key: "runtime.system", label: "System" }],
      },
    },
    runtimeKeys: [...],
  }}
/>
```

App-owned nav items are rendered above the "Mosaigo Runtime" section.
App docs are merged with `defaultRuntimeDocs` so the DocsPanel
finds entries for both app keys and runtime keys.

## Trimming the runtime rail

`config.runtimeKeys` is the explicit list of runtime views to show.
Omit a key to hide that view entirely — useful when an app's
backend doesn't populate the corresponding data (no logs endpoint,
no templates engine, etc.).

## Where MosShell does not go

- `MosShell` does not manage your app's own data fetching beyond
  the runtime views. Any custom polling for domain state belongs
  in your `appViews` components.
- Authorization (who can see what) is not baked in. The `appauth`
  package attaches an `Identity` to the request context server-side;
  your own view components inspect `rt.enabled` / `oidcAuthenticated`
  and decide what to render.
