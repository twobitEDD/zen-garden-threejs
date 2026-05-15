# Releasing `@twobitedd/zen-garden-threejs`

## Prerequisite: `zen-sand-rake`

This package depends on [`@twobitedd/zen-sand-rake`](https://www.npmjs.com/package/@twobitedd/zen-sand-rake). Features such as **`rakeAmbientZenSacredGarden`** require **0.2.0+** of that library.

**Publish order**

1. In the ergo-games repo, from `packages/zen-sand-rake`, run tests and publish version **0.2.0** (or the matching semver you intend to depend on):

   ```bash
   npm test && npm publish
   ```

2. In **this** repository, point `dependencies` at the published version instead of the monorepo `file:` link (temporary edit for publish only if you normally develop with `file:../packages/zen-sand-rake`):

   ```json
   "@twobitedd/zen-sand-rake": "^0.2.0"
   ```

   Then run `npm install` and commit the updated `package-lock.json` if you publish with a reproducible lockfile.

3. Version bump here (`package.json`), update `CHANGELOG.md`, then:

   ```bash
   npm run release:check
   npm publish
   ```

After publishing, you may revert `package.json` to `file:../packages/zen-sand-rake` for sibling-repo development.

## Checks

```bash
npm run release:check   # library tsc + Vite demo build
```
