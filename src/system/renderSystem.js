import Mesh from 'webglue/lib/mesh';
import { vec3 } from 'gl-matrix';

export default class WebGLSystem {
  constructor(container, geometries, materials) {
    this.container = container;
    this.geometries = geometries;
    this.materials = materials;
    this.meshMap = [];

    this.hooks = {
      'transform.setPos:post': (entity) => {
        let mesh = this.meshMap[entity.id];
        vec3.copy(mesh.transform.position, entity.transform.position);
        mesh.transform.invalidate();
      }
    };
  }
  attach(engine) {
    this.family = engine.systems.family.get('mesh', 'transform');
    // Add entity to container
    this.family.onAdd.add(entity => {
      let mesh = new Mesh(
        this.geometries[entity.mesh.geometry],
        this.materials[entity.mesh.material]
      );
      vec3.copy(mesh.transform.position, entity.transform.position);
      vec3.copy(mesh.transform.scale, entity.transform.scale);
      mesh.transform.invalidate();
      this.container.appendChild(mesh);
      this.meshMap[entity.id] = mesh;
    });
  }
}
