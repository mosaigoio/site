---
title: Step Catalog
description: Browse all available pipeline steps across mosaigo and mosoptics.
---

The step catalog lists all registered `StepDef` instances across the mosaigoio projects. Each step is a composable, typed pipeline unit with declared input, output, config schema, and metadata.

## mosaigo core steps

| Step | Package | Description |
|------|---------|-------------|
| `pubsub.*` | `steps/pubsub` | Topic-based publish/subscribe |
| `lastvalue.*` | `steps/lastvalue` | Last-value cache for payloads |
| `latmon.*` | `steps/latmon` | Latency monitoring |
| `sysmon.*` | `steps/sysmon` | System resource monitoring |

## mosoptics vision steps

See the [mosoptics documentation](/mosoptics/) for the full list of vision step packages including camera capture, face detection, gaze estimation, and GPU-accelerated inference.

---

*This catalog will be auto-generated from `StepDef` registrations as the codebase matures.*
