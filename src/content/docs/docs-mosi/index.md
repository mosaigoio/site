---
title: mosi
description: Open-source eye gaze communication system for assistive technology.
---

mosi is an open-source eye gaze communication project for people with motor disabilities. The ambition: your eyes become your voice.

## Why mosi

Many people with severe motor disabilities have full cognitive ability but no way to speak. Eye gaze is their voice. Commercial eye-tracking systems cost $10,000+ and lock families into proprietary ecosystems. mosi aims to make eye gaze communication accessible, affordable, and open to everyone.

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

mosi is built on [mosaigo](/getting-started/) and [mosoptics](/mosoptics/). The gaze pipeline runs on edge hardware, the overlay renders the communication UI, and the caretaker app provides remote control.

## Project status

mosi is in active early development. The core pipeline framework (mosaigo) and vision library (mosoptics) are being built first.
