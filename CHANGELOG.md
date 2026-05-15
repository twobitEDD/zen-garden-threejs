# Changelog

All notable changes to `@twobitedd/zen-garden-threejs` are documented here. This project re-exports `@twobitedd/zen-sand-rake`; feature work for the sand stack lives in that package.

## 0.2.0 — 2026-05-13

### Added

- Public re-exports: `buildZenSacredGardenAmbientPathUv`, `CLASSIC_ZEN_GARDEN_MAX_PROP_ITEMS`, type `ZenSacredGardenAmbientPathOpts`.
- Interactive demo: controls for ambient mode (sacred pattern / rim orbit / coverage car), stage toggles (silhouettes, pedestal mesh, orbit, prop cap), speeds (pilot vs ambient path), manual rake mode, and developer options (nav HUD, path half-turn, suppress pedestal grooves).
- NPM scripts `demo:build` and `release:check`.

### Dependencies

- Requires **`@twobitedd/zen-sand-rake` ≥ 0.2.0** (ambient sacred-garden props and path helpers). Publish `zen-sand-rake@0.2.0` before publishing this package with a semver dependency; see [`RELEASING.md`](./RELEASING.md).

## 0.1.1 — earlier

Baseline thin re-export layer over `zen-sand-rake` with `ZenGardenSandStage` playground helpers.
