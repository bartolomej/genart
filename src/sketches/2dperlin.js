// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/math/SimplexNoise");
require("three/examples/js/math/ImprovedNoise");

const canvasSketch = require("canvas-sketch");
const { toByteRGB } = require("../utils");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {

  let sqrtParticles = 14;
  let pathLength = 1000;
  let span = 10;
  let startHue = 230;
  let hueFactor = 50;
  let velocityK = 0.01;
  let showPath = true;
  let showParticles = true;
  // three objects
  let particlesObj;
  let pathsObj;
  let noiseType = 'PERLIN';
  let noise = new THREE.ImprovedNoise();
  let clock = new THREE.Clock(true);

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

  generateParticles();
  generatePaths();

  function generateParticles () {
    const diff = span / sqrtParticles;
    const start = -span / 2, end = span / 2;
    const particles = new Float32Array(Math.pow(sqrtParticles, 2) * 2);
    let index = 0;
    for (let x = start; x < end; x += diff) {
      for (let y = start; y < end; y += diff) {
        particles[index] = x;
        particles[index + 1] = y;
        index += 2;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 2));
    const pointMaterial = new THREE.PointsMaterial({ size: 0.1 });
    particlesObj = new THREE.Points(geometry, pointMaterial);
    if (showParticles) {
      scene.add(particlesObj);
    }
  }

  function generatePaths () {
    const diff = span / sqrtParticles;
    const start = -span / 2, end = span / 2;
    pathsObj = [];
    for (let x = start; x < end; x += diff) {
      for (let y = start; y < end; y += diff) {
        const path = new Float32Array(pathLength * 2);
        for (let i = 0; i < path.length; i += 2) {
          path[i] = x;
          path[i + 1] = y;
        }
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
        geometry.setAttribute('position', new THREE.BufferAttribute(path, 2));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors
        });
        const line = new THREE.LineSegments(geometry, lineMaterial);
        pathsObj.push(line);
        if (showPath) {
          scene.add(line);
        }
      }
    }
  }

  function update () {
    const prevPos = [];
    const particlePos = particlesObj.geometry.attributes.position.array;
    particlesObj.geometry.attributes.position.needsUpdate = true;
    for (let i = 0; i < particlePos.length; i += 2) {
      const p = new THREE.Vector3(particlePos[i], particlePos[i + 1]);
      const v = new THREE.Vector3(1, 0);
      const m = new THREE.Matrix3();
      const n = noiseType === 'PERLIN'
        ? (noise.noise(p.x, p.y, clock.getElapsedTime()) - 0.5) * Math.PI * 2
        : noise.noise(p.x, p.y) * Math.PI * 2;
      m.set(
        Math.cos(n), -Math.sin(n), 0,
        Math.sin(n), Math.cos(n), 0,
        0, 0, 0
      );
      prevPos.push(p);
      v.applyMatrix3(m);
      v.multiplyScalar(velocityK);
      p.add(v);
      particlePos[i] = p.x;
      particlePos[i + 1] = p.y;
    }
    for (let i = 0; i < pathsObj.length; i++) {
      const path = pathsObj[i].geometry.attributes.position.array;
      pathsObj[i].geometry.attributes.position.needsUpdate = true;
      // shift the path positions
      for (let i = path.length - 4; i >= 0; i -= 2) {
        path[i + 2] = path[i];
        path[i + 3] = path[i + 1];
      }
      path[0] = prevPos[i].x;
      path[1] = prevPos[i].y;
    }
  }

  class Controls {
    set span (n) {
      span = n;
      initAll();
    }

    get span () {
      return span;
    }

    set sqrtParticles (n) {
      sqrtParticles = n;
      initAll();
    }

    get sqrtParticles () {
      return sqrtParticles;
    }

    set pathLength (n) {
      pathLength = n;
      initAll();
    }

    get pathLength () {
      return pathLength;
    }

    set velocityK (n) {
      velocityK = n;
      initAll();
    }

    get velocityK () {
      return velocityK;
    }

    set showParticles (b) {
      showParticles = b;
      if (b) {
        scene.add(particlesObj);
      } else {
        scene.remove(particlesObj);
      }
    }

    get showParticles () {
      return showParticles;
    }

    set showPath (b) {
      showPath = b;
      if (b) {
        for (let p of pathsObj) scene.add(p);
      } else {
        for (let p of pathsObj) scene.remove(p);
      }
    }

    get showPath () {
      return showPath;
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

    set noise (s) {
      noiseType = s;
      if (s === 'PERLIN') {
        noise = new THREE.ImprovedNoise();
      } else {
        noise = new THREE.SimplexNoise();
      }
      initAll();
    }

    get noise () {
      return noiseType;
    }
  }

  function initAll () {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    generateParticles();
    generatePaths();

  }

  const c = new Controls();
  const gui = new dat.GUI();
  gui.add(c, 'span');
  gui.add(c, 'sqrtParticles');
  gui.add(c, 'pathLength');
  gui.add(c, 'velocityK');
  gui.add(c, 'showParticles');
  gui.add(c, 'showPath');
  gui.add(c, 'startHue');
  gui.add(c, 'hueFactor');
  gui.add(c, 'noise', ['PERLIN', 'SIMPLEX']);

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
      update();
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
