import * as ort from 'onnxruntime-web';

// const net = "./nude2-dcgan-met-random-crop-198x198.onnx"
// const net = "./yikes.onnx"
// const net = "./yada-yada.onnx"
// const net = "./nice.onnx"
const net = "./nude2-dcgan-met-random-crop-198x198.onnx";

export class WaveController {

  constructor(el) {
    this.el = el;
    this.setupListeners();
    this.active = false;
    this.el.className = "inactive";
    this.context = this.el.getContext("2d");

    this.highlighted = -1;

    this.size = 100;
    this.vector = new Array(this.size).fill(0.0);

    for (let i=0; i < this.vector.length; i++) {
      this.vector[i] = Math.random() * 2.0 - 1.0;
    }
    this.pos = [0.0, 0.0];
    this.update();
    this.draw();

    this.loop();
  }

  // Capture a point and map to a vector slot and a value from [-1.0, 1.0]
  capture(x, y) {
    const w = this.el.width;
    const h = this.el.height;
    const i = Math.floor(y / h * this.size);
    const v = (x / w) * 2.0 - 1.0;
    this.vector[i] = v;
  }

  loop() {

    if (this.loopId) {
      clearInterval(this.loopId);
    }



    this.loopId = setInterval(() => {

      let vec = JSON.stringify(this.vector);

      if (this.last == vec) {
        return;
      }

      this.last= vec;

      generateImageFromApi(this.vector, "api-image-container");
    }, 1000);
  }

  /**
   * SETUP LISTENERS
   *
   *
   */
  setupListeners() {

    let press = (e) => {
      if (this.active) {
        return;
      }
      this.active = true;
      this.el.className = "active";
      this.capture(e.offsetX, e.offsetY);
      this.update();
      this.draw();
    };

    // Release control
    let release = (e) => {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.el.className = "inactive";
      this.update();
      this.draw();
    };

    let move = (e) => {
      if (!this.active) {
        return;
      }
      this.capture(e.offsetX, e.offsetY);
      this.update();
      this.draw();
    };

    this.el.addEventListener("mousedown", press);
    this.el.addEventListener("touchstart", press);

    this.el.addEventListener("mousemove", move);
    this.el.addEventListener("touchmove", move);

    this.el.addEventListener("mouseup", release);
    this.el.addEventListener("mouseleave", release);
    this.el.addEventListener("touchend", release);
    this.el.addEventListener("touchcancel", release);
    this.el.addEventListener("touchleave", release);
  }

  update() {
    const h = this.el.height / this.size;
    const i = Math.floor(this.pos[1] / h);
    this.highlighted = i;
    this.vector[i] = this.pos[0];
    main(this.vector);
  }

  /**
   * DRAW
   *
   */
  draw() {

    const w = this.el.width;
    const h = this.el.height;
    const context = this.context;

    const [x, y] = this.pos;

    this.el.width = w;
    this.el.height = h;


    const Y_SEG_WIDTH = h / this.size;


    if (this.active) {
      const corner_x = 0;
      context.beginPath()
      context.rect(
        0,
        (this.highlighted-1) * Y_SEG_WIDTH,
        this.highlighted * this.el.width,
        Y_SEG_WIDTH,
      );
      context.fillStyle = 'rgba(0, 0, 0, 0.1)';
      context.fill();
    }


    /**
    if (this.active) {
      context.beginPath();
      context.arc(x, y, 30, 0, 2 * Math.PI, false);
      context.fillStyle = 'green';
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = '#003300';
      context.stroke();
    }
    */


    const WIDTH = this.el.width;
    const HEIGHT = this.el.height;

    let f = (x) => {
      return (x / WIDTH) * 2.0 - 1.0;
    };

    let g = (y) => {
      return (y + 1.0) / 2.0 * WIDTH;
    };

    for (let i=200; i < 300; i++) {
      if (f(g(i)) != i) {
        console.error("ERROR", f(i), f(g(i)), i);
      }
    }

    context.beginPath();
    let a = g(this.vector[0]);
    let b = 0.5 * Y_SEG_WIDTH;
    context.moveTo(a, b);

    for (let i=1; i < this.vector.length; i++) {
      let x = this.vector[i];
      let y = (i+0.5) * Y_SEG_WIDTH;
      let u = g(x);
      context.lineTo(u, y);
    }

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();

    this.vector.forEach((val, i) => {

      let u = g(val);
      let v = (i+0.5) * Y_SEG_WIDTH;
      context.beginPath();
      context.arc(u, v, 2, 0, 2 * Math.PI, false);
      context.fillStyle = 'blue';
      context.fill();
    });
  }
}

async function main(v) {
  return;

    /***
     * Normalize a tensor image with mean and standard deviation. This transform does not support PIL Image. Given mean: (mean[1],...,mean[n]) and std: (std[1],..,std[n]) for n channels, this transform will normalize each channel of the input torch.*Tensor i.e., output[channel] = (input[channel] - mean[channel]) / std[channel]
   */
  const normalizations = {
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225],
  };

  const session = await ort.InferenceSession.create(
    net,
    { backendHint: 'webgl', executionProviders: ['webgl'], graphOptimizationLevel: 'all' },
  );

  const b = 1;
  const n = 100;

  const t = new ort.Tensor("float32", v, [b, n, 1, 1]);

  let r = undefined;
  r = await session.run({ "vector": t });

  const url = r["output"].toDataURL();
  // const url = r["39"].toDataURL();

  let el = document.getElementById("image-container");
  let img = new Image();
  img.src = url;
  el.innerHTML = "";
  el.appendChild(img);
}


// ...
async function generateImageFromOnnxWeb(vec, id) {
  let el = document.getElementById(id);
}

// ...
async function generateImageFromApi(vec, id) {

  let el = document.getElementById(id);
  el.innerHTML = "";

  let img = new Image();

  let data = {
    "vec": vec,
    "train": document.getElementById("use-training").checked,
  };

  let req = {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  };

  let url2 = "/api/v1/image";
  let payload = await fetch(url2, req)
  let blob = await payload.blob();
  let blobUrl = URL.createObjectURL(blob);

  let img3 = new Image();
  img3.src = blobUrl;
  img3.onload = () => {
    el.innerHTML = "";
    el.appendChild(img3);
  };
}
