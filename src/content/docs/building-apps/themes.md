---
title: Themes
description: The seven mos palettes, the --mc-* CSS variable contract every panel reads, and how to add your own theme.
---

Every mos-based SPA ships with the same seven palettes. An operator
picks one from the palette icon in the top-right of the titlebar and
the choice is persisted per-app via a first-party cookie.

## The seven palettes

| ID              | Mode  | Accent         | Feel                                 |
|-----------------|-------|----------------|--------------------------------------|
| `slate`         | dark  | steel blue     | cool grey — default dark             |
| `midnight`      | dark  | soft lavender  | deep navy                            |
| `dusk`          | dark  | apricot        | warm aubergine                       |
| `graphite`      | dark  | muted bronze   | neutral charcoal                     |
| `mist`          | light | deep slate     | pale cool light                      |
| `sepia`         | light | terracotta     | warm cream                           |
| `high-contrast` | dark  | amber          | near-black + white (accessibility)   |

The full registry is exported from `@mosaigo/studio-ui`:

```ts
import { THEMES, type ThemeID } from "@mosaigo/studio-ui";

console.log(THEMES);
// [{ id: "slate", label: "Slate", mode: "dark", swatch: "#7d9bb5", ... }, ...]
```

## The CSS variable contract

Every studio-ui component renders through `--mc-*` custom properties
that map onto the active theme's underlying palette. Adding a new
theme means defining the base `--bg` / `--panel` / `--border` /
`--text` / `--accent` / `--ok` / `--warn` / `--error` variables under
a `[data-theme="..."]` selector. The `--mc-*` layer resolves
automatically.

Stable names every component relies on:

| Variable             | Role                                          |
|----------------------|-----------------------------------------------|
| `--bg` / `--mc-bg`   | main background                               |
| `--panel` / `--mc-panel` | card / titlebar / statusbar background    |
| `--panel-2` / `--mc-panel-2` | nested / hover background              |
| `--border` / `--mc-border` | panel + input borders                    |
| `--border-soft`      | muted separator lines                         |
| `--text` / `--mc-fg` | default body text                             |
| `--text-strong`      | headings, brand titles, strong emphasis       |
| `--muted` / `--mc-muted` | labels, secondary text                    |
| `--accent` / `--mc-accent` | active nav, chip selection, primary btn |
| `--accent-soft`      | hover / selected state backgrounds            |
| `--accent-on`        | foreground over `--accent` fills              |
| `--ok` / `--mc-ok`   | success / executing status                    |
| `--warn` / `--mc-warn` | warning / degraded status                   |
| `--error` / `--mc-err` | error / failure status                      |
| `--shadow`, `--shadow-lg` | panel elevation                          |

Host app stylesheets should reference `--bg` / `--panel` / ... for
chrome and let studio-ui components read the `--mc-*` aliases. The
`--mc-*` names exist so studio-ui can be consumed in apps that use
different brand-level variable names; only the `--mc-*` surface is
considered stable across versions.

## Importing the palette CSS

Host apps include studio-ui's theme CSS once in their entry point:

```ts
// main.tsx or style.css
import "@mosaigo/studio-ui/themes/themes.css";
```

That file defines every `[data-theme="..."]` selector. The active
theme is switched by setting `document.documentElement.setAttribute("data-theme", id)`,
which `MosShell` does on bootstrap via `applyTheme(id)` from the
themes module.

## Cookie persistence

The theme picker writes to a per-app cookie. `MosShell` namespaces
the cookie via your `config.appName`:

- `mosapp_theme`
- `moslab_theme`
- `moscam_theme`

Two mos apps on the same host don't stomp on each other's
preferences. The cookie is first-party, `SameSite=Lax`, one-year
lifetime — readable by server-rendered pages so the gateway can
stamp `data-theme` on first byte to avoid a flash.

## Adding a new palette

If none of the seven fit your app's brand:

1. Add a new `[data-theme="yourid"] { --bg: ...; --accent: ...; ... }`
   block in a host-app CSS file loaded after `themes.css`.
2. Register it in your `THEMES` list (copy the array from studio-ui,
   append a new entry with `id`, `label`, `description`, `mode`,
   `swatch`).
3. Pass your extended list to `ThemePicker` (if you're rendering it
   yourself) — or, if you're using `MosShell`, file an issue in
   `mosaigo/` to expose a `config.themes` override. Until then,
   apps that need a ninth theme subclass `MosShell` inline.

## Known gaps

- TopologyPanel's semantic colour map (LOAD / STORE / REQ / META /
  WANT) is intentionally hex — those encode relationship types, not
  chrome. A future version will expose these as `--mc-topology-*`
  so apps can recolour relationship edges too.
- Some semantic per-event-type colours (the EventChipsBar chips) are
  hard-coded per event-category. The category palette (`engine`,
  `lifecycle`, `issue`, `store`, `vision`, `system`) ships with
  studio-ui; apps with new categories currently patch at the chip
  render level.
