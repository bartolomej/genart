// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/controls/FlyControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {

  const spanX = 10, spanY = 10;
  const nParticles = 300;
  const maxTimesteps = 100;
  const dz = 10; // step in z dimension

  const vGrad = v => new THREE.Vector3(
    Math.sin(v.y * Math.sin(v.x * Math.sin(v.y))),
    -Math.sin(v.x * Math.sin(v.y * Math.sin(v.x))),
    dz
  );

  const vColor = v => new THREE.Color(
    `hsl(${v.length() + 250}, 100%, 60%)`
  );

  const clock = new THREE.Clock();

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 500);
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.FlyControls( camera, renderer.domElement );
  controls.movementSpeed = 30;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = Math.PI / 15;
  controls.dragToLook = false;

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
      const delta = clock.getDelta();
      controls.update( delta );
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
    const lines = [];
    // n of particles per dimension
    const sqrt = Math.sqrt(nParticles);
    // calculate initial spacing between particles
    const dx = spanX / sqrt, dy = spanY / sqrt;
    for (let y = -spanY / 2; y < spanY / 2; y += dy) {
      for (let x = -spanX / 2; x < spanX / 2; x += dx) {
        const lineGeometry = new THREE.BufferGeometry();
        // initial vector at point x,y
        const vertices = new Float32Array(maxTimesteps * 3);
        const colors = new Uint8Array(maxTimesteps * 3);
        // set initial vector
        vertices[0] = x;
        vertices[1] = y;
        vertices[2] = 0;
        // compute time evolution for each initial position
        for (let z = 3; z < maxTimesteps; z += 3) {
          // current positional vector
          const position = new THREE.Vector3(
            vertices[z - 3],
            vertices[z - 2],
            vertices[z - 1]
          );
          // calculate current velocity vector based on x,y coords
          const velocity = vGrad(position);
          // add current velocity vector to particle position
          position.add(velocity);
          vertices[z] = position.x;
          vertices[z + 1] = position.y;
          vertices[z + 2] = position.z;
          const color = toByteRGB(vColor(velocity));
          colors[z] = color.r;
          colors[z + 1] = color.g;
          colors[z + 2] = color.b;
        }
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, true));
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors
        });
        const line = new THREE.Line(lineGeometry, material)
        lines.push(line)
      }
    }
    return lines;
  }

  function toByteRGB (color) {
    return {
      r: (color.getHex() & 0xff0000) >> 16,
      g: (color.getHex() & 0x00ff00) >> 8,
      b: (color.getHex() & 0x0000ff)
    };

  }

};

canvasSketch(sketch, settings);
