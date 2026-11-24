# Changelog — Phase 3, Direction C "The Walk-In"

One line per scene: what changed, and where the before/after frames are (audit/screens/{before,after}/scenes/<scene>-*--{375,1280}.jpg).

- **S1 Arrival** — the board's two halves are now the restaurant's doors (ink panels, gold-ruled, brass pulls) and swing open on their hinges in 3D onto the rainy window (rotateY with perspective, 440 ms, fades edge-on); page in by 1.17–1.19 s (probe). Frames: `arrival-{400,750,1000}ms--{375,1280}.jpg`.
- **S2 Hero** — the room behind the glass lags the scroll (translateY to 14svh, scale 1.03, CSS scroll timeline) and drifts a few px with the mouse on desktop (`translate`); the shelf lamps breathe (a warm pool, 4.8 s, pausable); the glass mists over the last 60svh and melts into the street through a fixed fade. Reduced motion: still photo. perf:budget home unchanged (79 / 0.2% jank). Frames: `hero-*--{375,1280}.jpg`, `hero-scrolled-85--1280.jpg`.
