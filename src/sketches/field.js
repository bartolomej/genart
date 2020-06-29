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

  const nObjects = 500;
  const showParticles = true;
  const showVectors = false;
  const maxPathLength = 50;
  const pathWidth = 3;
  const dt = 0.1;
  let time = 0;

  const velocity = v => new Vector(Math.sin(v.y * Math.sin(v.y)), Math.sin(v.x * Math.sin(v.x))).scalarI(0.1);

  const spanX = 12;
  const spanY = 12;
  const m = new Matrix([spanX / w, 0], [0, spanY / h]);

  let sqrt = Math.sqrt(nObjects);
  let dx = w / sqrt;
  let dy = h / sqrt;

  let particles = [];
  for (let y = res.yMin; y < res.yMax; y += dy) {
    for (let x = res.xMin; x < res.xMax; x += dx) {
      particles.push({
        path: [],
        v: m.transformI(new Vector(x, y)),
        c: `hsla(${Math.random() * 100 + 150}, 100%, 50%, 1)`
      });
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

    time += dt;
  };

  function drawParticles (ctx) {
    for (let i = 0; i < particles.length; i++) {
      let { path, v, c } = particles[i];

      path.push(v.clone());

      v.addM(velocity(v));
      if (path.length >= maxPathLength) {
        path.splice(0, 1);
      }

      for (let i = 0; i < path.length - 1; i++) {
        const v0 = m.inverseTransformI(path[i]);
        const v1 = m.inverseTransformI(path[i + 1]);
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        ctx.lineWidth = Math.round(pathWidth * (i / path.length)) + 1;
        ctx.strokeStyle = c;
        ctx.stroke();
      }
    }
  }

  function drawVectors (ctx) {
    const scale = 3;
    for (let y = res.yMin; y < res.yMax; y += dy) {
      for (let x = res.xMin; x < res.yMax; x += dx) {
        const p = m.transformI(new Vector(x, y));
        const v = velocity(p).scalarI(scale);
        const drawP = m.inverseTransformI(p);
        const drawV = m.inverseTransformI(v);
        ctx.moveTo(drawP.x, drawP.y);
        ctx.lineTo(drawP.x + drawV.x, drawP.y + drawV.y);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.stroke();
  }

};

canvasSketch(sketch, settings);
