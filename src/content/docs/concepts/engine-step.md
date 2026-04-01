---
title: Engine Step
description: The composable unit of work in mosaigo. Strongly typed, self-describing, and built for high-throughput processing.
---

High-throughput, latency-sensitive data processing requires minimizing unnecessary logic and managing heavy resources outside the main loop. Parallel processing adds complexity around inter-routine communication. These problems compound quickly in real systems.

Mosaigo solves this with **single-purpose composable steps** that chain together through configuration or requests in a pipeline. Strong typing across every boundary reduces boilerplate, eliminates repetition, and catches errors at build time instead of runtime. With a small set of declarations, steps become discoverable, self-describing, and configurable for reuse.

![Engine Step diagram](/images/step-design.webp)

## Anatomy of a step

Each engine step is a set of functions and typed attributes following Go idioms. The strong typing means most issues surface during build time, not in production.

### Registration and definition

- **Register** - Steps register during application initialization. The composing application typically triggers this, though step packages may provide helpers.
- **StepDef** - A static definition of the step and its factory. This is the single source of truth for what the step is and how to create it.
- **Factory** - A consistent way to instantiate the step and inject configuration. The factory receives typed config and returns a ready-to-use step instance.

### Configuration and metadata

- **Config** - Typed attributes that can be set via config file, incoming request, or user interface. Defaults, file overrides, environment variables, and runtime API form a layered config hierarchy.
- **Step Meta** - Declares the step's runtime behavior: what payload metadata it requires, wants, and produces. Meta also declares last value stores/readers, and topics for publish/subscribe. These are *promises* the step makes, validated before the pipeline runs. Steps are single-purpose; a step should typically use one communication technique, not all of them.

### Lifecycle

- **Init & Close** - Set up and tear down heavy resources: memory buffers, file handles, AI models, GPU contexts. Init runs before the processing loop; Close runs after.
- **State** - Mutable state accessible at any stage of the step lifecycle.

### Processing

- **EngineCallback** - Access to engine capabilities: publishing/subscribing to events, marking latency, logging, creating payloads. The callback insulates steps from engine internals while providing consistent behavior across implementations.
- **Input & Output Payload** - A single strongly typed input and output with context and metadata. Strong typing eliminates type casting and assertion boilerplate, and prevents errors when steps are composed in different configurations. Payloads can be cloned, closed, enriched, or abstracted. They may be serializable data or pointers to heap-allocated resources like image buffers.
- **Process** - A single iteration of the processing loop. Payloads are created, analyzed, enriched, transformed, published, or run through inference. Keep this path as latency-efficient as possible.

### Communication

- **Last Value** - Concurrent steps and pipelines need shared context without tight coupling. A last value store lets one step own a value in a registry that many other steps and pipelines can read. Stores are initialized during init and cleaned up on close. Readers connect to stores by key. Concurrent access is mutex-protected.
- **Publish/Subscribe** - Topic-based event streaming between pipelines. A topic is a unique key and event type. Subscribers each get an independent buffered channel. Publishers enroll during init; when they publish, the topic fans out to every subscriber. Both publishers and subscribers declare their topics in step meta as promises, validated before the pipeline runs.

### Observability and errors

- **Mark** - Identify latency benchmarks with start/end blocks or reference points. The engine already tracks pipeline-level latency; marks add step-level granularity. Mark levels let the engine control which are active. Measuring system time at microsecond intervals has its own cost.
- **Error Handling** - The engine handles errors during init, processing, and cleanup. Steps return clear, descriptive errors. Everything else is handled gracefully by the framework.

## Why this matters for contribution

The step interface looks like many parts, but it reduces to several functions and typed attributes. Go's type system catches wiring mistakes at compile time, not at 2 AM in production.

The design is intentionally simple so that developers and AI agents can contribute steps openly. Every step in the registry is available to every pipeline. When someone contributes a step, everyone benefits.

The processing *is* the product. Most software treats infrastructure as the hard part and business logic as an afterthought. Mosaigo inverts this: the framework handles orchestration, lifecycle, config, validation, observability, and communication. You write the processing. That's it.

Each step has a unique shape: its typed inputs, outputs, config, and metadata. It fits with others to form a larger picture. The tiles are connected by their data types, and the mosaic they form is up to you.

**When the step you need already exists in the catalog, your work is configuration. When it doesn't, contributing it back means the next person's work is configuration too.**
