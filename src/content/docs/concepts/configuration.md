---
title: Configuration
description: Entity-based YAML configuration for pipelines, templates, profiles, and service settings.
---

All configuration in mosaigo uses an **entity-based format**: YAML lists where each entry is a self-describing entity with a `kind` field that identifies its type and a `name` field for unique identity.

## Entity format

```yaml
- kind: mosaigo.Service
  name: default
  port: 8765
  host: "0.0.0.0"

- kind: mosaigo.Pipeline
  name: system.cmd.pipeline
  desc: Process pipeline CRUD commands
  boot_phase: 1
  rate:
    type: delay
    delay_us: 200000
  steps:
    - def: system.cmd.pipeline.process
    - def: system.cmd.result.publish
```

Entity kinds use a namespace prefix to indicate the owning module. The `mosaigo` namespace contains framework-level entities. Domain libraries add their own namespaces (e.g., `mosoptics` for the vision step library).

## Pipeline scope

Pipeline and TemplatedPipeline entities support a `scope` field that controls which client loads them. File location (cli.yaml vs instances.yaml) is irrelevant. Both clients load all entity files and filter by scope.

| Scope | Loaded by | Use case |
|-------|-----------|----------|
| `all` (default) | mostudio + moscli | Shared pipelines visible to both clients |
| `studio` | mostudio only | Pipelines that should only run in the studio UI |
| `cli` | moscli only | Direct-to-window or testing pipelines |

Empty scope is treated as `all` for backward compatibility. The CLI is the primary config management tool: create and test pipeline config, then set scope to `all` to make it available to the studio.

```yaml
- kind: mosaigo.Pipeline
  name: elp-window
  scope: cli
  desc: ELP Stereo direct to window
  steps:
    - def: vision.camera.stereo
      config:
        camera_id: "0x12000032e49282"
    - def: show-dual-frame-window
      config:
        window_name: ELP Stereo
```

## Entity kinds

### mosaigo.Service

Configures the system controller: HTTP port, bind address, and endpoint paths.

```yaml
- kind: mosaigo.Service
  name: default
  port: 8765
  host: "0.0.0.0"
  graphql_path: /graphql
  health_path: /healthz
  playground_path: /playground
```

### mosaigo.Pipeline

A declarative engine definition with a step chain, rate governor, and latency marking. Each pipeline maps to one engine instance at runtime.

```yaml
- kind: mosaigo.Pipeline
  name: system.sysmon
  desc: Collect runtime metrics
  boot_phase: 1
  rate:
    type: delay
    delay_us: 1000000
  latency:
    level: step
    topic: latency-marks-infra
  steps:
    - def: system.sysmon.collect
```

Key fields:
- **boot_phase**: Controls startup order. Phase 1 is infrastructure, phase 2 is gateway, phase 3+ is user pipelines.
- **disabled**: When true, the engine is registered but not started.
- **rate**: Governor type (`delay`, `lifecycle`, or `fps`) with type-specific parameters.
- **latency**: Marking level (`step`, `engine`, or `sys`) and topic for latency measurement.

### mosaigo.PipelineTemplate

A parameterized pipeline that can be instantiated multiple times with different variable bindings. Variables use `${var}` syntax in step configs and are resolved at instantiation time.

```yaml
- kind: mosaigo.PipelineTemplate
  name: capture.single
  desc: Single camera capture pipeline
  category: capture
  variables:
    - name: camera_id
      desc: Camera device ID
      type: string
      required: true
    - name: resolution
      desc: Capture resolution
      type: string
      default: "1280x720"
  steps:
    - def: vision.camera.single
      config:
        camera_id: "${camera_id}"
        resolution: "${resolution}"
```

Variables support validation constraints (min, max, pattern, options) and dynamic lookups from last-value stores for populating UI dropdowns with live data.

### mosaigo.TemplatedPipeline

A running or saved instance of a template with resolved variables. These are auto-persisted to `instances.yaml` and restored on restart.

```yaml
- kind: mosaigo.TemplatedPipeline
  name: webcam-capture
  template: capture.single
  variables:
    camera_id: "ABC-123"
    resolution: "1280x720"
    fps: "30"
  state: running
```

State values: `running` (auto-start on restore) or `created` (saved but not started).

### mosaigo.TemplateProfile

A reusable set of variable values for a non-capture template. Template profiles let users save and switch between pipeline configurations for feed and process templates without re-entering values.

Template profiles are **not used for capture templates**. Resolution, fps, format, flip, mirror, brightness, contrast, exposure, and gain are device-specific attributes that depend on camera capabilities and physical positioning. Capture-related profiles belong on the specific camera registration as `mosoptics.CaptureProfile` entities.

