/**
 * Zen garden Three.js / R3F surface area.
 *
 * **v0:** This entry re-exports a curated subset of `@twobitedd/zen-sand-rake` so consumers can depend on
 * `@twobitedd/zen-garden-threejs` while implementation still lives in `zen-sand-rake`. A future release may
 * move or split code here without changing import paths for these symbols.
 */
export {
  ClassicInteractiveSand,
  ClassicSandRakeDecals,
  CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z,
  CLASSIC_TRAY_TO_WORLD_Y_UP,
  CLASSIC_ZEN_GARDEN_DISK_RADIUS,
  createRakeRingDecalTexture,
  DEFAULT_RAKE_PATH_DEBUG_LOCAL_STORAGE_KEYS,
  drawZenRakePathDebugOverlay2d,
  getClassicZenGardenLayout,
  ZenRakePathDebugOverlay,
  ZenRakePathDebugWorldQuad,
  ZEN_NAV_DEBUG_PIXEL_MUL,
  ZEN_RAKE_PATH_DEBUG_TRAIL_MAX_POINTS,
  ZEN_SCENE_CREAM_DISK_TRAY_LOCAL_Z,
} from "@twobitedd/zen-sand-rake";
export type {
  ClassicInteractiveSandProps,
  ClassicRakePatternKey,
  ClassicZenGardenLayoutOpts,
  ClassicZenPropAnchor,
  ZenRakePathDebugOverlayProps,
  ZenRakePathDebugRasterInput,
  ZenRakePathDebugWorldQuadProps,
  ZenRakePilotFinishReason,
  ZenUv,
} from "@twobitedd/zen-sand-rake";
export {
  zenGardenDemoCameraConfig,
  ZenGardenSandStage,
} from "./playground";
export type { ZenGardenSandStageProps } from "./playground";
