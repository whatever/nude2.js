export class WaveController {

  constructor(el) {
    this.el = el;
    this.setupListeners();
    this.active = false;
    this.el.className = "inactive";
    this.context = this.el.getContext("2d");

    this.highlighted = -1;

    this.vector = new Array(100).fill(0.0);
    this.pos = [0.0, 0.0];
    this.draw();

    console.log(this.vector);
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

      console.log("<<< press");
      this.active = true;
      this.el.className = "active";
    };

    // Release control
    let release = (e) => {

      if (!this.active) {
        return;
      }

      this.active = false;
      this.el.className = "inactive";
      console.log(">>> release");
      this.draw();
    };

    let move = (e) => {

      if (!this.active) {
        return;
      }

      let x = e.offsetX;
      let y = e.offsetY;
      this.pos = [x, y];

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
    const h = this.el.height / 100;
    const i = Math.floor(this.pos[1] / h);
    this.highlighted = i;
    this.vector[i] = this.pos[0];
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


    const Y_SEG_WIDTH = h / 100;


    if (this.active) {
      console.log("????")

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


    this.vector.forEach((val, i) => {

      let u = val;
      let v = (i+0.5) * Y_SEG_WIDTH;

      context.beginPath();
      context.arc(u, v, 2, 0, 2 * Math.PI, false);
      context.fillStyle = 'blue';
      context.fill();








    });

  }
}

/*


a * x + c * y + e = 0
b * x + d * y + f = 0


h / 100 +  h / 200

f(0, 0) = [w/2, h/200]
f(0, 1) = [w/2, 3*h/200]

a*0 + c*0 + e = [w/2, h/200]
b*0 + 




 */
