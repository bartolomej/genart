// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');

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

  let nPoints = 1000;
  let pointSize = 0.1;
  let showPoints = true;
  let span = 10;
  let vx = '0';
  let vy = '0';
  let vz = '0';

  let pointGeometry;
  let pointsObj;

  let field = v => new THREE.Vector3(0, 0, 0);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ canvas: context.canvas });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
  camera.position.set(0, 0, 20);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // initialize objects
  initPoints();

  class Controls {
    set showPoints (b) {
      showPoints = b;
      if (showPoints) {
        scene.add(pointsObj);
      } else {
        scene.remove(pointsObj);
      }
    }
    get showPoints () {
      return showPoints;
    }
    set nPoints (n) {
      nPoints = n;
      initPoints();
    }
    get nPoints () {
      return nPoints;
    }
    set pointSize (n) {
      pointSize = n;
      initPoints();
    }
    get pointSize () {
      return pointSize;
    }
    set span (n) {
      span = n;
      initPoints();
    }
    get span () {
      return span;
    }
    set vx (s) {
      vx = s;
      updateField();
    }
    get vx () {
      return vx;
    }
    set vy (s) {
      vy = s;
      updateField();
    }
    get vy () {
      return vy;
    }
    set vz (s) {
      vz = s;
      updateField();
    }
    get vz () {
      return vz;
    }
    resetParticles () {
      initPoints();
    }
  }

  function updateField () {
    try {
      field = new Function(`
        return v => new THREE.Vector3(${vx}, ${vy}, ${vz});
      `)();
    } catch (e) {
      console.info('Failed to update field: ', e);
    }
  }

  const c = new Controls();
  const gui = new dat.GUI();
  gui.add(c, 'showPoints');
  gui.add(c, 'nPoints');
  gui.add(c, 'pointSize');
  gui.add(c, 'span');
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'vz');
  gui.add(c, 'resetParticles');


  function initPoints () {
    // initial positions
    const pointArray = new Float32Array(nPoints * 3);
    const d = span / Math.cbrt(nPoints);
    const start = -span / 2, end = span / 2;
    let index = 0;
    for (let x = start; x < end; x += d) {
      for (let y = start; y < end; y += d) {
        for (let z = start; z < end; z += d) {
          pointArray[index] = x;
          pointArray[index + 1] = y;
          pointArray[index + 2] = z;
          index += 3;
        }
      }
    }
    // setup geometry
    pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointArray, 3));
    const dotMaterial = new THREE.PointsMaterial({ size: pointSize });
    if (pointsObj) {
      scene.remove(pointsObj);
    }
    pointsObj = new THREE.Points(pointGeometry, dotMaterial);
    scene.add(pointsObj);
  }

  function updatePoints () {
    const position = pointGeometry.attributes.position.array;
    for (let i = 0; i < position.length; i += 3) {
      const p = new THREE.Vector3(
        position[i],
        position[i + 1],
        position[i + 2]
      );
      const v = field(p);
      v.multiplyScalar(0.01)
      p.add(v);
      position[i] = p.x;
      position[i + 1] = p.y;
      position[i + 2] = p.z;
    }
    pointGeometry.attributes.position.needsUpdate = true;
    pointGeometry.computeBoundingSphere();
  }

  function render ({ time }) {
    updatePoints();
    controls.update();
    renderer.render(scene, camera);
  }

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render,
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
