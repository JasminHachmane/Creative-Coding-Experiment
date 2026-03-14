let shapes = [];
let totalShapes = 85;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  for (let i = 0; i < totalShapes; i++) {
    shapes.push(new SoftShape());
  }
}

function draw() {
  background(7, 8, 16);

  for (let s of shapes) {
    s.update();
  }

  drawConnections();

  for (let s of shapes) {
    s.display();
  }

  drawCursorAura();
}

class SoftShape {
  constructor() {
    this.baseX = random(width);
    this.baseY = random(height);

    this.x = this.baseX;
    this.y = this.baseY;

    this.size = random(10, 42);
    this.depth = random(0.6, 1.4);
    this.offset = random(1000);

    this.type = floor(random(3)); // 0 round, 1 stretched, 2 capsule
    this.rotation = random(TWO_PI);
  }

  update() {
    let d = dist(mouseX, mouseY, this.x, this.y);

    if (d < 170) {
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      let force = map(d, 0, 170, 7, 0);
      force *= 1.2 / this.depth;

      this.x += cos(angle) * force;
      this.y += sin(angle) * force;
    } else {
      this.x = lerp(this.x, this.baseX, 0.025);
      this.y = lerp(this.y, this.baseY, 0.025);
    }

    let driftX = map(noise(this.offset, frameCount * 0.008), 0, 1, -0.4, 0.4);
    let driftY = map(noise(this.offset + 100, frameCount * 0.008), 0, 1, -0.4, 0.4);

    this.x += driftX * this.depth;
    this.y += driftY * this.depth;

    this.rotation += 0.002 * this.depth;
  }

  display() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    let hover = map(d, 0, 220, 1, 0);
    hover = constrain(hover, 0, 1);

    let glow = map(d, 0, 220, 55, 12);
    glow = constrain(glow, 12, 55);

    fill(90, 120, 255, 16);
    ellipse(this.x, this.y, this.size + glow, this.size + glow);

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    if (this.type === 0) {
      drawOrganicBlob(this.size, hover, 0);
    } else if (this.type === 1) {
      drawOrganicBlob(this.size * 1.35, hover, 1);
    } else {
      drawOrganicBlob(this.size * 1.6, hover, 2);
    }

    pop();
  }
}

function drawOrganicBlob(base, hover, mode) {
  let points = 24;

  let r = map(hover, 0, 1, 170, 255);
  let g = map(hover, 0, 1, 190, 120);
  let b = 255;

  fill(r, g, b, 210);

  beginShape();

  for (let i = 0; i < points; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);

    let stretchX = 1;
    let stretchY = 1;

    if (mode === 1) {
      stretchX = 1.4;
      stretchY = 0.75;
    }

    if (mode === 2) {
      stretchX = 1.75;
      stretchY = 0.58;
    }

    let n = noise(cos(angle) * 0.8 + frameCount * 0.01, sin(angle) * 0.8);
    let wave = map(n, 0, 1, -2.5, 2.5);

    let x = cos(angle) * (base + wave) * stretchX;
    let y = sin(angle) * (base + wave) * stretchY;

    curveVertex(x, y);
  }

  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);

    let stretchX = 1;
    let stretchY = 1;

    if (mode === 1) {
      stretchX = 1.4;
      stretchY = 0.75;
    }

    if (mode === 2) {
      stretchX = 1.75;
      stretchY = 0.58;
    }

    let n = noise(cos(angle) * 0.8 + frameCount * 0.01, sin(angle) * 0.8);
    let wave = map(n, 0, 1, -2.5, 2.5);

    let x = cos(angle) * (base + wave) * stretchX;
    let y = sin(angle) * (base + wave) * stretchY;

    curveVertex(x, y);
  }

  endShape();
}

function drawConnections() {
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      let a = shapes[i];
      let b = shapes[j];
      let d = dist(a.x, a.y, b.x, b.y);

      if (d < 135) {
        let alpha = map(d, 0, 135, 150, 0);
        let weight = map(d, 0, 135, 1.8, 0.4);

        stroke(130, 170, 255, alpha);
        strokeWeight(weight);
        line(a.x, a.y, b.x, b.y);

        // small midpoint accent
        let mx = (a.x + b.x) / 2;
        let my = (a.y + b.y) / 2;
        noStroke();
        fill(180, 210, 255, alpha * 0.5);
        ellipse(mx, my, 2.5, 2.5);
      }
    }
  }
  noStroke();
}

function drawCursorAura() {
  fill(120, 180, 255, 18);
  ellipse(mouseX, mouseY, 120, 120);

  fill(160, 210, 255, 28);
  ellipse(mouseX, mouseY, 36, 36);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}