const canvasSketch = require('canvas-sketch');
const chroma = require("chroma-js");

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 50
};

const sketch = ({ width, height, context }) => {
  context.canvas.style.background = chroma.random().alpha(0.1);

  const totalPoints = 300;
  const trailLength = 30;
  const spacingFactor = 10;
  const pointSize = 8;
  const start = { x: width / 2, y: height / 2 }
  const dTime = 0.01;
  const randomnessFactor = 0;
  let time = 0;

  const colorScheme = chroma
      .bezier([chroma.random(), chroma.random()])
      .scale()
      .colors(trailLength)
      .map(color => chroma(color).darken());

  const spacing = () => Math.cos(time) * spacingFactor;
  const posX = i => start.x + Math.cos(i * Math.sqrt(time)) * spacing() * i;
  const posY = i => start.x + Math.sin(i * Math.sqrt(time)) * spacing() * i;

  const points = [];
  for (let i = 0; i < totalPoints; i++) {
    points.push({ x: posX(0), y: posY(0), trail: [] });
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < points.length; i++) {
      let { x, y, trail } = points[i];

      for (let j = 0; j < trail.length; j++) {
        let { x, y } = trail[j];

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, pointSize * (j / trail.length), 0, Math.PI * 2);

        const progressTowardsEndPoint = j / points.length

        ctx.closePath()
        ctx.fillStyle = chroma(colorScheme[j]).alpha(progressTowardsEndPoint * 3);
        ctx.fill();
      }

      trail.push(Object.assign({}, { x, y }));
      if (trail.length > trailLength) {
        trail.splice(0, 1);
      }

      const randomStep = () => ((Math.random() - 0.5) * Math.sin(time)) * randomnessFactor;

      points[i].x = posX(i) + randomStep();
      points[i].y = posY(i) + randomStep();
    }

    time += dTime;
  };
};

canvasSketch(sketch, settings);
