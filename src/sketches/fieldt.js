// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const meshLine = require('three.meshline');

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

  const spanX = 10, spanY = 10;
  const nParticles = 10;
  const maxTimesteps = 10;
  const dz = 1;
  let drawRange = 0;

  const vGrad = v => new THREE.Vector3(
    v.y,
    v.x,
    v.z + dz
  );

  const color = v => new THREE.Color(
    `hsl(${v.length() + 250}, 100%, 50%)`
  );

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 50);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const lineMeshes = generateField();
  lineMeshes.forEach(m => scene.add(m))

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
      // TODO: animate
      // for (let mesh of lineMeshes) {
      //   mesh.geometry.setDrawRange(0, drawRange);
      //   drawRange += 1;
      // }
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
    }
  };

  // generates nParticles geometry instances
  // for each path a particle will take
  // geometry has a buffer size of maxParticles
  function generateField () {
    const meshes = [];
    // n of particles per dimension
    const sqrt = Math.sqrt(nParticles);
    // calculate initial spacing between particles
    const dx = spanX / sqrt, dy = spanY / sqrt;
    for (let y = -spanY / 2; y < spanY / 2; y += dy) {
      for (let x = -spanX / 2; x < spanX / 2; x += dx) {
        const lineGeometry = new THREE.Geometry();
        // initial vector at point x,y
        const pointArray = [ new THREE.Vector3(x, y, 0) ];
        const colorArray = [ new THREE.Color('white') ];
        // compute time evolution for each initial position
        for (let z = 1; z < maxTimesteps; z++) {
          const v0 = pointArray[z - 1];
          const v1 = v0.clone();
          const velocity = vGrad(v0);
          v1.add(velocity);
          pointArray[z] = v1;
          colorArray[z] = color(velocity);
        }
        lineGeometry.setFromPoints(pointArray);
        lineGeometry.colors = colorArray;
        const line = new meshLine.MeshLine();
        line.setGeometry(lineGeometry, p => 0.1);
        const material = new meshLine.MeshLineMaterial({ color: 0x000fff});
        meshes.push(new THREE.Mesh(line.geometry, material));
      }
    }
    return meshes;
  }

};

canvasSketch(sketch, settings);
