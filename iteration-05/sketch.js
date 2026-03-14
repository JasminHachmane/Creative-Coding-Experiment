let blobs = [];
let totalBlobs = 120;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  for (let i = 0; i < totalBlobs; i++) {
    blobs.push(new Blob());
  }
}

function draw() {
  background(8, 10, 18);

  for (let blob of blobs) {
    blob.update();
    blob.display();
  }
}

class Blob {

  constructor() {
    this.x = random(width);
    this.y = random(height);

    this.baseX = this.x;
    this.baseY = this.y;

    this.size = random(6, 35);

    this.offset = random(1000);
  }

  update() {

    let d = dist(mouseX, mouseY, this.x, this.y);

    if (d < 140) {

      let angle = atan2(this.y - mouseY, this.x - mouseX);

      let force = map(d, 0, 140, 6, 0);

      this.x += cos(angle) * force;
      this.y += sin(angle) * force;

    } else {

      this.x = lerp(this.x, this.baseX, 0.02);
      this.y = lerp(this.y, this.baseY, 0.02);

    }

    let n = noise(this.offset, frameCount * 0.01);

    this.x += map(n, 0, 1, -0.3, 0.3);
    this.y += map(n, 0, 1, -0.3, 0.3);

  }

  display() {

    let d = dist(mouseX, mouseY, this.x, this.y);

    let glow = map(d, 0, 200, 80, 20);
    glow = constrain(glow, 20, 80);

    fill(80, 120, 255, 20);
    ellipse(this.x, this.y, this.size + glow);

    fill(120, 180, 255, 180);
    ellipse(this.x, this.y, this.size);

  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}