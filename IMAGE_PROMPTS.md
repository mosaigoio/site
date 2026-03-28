# Image Generation Prompts for mosaigo.io

Generate these images for the Dopetrope-themed landing pages.
All images should share a cohesive style: clean, modern, slightly abstract
tech illustrations with a cool blue-teal palette. Think flat/vector-style
concept art, not photorealistic. White or light gray backgrounds work best
with the Dopetrope template.

**Format**: PNG or WebP, landscape aspect ratio
**Size**: 1200x800px (will be displayed responsively)

---

## Portfolio Grid Images (6)

These appear as project/capability showcase cards on the homepage.

### 1. `public/images/portfolio-pipeline.webp`
> A stylized horizontal data pipeline diagram showing colorful typed blocks
> (steps) connected by flowing lines, with data payloads moving left to right.
> Minimal flat illustration style. Blue, teal, and amber accent colors.
> The blocks should suggest composability — like puzzle pieces or mosaic tiles
> that snap together. No text in the image.

### 2. `public/images/portfolio-vision.webp`
> A human face seen through a camera viewfinder with subtle bounding boxes
> and landmark dots overlaid. One eye has a gaze ray extending outward toward
> a screen point. Clean vector illustration style. Blue and green overlays
> on a light background. Conveys computer vision and eye tracking.

### 3. `public/images/portfolio-eyemia.webp`
> A communication board (AAC grid) with simple word/icon tiles viewed from
> a slight angle. A soft blue gaze cursor dot hovers over one tile, with a
> gentle radial glow indicating selection. Warm, accessible feel. Suggests
> assistive technology and empowerment. Flat illustration style.

### 4. `public/images/portfolio-hardware.webp`
> An edge computing device (small single-board computer) connected to a
> stereo camera module via ribbon cables. Subtle data flow lines emanate
> from the camera through the device. Clean technical illustration,
> not a photograph. Teal and dark gray tones.

### 5. `public/images/portfolio-studio.webp`
> A browser window showing a dashboard with real-time charts: a latency
> bar chart, a step pipeline diagram, and a small camera preview panel.
> Clean UI mockup illustration style. Dark UI theme inside the browser
> window, light background outside. Suggests observability and monitoring.

### 6. `public/images/portfolio-steps.webp`
> A grid of colorful tiles/cards arranged in rows, each representing a
> pipeline step with a small icon (camera, face, eye, gear, chart).
> Some tiles are connected by thin lines showing data flow. Suggests a
> catalog or library of composable components. Flat mosaic style matching
> the "mosaigo" name.

---

## Feature/Blog Images (2)

These appear in the secondary content section below the portfolio.

### 7. `public/images/feature-getstarted.webp`
> A terminal window with a few lines of Go code visible, next to a
> running pipeline visualization showing data flowing through steps.
> Split composition: code on the left, visual result on the right.
> Suggests quick setup and immediate results. Clean illustration style.

### 8. `public/images/feature-architecture.webp`
> A three-layer architecture diagram: bottom layer labeled-style blocks
> (engine/framework), middle layer (vision/CV), top layer (product/app).
> Layers connected by clean vertical arrows. Each layer is a different
> shade of blue. Abstract and architectural. No text needed — the shapes
> and hierarchy tell the story.

---

## Footer / About Image (1)

### 9. `public/images/about-mosaic.webp`
> An abstract mosaic pattern made of small colored tiles gradually forming
> into an eye shape. The tiles transition from scattered/random at the edges
> to ordered/aligned at the center where the eye forms. Blue, teal, and
> amber tiles on a light background. Represents the convergence of many
> pieces (mosaigo = mosaic) into vision (eye tracking). Could work as a
> project identity graphic.

---

## Optional: Hero Banner Background

If you want a subtle background texture for the hero/banner section:

### 10. `public/images/hero-bg.webp` (optional)
> A very subtle, light abstract pattern of interconnected nodes and lines
> forming a loose mesh/network. Almost like a faint blueprint or circuit
> diagram. Very low contrast (light gray on white) so text remains readable
> on top. Tileable. 1920x600px.

---

## Placement Summary

| File | Location in Template |
|------|---------------------|
| `portfolio-pipeline.webp` | Homepage portfolio grid, card 1 |
| `portfolio-vision.webp` | Homepage portfolio grid, card 2 |
| `portfolio-eyemia.webp` | Homepage portfolio grid, card 3 |
| `portfolio-hardware.webp` | Homepage portfolio grid, card 4 |
| `portfolio-studio.webp` | Homepage portfolio grid, card 5 |
| `portfolio-steps.webp` | Homepage portfolio grid, card 6 |
| `feature-getstarted.webp` | Homepage blog/feature section, card 1 |
| `feature-architecture.webp` | Homepage blog/feature section, card 2 |
| `about-mosaic.webp` | Footer about section |
| `hero-bg.webp` (optional) | Banner background image |

All files go in `site/public/images/`. Create the directory if it doesn't exist.