```yaml
- kind: mosaigo.TemplateProfile
  name: gridview.quad-2x2
  title: Quad View (2x2 grid)
  template: feed.gridview
  variables:
    cols: "2"
    rows: "2"
    cell_width: "480"
    cell_height: "360"
```

### mosoptics.CaptureProfile

A named set of variable overrides for a specific capture device. Each profile is a root-level entity that references its parent capture by name, allowing profiles to be saved, versioned, and managed independently from the capture entity itself.

```yaml
- kind: mosoptics.CaptureProfile
  name: facetime-capture.high-res
  capture: facetime-capture
  title: High Resolution (1080p 30fps)
  variables:
    resolution: "1920x1080"
    fps: "30"
    format: mjpeg
```

The entity name uses the convention `<capture-name>.<slug>`. The `capture` field references the parent capture entity by name. Validation warns about orphaned profiles that reference captures that no longer exist. The capture entity's `active_profile` field selects which profile is currently in use.

Profiles are overlays, not replacements. A profile that only sets `fps: "60"` inherits all other values (resolution, format, controls) from the camera's base variables.

## Variable precedence

Template variables follow a layered precedence model (lowest to highest):

1. **Template defaults**: Variable `default` fields from the `PipelineTemplate` definition.
2. **Camera registration base variables**: The `variables` map on the capture entity, set during camera registration.
3. **Active capture profile**: User-switchable overlay for resolution, fps, format, and device controls. Merged on top of base variables by `EffectiveVariables()`.
4. **Instance overrides**: Per-instance values set via the Create Pipeline form or API.
5. **CLI flags**: `--resolution`, `--fps`, `--format`, `--profile` override everything.

The SPA Create Pipeline form detects capture templates and shows device-specific profiles for the selected camera. Non-capture templates show template-level profiles.

## Loading precedence

Configuration files follow a layered loading model:

1. **Embedded defaults**: Compiled into the binary via `go:embed`.
2. **External YAML file**: User-provided config that overrides defaults.
3. **Environment variables**: `MOS_CONTROLLER_PORT=9000` overrides service port.
4. **CLI flags**: `-port 9000` overrides at highest precedence.

The loader auto-detects entity format vs. legacy wrapper format, so existing configurations continue to work during migration.

## Per-step configuration

Steps receive typed configuration structs with tags for multiple parsing paths:

```go
type HTTPServeCfg struct {
    Port int    `yaml:"port" koanf:"port" json:"port" desc:"HTTP port" reinit:"true"`
    Host string `yaml:"host" koanf:"host" json:"host" desc:"Bind address"`
}
```

The `reinit:"true"` tag marks fields that require an engine restart when changed (Level 2 reconfiguration). Fields without this tag can be hot-swapped at runtime (Level 1).

## File organization

Entity files can be split across multiple files and directories. The loader discovers entities by their `kind` field regardless of file location. Later files override earlier ones for entities with the same kind and name.

A typical layout:

```
~/.mosoptics/
  config.yaml          # Service entity + custom pipeline overrides
  cli.yaml             # CLIService + CLI-only Pipeline entities (scope: cli)
  cameras/
    captures.yaml      # Capture + CaptureProfile entities (mono cameras)
    stereo.yaml        # StereoCapture + CaptureProfile entities
    pairs.yaml         # DualCapture + CaptureProfile entities
    rtsp.yaml          # RTSPCapture + CaptureProfile entities
  templates/
    process.yaml       # PipelineTemplate entities
  instances.yaml       # TemplatedPipeline entities (user-managed)
  profiles.yaml        # TemplateProfile entities (feed/process only)
  vault.yaml           # Credential entities (0600 permissions)
```

Both mostudio and moscli load all entity files from `~/.mosoptics/` recursively and filter by scope. File names and directory structure are purely for human organization. The loader discovers entities by their `kind` field regardless of file location.

Capture cameras are resolved from registrations in `cameras/`. The CLI runs any registered camera with `moscli run <camera-name>`. Custom Pipeline entities in `cli.yaml` are for power-user step chains (e.g., direct GoCV window display) and use `scope: cli` to prevent them from being loaded by the studio.

`instances.yaml` is user-managed. The CLI creates and tests pipeline instances, then saves them with appropriate scope to make them available to the studio. The studio's controller reads instances.yaml to restore template instances at boot.

Capture profiles are stored alongside their parent capture entity in the same file. Each profile is a separate root-level entity, making individual saves and git diffs clean. Template profiles in `profiles.yaml` are only for non-capture templates (feed, process) where variables are not tied to specific device capabilities.
