import { quat, vec3 } from 'gl-matrix';
import { signal } from 'fudge';

let tmp = vec3.create();

export default {
  component: class TransformComponent {
    constructor(data) {
      this.position = data.position || vec3.create();
      this.scale = data.scale || vec3.fromValues(1, 1, 1);
      this.rotation = data.rotation || quat.create();
    }
  },
  actions: {
    setPos: signal((entity, target) => {
      vec3.copy(entity.transform.position, target);
    }),
    addPos: function (entity, target) {
      vec3.copy(tmp, entity.transform.position);
      vec3.add(tmp, tmp, target);
      this.actions.transform.setPos(entity, tmp);
    }
  }
};
