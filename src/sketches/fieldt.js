// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const dat = require('dat.gui');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/controls/FlyControls");

const canvasSketch = require("canvas-sketch");
const { toByteRGB } = require("../utils");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {

  let spanX = 40;
  let spanY = 40;
  let spanZ = 40;
  let nVertices = 20000;
  let speed = 80;
  let rollSpeed = 0.4;

  let vField = v => new THREE.Vector3(v.y, -v.x, 20);

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
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.FlyControls(camera, renderer.domElement);
  controls.movementSpeed = speed;
  controls.domElement = renderer.domElement;
  controls.rollSpeed = rollSpeed;
  controls.dragToLook = true;

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a geometry
  let lineMeshes = generateField();
  lineMeshes.forEach(m => scene.add(m))


  function Controls () {
    this.speed = speed;
    this.rollSpeed = rollSpeed;
    this.updateCamera = function () {
      controls.movementSpeed = this.speed;
      controls.rollSpeed = this.rollSpeed;
    }
    this.vx = 'v.y';
    this.vy = '-v.x';
    this.vz = '20';
    this.spanX = spanX;
    this.spanY = spanY;
    this.spanZ = spanZ;
    this.nVertices = nVertices;
    this.computeField = function () {
      // evaluated newly defined vector function
      vField = new Function(`
        return v => new THREE.Vector3(${this.vx}, ${this.vy}, ${this.vz});
      `)();
      spanX = this.spanX;
      spanY = this.spanY;
      spanZ = this.spanZ;
      nVertices = this.nVertices;
      // clear scene
      while(scene.children.length > 0){
        scene.remove(scene.children[0]);
      }
      // regenerate objects
      lineMeshes = generateField();
      lineMeshes.forEach(m => scene.add(m))
      window.requestAnimationFrame(render);
    }
  }

  // setup gui controls
  const gui = new dat.GUI();
  const c = new Controls();
  gui.add(c, 'speed');
  gui.add(c, 'rollSpeed');
  gui.add(c, 'updateCamera');
  gui.add(c, 'vx');
  gui.add(c, 'vy');
  gui.add(c, 'vz');
  gui.add(c, 'spanX');
  gui.add(c, 'spanY');
  gui.add(c, 'spanZ');
  gui.add(c, 'nVertices');
  gui.add(c, 'computeField');

  function render ({ time }) {
    const delta = clock.getDelta();
    controls.update(delta);
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

  // generates nParticles geometry instances
  // for each path a particle will take
  // geometry has a buffer size of maxParticles
  function generateField () {
    const lines = [];
    // n of particles per dimension
    const rt = Math.cbrt(nVertices);
    // calculate initial spacing between particles
    const dx = spanX / rt, dy = spanY / rt;
    for (let y = -spanY / 2; y < spanY / 2; y += dy) {
      for (let x = -spanX / 2; x < spanX / 2; x += dx) {
        const lineGeometry = new THREE.BufferGeometry();
        // initial vector at point x,y
        const vertices = new Float32Array(spanZ * 3);
        const colors = new Uint8Array(spanZ * 3);
        // set initial vector
        vertices[0] = x;
        vertices[1] = y;
        vertices[2] = 0;
        // compute time evolution for each initial position
        for (let z = 3; z < spanZ; z += 3) {
          // current positional vector
          const position = new THREE.Vector3(
            vertices[z - 3],
            vertices[z - 2],
            vertices[z - 1]
          );
          // calculate current velocity vector based on x,y coords
          const velocity = vField(position);
          // add current velocity vector to particle position
          position.add(velocity);
          vertices[z] = position.x;
          vertices[z + 1] = position.y;
          vertices[z + 2] = position.z;
          // dynamic coloring based on vector length
          const color = toByteRGB(vColor(velocity))
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

};

canvasSketch(sketch, settings);
