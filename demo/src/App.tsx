import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import {
  buildZenSacredGeometrySvgPathUv,
  CLASSIC_ZEN_GARDEN_MAX_PROP_ITEMS,
  ZEN_SACRED_GEOMETRY_PRESET_LABELS,
  ZEN_SACRED_GEOMETRY_PRESET_ORDER,
  zenGardenDemoCameraConfig,
  ZEN_RAKE_NAV_STEERING_PRESETS,
  ZenGardenSandStage,
  type ClassicRakePatternKey,
  type ZenSacredGeometryPreset,
  type ZenRakeNavSteeringPresetId,
  type ZenRakePilotFinishReason,
  type ZenPathDebugPresentationQuarterTurns,
  type ZenUv,
} from "@twobitedd/zen-garden-threejs";
import { ZenGardenIdol } from "./ZenGardenIdol";
import "./App.css";

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

type DemoAmbientMode = "sacred" | "rim" | "car";

const NAV_STEERING_PRESET_ORDER = [
  "classic",
  "watchdog",
  "watchdogPlanner",
  "wallTeleport",
] as const satisfies readonly ZenRakeNavSteeringPresetId[];

const NAV_STEERING_PRESET_UI_LABEL: Record<ZenRakeNavSteeringPresetId, string> = {
  classic: "Classic car",
  watchdog: "Watchdog (URL V2 parity)",
  watchdogPlanner: "Planner V2 only",
  wallTeleport: "Wall teleport only",
};

/** Default `layoutSeed` (dock label `layout #{n}`) — shipped retail baseline. */
const DEFAULT_LAYOUT_SEED = 7;

