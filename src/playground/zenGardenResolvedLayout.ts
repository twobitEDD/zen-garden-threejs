import {
  CLASSIC_ZEN_PEDESTAL_RAKE_OBSTACLE,
  getClassicZenGardenLayout,
  type ClassicZenGardenLayoutOpts,
  type ClassicZenPropAnchor,
  type ZenRakeObstacle,
} from "@twobitedd/zen-sand-rake";

/**
 * Integer tray-axis scale (+1 or −1) composing half-turn and per-axis scene QA mirrors.
 * Applied **once** to both {@link ZenRakeObstacle} centers and {@link ClassicZenPropAnchor} positions
 * so nav, rake SDF, and silhouette meshes share one frame.
 */
export type ZenGardenTrayRemap = { readonly sx: number; readonly sy: number };

export function computeZenGardenTrayRemap(
  rakeObstacleHalfTurn: boolean,
  zenExperimentSceneFlipTrayX: boolean,
  zenExperimentSceneFlipTrayY: boolean,
): ZenGardenTrayRemap {
  const sx = (rakeObstacleHalfTurn ? -1 : 1) * (zenExperimentSceneFlipTrayX ? -1 : 1);
  const sy = (rakeObstacleHalfTurn ? -1 : 1) * (zenExperimentSceneFlipTrayY ? -1 : 1);
  return { sx, sy };
}

export function applyZenGardenTrayRemapToObstacles(
  obstacles: ReadonlyArray<ZenRakeObstacle>,
  sx: number,
  sy: number,
): readonly ZenRakeObstacle[] {
  if (sx === 1 && sy === 1) {
    return obstacles;
  }
  return obstacles.map((o) =>
    o.kind === "circle"
      ? { ...o, cx: o.cx * sx, cy: o.cy * sy }
      : { ...o, cx: o.cx * sx, cy: o.cy * sy },
  );
}

export function applyZenGardenTrayRemapToAnchors(
  anchors: readonly ClassicZenPropAnchor[],
  sx: number,
  sy: number,
): readonly ClassicZenPropAnchor[] {
  if (sx === 1 && sy === 1) {
    return anchors;
  }
  return anchors.map((a) => ({ ...a, x: a.x * sx, y: a.y * sy }));
}

/**
 * Ensures {@link CLASSIC_ZEN_PEDESTAL_RAKE_OBSTACLE} is present when **`includeZenPedestalObstacle`** is on (bug recovery),
 * **or** when **`showZenPedestalSilhouette`** renders the pedestal platter but collision was mistakenly omitted — rake / nav /
 * shaders must forbid the plateau deck alongside the decorative mesh (center round-rect stays valid under tray remaps).
 */
export function zenGardenRakeObstaclesWithClassicPedestalWhenNeeded(
  rakeObstacles: readonly ZenRakeObstacle[],
  opts: { readonly includeZenPedestalObstacle: boolean; readonly showZenPedestalSilhouette: boolean },
): readonly ZenRakeObstacle[] {
  const wantDeckCollision = opts.includeZenPedestalObstacle === true || opts.showZenPedestalSilhouette === true;
  if (!wantDeckCollision) {
    return rakeObstacles;
  }
  const hasCenterBoard = rakeObstacles.some(
    (o) => o.kind === "roundRect" && Math.abs(o.cx) <= 1e-5 && Math.abs(o.cy) <= 1e-5,
  );
  if (hasCenterBoard) {
    return rakeObstacles;
  }
  return [CLASSIC_ZEN_PEDESTAL_RAKE_OBSTACLE, ...rakeObstacles];
}

export type ZenGardenResolvedLayout = {
  readonly rakeObstacles: readonly ZenRakeObstacle[];
  readonly anchors: readonly ClassicZenPropAnchor[];
  readonly trayRemap: ZenGardenTrayRemap;
};

/**
 * Single pipeline: seeded canonical layout → optional tray-axis remap → nav/rake + props use identical numbers.
 * Append obstacles (`zenRakeObstacleAppend`) must also be authored in **canonical** tray space; remap applies to the merged list.
 */
export function resolveZenGardenLayout(
  seed: number,
  layoutOpts: ClassicZenGardenLayoutOpts | undefined,
  trayRemap: ZenGardenTrayRemap,
  obstacleAppend: ReadonlyArray<ZenRakeObstacle> | undefined,
): ZenGardenResolvedLayout {
  const canonical = getClassicZenGardenLayout(seed, layoutOpts);
  const extra = obstacleAppend ?? [];
  const mergedCanonical =
    extra.length === 0 ? canonical.rakeObstacles : [...canonical.rakeObstacles, ...extra];
  const rakeObstacles = applyZenGardenTrayRemapToObstacles(
    mergedCanonical,
    trayRemap.sx,
    trayRemap.sy,
  );
  const anchors = applyZenGardenTrayRemapToAnchors(
    canonical.anchors,
    trayRemap.sx,
    trayRemap.sy,
  );
  assertPropCirclesMatchAnchors(rakeObstacles, anchors, extra.length);

  return { rakeObstacles, anchors, trayRemap };
}

function assertPropCirclesMatchAnchors(
  rakeObstacles: readonly ZenRakeObstacle[],
  anchors: readonly ClassicZenPropAnchor[],
  appendedObstacleCount: number,
): void {
  if (appendedObstacleCount > 0) {
    return;
  }
  const circles = rakeObstacles.filter((o): o is Extract<ZenRakeObstacle, { kind: "circle" }> => o.kind === "circle");
  if (circles.length !== anchors.length) {
    // eslint-disable-next-line no-console -- dev-only invariant
    console.warn("[zen-garden-threejs] prop obstacle count vs anchors", {
      circles: circles.length,
      anchors: anchors.length,
    });
    return;
  }
  for (let i = 0; i < anchors.length; i += 1) {
    const o = circles[i]!;
    const a = anchors[i]!;
    if (Math.abs(o.cx - a.x) > 1e-5 || Math.abs(o.cy - a.y) > 1e-5 || Math.abs(o.r - a.r) > 1e-4) {
      // eslint-disable-next-line no-console -- dev-only invariant
      console.warn("[zen-garden-threejs] prop obstacle vs anchor tray frame mismatch", {
        index: i,
        obstacle: { cx: o.cx, cy: o.cy, r: o.r },
        anchor: { x: a.x, y: a.y, r: a.r },
      });
      return;
    }
  }
}
