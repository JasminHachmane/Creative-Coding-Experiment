let video;
let handpose;
let predictions = [];

let shapes = [];
let trail = [];

let totalShapes = 95;
let clusterPoints = [];

let targetX, targetY;
let smoothX, smoothY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  setupClusters();
  createShapes();

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("handpose ready");
  });

  handpose.on("predict", results => {
    predictions = results;
  });

  targetX = width / 2;
  targetY = height / 2;
  smoothX = width / 2;
  smoothY = height / 2;
}

function setupClusters() {
  clusterPoints = [
    createVector(width * 0.22, height * 0.28),
    createVector(width * 0.72, height * 0.30),
    createVector(width * 0.35, height * 0.68),
    createVector(width * 0.78, height * 0.72)
  ];
}

function createShapes() {
  shapes = [];

  for (let i = 0; i < totalShapes; i++) {
    let cluster = random(clusterPoints);
    let angle = random(TWO_PI);
    let radius = random(20, 170);

    let x = cluster.x + cos(angle) * radius;
    let y = cluster.y + sin(angle) * radius;

    shapes.push(new SoftShape(x, y));
  }
}

function draw() {
  background(6, 7, 15);

  updateFinger();
  updateTrail();

  drawAmbientBackground();
  drawTrail();
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

function updateTrail() {
  trail.push(createVector(smoothX, smoothY));

  if (trail.length > 22) {
    trail.shift();
  }
}

function drawTrail() {
  for (let i = 0; i < trail.length; i++) {
    let p = trail[i];
    let alpha = map(i, 0, trail.length - 1, 8, 55);
    let size = map(i, 0, trail.length - 1, 10, 70);

    fill(120, 180, 255, alpha);
    ellipse(p.x, p.y, size, size);
  }
}

function drawAmbientBackground() {
  fill(30, 60, 130, 20);
  ellipse(width * 0.2, height * 0.3, 460, 460);

  fill(80, 100, 220, 12);
  ellipse(width * 0.72, height * 0.28, 520, 520);

  fill(40, 90, 180, 14);
  ellipse(width * 0.42, height * 0.75, 620, 620);

  fill(80, 120, 255, 10);
  ellipse(smoothX, smoothY, 260, 260);
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
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;

    this.size = random(8, 40);
    this.depth = random(0.7, 1.45);
    this.offset = random(1000);
    this.rotation = random(TWO_PI);
    this.type = floor(random(3));
  }

  update(cx, cy) {
    let d = dist(cx, cy, this.x, this.y);

    if (d < 190) {
      let angle = atan2(this.y - cy, this.x - cx);
      let force = map(d, 0, 190, 10, 0);
      force *= 1.15 / this.depth;

      this.x += cos(angle) * force;
      this.y += sin(angle) * force;
    } else {
      this.x = lerp(this.x, this.baseX, 0.03);
      this.y = lerp(this.y, this.baseY, 0.03);
    }

    let driftX = map(noise(this.offset, frameCount * 0.008), 0, 1, -0.35, 0.35);
    let driftY = map(noise(this.offset + 200, frameCount * 0.008), 0, 1, -0.35, 0.35);

    this.x += driftX * this.depth;
    this.y += driftY * this.depth;

    this.rotation += 0.0015 * this.depth;
  }

  display(cx, cy) {
    let d = dist(cx, cy, this.x, this.y);
    let react = map(d, 0, 220, 1, 0);
    react = constrain(react, 0, 1);

    let glow = map(d, 0, 220, 75, 12);
    glow = constrain(glow, 12, 75);

    fill(90, 130, 255, 10);
    ellipse(this.x, this.y, this.size + glow, this.size + glow);

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    if (this.type === 0) {
      drawOrganicShape(this.size, react, 1, 1);
    } else if (this.type === 1) {
      drawOrganicShape(this.size * 1.25, react, 1.45, 0.78);
    } else {
      drawOrganicShape(this.size * 1.45, react, 1.8, 0.56);
    }

    pop();
  }
}

function drawOrganicShape(base, react, stretchX, stretchY) {
  let points = 24;

  let r = map(react, 0, 1, 160, 255);
  let g = map(react, 0, 1, 185, 120);
  let b = 255;

  fill(r, g, b, 220);

  beginShape();

  for (let i = 0; i < points; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);

    let n = noise(
      cos(angle) * 0.9 + frameCount * 0.012,
      sin(angle) * 0.9 + base * 0.02
    );

    let wave = map(n, 0, 1, -3.2, 3.2);

    let x = cos(angle) * (base + wave) * stretchX;
    let y = sin(angle) * (base + wave) * stretchY;

    curveVertex(x, y);
  }

  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, points, 0, TWO_PI);

    let n = noise(
      cos(angle) * 0.9 + frameCount * 0.012,
      sin(angle) * 0.9 + base * 0.02
    );

    let wave = map(n, 0, 1, -3.2, 3.2);

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

      if (d < 125) {
        let pulse = sin(frameCount * 0.04 + i * 0.2 + j * 0.15) * 0.5 + 0.5;
        let alpha = map(d, 0, 125, 170, 0) * (0.65 + pulse * 0.5);
        let weight = map(d, 0, 125, 2.2, 0.5) + pulse * 0.6;

        stroke(140, 195, 255, alpha);
        strokeWeight(weight);
        line(a.x, a.y, b.x, b.y);

        let mx = (a.x + b.x) / 2;
        let my = (a.y + b.y) / 2;

        noStroke();
        fill(210, 230, 255, alpha * 0.28);
        ellipse(mx, my, 3 + pulse * 2, 3 + pulse * 2);
      }
    }
  }
  noStroke();
}

function drawCursorAura() {
  fill(120, 180, 255, 18);
  ellipse(smoothX, smoothY, 190, 190);

  fill(160, 220, 255, 40);
  ellipse(smoothX, smoothY, 48, 48);

  fill(255, 255, 255, 160);
  ellipse(smoothX, smoothY, 10, 10);
}

function drawText() {
  fill(255, 195);
  textAlign(CENTER);
  textSize(16);

  if (predictions.length === 0) {
    text("show your hand to the webcam", width / 2, height - 58);
  } else {
    text("move through the living field with your index finger", width / 2, height - 58);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupClusters();
  createShapes();
}