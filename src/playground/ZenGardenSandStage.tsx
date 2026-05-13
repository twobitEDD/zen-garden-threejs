import { OrbitControls } from "@react-three/drei";
import { useMemo, type ReactElement } from "react";
import { MOUSE, TOUCH } from "three";
import {
  ClassicInteractiveSand,
  CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z,
  CLASSIC_TRAY_TO_WORLD_Y_UP,
  getClassicZenGardenLayout,
  type ClassicInteractiveSandProps,
} from "@twobitedd/zen-sand-rake";

const defaultLayoutSeed = 7;

export type ZenGardenSandStageProps = Omit<ClassicInteractiveSandProps, "zenRakeObstacles"> & {
  layoutSeed?: number;
  maxLayoutProps?: number;
  enableOrbit?: boolean;
};

/**
 * Reusable R3F scene slice: ambient + key light, {@link ClassicInteractiveSand}, optional damped orbit.
 * Sand meshes use **tray** space (+Z tray-up disk in XY); this stage wraps sand with {@link CLASSIC_TRAY_TO_WORLD_Y_UP}
 * so the disk lies horizontally in Y‑up worlds (matching `XO3BoardScene`).
 *
 * **Orbit** (when enabled): Left mouse does nothing for orbit (`mouseButtons.LEFT` unused) so rake drags / double-clicks win;
 * orbit with **right-drag**, zoom with wheel / middle.
 */
export function ZenGardenSandStage({
  layoutSeed = defaultLayoutSeed,
  maxLayoutProps,
  enableOrbit = true,
  ...sandProps
}: ZenGardenSandStageProps): ReactElement {
  const rakeObstacles = useMemo(() => {
    const opts = maxLayoutProps !== undefined ? { maxPropItems: maxLayoutProps } : undefined;
    return getClassicZenGardenLayout(layoutSeed, opts).rakeObstacles;
  }, [layoutSeed, maxLayoutProps]);

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
      </group>
      {enableOrbit ? (
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={6}
          maxDistance={28}
          target={[0, CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z, 0]}
          enableDamping
          dampingFactor={0.06}
          mouseButtons={{
            LEFT: -1 as never,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
          touches={{
            ONE: -1 as never,
            TWO: TOUCH.DOLLY_PAN,
          }}
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
