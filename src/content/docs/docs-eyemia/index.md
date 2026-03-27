---
title: EyeMia
description: Open-source eye gaze communication system for assistive technology.
---

EyeMia is an open-source eye gaze communication system for people with Rett Syndrome, ALS, cerebral palsy, and other conditions that affect motor control. Your eyes become your voice.

## Why EyeMia

Rett Syndrome affects ~1 in 10,000 girls, taking away speech and hand use while leaving cognitive ability intact. Eye gaze is their voice. Commercial eye-tracking systems cost $10,000+ and lock families into proprietary ecosystems. EyeMia aims to make eye gaze communication accessible, affordable, and open to everyone.

## Stakeholders

- **Non-verbal individuals** — communicate needs, wants, and feelings through eye gaze
- **Caregivers & family** — configure boards, adjust sensitivity, track usage
- **Teachers & therapists** — customize grids for learning objectives, track attention
- **Developers & researchers** — extend, adapt, and improve the system

## Capabilities

- Real-time gaze tracking with dual cameras
- Text-to-speech from gaze selections
- Face recognition for personalized boards
- Head and movement tracking
- AI-generated symbol images
- Adaptive calibration

## Architecture

EyeMia is built on [mosaigo](/getting-started/) and [mosoptics](/mosoptics/). The gaze pipeline runs on edge hardware, the overlay renders the communication UI, and the caretaker app provides remote control.

## Project status

EyeMia is in active early development. The core pipeline framework (mosaigo) and vision library (mosoptics) are being built first.
