/**
 * Zen garden Three.js / R3F surface area.
 *
 * **v0:** This entry re-exports a curated subset of `@twobitedd/zen-sand-rake` so consumers can depend on
 * `@twobitedd/zen-garden-threejs` while implementation still lives in `zen-sand-rake`. A future release may
 * move or split code here without changing import paths for these symbols.
 */
export {
  ClassicInteractiveSand,
  ZenRakePathDebugOverlay,
  ZenRakePathDebugWorldQuad,
  DEFAULT_RAKE_PATH_DEBUG_LOCAL_STORAGE_KEYS,
  ZEN_NAV_DEBUG_PIXEL_MUL,
  drawZenRakePathDebugOverlay2d,
  ZEN_RAKE_PATH_DEBUG_TRAIL_MAX_POINTS,
} from "@twobitedd/zen-sand-rake";
export type {
  ClassicInteractiveSandProps,
  ZenRakePathDebugOverlayProps,
  ZenRakePathDebugRasterInput,
  ZenRakePathDebugWorldQuadProps,
  ZenUv,
} from "@twobitedd/zen-sand-rake";
