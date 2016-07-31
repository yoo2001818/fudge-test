import CanvasRenderContext from 'webglue/lib/contrib/canvasRenderContext';

import PhongMaterial from 'webglue/lib/contrib/material/phong';
import Texture2D from 'webglue/lib/texture2D';
import BoxGeometry from 'webglue/lib/geom/boxGeometry';

import PointLight from 'webglue/lib/light/point';
import PointLightMesh from 'webglue/lib/contrib/mesh/light/point';

import Container from 'webglue/lib/container';
import Mesh from 'webglue/lib/mesh';
import Grid from 'webglue/lib/contrib/mesh/grid';
import { TranslateWidget } from 'webglue/lib/contrib/mesh/widget';

import Camera from 'webglue/lib/camera';
import FPSCameraController from 'webglue/lib/contrib/controller/fps';

import { quat } from 'gl-matrix';

// Create scene

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

let boxGeom = new BoxGeometry();
let material = new PhongMaterial({
  specular: new Float32Array([0.1, 0.1, 0.1]),
  diffuse: new Float32Array([1, 1, 1]),
  ambient: new Float32Array([0.2, 0.2, 0.2]),
  shininess: 10.0
});

let mesh = new Mesh(boxGeom, material);
container.appendChild(mesh);

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

let context = new CanvasRenderContext();
context.mainScene.camera = camera;

let controller = new FPSCameraController(context.canvas, window, camera);
controller.registerEvents();

let beforeTime;

function animate(currentTime) {
  if (beforeTime == null) beforeTime = currentTime;
  let delta = (currentTime - beforeTime) / 1000;
  controller.update(delta);
  context.update(container, delta);
  beforeTime = currentTime;
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
