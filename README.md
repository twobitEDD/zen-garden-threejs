# @twobitedd/zen-garden-threejs

Three.js and React Three Fiber building blocks for zen-garden style experiences (interactive sand disk, rake path debug overlays, and related types).

## Status (v0.2)

This package **re-exports** selected APIs from [`@twobitedd/zen-sand-rake`](https://www.npmjs.com/package/@twobitedd/zen-sand-rake) (see `src/index.ts`), including stage props for **sacred garden** idle patterns (`rakeAmbientZenSacredGarden`), **rim** ambient orbit, and helpers such as `buildZenSacredGardenAmbientPathUv`.

**Releases:** See [`CHANGELOG.md`](./CHANGELOG.md). To publish, read [`RELEASING.md`](./RELEASING.md) (publish `zen-sand-rake` first when bumping past 0.1.x).

### Demo (in this repo)

```bash
npm install
npm run demo:install
npm run demo:dev
```

Or `npm run demo:build` for a production bundle of the demo app.

## Install

```bash
npm install @twobitedd/zen-garden-threejs
```

`@twobitedd/zen-sand-rake` is installed automatically as a normal dependency (single install pulls the sand stack).

Peer dependencies (must be installed in your app; keep versions aligned with your R3F stack):

- `react`, `react-dom`
- `three`
- `@react-three/fiber`
- `@react-three/drei`

## Build

From this package root (after `npm install`):

```bash
npm run build
```

## Repository

Source: https://github.com/twobitEDD/zen-garden-threejs
