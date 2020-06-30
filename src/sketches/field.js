const canvasSketch = require('canvas-sketch');
const { Vector, Matrix } = require('../math');

const settings = {
  duration: 3,
  dimensions: [4000, 4000],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = async ({ width: w, height: h, context }) => {
  const res = { xMin: -w / 2, xMax: w / 2, yMin: -h / 2, yMax: h / 2 };

  const nVectors = 1000;
  const nParticles = 1000;
  const maxPathLength = 50;
  const pathWidth = 20;
  const dt = 0.1;
  let time = 0;
  const spanX = 20;
  const spanY = 20;

  // transformation matrix
  const m = new Matrix([spanX / w, 0], [0, spanY / h]);
  // velocity gradient vector function
  const velocity = v => new Vector(
    Math.sin(v.y * Math.sin(v.x * Math.sin(v.y))),
    Math.sin(v.x * Math.sin(v.y * Math.sin(v.x)))
  ).scalarI(0.2);

  // calculate n of vectors for each dimension
  let vSrt = Math.sqrt(nVectors);
  let vdx = w / vSrt, vdy = h / vSrt;

  // calculate n of particles for each dimension
  let dSrt = Math.sqrt(nParticles);
  let pdx = w / dSrt, pdy = h / dSrt;

  // generate initial particles
  let particles = [];
  for (let y = res.yMin; y < res.yMax; y += pdy) {
    for (let x = res.xMin; x < res.xMax; x += pdx) {
      particles.push({
        path: [],
        v: m.transformI(new Vector(x, y)),
        c: `hsla(${Math.random() * 100 + 260}, 100%, 50%, 1)`
      });
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.beginPath();

    ctx.fillStyle = 'black';
    ctx.fillRect(-width, -height, width * 2, height * 2);

    if (nVectors > 0) {
      drawVectors(ctx);
    }
    if (nParticles > 0) {
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
    const scale = 2;
    for (let y = res.yMin; y < res.yMax; y += vdy) {
      for (let x = res.xMin; x < res.yMax; x += vdx) {
        const p = m.transformI(new Vector(x, y));
        const v = velocity(p).scalarI(scale);
        const drawP = m.inverseTransformI(p);
        const drawV = m.inverseTransformI(v);
        ctx.moveTo(drawP.x, drawP.y);
        ctx.lineTo(drawP.x + drawV.x, drawP.y + drawV.y);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
  }

};

canvasSketch(sketch, settings);
