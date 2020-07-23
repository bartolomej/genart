// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');
const Audio = require('../audio');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/math/ImprovedNoise");


const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = async ({ context }) => {

  // hyper params
  let noiseF = 0.02;
  let noiseStepF = 3;
  let pathLength = 200;
  let startRadius = 10;
  let radiusStep = 3;
  let nCircles = 60;
  let hueStart = 100;
  let hueF = 1;
  let noise = new THREE.ImprovedNoise();

  const audio = new Audio();
  await audio.init();

  const clock = new THREE.Clock(true);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2500);
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
  }

  function update () {
    const frequencyArray = audio.getFrequencyArray();
    for (let i = 0; i < scene.children.length; i++) {
      const c = scene.children[i];
      const pos = c.geometry.attributes.position.array;
      c.geometry.attributes.position.needsUpdate = true;
      for (let j = 0; j < pos.length; j += 3) {
        const t = clock.getElapsedTime();
        const step = noise.noise(pos[j] * noiseF, pos[j + 1] * noiseF, t) * noiseStepF;
        pos[j + 2] = step * frequencyArray[i] / 4;
      }
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

    set hueStart (n) {
      hueStart = n;
      initScene();
    }

    get hueStart () {
      return hueStart;
    }

    set hueF (n) {
      hueF = n;
      initScene();
    }

    get hueF () {
      return hueF;
    }

    set startRadius (n) {
      startRadius = n;
      initScene();
    }

    get startRadius () {
      return startRadius;
    }

    set radiusStep (n) {
      radiusStep = n;
      initScene();
    }

    get radiusStep () {
      return radiusStep;
    }

    set nCircles (n) {
      nCircles = n;
      initScene();
    }

    get nCircles () {
      return nCircles;
    }

  }

  const gui = new dat.GUI();
  const c = new Controls();
  gui.add(c, 'pathLength', 3, 200, 1);
  gui.add(c, 'hueStart', 0, 360);
  gui.add(c, 'hueF', 0, 5);
  gui.add(c, 'startRadius', 1, 100);
  gui.add(c, 'radiusStep', 0, 5);
  gui.add(c, 'nCircles', 10, 200);

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
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(`hsl(${(r + hueStart) * hueF}, 100%, 50%)`) });
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
