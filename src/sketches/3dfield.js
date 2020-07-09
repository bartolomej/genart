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

  // speed coefficient
  let speedF = 0.01;
  let nPoints = 1000;
  let pointSize = 0.1;
  let showPoints = true;
  let showPaths = true;
  let pathLength = 10;
  let span = 10;
  let vx = '0';
  let vy = '0';
  let vz = '0';

  let pointGeometry;
  let pointsObj;
  let pathGeometries;
  let pathsObj;

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
  initPaths();

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

    set showPaths (b) {
      showPaths = b;
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

    get showPaths () {
      return showPaths;
    }

    set nPoints (n) {
      nPoints = n;
      initPoints();
      initPaths();
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

    set pathLength (n) {
      pathLength = n;
      initPaths();
      initPoints();
    }

    get pathLength() {
      return pathLength;
    }

    set span (n) {
      span = n;
      initPoints();
      initPaths();
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

    resetField () {
      // clear scene
      while(scene.children.length > 0){
        scene.remove(scene.children[0]);
      }
      initPoints();
      initPaths();
    }
  }

  function updateField () {
    try {
      field = new Function(`
        const cos = Math.cos;
        const sin = Math.sin;
        const pow = Math.pow;
        const sqrt = Math.sqrt;
        return v => new THREE.Vector3(${vx}, ${vy}, ${vz});
      `)();
    } catch (e) {
      console.info('Failed to update field: ', e);
    }
  }

  const c = new Controls();
  const gui = new dat.GUI();
  gui.add(c, 'showPoints');
  gui.add(c, 'showPaths');
  gui.add(c, 'nPoints');
  gui.add(c, 'pointSize');
  gui.add(c, 'pathLength');
  gui.add(c, 'span');
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'vz');
  gui.add(c, 'resetField');

  function initPaths () {
    pathsObj = [];
    pathGeometries = [];
    for (let p of pathsObj) {
      scene.remove(p);
    }
    const d = span / Math.cbrt(nPoints);
    const start = -span / 2, end = span / 2;
    for (let x = start; x < end; x += d) {
      for (let y = start; y < end; y += d) {
        for (let z = start; z < end; z += d) {
          const pathArray = new Float32Array(pathLength * 3);
          for (let i = 0; i < pathArray.length; i += 3) {
            pathArray[i] = x;
            pathArray[i + 1] = y;
            pathArray[i + 2] = z;
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(pathArray, 3));
          pathGeometries.push(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, });
          const line = new THREE.Line(geometry, lineMaterial);
          pathsObj.push(line);
          scene.add(line);
        }
      }
    }
  }

  function initPoints () {
    if (pointsObj) {
      scene.remove(pointsObj);
    }
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
      v.multiplyScalar(speedF)
      p.add(v);
      position[i] = p.x;
      position[i + 1] = p.y;
      position[i + 2] = p.z;
    }
    pointGeometry.attributes.position.needsUpdate = true;
    pointGeometry.computeBoundingSphere();
  }

  function updatePaths () {
    for (let pathGeometry of pathGeometries) {
      const path = pathGeometry.attributes.position.array;
      const p = new THREE.Vector3(path[0], path[1], path[2]);
      for (let i = path.length - 6 ; i >= 0; i -= 3) {
        path[i + 3] = path[i];
        path[i + 4] = path[i + 1];
        path[i + 5] = path[i + 2];
      }
      const v = field(p);
      v.multiplyScalar(speedF);
      p.add(v);
      path[0] = p.x;
      path[1] = p.y;
      path[2] = p.z;
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
    // Update & render your scene here
    render ({ time }) {
      updatePoints();
      updatePaths();
      controls.update();
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
