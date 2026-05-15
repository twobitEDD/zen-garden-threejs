import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

export async function loadZenSvg(url, options = {}) {
  const {
    depth = 1,
    scale = 0.01,
    color = 0x111111,
    center = true
  } = options;

  const loader = new SVGLoader();
  const data = await loader.loadAsync(url);
  const group = new THREE.Group();

  for (const path of data.paths) {
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const shapes = SVGLoader.createShapes(path);

    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments: 24
      });

      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
  }

  group.scale.setScalar(scale);
  group.rotation.x = -Math.PI / 2;

  if (center) {
    const box = new THREE.Box3().setFromObject(group);
    const centerVec = new THREE.Vector3();
    box.getCenter(centerVec);
    group.position.sub(centerVec);
  }

  return group;
}

// Usage:
// const geometryGuide = await loadZenSvg('/zen_svgs_export/enso_mandala.svg', { scale: 0.01 });
// scene.add(geometryGuide);
