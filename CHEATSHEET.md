# Zen Garden Integration Cheatsheet

Package pin:

```bash
npm install @twobitedd/zen-garden-threejs@0.2.1
```

Minimal imports:

```tsx
import { Canvas } from "@react-three/fiber";
import {
  buildZenSacredGeometrySvgPathUv,
  ZenGardenSandStage,
  zenGardenDemoCameraConfig,
  type ZenSacredGeometryPreset,
} from "@twobitedd/zen-garden-threejs";
```

Game-background embed:

```tsx
const preset: ZenSacredGeometryPreset = "enso-mandala";
const sacredPathUv = buildZenSacredGeometrySvgPathUv(preset, { segmentsPerCircle: 88 });

<Canvas shadows={false} camera={zenGardenDemoCameraConfig}>
  <color attach="background" args={["#283226"]} />
  <ZenGardenSandStage
    layoutSeed={7}
    enableOrbit={false}
    autoRakeEnabled
    rakePaintingEnabled={false}
    rakeManualInputEnabled={false}
    rakeAmbientZenSacredGarden
    rakeAmbientCustomPathUv={sacredPathUv}
    suppressPedestalSandGrooves
    showZenPedestalSilhouette={false}
    showClassicZenLayoutBodies
    includeZenPedestalObstacle
    zenExperimentSceneVisualFlipTrayY
  />
</Canvas>
```

Retail baseline toggles:

- Keep debug off unless actively aligning: `rakeDebugContrast={false}`, `rakeAgentDebugOverlay={false}`, `rakePathDebugOverlayHost={false}`, `rakePathDebugWorldOverlayHost={false}`.
- For fixed background scenes, set `enableOrbit={false}` and usually leave pointer painting/manual rake off.
- Optional performance savings: keep `<Canvas shadows={false}>`; the stage still renders its lights and sand without requiring shadow maps.
- Use `layoutSeed={7}` for the shipped demo arrangement, or provide your own stable seed per level.
- Keep `suppressPedestalSandGrooves`, `showZenPedestalSilhouette={false}`, and `includeZenPedestalObstacle` for the flat center plateau with nav/rake avoidance.

Sacred preset cycling:

- The demo cycles `ZEN_SACRED_GEOMETRY_PRESET_ORDER` every 60 seconds and bumps `rakeRefreshToken` so the rake restarts on the new path.
- That cycling is demo-only behavior. Hosts should wire their own timer/state, call `buildZenSacredGeometrySvgPathUv(nextPreset)`, pass it to `rakeAmbientCustomPathUv`, and increment `rakeRefreshToken` when they want a visible path refresh.
