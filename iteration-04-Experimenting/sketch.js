let blobs = [];
let numBlobs = 7;

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < numBlobs; i++) {
    blobs.push(new Blob(
      random(width * 0.2, width * 0.8),
      random(height * 0.2, height * 0.8),
      random(45, 75)
    ));
  }

  noStroke();
}

function draw() {
  background(10, 12, 24, 45);

  for (let blob of blobs) {
    blob.update(blobs);
    blob.display();
  }

  fill(255, 180);
  textAlign(CENTER);
  textSize(16);
  text("move your mouse through the blobs", width / 2, height - 40);
}

class Blob {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.baseR = r;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.offset = random(1000);
  }

  update(blobs) {
    let mouseDX = mouseX - this.x;
    let mouseDY = mouseY - this.y;
    let mouseDist = dist(this.x, this.y, mouseX, mouseY);

    if (mouseDist < 220) {
      let force = map(mouseDist, 0, 220, 0.03, 0);
      this.vx += mouseDX * force * 0.01;
      this.vy += mouseDY * force * 0.01;
    }

    for (let other of blobs) {
      if (other !== this) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let d = sqrt(dx * dx + dy * dy);

        if (d < this.baseR + other.baseR + 30) {
          let repel = map(d, 0, this.baseR + other.baseR + 30, 0.06, 0);
          this.vx += dx * repel * 0.01;
          this.vy += dy * repel * 0.01;
        }
      }
    }

    let centerPullX = width / 2 - this.x;
    let centerPullY = height / 2 - this.y;
    this.vx += centerPullX * 0.00008;
    this.vy += centerPullY * 0.00008;

    this.vx *= 0.97;
    this.vy *= 0.97;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 100 || this.x > width - 100) {
      this.vx *= -0.9;
    }

    if (this.y < 100 || this.y > height - 100) {
      this.vy *= -0.9;
    }
  }

  display() {
    let t = frameCount * 0.01;
    let points = 40;

    let mouseDist = dist(this.x, this.y, mouseX, mouseY);
    let glow = map(mouseDist, 0, 250, 90, 25);
    glow = constrain(glow, 25, 90);

    fill(80, 120, 255, 18);
    ellipse(this.x, this.y, this.baseR * 2 + glow);

    let colorShift = map(mouseDist, 0, 300, 255, 120);
    colorShift = constrain(colorShift, 120, 255);

    fill(colorShift, 160, 255, 180);

    beginShape();

    for (let i = 0; i < points; i++) {
      let angle = map(i, 0, points, 0, TWO_PI);

      let noiseValue = noise(
        this.offset + cos(angle) * 0.8,
        this.offset + sin(angle) * 0.8,
        t
      );

      let wave = map(noiseValue, 0, 1, -10, 10);
      let r = this.baseR + wave;

      let x = this.x + cos(angle) * r;
      let y = this.y + sin(angle) * r;

      curveVertex(x, y);
    }

    for (let i = 0; i < 3; i++) {
      let angle = map(i, 0, points, 0, TWO_PI);

      let noiseValue = noise(
        this.offset + cos(angle) * 0.8,
        this.offset + sin(angle) * 0.8,
        t
      );

      let wave = map(noiseValue, 0, 1, -10, 10);
      let r = this.baseR + wave;

      let x = this.x + cos(angle) * r;
      let y = this.y + sin(angle) * r;

      curveVertex(x, y);
    }

    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}