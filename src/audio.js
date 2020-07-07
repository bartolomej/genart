class Audio {

  constructor () {
    this.ctx = null;
    this.analyzer = null;
    this.data = null;
  }

  // NOTE: must open with http://192.168...
  async init () {
    return new Promise((resolve, reject) => {
      let navigator = window.navigator;

      navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      navigator.getUserMedia(
        { video: false, audio: true },
        onSuccess.bind(this),
        onError.bind(this)
      );

      function onSuccess (stream) {
        this.ctx = new AudioContext();
        let mic = this.ctx.createMediaStreamSource(stream);
        this.analyzer = this.ctx.createAnalyser();

        mic.connect(this.analyzer);

        this.data = new Uint8Array(this.analyzer.frequencyBinCount);
        resolve();
      }

      function onError (e) {
        console.error(e);
        reject(e);
      }
    })
  }

  getFrequencyArray () {
    this.analyzer.getByteFrequencyData(this.data);
    return this.data;
  }
}

module.exports = Audio;
