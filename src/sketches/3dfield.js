// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');
const Modal = require('../modal');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/controls/FlyControls");
require("three/examples/js/exporters/STLExporter");
require("three/examples/js/exporters/OBJExporter");

const canvasSketch = require("canvas-sketch");
const { toByteRGB, saveFile, shortenedFunctionStrings } = require("../utils");

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
  let pathLength = 800;
  let startHue = 230;
  let hueFactor = 50;
  let movementSpeed = 5;
  let rollSpeed = 0.09;
  let span = 10;
  let vx = '0';
  let vy = '0';
  let vz = '0';
  let example = null;

  let pointGeometry;
  let pointsObj;
  let pathGeometries;
  let pathsObj;

  let field = v => new THREE.Vector3(0, 0, 0);

  const clock = new THREE.Clock();
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({ canvas: context.canvas });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
  camera.position.set(15, 15, 15);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  // const controls = new THREE.OrbitControls(camera, context.canvas);
  const controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = movementSpeed;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = rollSpeed;
  controls.dragToLook = true;

  // Setup your scene
  const scene = new THREE.Scene();

  // initialize objects
  initPoints();
  initPaths();

  class Controls {

    set movementSpeed (n) {
      movementSpeed = n;
      controls.movementSpeed = n;
    }

    get movementSpeed () {
      return movementSpeed;
    }

    set rollSpeed (n) {
      rollSpeed = n;
      controls.rollSpeed = n;
    }

    get rollSpeed () {
      return rollSpeed;
    }

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

    get pathLength () {
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
      initAll();
    }

    exportToTsl() {
      const exporter = new THREE.STLExporter();
      const str = exporter.parse( scene );
      const blob = new Blob( [str], { type : 'text/plain' } );
      saveFile(blob, `3dfield_${Date.now()}.stl`)
    }

    exportToObj() {
      const exporter = new THREE.OBJExporter();
      const str = exporter.parse( scene );
      const blob = new Blob( [str], { type : 'text/plain' } );
      saveFile(blob, `3dfield_${Date.now()}.obj`)
    }


    set examples (s) {
      example = s;
      switch (s) {
        case '1': {
          vx = 'sin(v.x * sin(v.z))';
          vy = 'sin(v.y * sin(v.x))';
          vz = 'sin(v.z * sin(v.y))';
          updateField();
          break;
        }
        case '2': {
          vx = 'cos(v.x * sin(v.z * sin(v.x)))';
          vy = 'sin(v.y * sin(v.x * cos(v.z)))';
          vz = 'sin(v.z * cos(v.y * sin(v.y)))';
          updateField();
          break;
        }
        case '3': {
          vx = 'sin(v.x * cos(v.z * sin(v.x)))';
          vy = 'sin(v.y * sin(v.z * cos(v.z)))';
          vz = 'sin(v.z * cos(v.y * sin(v.y)))';
          updateField();
          break;
        }
        default: {
          vx = '0';
          vy = '0';
          vz = '0';
          updateField();
          initAll();
          break;
        }
      }
    }

    get examples () {
      return example;
    }
  }

  function initAll () {
    // clear scene
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    initPoints();
    initPaths();
  }

  function updateField () {
    try {
      field = new Function(`
        ${shortenedFunctionStrings}
        return v => new THREE.Vector3(${vx}, ${vy}, ${vz});
      `)();
    } catch (e) {
      console.info('Failed to update field: ', e.message);
    }
  }

  const c = new Controls();
  const gui = new dat.GUI();
  gui.add(c, 'movementSpeed');
  gui.add(c, 'rollSpeed');
  gui.add(c, 'showPoints');
  gui.add(c, 'showPaths');
  gui.add(c, 'nPoints');
  gui.add(c, 'pointSize');
  gui.add(c, 'pathLength');
  gui.add(c, 'span');
  gui.add(c, 'startHue');
  gui.add(c, 'hueFactor');
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'vz');
  gui.add(c, 'resetField');
  gui.add(c, 'exportToTsl');
  gui.add(c, 'exportToObj');
  gui.add(c, 'examples', [null, '1', '2', '3']);

  const modal = new Modal({
    title: '3D Vector Field',
    description: `
        <p>This is a three dimensional <a href="https://en.wikipedia.org/wiki/Vector_field">vector field</a> implemented in WebGL with <a href="https://threejs.org/">Three.js</a>.</p>
        <p>A 3D vector field is essentially a function that takes 3 numbers (3d vector) as input and returns 3 new numbers (3d vector) as output. These numbers then determine velocity of a particle at that point in 3D space.</p>
        <p>You can experiments with the parameters and examples. Have fun :)</p>
    `
  });
  modal.show();

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
          const path = new Float32Array(pathLength * 3);
          for (let i = 0; i < path.length; i += 3) {
            path[i] = x;
            path[i + 1] = y;
            path[i + 2] = z;
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
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(path, 3));
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          pathGeometries.push(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors
          });
          const line = new THREE.Line(geometry, lineMaterial);
          pathsObj.push(line);
          if (showPaths) {
            scene.add(line);
          }
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
    if (showPoints) {
      scene.add(pointsObj);
    }
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
      const colors = pathGeometry.attributes.color.array;
      const p = new THREE.Vector3(path[0], path[1], path[2]);
      for (let i = path.length - 6; i >= 0; i -= 3) {
        // shift positions
        path[i + 3] = path[i];
        path[i + 4] = path[i + 1];
        path[i + 5] = path[i + 2];
        // shift corresponding colors
        colors[i + 3] = colors[i];
        colors[i + 4] = colors[i + 1];
        colors[i + 5] = colors[i + 2];
      }
      const v = field(p);
      v.multiplyScalar(speedF);
      p.add(v);
      path[0] = p.x;
      path[1] = p.y;
      path[2] = p.z;
      const h = v.length() * 80 * 160 + 100;
      const c = toByteRGB(new THREE.Color(`hsl(${h}, 100%, 50%)`))
      colors[0] = c.r;
      colors[1] = c.g;
      colors[2] = c.b;
      pathGeometry.attributes.position.needsUpdate = true;
      pathGeometry.attributes.color.needsUpdate = true;
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
      controls.update(clock.getDelta());
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
      modal.hide();
    }
  };
};

canvasSketch(sketch, settings);
