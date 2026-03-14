let blobs = [];
let totalBlobs = 100;

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
  }

  drawConnections();

  for (let blob of blobs) {
    blob.display();
  }

  drawCursorField();
}

class Blob {

  constructor() {

    this.baseX = random(width);
    this.baseY = random(height);

    this.x = this.baseX;
    this.y = this.baseY;

    this.size = random(4, 28);
    this.offset = random(1000);

  }

  update() {

    let d = dist(mouseX, mouseY, this.x, this.y);

    if (d < 140) {

      let angle = atan2(this.y - mouseY, this.x - mouseX);
      let force = map(d, 0, 140, 5, 0);

      this.x += cos(angle) * force;
      this.y += sin(angle) * force;

    } else {

      this.x = lerp(this.x, this.baseX, 0.03);
      this.y = lerp(this.y, this.baseY, 0.03);

    }

    let n = noise(this.offset, frameCount * 0.01);

    this.x += map(n, 0, 1, -0.4, 0.4);
    this.y += map(n, 0, 1, -0.4, 0.4);

  }

  display() {

    let d = dist(mouseX, mouseY, this.x, this.y);

    let glow = map(d, 0, 200, 60, 10);
    glow = constrain(glow, 10, 60);

    fill(80, 120, 255, 20);
    ellipse(this.x, this.y, this.size + glow);

    fill(140, 190, 255, 200);
    ellipse(this.x, this.y, this.size);

  }

}

function drawConnections() {

  for (let i = 0; i < blobs.length; i++) {

    for (let j = i + 1; j < blobs.length; j++) {

      let d = dist(blobs[i].x, blobs[i].y, blobs[j].x, blobs[j].y);

      if (d < 120) {

        let alpha = map(d, 0, 120, 90, 0);

        stroke(120, 160, 255, alpha);
        strokeWeight(1);

        line(
          blobs[i].x,
          blobs[i].y,
          blobs[j].x,
          blobs[j].y
        );

        noStroke();

      }

    }

  }

}

function drawCursorField() {

  fill(120, 160, 255, 25);
  ellipse(mouseX, mouseY, 120);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}