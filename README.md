# @twobitedd/zen-garden-threejs

Three.js and React Three Fiber building blocks for zen-garden style experiences (interactive sand disk, rake path debug overlays, and related types).

## Status (v0)

This package currently **re-exports** selected APIs from [`@twobitedd/zen-sand-rake`](https://github.com/twobitEDD/ergo-games/tree/main/packages/zen-sand-rake) (see `src/index.ts`). The long-term plan is to **extract or relocate** implementation from `zen-sand-rake` into this repository while keeping stable imports for apps that switch from `@twobitedd/zen-sand-rake` to `@twobitedd/zen-garden-threejs`.

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
