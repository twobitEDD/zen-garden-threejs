import { OrbitControls } from "@react-three/drei";
import { useMemo, type ReactElement, type ReactNode } from "react";
import {
  ClassicInteractiveSand,
  CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z,
  CLASSIC_TRAY_TO_WORLD_Y_UP,
  type ClassicInteractiveSandProps,
  type ZenRakeObstacle,
} from "@twobitedd/zen-sand-rake";
import { ZenGardenLayoutSilhouettes } from "./ZenGardenLayoutSilhouettes";
import { computeZenGardenTrayRemap, resolveZenGardenLayout, zenGardenRakeObstaclesWithClassicPedestalWhenNeeded } from "./zenGardenResolvedLayout";

const defaultLayoutSeed = 7;

export type ZenGardenSandStageProps = Omit<ClassicInteractiveSandProps, "zenRakeObstacles"> & {
  layoutSeed?: number;
  maxLayoutProps?: number;
  /**
   * Include fixed center pedestal as hard nav/rake obstacle (recommended for routing/orbits around the plateau).
   * Set false only when you deliberately want unobstructed stamping through the geometric center while grooves are suppressed.
   */
  includeZenPedestalObstacle?: boolean;
  /** Apply `(x,y)->(-x,-y)` to nav/rake obstacles before passing into sand (frame compensation for hosts that appear half-turned). */
  rakeObstacleHalfTurn?: boolean;
  enableOrbit?: boolean;
  /** Extra hard nav / rake obstacles appended after seeded layout obstacles (canonical tray authoring units). */
  zenRakeObstacleAppend?: ReadonlyArray<ZenRakeObstacle>;
  /**
   * When true (default), render {@link ZenGardenLayoutSilhouettes} using anchors from {@link resolveZenGardenLayout}
   * — the same tray remap as `zenRakeObstacles` (otherwise collisions exist invisibly unless you mount props yourself).
   */
  showClassicZenLayoutBodies?: boolean;
  /**
   * Optional central pedestal platter mesh for collision QA. Default off — the plateau remains a rake/nav forbid zone,
   * but `suppressPedestalSandGrooves` scenes usually want flat sand visually (no “tray” in the middle).
   */
  showZenPedestalSilhouette?: boolean;
  /**
   * QA: mirror sandbox + props along tray −X by negating rake/nav obstacle centers (no negative three.js mesh scale —
   * keeps the 128² nav grid coincident with visible silhouettes under the −90° X tray→world tilt).
   */
  zenExperimentSceneFlipTrayX?: boolean;
  /** QA: tray −Y mirror for obstacles + meshes (matches prior “scene flip”; now baked into data, not `group.scale = -1`). */
  zenExperimentSceneFlipTrayY?: boolean;
  /**
   * QA: mirror **only** {@link ZenGardenLayoutSilhouettes} in tray −Y via `group` scale — **does not** change rake/nav obstacle
   * data passed into {@link ClassicInteractiveSand}, nav, path debug, or rake. Ignored when {@link zenExperimentSceneFlipTrayY} is true
   * Use when you want props mirrored on screen while keeping red/nav/sim fixed in canonical seed space.
   */
  zenExperimentSceneVisualFlipTrayY?: boolean;
  children?: ReactNode;
};

/**
 * Reusable R3F scene slice: ambient + key light, {@link ClassicInteractiveSand}, optional damped orbit.
 * Seeded props and rake/nav {@link ZenRakeObstacle} data use {@link resolveZenGardenLayout} so silhouettes and the sand
 * stack share **one** tray frame (half-turn + optional scene flips applied once).
 * Use {@link zenExperimentSceneVisualFlipTrayY} only when you need a **purely visual** rim-prop mirror without remapping nav.
 * Sand meshes use **tray** space (+Z tray-up disk in XY); this stage wraps sand with {@link CLASSIC_TRAY_TO_WORLD_Y_UP}
 * so the disk lies horizontally in Y‑up worlds (matching `XO3BoardScene`).
 *
 * **Orbit** (when enabled): default OrbitControls bindings (left rotates, middle dollys, right pans; wheel zooms).
 * {@link ClassicInteractiveSand} disables the default controls for the duration of a rake stroke so grooves keep pointer capture cleanly.
 */
export function ZenGardenSandStage({
  layoutSeed = defaultLayoutSeed,
  maxLayoutProps,
  includeZenPedestalObstacle = true,
  rakeObstacleHalfTurn = false,
  enableOrbit = true,
  zenRakeObstacleAppend,
  showClassicZenLayoutBodies = true,
  showZenPedestalSilhouette = false,
  zenExperimentSceneFlipTrayX = false,
  zenExperimentSceneFlipTrayY = false,
  zenExperimentSceneVisualFlipTrayY = false,
  children,
  ...sandProps
}: ZenGardenSandStageProps): ReactElement {
  const layoutOpts = useMemo(() => {
    return {
      maxPropItems: maxLayoutProps,
      includePedestalObstacle: includeZenPedestalObstacle,
    };
  }, [maxLayoutProps, includeZenPedestalObstacle]);

  const trayRemap = useMemo(
    () => computeZenGardenTrayRemap(rakeObstacleHalfTurn, zenExperimentSceneFlipTrayX, zenExperimentSceneFlipTrayY),
    [rakeObstacleHalfTurn, zenExperimentSceneFlipTrayX, zenExperimentSceneFlipTrayY],
  );

  const { rakeObstacles: layoutRakeObstacles, anchors: layoutAnchors } = useMemo(
    () => resolveZenGardenLayout(layoutSeed, layoutOpts, trayRemap, zenRakeObstacleAppend),
    [layoutSeed, layoutOpts, trayRemap, zenRakeObstacleAppend],
  );

  const rakeObstacles = useMemo(
    () =>
      zenGardenRakeObstaclesWithClassicPedestalWhenNeeded(layoutRakeObstacles, {
        includeZenPedestalObstacle: includeZenPedestalObstacle,
        showZenPedestalSilhouette,
      }),
    [layoutRakeObstacles, includeZenPedestalObstacle, showZenPedestalSilhouette],
  );

  const silhouetteTrayVisualScaleY =
    zenExperimentSceneVisualFlipTrayY && !zenExperimentSceneFlipTrayY ? -1 : 1;

  return (
    <>
      <ambientLight intensity={0.58} color="#f5f0e8" />
      <hemisphereLight args={["#ffe8d4", "#6a7a68", 0.35]} />
      <directionalLight
        castShadow
        position={[8, 16, 10]}
        intensity={1.12}
        color="#fff6ec"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={48}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.00018}
      />
      <group rotation={CLASSIC_TRAY_TO_WORLD_Y_UP}>
        <ClassicInteractiveSand zenRakeObstacles={rakeObstacles} {...sandProps} />
        {showClassicZenLayoutBodies ? (
          <group scale={[1, silhouetteTrayVisualScaleY, 1]}>
            <ZenGardenLayoutSilhouettes anchors={layoutAnchors} showPedestal={showZenPedestalSilhouette} />
          </group>
        ) : null}
        {children}
      </group>
      {enableOrbit ? (
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={6}
          maxDistance={52}
          target={[0, CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z, 0]}
          enableDamping
          dampingFactor={0.06}
        />
      ) : null}
    </>
  );
}

/** Suggested `<Canvas camera={…}>` for sand framed from above-front. */
export const zenGardenDemoCameraConfig = {
  position: [0, 10.5, 12.8] as const,
  fov: 42 as const,
  near: 0.1 as const,
  far: 80 as const,
};
