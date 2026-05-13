# @twobitedd/zen-garden-threejs

Three.js and React Three Fiber building blocks for zen-garden style experiences (interactive sand disk, rake path debug overlays, and related types).

## Status (v0)

This package currently **re-exports** selected APIs from [`@twobitedd/zen-sand-rake`](https://github.com/twobitEDD/ergo-games/tree/main/packages/zen-sand-rake) (see `src/index.ts`). The long-term plan is to **extract or relocate** implementation from `zen-sand-rake` into this repository while keeping stable imports for apps that switch from `@twobitedd/zen-sand-rake` to `@twobitedd/zen-garden-threejs`.

## Install

```bash
npm install @twobitedd/zen-garden-threejs
```

Peer dependencies (install in your app; versions should match your R3F stack):

- `react`, `react-dom`
- `three`
- `@react-three/fiber`
- `@react-three/drei`

## Build

From this package root (after `npm install`):

```bash
npm run build
```

Ensure `@twobitedd/zen-sand-rake` is built when using the `file:` dependency (monorepo): `npm --prefix ../packages/zen-sand-rake run build`.

## Repository

Source: https://github.com/twobitEDD/zen-garden-threejs
