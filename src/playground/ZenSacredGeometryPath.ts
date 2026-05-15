export type ZenSacredGeometryPreset =
  | "enso-mandala"
  | "flower-of-life-lite"
  | "seed-of-life"
  | "shippo-tsunagi"
  | "seigaiha-circles"
  | "kiku-rosette"
  // legacy aliases (kept so existing hosts do not break)
  | "lotus-orbit"
  | "flower-grid"
  | "seed-seven";

type SvgCircleDef = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
};

type ZenSacredGeometrySpec = {
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly circles: readonly SvgCircleDef[];
};

const ENSO_MANDALA_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1000,
  viewHeight: 1000,
  circles: [
    { cx: 500, cy: 500, r: 70 },
    { cx: 500, cy: 500, r: 150 },
    { cx: 500, cy: 500, r: 230 },
    { cx: 500, cy: 500, r: 310 },
    { cx: 500, cy: 190, r: 90 },
    { cx: 768, cy: 345, r: 90 },
    { cx: 768, cy: 655, r: 90 },
    { cx: 500, cy: 810, r: 90 },
    { cx: 232, cy: 655, r: 90 },
    { cx: 232, cy: 345, r: 90 },
    { cx: 500, cy: 350, r: 60 },
    { cx: 630, cy: 425, r: 60 },
    { cx: 630, cy: 575, r: 60 },
    { cx: 500, cy: 650, r: 60 },
    { cx: 370, cy: 575, r: 60 },
    { cx: 370, cy: 425, r: 60 },
  ],
};

const FLOWER_OF_LIFE_LITE_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1000,
  viewHeight: 1000,
  circles: [
    { cx: 500, cy: 500, r: 90 },
    { cx: 590, cy: 500, r: 90 },
    { cx: 545, cy: 422, r: 90 },
    { cx: 455, cy: 422, r: 90 },
    { cx: 410, cy: 500, r: 90 },
    { cx: 455, cy: 578, r: 90 },
    { cx: 545, cy: 578, r: 90 },
    { cx: 680, cy: 500, r: 90 },
    { cx: 635, cy: 422, r: 90 },
    { cx: 590, cy: 344, r: 90 },
    { cx: 500, cy: 344, r: 90 },
    { cx: 410, cy: 344, r: 90 },
    { cx: 365, cy: 422, r: 90 },
    { cx: 320, cy: 500, r: 90 },
    { cx: 365, cy: 578, r: 90 },
    { cx: 410, cy: 656, r: 90 },
    { cx: 500, cy: 656, r: 90 },
    { cx: 590, cy: 656, r: 90 },
    { cx: 635, cy: 578, r: 90 },
  ],
};

const SEED_OF_LIFE_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1000,
  viewHeight: 1000,
  circles: [
    { cx: 500, cy: 500, r: 140 },
    { cx: 640, cy: 500, r: 140 },
    { cx: 570, cy: 379, r: 140 },
    { cx: 430, cy: 379, r: 140 },
    { cx: 360, cy: 500, r: 140 },
    { cx: 430, cy: 621, r: 140 },
    { cx: 570, cy: 621, r: 140 },
  ],
};

const SHIPPO_TSUNAGI_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1000,
  viewHeight: 1000,
  circles: [
    { cx: 250, cy: 250, r: 176 },
    { cx: 500, cy: 250, r: 176 },
    { cx: 750, cy: 250, r: 176 },
    { cx: 375, cy: 467, r: 176 },
    { cx: 625, cy: 467, r: 176 },
    { cx: 250, cy: 684, r: 176 },
    { cx: 500, cy: 684, r: 176 },
    { cx: 750, cy: 684, r: 176 },
  ],
};

const SEIGAIHA_CIRCLES_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1200,
  viewHeight: 1000,
  circles: [
    { cx: 150, cy: 850, r: 150 },
    { cx: 450, cy: 850, r: 150 },
    { cx: 750, cy: 850, r: 150 },
    { cx: 1050, cy: 850, r: 150 },
    { cx: 300, cy: 700, r: 150 },
    { cx: 600, cy: 700, r: 150 },
    { cx: 900, cy: 700, r: 150 },
    { cx: 150, cy: 550, r: 150 },
    { cx: 450, cy: 550, r: 150 },
    { cx: 750, cy: 550, r: 150 },
    { cx: 1050, cy: 550, r: 150 },
    { cx: 300, cy: 400, r: 150 },
    { cx: 600, cy: 400, r: 150 },
    { cx: 900, cy: 400, r: 150 },
    { cx: 600, cy: 220, r: 110 },
    { cx: 600, cy: 220, r: 55 },
  ],
};

