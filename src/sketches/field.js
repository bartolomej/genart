const canvasSketch = require('canvas-sketch');
const { Vector, Matrix } = require('../math');
const chroma = require('chroma-js')

const size = 4000;

const settings = {
  duration: 3,
  dimensions: [size, size],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const sketch = async ({ width: w, height: h, context }) => {
  const res = { xMin: -w / 2, xMax: w / 2, yMin: -h / 2, yMax: h / 2 };

  const totalVectors = 0;
  const totalParticles = 5000;
  const maxPathLength = 100;
  const widthFactor = 30;
  const integrationStep = 0.05;
  const span = 15;
  const spanX = span;
  const spanY = span;

  // transformation matrix
  const m = new Matrix([spanX / w, 0], [0, spanY / h]);
  // velocity gradient vector function
  const velocity = v => new Vector(
      Math.sin(v.y * Math.sin(v.x * Math.sin(v.y))),
      Math.sin(v.x * Math.sin(v.y * Math.sin(v.x)))
  ).scalarI(integrationStep);

  // calculate n of vectors for each dimension
  let vSrt = Math.sqrt(totalVectors);
  let vdx = w / vSrt, vdy = h / vSrt;

  // calculate n of particles for each dimension
  let dSrt = Math.sqrt(totalParticles);
  let pdx = w / dSrt, pdy = h / dSrt;

  const colorPallet = [
    '#FFCBF2',
    '#F3C4FB',
    '#ECBCFD',
    '#E5B3FE',
    '#E2AFFF',
    '#DEAAFF',
    '#D8BBFF',
    '#D0D1FF',
    '#C8E7FF',
  ];

  const colorInterpolator = chroma.bezier(colorPallet);

  // generate initial particles
  let particles = [];
  let particleIndex = 0;
  for (let y = res.yMin; y < res.yMax; y += pdy) {
    for (let x = res.xMin; x < res.xMax; x += pdx) {
      const baseColor = colorInterpolator(Math.random());
      particles.push({
        path: [],
        v: m.transformI(new Vector(x, y)),
        color: ({progressTowardsPathEnd}) => chroma(baseColor).alpha(progressTowardsPathEnd)
      });
      particleIndex++;
    }
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, -1);
    ctx.beginPath();

    ctx.fillStyle = 'black';
    ctx.fillRect(-width, -height, width * 2, height * 2);

    if (totalVectors > 0) {
      drawVectors(ctx);
    }
    if (totalParticles > 0) {
      drawParticles(ctx);
    }
  };

  function drawParticles (ctx) {
    for (let i = 0; i < particles.length; i++) {
      let { path, v, color } = particles[i];

      path.push(v.clone());

      v.addM(velocity(v));
      const progressFromCenter = 1- (v.abs() / span);
      const width = progressFromCenter * widthFactor;
      if (path.length >= maxPathLength) {
        path.splice(0, 1);
      }

      for (let i = 0; i < path.length - 1; i++) {
        const v0 = m.inverseTransformI(path[i]);
        const v1 = m.inverseTransformI(path[i + 1]);
        ctx.beginPath();
        ctx.moveTo(v0.x, v0.y);
        ctx.lineTo(v1.x, v1.y);
        const progressTowardsPathEnd = i / path.length;
        ctx.lineWidth = Math.round(width * progressTowardsPathEnd) + 1;
        ctx.strokeStyle = color({ progressTowardsPathEnd });
        ctx.stroke();
      }
    }
  }

  function drawVectors (ctx) {
    const scale = 1;
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
