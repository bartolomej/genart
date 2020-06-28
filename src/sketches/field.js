const canvasSketch = require('canvas-sketch');
const { Vector, Matrix } = require('../math');

const settings = {
  duration: 3,
  dimensions: [2000, 2000],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = async ({ width: w, height: h, context }) => {
  context.canvas.style.background = 'black';
  const res = { xMin: -w / 2, xMax: w / 2, yMin: -h / 2, yMax: h / 2 };
  const bounds = { x: [-2, 2], y: [-2, 2] };
  const spanX = Math.abs(bounds.x[0] - bounds.x[1]);
  const spanY = Math.abs(bounds.y[0] - bounds.y[1]);

  const nVectors = 200;
  const showParticles = true;
  const showVectors = true;
  const maxPathLength = 50;
  const dt = 0.001;
  let time = 0;

  const velocity = v => new Vector(v.y, v.x).scalarI(0.1);
  const m = new Matrix([spanX / w, 0], [0, spanY / h]);

  m.scalarM(10)

  let sqrt = Math.sqrt(nVectors);
  let dx = w / sqrt;
  let dy = h / sqrt;

  let particles = [];
  for (let y = res.yMin; y < res.yMax; y += dy) {
    for (let x = res.xMin; x < res.xMax; x += dx) {
      particles.push({ v: new Vector(x, y), path: [] });
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.beginPath();

    if (showVectors) {
      drawVectors(ctx);
    }
    if (showParticles) {
      drawParticles(ctx);
    }

    ctx.strokeStyle = `#FFFFFF`;
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();

    time += dt;
  };

  function drawParticles (ctx) {
    for (let i = 0; i < particles.length; i++) {
      let { path, v } = particles[i];

      path.push(v.clone());

      v.addM(velocity(v));
      if (path.length >= maxPathLength) {
        path.splice(0, 1);
      }

      for (let i = 0; i < path.length - 1; i++) {
        const v0 = path[i];
        const v1 = path[i + 1];
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
      }
    }
  }

  function drawVectors (ctx) {
    const scale = 2;
    for (let y = res.yMin; y < res.yMax; y += dy) {
      for (let x = res.xMin; x < res.yMax; x += dx) {
        const p = new Vector(x, y);
        const v = velocity(p).scalarI(scale);
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + v.x, p.y + v.y);
      }
    }
  }

};

canvasSketch(sketch, settings);
