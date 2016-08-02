import { quat, vec3 } from 'gl-matrix';

export default class BlenderCameraController {
  constructor(node, keyNode, camera) {
    this.node = node;
    this.keyNode = keyNode;
    this.camera = camera;
    this.center = vec3.create();
    this.radius = 6;
    this.hasChanged = true;

    this.mouseRotate = false;
    this.mouseTranslate = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.rotateDir = 0;

    this.slerpStart = quat.create();
    this.slerpEnd = quat.create();
    this.slerpCounter = -1;

    this.lerpStart = vec3.create();
    this.lerpEnd = vec3.create();
    this.lerpCounter = -1;
  }
  reset() {
    quat.identity(this.camera.transform.rotation);
    quat.rotateY(this.camera.transform.rotation, this.camera.transform.rotation,
      Math.PI / 4);
    quat.rotateX(this.camera.transform.rotation, this.camera.transform.rotation,
      -Math.PI / 180 * 35.264);
    vec3.set(this.center, 0, 0, 0);
    this.hasChanged = true;
  }
  registerEvents() {
    this.node.addEventListener('mousemove', e => {
      const { camera } = this;
      let offsetX = e.clientX - this.mouseX;
      let offsetY = e.clientY - this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (this.mouseTranslate) {
        // Do translation instead - we'd need two vectors to make translation
        // relative to the camera rotation
        let vecX = vec3.create();
        let vecY = vec3.create();

        vec3.transformQuat(vecX, [1, 0, 0],
          camera.transform.rotation);
        vecX[1] = 0;
        vec3.normalize(vecX, vecX);
        vec3.scale(vecX, vecX, -offsetX * this.radius / 600);

        vec3.transformQuat(vecY, [0, 1, 0],
          camera.transform.rotation);
        vecY[1] = 0;
        vec3.normalize(vecY, vecY);
        vec3.scale(vecY, vecY, offsetY * this.radius / 600);

        vec3.add(this.center, this.center, vecX);
        vec3.add(this.center, this.center, vecY);
        this.center[1] = 0;
        this.hasChanged = true;
      }
      if (this.mouseRotate) {
        // rotation....
        let rot = quat.create();
        quat.rotateY(rot, rot,
            Math.PI / 180 * -offsetX * this.rotateDir);
        quat.multiply(camera.transform.rotation, rot,
          camera.transform.rotation);
        quat.rotateX(camera.transform.rotation, camera.transform.rotation,
            Math.PI / 180 * -offsetY);
        this.hasChanged = true;
      }
    });
    this.node.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    this.node.addEventListener('mousedown', e => {
      if (e.button === 2) this.mouseTranslate = true;
      if (e.button === 1) this.mouseRotate = true;
      // Determine if we should go clockwise or anticlockwise.
      let upLocal = vec3.create();
      let up = vec3.fromValues(0, 1, 0);
      vec3.transformQuat(upLocal, [0, 1, 0],
        this.camera.transform.rotation);
      let upDot = vec3.dot(up, upLocal);
      this.rotateDir = upDot >= 0 ? 1 : -1;
      // Set position
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      // e.preventDefault();
    });
    this.node.addEventListener('mouseup', e => {
      if (e.button === 2) this.mouseTranslate = false;
      if (e.button === 1) this.mouseRotate = false;
      // e.preventDefault();
    });
    this.keyNode.addEventListener('keydown', e => {
      if (e.shiftKey) return;
      const { camera } = this;
      if (e.keyCode === 32) {
        vec3.copy(this.lerpStart, this.center);
        vec3.set(this.lerpEnd, 0, 0, 0);
        this.lerpCounter = 0;
        quat.copy(this.slerpStart, camera.transform.rotation);
        quat.identity(this.slerpEnd);
        quat.rotateY(this.slerpEnd, this.slerpEnd, Math.PI / 4);
        quat.rotateX(this.slerpEnd, this.slerpEnd, -Math.PI / 180 * 35.264);
        this.slerpCounter = 0;
      }
      // Persp - Ortho swap
      if (e.keyCode === 101 || e.keyCode === 53) {
        if (camera.options.type === 'persp') {
          camera.options.type = 'ortho';
          camera.options.near = -100;
          //camera.far = 100;
          // statusBar.innerHTML = 'User Ortho';
        } else {
          camera.options.type = 'persp';
          camera.options.near = 0.3;
          //camera.far = 1000;
          // statusBar.innerHTML = 'User Persp';
        }
        camera.invalidate();
        this.hasChanged = true;
      }
      // Front
      if (e.keyCode === 97 || e.keyCode === 49) {
        quat.copy(this.slerpStart, camera.transform.rotation);
        quat.identity(this.slerpEnd);
        if (e.ctrlKey) {
          quat.rotateY(this.slerpEnd, this.slerpEnd, Math.PI);
        }
        this.slerpCounter = 0;
      }
      // Right
      if (e.keyCode === 99 || e.keyCode === 51) {
        quat.copy(this.slerpStart, camera.transform.rotation);
        quat.identity(this.slerpEnd);
        quat.rotateY(this.slerpEnd, this.slerpEnd, Math.PI / 2);
        if (e.ctrlKey) {
          quat.rotateY(this.slerpEnd, this.slerpEnd, -Math.PI);
        }
        this.slerpCounter = 0;
      }
      // Top
      if (e.keyCode === 103 || e.keyCode === 55) {
        quat.copy(this.slerpStart, camera.transform.rotation);
        quat.identity(this.slerpEnd);
        quat.rotateX(this.slerpEnd, this.slerpEnd, -Math.PI / 2);
        if (e.ctrlKey) {
          quat.rotateX(this.slerpEnd, this.slerpEnd, Math.PI);
        }
        this.slerpCounter = 0;
      }
    });
    this.node.addEventListener('wheel', e => {
      if (e.deltaMode === 0) {
        this.radius += this.radius * e.deltaY / 50 / 12;
      } else {
        this.radius += this.radius * e.deltaY / 50;
      }
      this.hasChanged = true;
      e.preventDefault();
    });
  }
  update(delta) {
    const { camera } = this;
    if (this.lerpCounter !== -1) {
      this.lerpCounter = Math.min(1, this.lerpCounter + delta * 4);
      vec3.lerp(this.center,
        this.lerpStart, this.lerpEnd, easeInOutQuad(this.lerpCounter)
      );
      this.hasChanged = true;
      if (this.lerpCounter >= 1) this.lerpCounter = -1;
    }
    if (this.slerpCounter !== -1) {
      this.slerpCounter = Math.min(1, this.slerpCounter + delta * 4);
      quat.slerp(camera.transform.rotation,
        this.slerpStart, this.slerpEnd, easeInOutQuad(this.slerpCounter)
      );
      this.hasChanged = true;
      if (this.slerpCounter >= 1) this.slerpCounter = -1;
    }
    if (this.hasChanged) {
      if (camera.options.type === 'ortho') {
        camera.options.zoom = this.radius;
        camera.invalidate();
        vec3.transformQuat(camera.transform.position, [0, 0, 100],
          camera.transform.rotation);
        vec3.add(camera.transform.position, camera.transform.position,
          this.center);
      } else {
        vec3.transformQuat(camera.transform.position, [0, 0, this.radius],
          camera.transform.rotation);
        vec3.add(camera.transform.position, camera.transform.position,
          this.center);
      }
      camera.transform.invalidate();
      this.hasChanged = false;
    }
  }
}

function easeInOutQuad (t) {
  t *= 2;
  if (t < 1) return t*t/2;
  t--;
  return (t*(t-2) - 1) / -2;
}
