---
title: mosoptics
description: Computer vision step library for the mosaigo pipeline framework.
---

mosoptics is a computer vision step library for the [mosaigo](/getting-started/) pipeline framework. It provides production-ready face detection, gaze estimation, stereo capture, and GPU-accelerated ONNX inference, all as composable, typed pipeline steps.

## Prerequisites

- Go 1.24+
- GoCV (OpenCV 4.x Go bindings)
- ONNX Runtime
- GPU acceleration is optional and build-tag gated

## Install

```bash
go get github.com/mosaigoio/mosoptics@latest
```

## Packages

| Package | Description |
|---------|-------------|
| `cam/` | Camera enumeration, V4L2, macOS capture |
| `frame/` | Frame types, DualFrame, stereo pairs |
| `face/` | Face detection, mesh, recognition |
| `eye/` | Eye region, pupil tracking, corneal reflection |
| `gaze/` | Gaze estimation, calibration, smoothing |
| `pose/` | Head pose estimation, yaw/pitch/roll |
| `stereo/` | Stereo triangulation, camera calibration |
| `onnx/` | ONNX Runtime wrapper, model loading |
| `gpu/` | TensorRT, VPI, CUDA (build-tag gated) |
| `display/` | Display steps, annotated overlays |
| `record/` | Recording, playback, session management |
| `regression/` | Tolerance-aware comparison of pipeline output against golden sessions |
| `stream/` | MJPEG, RTSP, HLS streaming |

## Architecture

mosoptics imports `mosaigo/mos` and `mosaigo/engine` as dependencies. Every package exports mosaigo `TypedEngineStep` implementations. The CGo boundary lives in mosoptics. Mosaigo stays pure Go.
