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

  // initial configuration
  let nPoints = 100;
  let pathLength = 10;
  let showPath = false;
  let showPoints = true;
  let span = 5;
  let vx = '0';
  let vy = '0';

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
  initPoints();
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
    set nPoints (n) {
      nPoints = n;
      initAll()
    }
    get nPoints () {
      return nPoints;
    }
    set pathLength (n) {
      pathLength = n;
      initAll()
    }
    get pathLength () {
      return pathLength;
    }
    set showPath (b) {
      showPath = b;
      if (b) {
        scene.add(pathsObj);
      } else {
        scene.remove(pathsObj);
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
    resetField () {
      initAll();
    }
  }

  function initAll () {
    // clear scene
    while(scene.children.length > 0){
      scene.remove(scene.children[0]);
    }
    initPaths();
    initPoints();
  }

  function updateField () {
    try {
      field = new Function(`
        return v => new THREE.Vector3(${vx}, ${vy});
      `)();
    } catch (e) {
      console.info('Failed to update field: ', e);
    }
  }

  // setup gui controls
  const gui = new dat.GUI();
  const c = new Controls();
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'nPoints');
  gui.add(c, 'span');
  gui.add(c, 'pathLength');
  gui.add(c, 'showPath');
  gui.add(c, 'showPoints');
  gui.add(c, 'resetField');

  function initPaths () {
    pathsObj = [];
    pathGeometries = [];
    const diff = span / Math.sqrt(nPoints);
    const start = -span / 2, end = span / 2;
    for (let y = start; y < end; y += diff) {
      for (let x = start; x < end; x += diff) {
        // setup path geometry
        const pathGeometry = new THREE.BufferGeometry();
        const pathArray = new Float32Array(pathLength * 2);
        for (let i = 0; i < pathArray.length - 1; i += 2) {
          pathArray[i] = x;
          pathArray[i + 1] = y;
        }
        pathGeometry.setAttribute('position', new THREE.BufferAttribute(pathArray, 2));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, });
        const line = new THREE.Line(pathGeometry, lineMaterial);
        pathsObj.push(line);
        pathGeometries.push(pathGeometry);
        scene.add(line)
      }
    }
  }

  function initPoints () {
    const diff = span / Math.sqrt(nPoints);
    const start = -span / 2, end = span / 2;
    const pointArray = new Float32Array(nPoints * 2);
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
    for (let i = 0; i < position.length - 2; i += 2) {
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

  function render ({ time }) {
    updatePath();
    updatePoints();

    controls.update();
    renderer.render(scene, camera);
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
    },
    // Update & render your scene here
    render,
  };
};

canvasSketch(sketch, settings);
