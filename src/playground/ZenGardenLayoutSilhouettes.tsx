import { RoundedBox } from "@react-three/drei";
import { memo, useMemo, type ReactElement } from "react";
import {
  CLASSIC_PROP_GROUND_CONTACT_Z,
  CLASSIC_ZEN_PEDESTAL_OUTER_CORNER_R,
  CLASSIC_ZEN_PEDESTAL_OUTER_XY,
  type ClassicZenPropAnchor,
} from "@twobitedd/zen-sand-rake";
import { CircleGeometry, ConeGeometry, CylinderGeometry, DoubleSide, SphereGeometry } from "three";

const noopPickRaycast = (): void => {
  /* Translucent/nav QA disks sit on the sand pick plane — must not steal events from rake hit mesh */
};

const diskLift = CLASSIC_PROP_GROUND_CONTACT_Z + 0.004;

/** Pedestal deck thickness in tray Z (readable silhouette atop shader sand when pedestal grooves are suppressed). */
const pedestalTrayH = 0.17;

function propMatColor(kind: ClassicZenPropAnchor["kind"]): string {
  switch (kind) {
    case "lantern":
      return "#c9b59a";
    case "stones":
      return "#8c8778";
    case "moss":
      return "#6b7358";
    default:
      return "#a09888";
  }
}

/**
 * Lightweight tray meshes plus **rake/nav collision footprints** (`ClassicZenPropAnchor.r` cyan tint on sand)
 * for each seeded rim prop. The central pedestal is **off by default** — it is only a rake/SDF forbid region; with
 * `suppressPedestalSandGrooves` hosts usually want uninterrupted sand in the middle (no chunky “tray” mesh).
 * Set **`showPedestal`** to preview the plateau footprint for QA.
 *
 * Hosts using full asset kits should set `ZenGardenSandStage` **`showClassicZenLayoutBodies`** to **`false`** to avoid doubling.
 */
export const ZenGardenLayoutSilhouettes = memo(function ZenGardenLayoutSilhouettes({
  anchors,
  showPedestal = false,
}: {
  readonly anchors: readonly ClassicZenPropAnchor[];
  readonly showPedestal?: boolean;
}): ReactElement {
  const unitFootprint = useMemo(() => new CircleGeometry(1, 56), []);
  const stoneBall = useMemo(() => new SphereGeometry(0.095, 8, 6), []);

  return (
    <>
      {showPedestal ? (
        <RoundedBox
          args={[CLASSIC_ZEN_PEDESTAL_OUTER_XY * 0.94, CLASSIC_ZEN_PEDESTAL_OUTER_XY * 0.94, pedestalTrayH]}
          radius={CLASSIC_ZEN_PEDESTAL_OUTER_CORNER_R}
          smoothness={4}
          position={[0, 0, CLASSIC_PROP_GROUND_CONTACT_Z + pedestalTrayH / 2 + 0.01]}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#bfb4a8" roughness={0.88} metalness={0.04} />
        </RoundedBox>
      ) : null}

      {anchors.map((a, i) => {
        const col = propMatColor(a.kind);

        let body: ReactElement;
        if (a.kind === "lantern") {
          body = (
            <group position={[a.x, a.y, a.localZ]}>
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]} geometry={new CylinderGeometry(0.11, 0.14, 0.38, 10)} position={[0, 0, 0.19]}>
                <meshStandardMaterial color={col} roughness={0.82} metalness={0.05} />
              </mesh>
              <mesh castShadow geometry={new ConeGeometry(0.16, 0.22, 8)} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.43]}>
                <meshStandardMaterial color="#8a8174" roughness={0.9} metalness={0.06} />
              </mesh>
            </group>
          );
        } else if (a.kind === "stones") {
          body = (
            <group position={[a.x, a.y, a.localZ]}>
              <mesh castShadow geometry={stoneBall} position={[-0.08, -0.04, 0.06]}>
                <meshStandardMaterial color="#928b7f" roughness={0.95} metalness={0.03} />
              </mesh>
              <mesh castShadow geometry={stoneBall} position={[0.1, 0.05, 0.04]} scale={[1.05, 1.08, 0.92]}>
                <meshStandardMaterial color="#8a8376" roughness={0.96} metalness={0.02} />
              </mesh>
              <mesh castShadow geometry={stoneBall} position={[0.02, -0.1, 0.09]} scale={[0.88, 0.94, 0.82]}>
                <meshStandardMaterial color="#959088" roughness={0.94} metalness={0.02} />
              </mesh>
            </group>
          );
        } else {
          body = (
            <mesh castShadow position={[a.x, a.y, a.localZ + 0.045]} geometry={new SphereGeometry(Math.max(0.19, a.r * 0.37), 12, 9)}>
              <meshStandardMaterial color={col} roughness={0.98} metalness={0} />
            </mesh>
          );
        }

        return (
          // eslint-disable-next-line react/no-array-index-key -- layout list stable per anchors array slice
          <group key={`${i}-${a.kind}-${String(a.x)}-${String(a.y)}`}>
            <mesh
              raycast={noopPickRaycast}
              renderOrder={2}
              geometry={unitFootprint}
              scale={[a.r, a.r, 1]}
              position={[a.x, a.y, diskLift]}
            >
              <meshBasicMaterial color="#4ad4ff" opacity={0.14} transparent depthWrite={false} side={DoubleSide} />
            </mesh>
            {body}
          </group>
        );
      })}
    </>
  );
});
