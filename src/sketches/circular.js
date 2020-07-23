// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');
const utils = require('../utils');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {

  // hyper params
  let pathLength = 60;
  let startRadius = 1;
  let radiusStep = 2;
  let nCircles = 50;
  // rotation functions
  let rx = (t, i) => Math.sin(t);
  let ry = (t, i) => Math.sin(t);
  let rz = (t, i) => Math.sin(t);
  // unparsed functions
  let _rx = 'sin(t)';
  let _ry = 'sin(t)';
  let _rz = 'sin(t)';

  let clock = new THREE.Clock(true);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
  camera.position.set(0, 0, 250);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  function initScene () {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    for (let i = 0; i < nCircles; i++) {
      const c = initCircle(startRadius + i * radiusStep, 0);
      scene.add(c);
    }
    clock = new THREE.Clock(true);
  }

  function update () {
    for (let i = 0; i < scene.children.length; i++) {
      const c = scene.children[i];
      const pos = c.geometry.attributes.position.array;
      c.geometry.attributes.position.needsUpdate = true;
      for (let j = 0; j < pos.length; j += 3) {
        const t = clock.getElapsedTime();
        const rF = 0.00001 * (i / 3);
        c.geometry.rotateX(rF * rx(t, i));
        c.geometry.rotateY(rF * ry(t, i));
        c.geometry.rotateZ(rF * rz(t, i));
      }
    }
  }

  function initRotationFunctions () {
    const f = utils.shortenedFunctionStrings;
    try {
      rx = new Function(`${f}return (t, i) => ${_rx};`)();
      ry = new Function(`${f}return (t, i) => ${_ry};`)();
      rz = new Function(`${f}return (t, i) => ${_rz};`)();
    } catch (e) {
      console.info('Function eval failed !');
    }
  }

  initScene();

  class Controls {
    set pathLength (n) {
      pathLength = n;
      initScene();
    }

    get pathLength () {
      return pathLength;
    }

    set rx (s) {
      _rx = s;
      initRotationFunctions();
    }

    get rx () {
      return _rx;
    }

    set ry (s) {
      _ry = s;
      initRotationFunctions();
    }

    get ry () {
      return _ry;
    }

    set rz (s) {
      _rz = s;
      initRotationFunctions();
    }

    get rz () {
      return _rz;
    }

    resetScene () {
      initScene();
    }
  }

  const gui = new dat.GUI();
  const c = new Controls();
  gui.add(c, 'pathLength', 3, 200, 1);
  gui.add(c, 'rx');
  gui.add(c, 'ry');
  gui.add(c, 'rz');
  gui.add(c, 'resetScene');

  function initCircle (r, y = 0) {
    const pathArray = new Float32Array((pathLength + 1) * 3);
    let dAngle = (Math.PI * 2) / pathLength, i = 0;
    for (let angle = 0; angle <= Math.PI * 2; angle += dAngle) {
      pathArray[i] = Math.cos(angle) * r;
      pathArray[i + 1] = Math.sin(angle) * r;
      pathArray[i + 2] = y;
      i += 3;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pathArray, 3));
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(`hsl(${r}, 100%, 50%)`) });
    return new THREE.Line(geometry, material);
  }

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render ({ time }) {
      controls.update();
      update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
