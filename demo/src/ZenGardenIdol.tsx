import { memo, type ReactElement } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { ConeGeometry, CylinderGeometry, DoubleSide } from "three";
import type { Mesh } from "three";
import type { ZenUv } from "@twobitedd/zen-garden-threejs";
import {
  CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z,
  trayUvToClassicSandTrayLocal,
} from "@twobitedd/zen-garden-threejs";

/** Pedestal + cap along tray +Z (“up” off the XY sand disk). */
const baseGeo = /* @__PURE__ */ new CylinderGeometry(0.1, 0.115, 0.4, 8);
const capGeo = /* @__PURE__ */ new ConeGeometry(0.195, 0.36, 10);

/** Rotate Y-aligned primitives so their height stacks along tray +Z. */
const standRot = /* @__PURE__ */ [Math.PI / 2, 0, 0] as const;

export type ZenGardenIdolProps = {
  /** Disk UV waypoint; renders nothing until set. */
  uv: ZenUv | null;
  /** Presentation-only tray-Y mirror so this waypoint can match flipped silhouettes without changing nav/pilot UV. */
  visualFlipTrayY?: boolean;
  /** Emphasize selection (user intends to reposition — orbit stays off host-side). */
  selected?: boolean;
  /** While true (placement / reposition), idols do not steal raycasts from the sand pickup plane. */
  suppressRaycast?: boolean;
};

/**
 * Tray-space waypoint idol beside {@link ZenGardenSandStage} sand disk.
 */
export const ZenGardenIdol = memo(function ZenGardenIdol({
  uv,
  visualFlipTrayY = false,
  selected = false,
  onPointerDown,
  suppressRaycast = false,
}: ZenGardenIdolProps): ReactElement | null {
  if (!uv) {
    return null;
  }

  const sandZ = CLASSIC_SAND_DISK_SHADER_VISUAL_TRAY_LOCAL_Z;
  const displayV = visualFlipTrayY ? 1 - uv.v : uv.v;
  const { x, y } = trayUvToClassicSandTrayLocal(uv.u, displayV, {
    trayZ: sandZ,
  });

  const pedestalH = baseGeo.parameters.height;
  const capH = capGeo.parameters.height;
  const pedestalZ = pedestalH / 2;
  const capZ = pedestalH + capH / 2;

  const emissive = selected ? 0.28 : 0.06;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    onPointerDown?.(event);
  };

  const noopRaycast: Mesh["raycast"] = () => {
    /* allow sand plane to resolve hits instead */
  };
  const pickBypass = suppressRaycast ? { raycast: noopRaycast } : {};

  return (
    <group position={[x, y, sandZ]}>
      <mesh
        {...pickBypass}
        geometry={baseGeo}
        rotation={standRot}
        position={[0, 0, pedestalZ]}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        <meshStandardMaterial
          color="#677560"
          roughness={0.8}
          metalness={0.06}
          emissive="#2d352c"
          emissiveIntensity={emissive * 0.45}
        />
      </mesh>
      <mesh {...pickBypass} geometry={capGeo} rotation={standRot} position={[0, 0, capZ]} castShadow onPointerDown={handlePointerDown}>
        <meshStandardMaterial
          color="#8e9686"
          roughness={0.65}
          metalness={0.05}
          emissive="#3d453a"
          emissiveIntensity={emissive}
        />
      </mesh>
      {/* Soft ring on sand for selection read */}
      <mesh {...pickBypass} rotation={[0, 0, 0]} position={[0, 0, 0.025]} renderOrder={1}>
        <ringGeometry args={[0.34, 0.5, 32]} />
        <meshBasicMaterial
          color={selected ? "#d6e4c4" : "#8fa382"}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
});
