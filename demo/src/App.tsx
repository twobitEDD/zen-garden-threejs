import { Canvas } from "@react-three/fiber";
import { useCallback, useMemo, useState, type ReactElement } from "react";
import type {
  ClassicRakePatternKey,
  ZenRakePilotFinishReason,
  ZenUv,
} from "@twobitedd/zen-garden-threejs";
import { zenGardenDemoCameraConfig, ZenGardenSandStage } from "@twobitedd/zen-garden-threejs";

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

export function App(): ReactElement {
  const [rakePattern, setRakePattern] = useState<ClassicRakePatternKey>("rings");
  const [rakeBrushSize, setRakeBrushSize] = useState(52);
  const [rakeIntensity, setRakeIntensity] = useState(1);
  const [rakeDebugContrast, setRakeDebugContrast] = useState(false);
  /** Sticky rake — equivalent to URL `rake=1` without holding Shift */
  const [rakePaintingEnabled, setRakePaintingEnabled] = useState(true);
  const [autoRakeEnabled, setAutoRakeEnabled] = useState(false);
  const [rakeRefreshToken, setRakeRefreshToken] = useState(0);
  const [layoutSeed, setLayoutSeed] = useState(7);

  /** Controlled pilot waypoint in disk UV; cleared on finish (see ZenRakePilotFinishReason). */
  const [rakePilotTargetUv, setRakePilotTargetUv] = useState<ZenUv | null>(null);

  const onRakePilotFinish = useCallback((reason: ZenRakePilotFinishReason) => {
    setRakePilotTargetUv(null);
    if (reason === "blocked" && typeof console !== "undefined" && typeof console.debug === "function") {
      console.debug("[zen-garden-demo] pilot blocked (straight fallback may still carve soft sand)");
    }
  }, []);

  const onGardenNavigate = useCallback((uv: ZenUv) => {
    setRakePilotTargetUv(uv);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRakePilotTargetUv(null);
    setRakeRefreshToken((n) => n + 1);
  }, []);

  const reshuffleGarden = useCallback(() => {
    setRakePilotTargetUv(null);
    setLayoutSeed(randomSeed());
    setRakeRefreshToken((n) => n + 1);
  }, []);

  const canvasCamera = useMemo(
    () => ({
      ...zenGardenDemoCameraConfig,
      position: [...zenGardenDemoCameraConfig.position] as [number, number, number],
    }),
    [],
  );

  return (
    <div className="app-shell">
      <div className="canvas-wrap">
        <Canvas shadows gl={{ antialias: true, alpha: false }} camera={canvasCamera}>
          <color attach="background" args={["#283226"]} />
          <ZenGardenSandStage
            suppressPedestalSandGrooves
            layoutSeed={layoutSeed}
            rakePattern={rakePattern}
            rakeRefreshToken={rakeRefreshToken}
            rakeDebugContrast={rakeDebugContrast}
            rakeIntensity={rakeIntensity}
            rakePaintingEnabled={rakePaintingEnabled}
            autoRakeEnabled={autoRakeEnabled}
            rakeBrushSize={rakeBrushSize}
            rakePilotTargetUv={rakePilotTargetUv}
            rakePilotSpeedUvPerSec={0.115}
            onRakePilotFinish={onRakePilotFinish}
            onGardenSandNavigateRequest={(uv) => {
              if (!autoRakeEnabled) onGardenNavigate(uv);
            }}
          />
        </Canvas>
      </div>

      <div className="ui-layer">
        <header className="hero">
          <h1>Zen sand garden</h1>
          <p>
            Drag on the sand to rake — <strong>left-drag orbit is off</strong> here so gestures hit the rake first. Rotate
            the view with <strong>right-drag</strong> (scroll wheel zooms).
            {!autoRakeEnabled ? (
              <>
                {" "}
                <strong>Double-click</strong> the sand to carve toward that spot when auto motion is off.
              </>
            ) : (
              <>
                {" "}
                Disable <strong>Auto motion</strong> to pilot via double-click targeting.
              </>
            )}
          </p>
          {rakePaintingEnabled ? null : (
            <p className="hint" style={{ marginTop: "0.5rem" }}>
              Painting is Shift-gated until you turn Always rake on.
            </p>
          )}
        </header>

        <aside className="dock" aria-label="Rake controls">
          <div className="dock-header">
            <h2>Rake</h2>
            <span>layout #{layoutSeed}</span>
          </div>

          <div className="control-block">
            <span className="control-label">Interaction</span>
            <div className="toggle-row">
              <span className="toggle-text">Always rake (no Shift)</span>
              <label className="switch" title="When off, hold Shift while dragging to rake">
                <input
                  type="checkbox"
                  checked={rakePaintingEnabled}
                  onChange={(e) => setRakePaintingEnabled(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-text">Auto motion</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRakeEnabled}
                  onChange={(e) => setAutoRakeEnabled(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
            {autoRakeEnabled ? (
              <p className="notice-auto">Auto uses the built-in agent — great for ambient demos; turn off for calm manual raking.</p>
            ) : (
              <p className="hint">
                Targeting{" "}
                {rakePilotTargetUv ? (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    carving toward ({rakePilotTargetUv.u.toFixed(3)}, {rakePilotTargetUv.v.toFixed(3)})
                  </span>
                ) : (
                  <>Double-click sand.</>
                )}
              </p>
            )}
          </div>

          <div className="control-block">
            <span className="control-label">Pattern</span>
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
            <span className="control-label">Garden</span>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={bumpRefresh}>
                Clear sand
              </button>
              <button type="button" className="btn btn-ghost" onClick={reshuffleGarden}>
                New arrangement
              </button>
            </div>
            <p className="hint">Clear resets grooves; pilot starts from grooves you drew after that.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
