import createScene from './util/createScene';
import { Engine } from 'fudge';

import mesh from './component/mesh';
import transform from './component/transform';

import RenderSystem from './system/renderSystem';
import PhongMaterial from 'webglue/lib/contrib/material/phong';
import BoxGeometry from 'webglue/lib/geom/boxGeometry';
import QuadGeometry from 'webglue/lib/geom/quadGeometry';

import CanvasRenderContext from 'webglue/lib/contrib/canvasRenderContext';
import CameraController from './util/cameraController';

import { vec3 } from 'gl-matrix';

let { container, camera } = createScene();

let context = new CanvasRenderContext();
context.mainScene.camera = camera;

let controller = new CameraController(window, window, camera);
controller.registerEvents();
controller.reset();

let engine = new Engine({
  mesh, transform, test: {
    component: function TestComponent(data) {
      this.velocity = data.velocity || vec3.fromValues(0, 10, 0);
    }
  }
}, {
  render: new RenderSystem(container, {
    default: new BoxGeometry(),
    cube: new BoxGeometry(),
    quad: new QuadGeometry()
  }, {
    default: new PhongMaterial({
      specular: new Float32Array([0.5, 0.5, 0.5]),
      diffuse: new Float32Array([0.8, 0.8, 0.8]),
      ambient: new Float32Array([0.2, 0.2, 0.2]),
      shininess: 64.0
    })
  }),
  test: function TestSystem (engine) {
    this.timer = 0;
    this.entities = engine.systems.family.get('test', 'transform').entities;
    this.hooks = {
      'external.start': () => {
        for (let x = -5; x <= 5; ++x) {
          for (let z = -5; z <= 5; ++z) {
            engine.actions.entity.create({
              transform: {
                position: vec3.fromValues(x, 0, z),
                scale: vec3.fromValues(0.5, 0.5, 0.5)
              },
              mesh: {
                geometry: 'cube'
              },
              test: {
              }
            });
          }
        }
      },
      'external.update': (delta) => {
        this.timer += delta;
        this.entities.forEach(entity => {
          let x = entity.transform.position[0];
          let z = entity.transform.position[2];
          let y = Math.sin((x + z) / 5 + this.timer) * 4;
          let tmp = vec3.fromValues(x, y, z);
          engine.actions.transform.setPos(entity, tmp);
        });
        /*
        let deltaVal = vec3.fromValues(0, -9.8 * delta, 0);
        this.entities.forEach(entity => {
          let tmp = vec3.create();
          vec3.scale(tmp, entity.test.velocity, delta);
          vec3.add(entity.test.velocity, entity.test.velocity,
            deltaVal);
          engine.actions.transform.addPos(entity, tmp);
        });
        */
      }
      /*'transform.setPos:pre': (entity, pos) => {
        pos[1] = Math.max(pos[1], 0);
        if (pos[1] <= 0 && entity.test) {
          entity.test.velocity[1] = Math.max(entity.test.velocity[1], 0);
        }
        return [entity, pos];
      }*/
    };
  }
});

engine.start();

let beforeTime;

function animate(currentTime) {
  if (beforeTime == null) beforeTime = currentTime;
  let delta = (currentTime - beforeTime) / 1000;
  controller.update(delta);
  engine.update(delta);
  context.update(container, delta);
  beforeTime = currentTime;
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
