/**
 * Zen garden Three.js / R3F surface area.
 *
 * **v0:** This entry re-exports a curated subset of `@twobitedd/zen-sand-rake` so consumers can depend on
 * `@twobitedd/zen-garden-threejs` while implementation still lives in `zen-sand-rake`. A future release may
 * move or split code here without changing import paths for these symbols.
 */
export {
  buildZenSacredGardenAmbientPathUv,
  ClassicInteractiveSand,
  ClassicSandRakeDecals,
  CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z,
  CLASSIC_TRAY_TO_WORLD_Y_UP,
  CLASSIC_ZEN_GARDEN_DISK_RADIUS,
  CLASSIC_ZEN_GARDEN_MAX_PROP_ITEMS,
  createRakeRingDecalTexture,
  DEFAULT_RAKE_PATH_DEBUG_LOCAL_STORAGE_KEYS,
  drawZenRakePathDebugOverlay2d,
  getClassicZenGardenLayout,
  RAKE_DISK_RADIUS,
  trayUvToClassicSandTrayLocal,
  ZenRakePathDebugOverlay,
  ZenRakePathDebugWorldQuad,
  ZEN_NAV_DEBUG_PIXEL_MUL,
  ZEN_RAKE_PATH_DEBUG_TRAIL_MAX_POINTS,
  ZEN_SCENE_CREAM_DISK_TRAY_LOCAL_Z,
  createZenRakeDiskNavMotor,
  mergeZenRakeNavSteering,
  zenRakeNavSteeringPreset,
  ZEN_RAKE_NAV_STEERING_PRESETS,
} from "@twobitedd/zen-sand-rake";
export type {
  ClassicInteractiveSandProps,
  ClassicRakePatternKey,
  ClassicZenGardenLayoutOpts,
  ClassicZenPropAnchor,
  ZenPathDebugPresentationQuarterTurns,
  ZenRakeDiskNavMotor,
  ZenRakeDiskNavMotorOpts,
  ZenRakeNavResolvedSteering,
  ZenRakeNavSteeringPresetId,
  ZenRakePathDebugOverlayProps,
  ZenRakePathDebugRasterInput,
  ZenRakePathDebugWorldQuadProps,
  ZenRakePilotFinishReason,
  ZenRakeObstacle,
  ZenSacredGardenAmbientPathOpts,
  ZenUv,
} from "@twobitedd/zen-sand-rake";
export {
  applyZenGardenTrayRemapToAnchors,
  applyZenGardenTrayRemapToObstacles,
  buildZenSacredGeometrySvgPathUv,
  computeZenGardenTrayRemap,
  resolveZenGardenLayout,
  zenGardenRakeObstaclesWithClassicPedestalWhenNeeded,
  ZEN_SACRED_GEOMETRY_PRESET_LABELS,
  ZEN_SACRED_GEOMETRY_PRESET_ORDER,
  ZenGardenLayoutSilhouettes,
  ZenGardenSandStage,
  zenGardenDemoCameraConfig,
} from "./playground";
export type { ZenGardenResolvedLayout, ZenGardenSandStageProps, ZenGardenTrayRemap, ZenSacredGeometryPreset } from "./playground";
