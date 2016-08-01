import PointLight from 'webglue/lib/light/point';
import PointLightMesh from 'webglue/lib/contrib/mesh/light/point';

import Container from 'webglue/lib/container';
import Grid from 'webglue/lib/contrib/mesh/grid';
import { TranslateWidget } from 'webglue/lib/contrib/mesh/widget';

import Camera from 'webglue/lib/camera';

import { quat } from 'gl-matrix';

export default function createRenderContext() {
  let container = new Container();

  let camera = new Camera();
  container.appendChild(camera);

  camera.transform.position[1] = 1;
  camera.transform.position[2] = 0;
  camera.transform.position[0] = -8;
  quat.rotateY(camera.transform.rotation, camera.transform.rotation,
    Math.PI / 4);
  quat.rotateX(camera.transform.rotation, camera.transform.rotation,
    -Math.PI / 3);
  camera.transform.invalidate();

  let light = new PointLightMesh(new PointLight({
    color: new Float32Array([1, 1, 1]),
    ambient: 1,
    diffuse: 1,
    specular: 0.8,
    attenuation: 0.0008
  }));
  container.appendChild(light);

  light.transform.position[1] = 10;
  light.transform.position[2] = 8;
  light.transform.position[0] = 8;
  quat.rotateY(light.transform.rotation,
    light.transform.rotation, Math.PI / 4 * 3);
  quat.rotateZ(light.transform.rotation,
    light.transform.rotation, -Math.PI / 3);
  light.transform.invalidate();

  let grid = new Grid();
  container.appendChild(grid);

  quat.rotateX(grid.transform.rotation, grid.transform.rotation, Math.PI / 2);
  grid.transform.invalidate();

  let translateWidget = new TranslateWidget();
  container.appendChild(translateWidget);

  return { container, camera };
}
