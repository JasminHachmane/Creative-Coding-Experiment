let video;
let handpose;
let predictions = [];

let shapes = [];
let totalShapes = 95;

let targetX, targetY;
let smoothX, smoothY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("handpose ready");
  });

  handpose.on("predict", results => {
    predictions = results;
  });

  for (let i = 0; i < totalShapes; i++) {
    shapes.push(new SoftShape());
  }

  targetX = width / 2;
  targetY = height / 2;
  smoothX = width / 2;
  smoothY = height / 2;
}

function draw() {
  background(7, 8, 16, 255);

  updateFinger();
  drawBackgroundGlow();
  updateShapes();
  drawConnections();
  drawShapes();
  drawCursorAura();
  drawText();
}

function updateFinger() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let indexTip = hand.landmarks[8];

    targetX = map(indexTip[0], 0, video.width, width, 0);
    targetY = map(indexTip[1], 0, video.height, 0, height);
  }

  smoothX = lerp(smoothX, targetX, 0.18);
  smoothY = lerp(smoothY, targetY, 0.18);
}

function drawBackgroundGlow() {
  fill(30, 50, 120, 20);
  ellipse(width * 0.3, height * 0.35, 500);

  fill(50, 80, 180, 16);
  ellipse(width * 0.7, height * 0.6, 700);

  fill(80, 120, 255, 12);
  ellipse(smoothX, smoothY, 280);
}

function updateShapes() {
  for (let s of shapes) {
    s.update(smoothX, smoothY);
  }
}

function drawShapes() {
  for (let s of shapes) {
    s.display(smoothX, smoothY);
  }
}

class SoftShape {
  constructor() {
    this.baseX = random(width);
    this.baseY = random(height);
    this.x = this.baseX;
    this.y = this.baseY;

    this.size = random(8, 36);
    this.depth = random(0.7, 1.4);
    this.offset = random(1000);
    this.rotation = random(TWO_PI);
    this.type = floor(random(3));
  }

  update(cx, cy) {
    let d = dist(cx, cy, this.x, this.y);

    if (d < 180) {
      let angle = atan2(this.y - cy, this.x - cx);
      let force = map(d, 0, 180, 9, 0);
      force *= 1.2 / this.depth;

      this.x += cos(angle) * force;
      this.y += sin(angle) * force;
    } else {
      this.x = lerp(this.x, this.baseX, 0.025);
      this.y = lerp(this.y, this.baseY, 0.025);
    }

    let driftX = map(noise(this.offset, frameCount * 0.008), 0, 1, -0.35, 0.35);
    let driftY = map(noise(this.offset + 100, frameCount * 0.008), 0, 1, -0.35, 0.35);

    this.x += driftX * this.depth;
    this.y += driftY * this.depth;

    this.rotation += 0.0015 * this.depth;
  }

  display(cx, cy) {
    let d = dist(cx, cy, this.x, this.y);
    let react = map(d, 0, 220, 1, 0);
    react = constrain(react, 0, 1);

    let glow = map(d, 0, 220, 70, 10);
    glow = constrain(glow, 10, 70);

    fill(80, 120, 255, 12);
    ellipse(this.x, this.y, this.size + glow, this.size + glow);

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    if (this.type === 0) {
      drawOrganicShape(this.size, react, 1, 1);
    } else if (this.type === 1) {
      drawOrganicShape(this.size * 1.25, react, 1.4, 0.78);
    } else {
      drawOrganicShape(this.size * 1.45, react, 1.75, 0.58);
    }

    pop();
  }
}

function drawOrganicShape(base, react, stretchX, stretchY) {
  let points = 22;

  let r = map(react, 0, 1, 155, 255);
  let g = map(react, 0, 1, 185, 120);
  let b = 255;

  fill(r, g, b, 215);

  beginShape();

  for (let i = 0; i < points; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);
    let n = noise(
      cos(angle) * 0.9 + frameCount * 0.01,
      sin(angle) * 0.9 + base * 0.03
    );
    let wave = map(n, 0, 1, -3, 3);

    let x = cos(angle) * (base + wave) * stretchX;
    let y = sin(angle) * (base + wave) * stretchY;

    curveVertex(x, y);
  }

  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);
    let n = noise(
      cos(angle) * 0.9 + frameCount * 0.01,
      sin(angle) * 0.9 + base * 0.03
    );
    let wave = map(n, 0, 1, -3, 3);

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

      if (d < 130) {
        let alpha = map(d, 0, 130, 180, 0);
        let weight = map(d, 0, 130, 2.1, 0.4);

        stroke(140, 190, 255, alpha);
        strokeWeight(weight);
        line(a.x, a.y, b.x, b.y);

        let mx = (a.x + b.x) / 2;
        let my = (a.y + b.y) / 2;
        noStroke();
        fill(200, 225, 255, alpha * 0.35);
        ellipse(mx, my, 2.5);
      }
    }
  }
  noStroke();
}

function drawCursorAura() {
  fill(120, 180, 255, 18);
  ellipse(smoothX, smoothY, 180);

  fill(160, 220, 255, 35);
  ellipse(smoothX, smoothY, 42);

  fill(255, 255, 255, 140);
  ellipse(smoothX, smoothY, 8);
}

function drawText() {
  fill(255, 190);
  textAlign(CENTER);
  textSize(16);

  if (predictions.length === 0) {
    text("show your hand to the webcam", width / 2, height - 55);
  } else {
    text("move through the field with your index finger", width / 2, height - 55);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}