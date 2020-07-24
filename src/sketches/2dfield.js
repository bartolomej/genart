// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');
const Modal = require('../modal');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { toByteRGB, shortenedFunctionStrings } = require("../utils");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {

  // initial configuration
  let nParticles = 50;
  let pathLength = 100;
  let showPath = true;
  let showPoints = true;
  let startHue = 230;
  let hueFactor = 50;
  let span = 20;
  let vx = '0';
  let vy = '0';
  let example = null;

  let pointsObj;
  let pathsObj = [];
  let pointGeometry;
  let pathGeometries = [];

  // function describing dynamics of a field
  let field = v => new THREE.Vector3(0, 0);

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ canvas: context.canvas });
  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 300);
  camera.position.set(0, 0, 20);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // initialize geometries
  initParticles();
  initPaths();

  if (showPath) {
    for (let path of pathsObj) {
      scene.add(path);
    }
  }
  if (showPoints) {
    scene.add(pointsObj);
  }

  class Controls {
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

    set span (n) {
      span = n;
      initAll();
    }

    get span () {
      return span;
    }

    set nParticles (n) {
      nParticles = n;
      initAll()
    }

    get nParticles () {
      return nParticles;
    }

    set pathLength (n) {
      pathLength = n;
      initAll()
    }

    get pathLength () {
      return pathLength;
    }

    set startHue (b) {
      startHue = b;
      initAll();
    }

    get startHue () {
      return startHue;
    }

    set hueFactor (b) {
      hueFactor = b;
      initAll();
    }

    get hueFactor () {
      return hueFactor;
    }

    set showPath (b) {
      showPath = b;
      if (b) {
        for (let p of pathsObj) {
          scene.add(p);
        }
      } else {
        for (let p of pathsObj) {
          scene.remove(p);
        }
      }
    }

    get showPath () {
      return showPath;
    }

    set showPoints (b) {
      showPoints = b;
      if (b) {
        scene.add(pointsObj);
      } else {
        scene.remove(pointsObj);
      }
    }

    get showPoints () {
      return showPoints;
    }

    set example (e) {
      example = e;
      switch (e) {
        case '1': {
          vx = 'sin(v.x * sin(v.x * sin(v.y)))';
          vy = 'sin(v.y * cos(v.x * sin(v.y)))';
          updateField();
          break;
        }
        case '2': {
          vx = '-sin(v.y * sin(v.x * cos(v.x)))';
          vy = 'sin(v.y * cos(v.x * cos(v.y)))';
          updateField();
          break;
        }
        default: {
          vx = '0';
          vy = '0';
          updateField();
          initAll();
        }
      }
    }

    get example () {
      return example;
    }

    resetField () {
      initAll();
    }
  }

  function initAll () {
    // clear scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    initPaths();
    initParticles();
  }

  function updateField () {
    try {
      field = new Function(`
        ${shortenedFunctionStrings}
        return v => new THREE.Vector3(${vx}, ${vy});
      `)();
    } catch (e) {
      console.info('Failed to update field: ', e.message);
    }
  }

  // setup gui controls
  const gui = new dat.GUI();
  const c = new Controls();
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'nParticles');
  gui.add(c, 'span');
  gui.add(c, 'pathLength');
  gui.add(c, 'showPath');
  gui.add(c, 'showPoints');
  gui.add(c, 'startHue');
  gui.add(c, 'hueFactor');
  gui.add(c, 'resetField');
  gui.add(c, 'example', [null, '1', '2']);

  const modal = new Modal({
    title: '2D Vector Field',
    description: `
        <p>This is a two dimensional <a href="https://en.wikipedia.org/wiki/Vector_field">vector field</a> implemented in WebGL with <a href="https://threejs.org/">Three.js</a>.</p>
        <p>A 2D vector field is essentially a function that takes 2 numbers (2d vector) as input and returns 2 new numbers (2d vector) as output. These numbers then determine velocity of a particle at that point in 2D space.</p>
        <p>You can experiments with the parameters and examples. Have fun :)</p>
    `
  });
  modal.show();

  function initPaths () {
    pathsObj = [];
    pathGeometries = [];
    const diff = span / nParticles;
    const start = -span / 2, end = span / 2;
    for (let y = start; y < end; y += diff) {
      for (let x = start; x < end; x += diff) {
        // setup path geometry
        const pathGeometry = new THREE.BufferGeometry();
        const path = new Float32Array(pathLength * 2);
        for (let i = 0; i < path.length; i += 2) {
          path[i] = x;
          path[i + 1] = y;
        }
        // generate random colors for line within hue interval
        const colors = new Uint8Array(pathLength * 3);
        const hue = Math.random() * hueFactor + startHue;
        for (let i = 0; i < colors.length; i += 3) {
          const luminosity = Math.round(50 * (1 / ((i / path.length) + 1)));
          const color = toByteRGB(new THREE.Color(`hsl(${hue}, 100%, ${luminosity}%)`));
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
        pathGeometry.setAttribute('position', new THREE.BufferAttribute(path, 2));
        pathGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors
        });
        const line = new THREE.Line(pathGeometry, lineMaterial);
        pathsObj.push(line);
        pathGeometries.push(pathGeometry);
        scene.add(line)
      }
    }
  }

  function initParticles () {
    const diff = span / nParticles;
    const start = -span / 2, end = span / 2;
    const pointArray = new Float32Array(Math.pow(nParticles, 2) * 2);
    let index = 0;
    for (let y = start; y < end; y += diff) {
      for (let x = start; x < end; x += diff) {
        // initialize position vector
        pointArray[index] = x;
        pointArray[index + 1] = y;
        index += 2;
      }
    }
    pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointArray, 2));
    const pointMaterial = new THREE.PointsMaterial({ size: 0.1 });
    pointsObj = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(pointsObj);
  }

  function updatePoints () {
    const position = pointGeometry.attributes.position.array;
    pointGeometry.attributes.position.needsUpdate = true;
    for (let i = 0; i < position.length; i += 2) {
      const p = new THREE.Vector3(
        position[i],
        position[i + 1]
      );
      const v = field(p);
      v.multiplyScalar(0.01);
      p.add(v);
      position[i] = p.x;
      position[i + 1] = p.y;
    }
  }

  function updatePath () {
    for (let pathGeometry of pathGeometries) {
      let path = pathGeometry.attributes.position.array;
      let p = new THREE.Vector3(path[0], path[1]);
      for (let i = path.length - 4; i >= 0; i -= 2) {
        path[i + 2] = path[i];
        path[i + 3] = path[i + 1];
      }
      // update last point
      const v = field(p);
      v.multiplyScalar(0.01)
      p.add(v);
      path[0] = p.x;
      path[1] = p.y;
      pathGeometry.attributes.position.needsUpdate = true;
    }
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
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
      modal.hide();
    },
    // Update & render your scene here
    render ({ time }) {
      updatePath();
      updatePoints();
      controls.update();
      renderer.render(scene, camera);
    }
  };
};

canvasSketch(sketch, settings);
