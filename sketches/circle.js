const canvasSketch = require('canvas-sketch');

const settings = {
  duration: 3,
  dimensions: [2048, 2048],
  scaleToView: true,
  playbackRate: 'throttle',
  animate: true,
  fps: 24
};

const division2d = ({ width, height, context }) => {
  context.canvas.style.background = 'black';

  let time = 0;
  const spacing = 100;
  const nCircles = 110;
  const dTime = 0.015;
  const dxFactor = 0.4;
  const dyFactor = 0.4;
  const circularAmplitude = () => 5;
  const circularFrequency = () => 2;
  const radius = (i) => Math.pow(Math.cos(time), 2) * 0.01 * i + 0.02;
  const dx = (i) => Math.cos(time * circularFrequency() + i * dxFactor) * circularAmplitude();
  const dy = (i) => Math.sin(time * circularFrequency() + i * dyFactor) * circularAmplitude();
  const color = () => '#eccd8f'


  const circles = [];
  for (let i = 0; i < nCircles; i++) {
    circles.push({
      center: { x: width / 2, y: height / 2},
      radius: i * spacing,
      initialR: i * spacing
    });
  }

  return ({ context: ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    for (let i = 0; i < circles.length; i++) {
      const c = circles[i];
      ctx.moveTo(c.center.x + c.radius, c.center.y);
      ctx.arc(c.center.x, c.center.y, c.radius, 0, Math.PI * 2);

      c.center.x += dx(i);
      c.center.y += dy(i);
      c.radius = c.initialR * radius(i);
    }
    ctx.strokeStyle = color();
    ctx.lineWidth = 3;
    ctx.stroke();

    time += dTime;
  };
};

canvasSketch(division2d, settings);
