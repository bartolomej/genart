export default class Canvas {

  constructor ({ name, root, background = 'white', showCaptureBtn = false }) {
    this.name = name;
    this.root = root;
    this.canvas = null;
    this.ctx = null;
    this.background = background;
    this.init();
    if (showCaptureBtn) {
      this.initCaptureButton();
    }
  }

  init () {
    this.canvas = document.createElement('canvas');
    this.canvas.style.background = this.background;
    this.canvas.width = this.root.clientWidth * 2;
    this.canvas.height = this.root.clientHeight * 2;
    this.canvas.style.height = '100%';
    this.canvas.style.width = '100%';
    this.root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  initCaptureButton () {
    this.captureButton = document.createElement('a');
    this.captureButton.setAttribute('download', `${this.name}.png`);
    this.captureButton.setAttribute('href', this.imageData);
    this.captureButton.innerText = 'Capture';
    this.captureButton.className = 'capture-btn';
    this.root.appendChild(this.captureButton);
  }

  get height () {
    return this.canvas.height;
  }

  get width () {
    return this.canvas.width;
  }

  get imageData () {
    return this.canvas.toDataURL('image/png', 1);
  }

  clear () {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  stop () {
    cancelAnimationFrame(this.animation);
  }

  animate (cb) {
    this.clear();
    cb.bind(this)();
    this.animation = requestAnimationFrame(() => this.animate.bind(this)(cb));
  }

}