const KIKU_ROSETTE_SPEC: ZenSacredGeometrySpec = {
  viewWidth: 1000,
  viewHeight: 1000,
  circles: [
    { cx: 500, cy: 500, r: 70 },
    { cx: 500, cy: 500, r: 120 },
    { cx: 500, cy: 500, r: 260 },
    { cx: 500, cy: 240, r: 100 },
    { cx: 630, cy: 275, r: 100 },
    { cx: 725, cy: 370, r: 100 },
    { cx: 760, cy: 500, r: 100 },
    { cx: 725, cy: 630, r: 100 },
    { cx: 630, cy: 725, r: 100 },
    { cx: 500, cy: 760, r: 100 },
    { cx: 370, cy: 725, r: 100 },
    { cx: 275, cy: 630, r: 100 },
    { cx: 240, cy: 500, r: 100 },
    { cx: 275, cy: 370, r: 100 },
    { cx: 370, cy: 275, r: 100 },
  ],
};

const PRESET_SPEC: Readonly<Record<ZenSacredGeometryPreset, ZenSacredGeometrySpec>> = {
  "enso-mandala": ENSO_MANDALA_SPEC,
  "flower-of-life-lite": FLOWER_OF_LIFE_LITE_SPEC,
  "seed-of-life": SEED_OF_LIFE_SPEC,
  "shippo-tsunagi": SHIPPO_TSUNAGI_SPEC,
  "seigaiha-circles": SEIGAIHA_CIRCLES_SPEC,
  "kiku-rosette": KIKU_ROSETTE_SPEC,
  "lotus-orbit": ENSO_MANDALA_SPEC,
  "flower-grid": FLOWER_OF_LIFE_LITE_SPEC,
  "seed-seven": SEED_OF_LIFE_SPEC,
};

export const ZEN_SACRED_GEOMETRY_PRESET_LABELS: Readonly<Record<ZenSacredGeometryPreset, string>> = {
  "enso-mandala": "Enso mandala",
  "flower-of-life-lite": "Flower of life (lite)",
  "seed-of-life": "Seed of life",
  "shippo-tsunagi": "Shippo tsunagi",
  "seigaiha-circles": "Seigaiha circles",
  "kiku-rosette": "Kiku rosette",
  "lotus-orbit": "Enso mandala (alias)",
  "flower-grid": "Flower of life (lite, alias)",
  "seed-seven": "Seed of life (alias)",
};

export const ZEN_SACRED_GEOMETRY_PRESET_ORDER: readonly ZenSacredGeometryPreset[] = [
  "enso-mandala",
  "flower-of-life-lite",
  "seed-of-life",
  "shippo-tsunagi",
  "seigaiha-circles",
  "kiku-rosette",
];

function circlePointsUv(
  circle: SvgCircleDef,
  viewWidth: number,
  viewHeight: number,
  segments: number,
): Array<{ readonly u: number; readonly v: number }> {
  const pts: Array<{ readonly u: number; readonly v: number }> = [];
  const cxUv = circle.cx / viewWidth;
  const cyUv = 1 - circle.cy / viewHeight;
  const rUv = circle.r / Math.min(viewWidth, viewHeight);
  const n = Math.max(18, segments);
  for (let i = 0; i <= n; i += 1) {
    const theta = (i / n) * Math.PI * 2;
    pts.push({
      u: cxUv + Math.cos(theta) * rUv,
      v: cyUv + Math.sin(theta) * rUv,
    });
  }
  return pts;
}

function sanitizeDiskUvPath(path: ReadonlyArray<{ readonly u: number; readonly v: number }>): Array<{ readonly u: number; readonly v: number }> {
  const out: Array<{ readonly u: number; readonly v: number }> = [];
  for (const p of path) {
    const gu = (p.u - 0.5) * 2;
    const gv = (p.v - 0.5) * 2;
    if (gu * gu + gv * gv > 1.001) {
      continue;
    }
    out.push({
      u: Math.min(0.9995, Math.max(0.0005, p.u)),
      v: Math.min(0.9995, Math.max(0.0005, p.v)),
    });
  }
  return out;
}

export function buildZenSacredGeometrySvgPathUv(
  preset: ZenSacredGeometryPreset,
  opts?: { readonly segmentsPerCircle?: number },
): Array<{ readonly u: number; readonly v: number }> {
  const spec = PRESET_SPEC[preset];
  const segments = opts?.segmentsPerCircle ?? 96;
  const raw: Array<{ readonly u: number; readonly v: number }> = [];
  for (const c of spec.circles) {
    raw.push(...circlePointsUv(c, spec.viewWidth, spec.viewHeight, segments));
  }
  return sanitizeDiskUvPath(raw);
}