export function App(): ReactElement {
  const [rakePattern, setRakePattern] = useState<ClassicRakePatternKey>("rings");
  const [rakeBrushSize, setRakeBrushSize] = useState(52);
  const [rakeIntensity, setRakeIntensity] = useState(1);
  const [rakeDebugContrast, setRakeDebugContrast] = useState(false);
  const [autoRakeEnabled, setAutoRakeEnabled] = useState(true);
  const [ambientMode, setAmbientMode] = useState<DemoAmbientMode>("sacred");
  const [sacredPreset, setSacredPreset] = useState<ZenSacredGeometryPreset>("enso-mandala");
  const [rakeRefreshToken, setRakeRefreshToken] = useState(0);
  const [layoutSeed, setLayoutSeed] = useState(DEFAULT_LAYOUT_SEED);
  const [maxLayoutProps, setMaxLayoutProps] = useState(CLASSIC_ZEN_GARDEN_MAX_PROP_ITEMS);
  const [showClassicZenLayoutBodies, setShowClassicZenLayoutBodies] = useState(true);
  const [showZenPedestalSilhouette, setShowZenPedestalSilhouette] = useState(false);
  const [includeZenPedestalObstacle, setIncludeZenPedestalObstacle] = useState(true);
  const [rakeObstacleHalfTurn, setRakeObstacleHalfTurn] = useState(false);
  const [suppressPedestalSandGrooves, setSuppressPedestalSandGrooves] = useState(true);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  const [rakePilotSpeedUvPerSec, setRakePilotSpeedUvPerSec] = useState(0.115);
  const [rakeAmbientPathSpeedUvPerSec, setRakeAmbientPathSpeedUvPerSec] = useState(0.115);
  const [matchAmbientSpeedToPilot, setMatchAmbientSpeedToPilot] = useState(true);

  /** Waypoint pedestal the rake travels toward (pilot UV). */
  const [idolUv, setIdolUv] = useState<ZenUv | null>(null);
  /** True after "Place/move idol", or tapping the pedestal, until sand receives a pick or Cancel. */
  const [placementArmed, setPlacementArmed] = useState(false);
  /** True while user chose the pedestal for another move — keeps orbit paused until repositioned or cancelled. */
  const [idolSelectedForMove, setIdolSelectedForMove] = useState(false);

  /** Controlled pilot waypoint in disk UV; cleared on finish (see ZenRakePilotFinishReason). */
  const [rakePilotTargetUv, setRakePilotTargetUv] = useState<ZenUv | null>(null);
  /** Bump to request one idol re-target when modes/toggles change. */
  const [idolRetargetToken, setIdolRetargetToken] = useState(1);

  /** Optional 128² nav cell mosaic (corner HUD). */
  const [cornerNavCellsDebug, setCornerNavCellsDebug] = useState(false);
  /**
   * Paints the **same** nav/path debug raster on the **sand disk** (coplanar UV) + enables path layers.
   * Corner minimap alone is orthographic and will not line up under orbit perspective — use this for real alignment QA.
   */
  const [navDebugRasterOnSand, setNavDebugRasterOnSand] = useState(false);

  const rakeAgentDebugOverlayEffective = cornerNavCellsDebug || navDebugRasterOnSand;

  /**
   * HUD/world path canvas only: maps `(u,v)↦(1−u,1−v)` before plotting — **inverts** corner nav vs geometric disk.
   * Keep **off** unless a host waypoint stream is authored in that mirrored frame (see `zenGardenObstacles` overlay docs).
   */
  const [rakePathDebugRotateHalfTurn, setRakePathDebugRotateHalfTurn] = useState(false);

  /** Visual-only: spin / mirror the **corner** path/nav HUD canvas (nav math unchanged). */
  const [rakePathDebugHudPresentationRotationQuarterTurns, setRakePathDebugHudPresentationRotationQuarterTurns] =
    useState<ZenPathDebugPresentationQuarterTurns>(0);
  const [rakePathDebugHudPresentationMirrorTrayX, setRakePathDebugHudPresentationMirrorTrayX] = useState(false);
  const [rakePathDebugHudPresentationMirrorTrayY, setRakePathDebugHudPresentationMirrorTrayY] = useState(true);
  /** Visual-only: spin / mirror the **coplanar sand disk** path raster quad. */
  const [rakePathDebugWorldPresentationRotationQuarterTurns, setRakePathDebugWorldPresentationRotationQuarterTurns] =
    useState<ZenPathDebugPresentationQuarterTurns>(0);
  const [rakePathDebugWorldPresentationMirrorTrayX, setRakePathDebugWorldPresentationMirrorTrayX] = useState(false);
  const [rakePathDebugWorldPresentationMirrorTrayY, setRakePathDebugWorldPresentationMirrorTrayY] = useState(true);

  /** QA: remap mask texel axes vs planar disk UV (groove stamp + shader parity). Baseline UX matches CLASSIC mirror default. */
  const [rakeGrooveMaskMirrorUx, setRakeGrooveMaskMirrorUx] = useState(true);
  const [rakeGrooveMaskMirrorVx, setRakeGrooveMaskMirrorVx] = useState(false);
  /** QA: nav occupancy / pilot pathfinding in mirrored UV (display mesh UV unchanged). */
  const [rakeNavMirrorUx, setRakeNavMirrorUx] = useState(false);
  const [rakeNavMirrorV, setRakeNavMirrorV] = useState(false);
  /** QA: roller sphere follows mirrored tray XY under the rake head. */
  const [rakeRollerTrayMirrorUx, setRakeRollerTrayMirrorUx] = useState(false);
  const [rakeRollerTrayMirrorV, setRakeRollerTrayMirrorV] = useState(true);
  /** QA: negate tray X/Y scales for silhouettes + sand together (whole sub-scene flip). */
  const [zenSceneFlipTrayX, setZenSceneFlipTrayX] = useState(false);
  const [zenSceneFlipTrayY, setZenSceneFlipTrayY] = useState(false);
  /** Silhouette meshes only — nav / sand / sim frame unchanged (see ZenGardenSandStage). */
  const [zenSceneVisualFlipTrayY, setZenSceneVisualFlipTrayY] = useState(true);
  /** QA: tilt sand `CircleGeometry` stack π about mesh local +X (`ClassicInteractiveSand`). */
  const [zenExperimentSandDiskFlipAboutLocalX, setZenExperimentSandDiskFlipAboutLocalX] = useState(false);
  /** QA: remap sand disk vertex UV `(u,v) ↦ (1−u, 1−v)` shared by picks/shader/overlays (`ClassicInteractiveSand`). */
  const [zenExperimentSandDiskInvertUvHalfTurn, setZenExperimentSandDiskInvertUvHalfTurn] = useState(false);
  const [rakeRollerSphereRadiusScale, setRakeRollerSphereRadiusScale] = useState(4);
  /** `null` = pattern default fork count from sand-rake. Slider 0 selects auto; 3–25 overrides . */
  const [rakeForkCountOverride, setRakeForkCountOverride] = useState<number | null>(null);

  /** `undefined` ⇒ follow **`?rakeNavAgentV2=1`** routing in sand-rake (`mergeZenRakeNavSteering`). */
  const [rakeNavSteeringPreset, setRakeNavSteeringPreset] = useState<ZenRakeNavSteeringPresetId | undefined>(undefined);

  /** Developer `<details>` panel; collapsed by default for retail builds. */
  const [developerPanelOpen, setDeveloperPanelOpen] = useState(false);

  const orbitSuspended = placementArmed || idolSelectedForMove;
  const orbitEnabled = orbitControlsEnabled && !orbitSuspended;

  const effectiveAmbientSpeed = matchAmbientSpeedToPilot ? rakePilotSpeedUvPerSec : rakeAmbientPathSpeedUvPerSec;

  const onRakePilotFinish = useCallback((reason: ZenRakePilotFinishReason) => {
    setRakePilotTargetUv(null);
    if (reason === "blocked" && typeof console !== "undefined" && typeof console.debug === "function") {
      console.debug("[zen-garden-demo] pilot blocked (straight fallback may still carve soft sand)");
    }
  }, []);

  useEffect(() => {
    if (autoRakeEnabled && idolUv) {
      setIdolRetargetToken((n) => n + 1);
    }
  }, [autoRakeEnabled, ambientMode, idolUv]);

  useEffect(() => {
    if (idolRetargetToken <= 0 || !autoRakeEnabled || !idolUv || rakePilotTargetUv) {
      return;
    }
    setRakePilotTargetUv(idolUv);
    setIdolRetargetToken(0);
  }, [idolRetargetToken, autoRakeEnabled, idolUv, rakePilotTargetUv]);

  const clearPlacementFlow = useCallback((): void => {
    setPlacementArmed(false);
    setIdolSelectedForMove(false);
  }, []);

  const armPlaceIdol = useCallback((): void => {
    setPlacementArmed(true);
    setIdolSelectedForMove(false);
    setRakePilotTargetUv(null);
  }, []);

  const cancelPlacementFlow = useCallback((): void => {
    clearPlacementFlow();
    setRakePilotTargetUv(null);
  }, [clearPlacementFlow]);

  const applyIdolWaypoint = useCallback(
    (uv: ZenUv): void => {
      setIdolUv(uv);
      setRakePilotTargetUv(uv);
      setIdolRetargetToken((n) => n + 1);
      clearPlacementFlow();
    },
    [clearPlacementFlow],
  );

  const canonicalUvFromSandPick = useCallback(
    (uv: ZenUv): ZenUv => {
      const invertUv = zenExperimentSandDiskInvertUvHalfTurn;
      const flipV = zenExperimentSandDiskFlipAboutLocalX !== invertUv;
      return {
        u: invertUv ? 1 - uv.u : uv.u,
        v: flipV ? 1 - uv.v : uv.v,
      };
    },
    [zenExperimentSandDiskFlipAboutLocalX, zenExperimentSandDiskInvertUvHalfTurn],
  );

  const gardenSandPointerIntent = useCallback(
    (uv: ZenUv, _event: ThreeEvent<PointerEvent>): void => {
      if (!(placementArmed || idolSelectedForMove)) {
        return;
      }
      applyIdolWaypoint(canonicalUvFromSandPick(uv));
    },
    [applyIdolWaypoint, canonicalUvFromSandPick, idolSelectedForMove, placementArmed],
  );

  const handleIdolTap = useCallback((): void => {
    setPlacementArmed(false);
    setIdolSelectedForMove(true);
    setRakePilotTargetUv(null);
  }, []);

  const bumpRefresh = useCallback(() => {
    cancelPlacementFlow();
    setIdolUv(null);
    setRakePilotTargetUv(null);
    setRakeRefreshToken((n) => n + 1);
  }, [cancelPlacementFlow]);

  const reshuffleGarden = useCallback(() => {
    cancelPlacementFlow();
    setIdolUv(null);
    setRakePilotTargetUv(null);
    setLayoutSeed(randomSeed());
    setRakeRefreshToken((n) => n + 1);
  }, [cancelPlacementFlow]);

  const canvasCamera = useMemo(
    () => ({
      ...zenGardenDemoCameraConfig,
      position: [...zenGardenDemoCameraConfig.position] as [number, number, number],
    }),
    [],
  );

  const pointerIntent = placementArmed || idolSelectedForMove ? gardenSandPointerIntent : undefined;
  const sacredPathUv = useMemo(
    () => buildZenSacredGeometrySvgPathUv(sacredPreset, { segmentsPerCircle: 88 }),
    [sacredPreset],
  );

  const onCanvasPointerMissed = useCallback((): void => {
    if (orbitSuspended) {
      cancelPlacementFlow();
    }
  }, [cancelPlacementFlow, orbitSuspended]);

  const idolHudSelected = idolSelectedForMove || placementArmed;

  const sacredOn = autoRakeEnabled && ambientMode === "sacred";
  const rimOn = autoRakeEnabled && ambientMode === "rim";

  return (
    <div className="app-shell">
      <div className="canvas-wrap">
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
          camera={canvasCamera}
          onPointerMissed={onCanvasPointerMissed}
        >
          <color attach="background" args={["#283226"]} />
          <ZenGardenSandStage
            suppressPedestalSandGrooves={suppressPedestalSandGrooves}
            layoutSeed={layoutSeed}
            maxLayoutProps={maxLayoutProps}
            includeZenPedestalObstacle={includeZenPedestalObstacle}
            rakeObstacleHalfTurn={rakeObstacleHalfTurn}
            zenExperimentSceneFlipTrayX={zenSceneFlipTrayX}
            zenExperimentSceneFlipTrayY={zenSceneFlipTrayY}
            zenExperimentSceneVisualFlipTrayY={zenSceneVisualFlipTrayY}
            zenExperimentSandDiskFlipAboutLocalX={zenExperimentSandDiskFlipAboutLocalX}
            zenExperimentSandDiskInvertUvHalfTurn={zenExperimentSandDiskInvertUvHalfTurn}
            showClassicZenLayoutBodies={showClassicZenLayoutBodies}
            showZenPedestalSilhouette={showZenPedestalSilhouette}
            rakeAmbientZenSacredGarden={sacredOn}
            rakeAmbientCustomPathUv={sacredOn ? sacredPathUv : undefined}
            rakeAmbientZenOuterRing={rimOn}
            rakePattern={rakePattern}
            rakeRefreshToken={rakeRefreshToken}
            rakeNavSteeringPreset={rakeNavSteeringPreset}
            rakeGroovePresentationMirrorUx={rakeGrooveMaskMirrorUx}
            rakeGroovePresentationMirrorVx={rakeGrooveMaskMirrorVx}
            rakeNavUvMirrorUx={rakeNavMirrorUx}
            rakeNavUvMirrorV={rakeNavMirrorV}
            rakeRollerTrayMirrorUx={rakeRollerTrayMirrorUx}
            rakeRollerTrayMirrorV={rakeRollerTrayMirrorV}
            rakeRollerSphereRadiusScale={rakeRollerSphereRadiusScale}
            rakeForkCount={rakeForkCountOverride ?? undefined}
            rakeDebugContrast={rakeDebugContrast}
            rakeIntensity={rakeIntensity}
            rakePaintingEnabled={false}
            rakeManualInputEnabled={false}
            showRakeRollerSphere
            autoRakeEnabled={autoRakeEnabled}
            rakeBrushSize={rakeBrushSize}
            rakePilotTargetUv={rakePilotTargetUv}
            rakePilotSpeedUvPerSec={rakePilotSpeedUvPerSec}
            rakeAmbientRimSpeedUvPerSec={effectiveAmbientSpeed}
            onRakePilotFinish={onRakePilotFinish}
            gardenSandPointerIntent={pointerIntent}
            rakeAgentDebugOverlay={rakeAgentDebugOverlayEffective}
            rakePathDebugOverlayHost={navDebugRasterOnSand}
            rakePathDebugWorldOverlayHost={navDebugRasterOnSand}
            rakePathDebugAlignHost={navDebugRasterOnSand}
            rakePathDebugRotateHalfTurn={rakePathDebugRotateHalfTurn}
            rakePathDebugHudPresentationRotationQuarterTurns={rakePathDebugHudPresentationRotationQuarterTurns}
            rakePathDebugHudPresentationMirrorTrayX={rakePathDebugHudPresentationMirrorTrayX}
            rakePathDebugHudPresentationMirrorTrayY={rakePathDebugHudPresentationMirrorTrayY}
            rakePathDebugWorldPresentationRotationQuarterTurns={rakePathDebugWorldPresentationRotationQuarterTurns}
            rakePathDebugWorldPresentationMirrorTrayX={rakePathDebugWorldPresentationMirrorTrayX}
            rakePathDebugWorldPresentationMirrorTrayY={rakePathDebugWorldPresentationMirrorTrayY}
            enableOrbit={orbitEnabled}
          >
            <ZenGardenIdol
              uv={idolUv}
              selected={idolHudSelected}
              suppressRaycast={orbitSuspended}
              onPointerDown={idolUv ? handleIdolTap : undefined}
            />
          </ZenGardenSandStage>
        </Canvas>
      </div>

      <div className="ui-layer">
        <header className="hero">
          <h1>Zen sand garden</h1>
          <p>
            Idle <strong>patterns</strong>, <strong>rim orbit</strong>, or <strong>coverage car</strong>; all respect the same nav grid
            as rake stamping. The idol sets a pilot waypoint for all auto modes; manual drawing is disabled in this demo.
            Use the dock to tune the stage and rake. Orbit pauses only while placement is armed.
          </p>
          {orbitSuspended ? (
            <p className="hint" style={{ marginTop: "0.55rem", color: "var(--zen-sage)", fontWeight: 600 }}>
              Orbit paused — tap sand to set the idol{placementArmed ? " (armed)" : " (moving pedestal)"}.
            </p>
          ) : null}
        </header>

        <aside className="dock" aria-label="Garden controls">
          <div className="dock-header">
            <h2>Garden</h2>
            <span>layout #{layoutSeed}</span>
          </div>
          <p className="dock-scroll-hint">Scroll this dock for grooves, rake forks, sphere scale, and coordinate QA switches.</p>

          <div className="control-block">
            <span className="control-label">Idol waypoint</span>
            <div className="actions" style={{ marginTop: "0.45rem" }}>
              <button type="button" className="btn btn-primary" onClick={armPlaceIdol}>
                Place idol
              </button>
              {(placementArmed || idolSelectedForMove) && (
                <button type="button" className="btn btn-ghost" onClick={cancelPlacementFlow}>
                  Cancel
                </button>
              )}
            </div>
            <p className="hint">
              {idolUv ? (
                <>
                  Waypoint&nbsp;
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    ({idolUv.u.toFixed(3)}, {idolUv.v.toFixed(3)})
                  </span>
                  {placementArmed
                    ? " — click sand."
                    : idolSelectedForMove
                      ? " — tap sand to reposition."
                      : " — pilot runs whenever idle motion is on."}
                </>
              ) : (
                <>
                  Tap <strong>Place idol</strong> (orbit pauses), then click the sand disk.
                </>
              )}
            </p>
          </div>

          <div className="control-block">
            <span className="control-label">Stage</span>
            <div className="toggle-row">
              <span className="toggle-text">Prop silhouettes on sand</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={showClassicZenLayoutBodies}
                  onChange={(e) => setShowClassicZenLayoutBodies(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Center pedestal obstacle (nav + rake)</span>
              <label
                className="switch"
                title="Keeps the central plateau off the nav grid so sacred path, pilot, and coverage car orbit the board. Turn off only for unobstructed stamping through geometric center."
              >
                <input
                  type="checkbox"
                  checked={includeZenPedestalObstacle}
                  onChange={(e) => setIncludeZenPedestalObstacle(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Obstacle/nav 180° offset compensation</span>
              <label className="switch" title="Applies half-turn to nav/rake obstacle map only">
                <input
                  type="checkbox"
                  checked={rakeObstacleHalfTurn}
                  onChange={(e) => setRakeObstacleHalfTurn(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Pedestal platter mesh (debug)</span>
              <label
                className="switch"
                title="Chunky mesh on the deck. While this is on, ZenGardenSandStage keeps CLASSIC_ZEN_PEDESTAL_RAKE_OBSTACLE in rake/nav even if 'Center pedestal obstacle' is unchecked."
              >
                <input
                  type="checkbox"
                  checked={showZenPedestalSilhouette}
                  onChange={(e) => setShowZenPedestalSilhouette(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Orbit camera</span>
              <label className="switch" title="Turn off for a fixed view (placement still pauses orbit when armed)">
                <input
                  type="checkbox"
                  checked={orbitControlsEnabled}
                  onChange={(e) => setOrbitControlsEnabled(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">Coordinate QA (mask · nav · scene)</span>
            <p className="hint">
              Stage tray flips / half-turn bake into obstacle + silhouette positions together via{" "}
              <code>resolveZenGardenLayout</code>. Leave <strong>nav UV mirrors</strong> off unless a waypoint stream is authored in
              mirrored disk UV — they remap queries only and will look rotated vs obstacles when combined with scene flips.
            </p>
            <div className="toggle-row">
              <span className="toggle-text">Groove mask mirror disk U ↔ texel columns</span>
              <label className="switch" title="rakeGroovePresentationMirrorUx">
                <input
                  type="checkbox"
                  checked={rakeGrooveMaskMirrorUx}
                  onChange={(e) => setRakeGrooveMaskMirrorUx(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Groove mask mirror disk V ↔ texel rows</span>
              <label className="switch" title="rakeGroovePresentationMirrorVx">
                <input
                  type="checkbox"
                  checked={rakeGrooveMaskMirrorVx}
                  onChange={(e) => setRakeGrooveMaskMirrorVx(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Nav / pilot UV mirror U</span>
              <label className="switch" title="rakeNavUvMirrorUx">
                <input
                  type="checkbox"
                  checked={rakeNavMirrorUx}
                  onChange={(e) => setRakeNavMirrorUx(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Nav / pilot UV mirror V</span>
              <label className="switch" title="rakeNavUvMirrorV">
                <input
                  type="checkbox"
                  checked={rakeNavMirrorV}
                  onChange={(e) => setRakeNavMirrorV(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Roller tray mirror X (U)</span>
              <label className="switch" title="rakeRollerTrayMirrorUx">
                <input
                  type="checkbox"
                  checked={rakeRollerTrayMirrorUx}
                  onChange={(e) => setRakeRollerTrayMirrorUx(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Roller tray mirror Y (V)</span>
              <label className="switch" title="rakeRollerTrayMirrorV">
                <input
                  type="checkbox"
                  checked={rakeRollerTrayMirrorV}
                  onChange={(e) => setRakeRollerTrayMirrorV(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Scene flip tray X (sand + silhouettes)</span>
              <label className="switch" title="zenExperimentSceneFlipTrayX">
                <input
                  type="checkbox"
                  checked={zenSceneFlipTrayX}
                  onChange={(e) => setZenSceneFlipTrayX(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Scene flip tray Y (sand + silhouettes)</span>
              <label className="switch" title="zenExperimentSceneFlipTrayY">
                <input
                  type="checkbox"
                  checked={zenSceneFlipTrayY}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setZenSceneFlipTrayY(on);
                    if (on) {
                      setZenSceneVisualFlipTrayY(false);
                    }
                  }}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Scene visual flip tray Y (silhouettes only)</span>
              <label
                className="switch"
                title={
                  zenSceneFlipTrayY
                    ? "Turn off data Scene flip tray Y first — this is disabled when obstacles are remapped in data."
                    : "Mirrors rim prop + pedestal silhouettes in tray Y; zenRakeObstacles, nav, path debug, and sand UV stay canonical."
                }
              >
                <input
                  type="checkbox"
                  disabled={zenSceneFlipTrayY}
                  checked={zenSceneVisualFlipTrayY}
                  onChange={(e) => setZenSceneVisualFlipTrayY(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>

          <div className="control-block">
            <span className="control-label">
              Rim prop cap <span className="slider-value">{maxLayoutProps}</span>
            </span>
            <input
              className="slider"
              type="range"
              min={2}
              max={24}
              step={1}
              value={maxLayoutProps}
              onChange={(e) => setMaxLayoutProps(Number(e.target.value))}
            />
            <p className="hint">Feeds <code style={{ fontSize: "0.74em" }}>getClassicZenGardenLayout</code> max anchors (clamped in library).</p>
          </div>

          <div className="control-block">
            <span className="control-label">Ambient idle motion</span>
            <div className="toggle-row">
              <span className="toggle-text">Enabled</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRakeEnabled}
                  onChange={(e) => {
                    setAutoRakeEnabled(e.target.checked);
                  }}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="pill-row pill-row--wrap" role="group" aria-label="Ambient mode">
              <button
                type="button"
                className="pill"
                disabled={!autoRakeEnabled}
                data-active={ambientMode === "sacred"}
                onClick={() => setAmbientMode("sacred")}
              >
                Sacred pattern
              </button>
              <button
                type="button"
                className="pill"
                disabled={!autoRakeEnabled}
                data-active={ambientMode === "rim"}
                onClick={() => setAmbientMode("rim")}
              >
                Rim orbit
              </button>
              <button
                type="button"
                className="pill"
                disabled={!autoRakeEnabled}
                data-active={ambientMode === "car"}
                onClick={() => setAmbientMode("car")}
              >
                Coverage car
              </button>
            </div>
            {ambientMode === "car" ? (
              <>
                <span className="control-label" style={{ marginTop: "0.65rem" }}>
                  Coverage car steering
                </span>
                <div className="pill-row pill-row--wrap" role="group" aria-label="Navigation steering preset">
                  <button
                    type="button"
                    className="pill"
                    disabled={!autoRakeEnabled}
                    data-active={rakeNavSteeringPreset === undefined}
                    onClick={() => setRakeNavSteeringPreset(undefined)}
                  >
                    Follow URL
                  </button>
                  {NAV_STEERING_PRESET_ORDER.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="pill"
                      disabled={!autoRakeEnabled}
                      data-active={rakeNavSteeringPreset === id}
                      title={JSON.stringify(ZEN_RAKE_NAV_STEERING_PRESETS[id])}
                      onClick={() => setRakeNavSteeringPreset(id)}
                    >
                      {NAV_STEERING_PRESET_UI_LABEL[id]}
                    </button>
                  ))}
                </div>
                <p className="hint" style={{ marginTop: "0.35rem" }}>
                  Named presets ignore <code>?rakeNavAgentV2=1</code>. Use Follow URL so that query switches planner + wall teleport like before.
                </p>
              </>
            ) : null}
            {ambientMode === "sacred" ? (
              <>
                <span className="control-label" style={{ marginTop: "0.65rem" }}>
                  Sacred geometry preset
                </span>
                <div className="pill-row pill-row--wrap" role="group" aria-label="Sacred geometry preset">
                  {ZEN_SACRED_GEOMETRY_PRESET_ORDER.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="pill"
                      disabled={!autoRakeEnabled}
                      data-active={sacredPreset === preset}
                      onClick={() => setSacredPreset(preset)}
                    >
                      {ZEN_SACRED_GEOMETRY_PRESET_LABELS[preset]}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
            {autoRakeEnabled ? (
              <p className="notice-auto">
                Idol pilot still runs when a waypoint is set — it temporarily overrides ambient motion.
              </p>
            ) : null}
          </div>

          <div className="control-block">
            <span className="control-label">
              Idol pilot speed <span className="slider-value">{rakePilotSpeedUvPerSec.toFixed(3)} UV/s</span>
            </span>
            <input
              className="slider"
              type="range"
              min={35}
              max={520}
              step={5}
              value={Math.round(rakePilotSpeedUvPerSec * 1000)}
              onChange={(e) => setRakePilotSpeedUvPerSec(Number(e.target.value) / 1000)}
            />
            <div className="toggle-row" style={{ marginTop: "0.55rem" }}>
              <span className="toggle-text">Ambient path speed = pilot speed</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={matchAmbientSpeedToPilot}
                  onChange={(e) => setMatchAmbientSpeedToPilot(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            {!matchAmbientSpeedToPilot ? (
              <>
                <span className="control-label" style={{ marginTop: "0.65rem" }}>
                  Ambient path speed <span className="slider-value">{rakeAmbientPathSpeedUvPerSec.toFixed(3)} UV/s</span>
                </span>
                <input
                  className="slider"
                  type="range"
                  min={25}
                  max={520}
                  step={5}
                  value={Math.round(rakeAmbientPathSpeedUvPerSec * 1000)}
                  onChange={(e) => setRakeAmbientPathSpeedUvPerSec(Number(e.target.value) / 1000)}
                />
              </>
            ) : null}
          </div>

          <div className="control-block">
            <span className="control-label">Groove stamp</span>
            <div className="pill-row" role="group" aria-label="Rake pattern">
              <button
                type="button"
                className="pill"
                data-active={rakePattern === "rings"}
                onClick={() => setRakePattern("rings")}
              >
                Rings
              </button>
              <button
                type="button"
                className="pill"
                data-active={rakePattern === "waves"}
                onClick={() => setRakePattern("waves")}
              >
                Waves
              </button>
            </div>
            <span className="control-label" style={{ marginTop: "0.65rem" }}>
              Rake forks{" "}
              <span className="slider-value">
                {rakeForkCountOverride == null ? "Auto (pattern)" : rakeForkCountOverride}
              </span>
            </span>
            <input
              className="slider"
              type="range"
              min={0}
              max={25}
              step={1}
              value={rakeForkCountOverride ?? 0}
              onChange={(e) => {
                const n = Number(e.target.value);
                setRakeForkCountOverride(n <= 0 ? null : n);
              }}
              aria-label="Rake fork count override; zero is pattern default"
            />
            <p className="hint" style={{ marginTop: "0.35rem" }}>
              0 uses each pattern&apos;s baked tine count; 1–2 are clamped to 3 inside the rake.
            </p>
          </div>

          <div className="control-block">
            <span className="control-label">
              Brush size <span className="slider-value">{rakeBrushSize}px</span>
            </span>
            <input
              className="slider"
              type="range"
              min={12}
              max={120}
              value={rakeBrushSize}
              onChange={(e) => setRakeBrushSize(Number(e.target.value))}
            />
          </div>

          <div className="control-block">
            <span className="control-label">
              Groove depth <span className="slider-value">{rakeIntensity.toFixed(2)}×</span>
            </span>
            <input
              className="slider"
              type="range"
              min={55}
              max={240}
              step={5}
              value={Math.round(rakeIntensity * 100)}
              onChange={(e) => setRakeIntensity(Number(e.target.value) / 100)}
            />
          </div>

          <div className="control-block">
            <div className="toggle-row">
              <span className="toggle-text">Stronger groove contrast (debug)</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={rakeDebugContrast}
                  onChange={(e) => setRakeDebugContrast(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <p className="hint">Tweaks shader weighting so furrows read more clearly on some displays.</p>
          </div>

          <div className="control-block">
            <span className="control-label">
              Roller sphere scale{" "}
              <span className="slider-value">{rakeRollerSphereRadiusScale.toFixed(2)}×</span>
            </span>
            <input
              className="slider"
              type="range"
              min={25}
              max={800}
              step={5}
              value={Math.round(rakeRollerSphereRadiusScale * 100)}
              onChange={(e) => setRakeRollerSphereRadiusScale(Number(e.target.value) / 100)}
              aria-label="Rake roller ball radius scale"
            />
          </div>

          <details
            className="control-block developer-panel"
            open={developerPanelOpen}
            onToggle={(e) => {
              setDeveloperPanelOpen(e.currentTarget.open);
            }}
          >
            <summary className="control-label developer-summary">
              Developer
            </summary>
            <div className="toggle-row">
              <span className="toggle-text">
                Nav / path QA <strong>on sand disk</strong> (coplanar UV)
              </span>
              <label
                className="switch"
                title="Enables path & obstacle overlays + paints the same raster on the actual CircleGeometry disk. Orbit from above to compare to grooves and cyan footprints."
              >
                <input
                  type="checkbox"
                  checked={navDebugRasterOnSand}
                  onChange={(e) => setNavDebugRasterOnSand(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Corner nav‑cell HUD</span>
              <label className="switch" title="Dense 128² reachability mosaic in the viewport corner (orthographic UV minimap)">
                <input
                  type="checkbox"
                  checked={cornerNavCellsDebug}
                  onChange={(e) => setCornerNavCellsDebug(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <p className="hint" style={{ marginTop: "0.45rem" }}>
              The <strong>corner HUD</strong> is a fixed orthographic minimap — it will look “wrong” vs a tilted 3D view even when data are
              correct. Turning <strong>on sand disk</strong> overlays the same pixels on the rake mesh; also turns on the dense nav mosaic when
              corner HUD is off.
            </p>
            <div className="toggle-row">
              <span className="toggle-text">Sand disk: flip surface π about local +X</span>
              <label
                className="switch"
                title="zenExperimentSandDiskFlipAboutLocalX — faces the disk the other way; shader already DoubleSide"
              >
                <input
                  type="checkbox"
                  checked={zenExperimentSandDiskFlipAboutLocalX}
                  onChange={(e) => setZenExperimentSandDiskFlipAboutLocalX(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Sand disk: invert mesh UV half-turn · (1−u, 1−v)</span>
              <label
                className="switch"
                title="zenExperimentSandDiskInvertUvHalfTurn — ray picks share geometry UV; silhouettes/nav authoring stay canonical tray until mirrored"
              >
                <input
                  type="checkbox"
                  checked={zenExperimentSandDiskInvertUvHalfTurn}
                  onChange={(e) => setZenExperimentSandDiskInvertUvHalfTurn(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Path debug half‑turn <code className="kbd" style={{ fontSize: "0.68rem" }}>(u,v)</code></span>
              <label
                className="switch"
                title="Draw-time 180° in raster. XOR with “invert mesh UV half-turn” so overlays track geometry UV. Toggle off both for canonical stamp frame."
              >
                <input
                  type="checkbox"
                  checked={rakePathDebugRotateHalfTurn}
                  onChange={(e) => setRakePathDebugRotateHalfTurn(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="path-align-controls">
              <span className="control-label" style={{ marginBottom: "0.35rem" }}>
                Corner HUD overlay: presentation
              </span>
              <div className="toggle-row path-align-row">
                <span className="toggle-text">
                  Rotate +90° (now{" "}
                  <strong>{rakePathDebugHudPresentationRotationQuarterTurns * 90}°</strong>)
                </span>
                <button
                  type="button"
                  className="btn btn-ghost path-align-cycle"
                  onClick={() =>
                    setRakePathDebugHudPresentationRotationQuarterTurns(
                      ((rakePathDebugHudPresentationRotationQuarterTurns + 1) %
                        4) as ZenPathDebugPresentationQuarterTurns,
                    )
                  }
                >
                  Cycle
                </button>
              </div>
              <div className="toggle-row">
                <span className="toggle-text">Mirror tray X</span>
                <label className="switch" title="CSS scaleX(-1) on fixed HUD minimap">
                  <input
                    type="checkbox"
                    checked={rakePathDebugHudPresentationMirrorTrayX}
                    onChange={(e) => setRakePathDebugHudPresentationMirrorTrayX(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
              <div className="toggle-row">
                <span className="toggle-text">Mirror tray Y</span>
                <label className="switch" title="CSS scaleY(-1) on fixed HUD minimap">
                  <input
                    type="checkbox"
                    checked={rakePathDebugHudPresentationMirrorTrayY}
                    onChange={(e) => setRakePathDebugHudPresentationMirrorTrayY(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
            <div className="path-align-controls">
              <span className="control-label" style={{ marginBottom: "0.35rem" }}>Sand disk path raster: presentation</span>
              <div className="toggle-row path-align-row">
                <span className="toggle-text">
                  Rotate +90° (now{" "}
                  <strong>{rakePathDebugWorldPresentationRotationQuarterTurns * 90}°</strong>)
                </span>
                <button
                  type="button"
                  className="btn btn-ghost path-align-cycle"
                  onClick={() =>
                    setRakePathDebugWorldPresentationRotationQuarterTurns(
                      ((rakePathDebugWorldPresentationRotationQuarterTurns + 1) %
                        4) as ZenPathDebugPresentationQuarterTurns,
                    )
                  }
                >
                  Cycle
                </button>
              </div>
              <div className="toggle-row">
                <span className="toggle-text">Mirror tray X</span>
                <label className="switch" title="Mesh scale X on coplanar world quad">
                  <input
                    type="checkbox"
                    checked={rakePathDebugWorldPresentationMirrorTrayX}
                    onChange={(e) => setRakePathDebugWorldPresentationMirrorTrayX(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
              <div className="toggle-row">
                <span className="toggle-text">Mirror tray Y</span>
                <label className="switch" title="Mesh scale Y on coplanar world quad">
                  <input
                    type="checkbox"
                    checked={rakePathDebugWorldPresentationMirrorTrayY}
                    onChange={(e) => setRakePathDebugWorldPresentationMirrorTrayY(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
            <p className="hint" style={{ marginTop: "0.45rem", lineHeight: 1.45 }}>
              <strong>Presentation</strong> controls (above) only rotate/scale the <em>finished</em> debug bitmap — 3D props and rake
              data do not move, so magenta / nav tints will not chase silhouettes. Use <strong>Scene flip tray X/Y</strong> (Garden
              section) to remap obstacle centers and nav in one tray frame; reset presentation mirrors when checking prop alignment.
              With <strong>Sand disk: invert mesh UV half‑turn</strong> on, path debug draw half-turn is applied automatically (XOR) so the
              coplanar overlay stays glued to geometry UV.
            </p>
            <div className="toggle-row">
              <span className="toggle-text">Suppress pedestal shader grooves</span>
              <label className="switch" title="suppressPedestalSandGrooves — off redraws baked plateau ring on sand">
                <input
                  type="checkbox"
                  checked={suppressPedestalSandGrooves}
                  onChange={(e) => setSuppressPedestalSandGrooves(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <p className="hint" style={{ marginTop: "0.5rem" }}>
              URL equivalents still work (<code>?rakePathDebug=1</code>, <code>?rakePathDebugWorld=1</code>). Dock toggle &quot;on sand disk&quot;
              replaces <code>rakePathDebugWorld=1</code> via <code>rakePathDebugWorldOverlayHost</code>. Obstacle centers match{" "}
              <code>getClassicZenGardenLayout</code>.
            </p>
          </details>

          <div className="control-block">
            <span className="control-label">Reset</span>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={bumpRefresh}>
                Clear sand
              </button>
              <button type="button" className="btn btn-ghost" onClick={reshuffleGarden}>
                New arrangement
              </button>
            </div>
            <p className="hint">Clear wipes grooves + the idol waypoint; reshuffle rotates props.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
