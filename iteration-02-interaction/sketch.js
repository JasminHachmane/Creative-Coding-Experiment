let blobPoints = 80;
let baseRadius = 160;
let time = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(8, 10, 20, 255);

  let centerX = width / 2;
  let centerY = height / 2;

  let mouseDistance = dist(mouseX, mouseY, centerX, centerY);
  let pullStrength = map(mouseDistance, 0, width / 2, 55, 0);
  pullStrength = constrain(pullStrength, 0, 55);

  let glowSize = baseRadius * 2.3 + sin(time * 2) * 20;

  fill(70, 120, 255, 25);
  ellipse(centerX, centerY, glowSize + 120);

  fill(0, 200, 255, 35);
  ellipse(centerX, centerY, glowSize);

  let colorR = map(mouseX, 0, width, 80, 255);
  let colorG = map(mouseY, 0, height, 120, 220);
  let colorB = 255;

  fill(colorR, colorG, colorB, 220);

  beginShape();

  for (let i = 0; i < blobPoints; i++) {
    let angle = map(i, 0, blobPoints, 0, TWO_PI);

    let noiseOffset = i * 0.12;
    let wave = map(noise(noiseOffset, time), 0, 1, -35, 35);

    let edgeX = centerX + cos(angle) * baseRadius;
    let edgeY = centerY + sin(angle) * baseRadius;

    let mouseEdgeDistance = dist(mouseX, mouseY, edgeX, edgeY);
    let mouseInfluence = map(mouseEdgeDistance, 0, 250, pullStrength, 0);
    mouseInfluence = constrain(mouseInfluence, 0, pullStrength);

    let radius = baseRadius + wave + mouseInfluence;

    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;

    curveVertex(x, y);
  }

  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, blobPoints, 0, TWO_PI);

    let noiseOffset = i * 0.12;
    let wave = map(noise(noiseOffset, time), 0, 1, -35, 35);

    let edgeX = centerX + cos(angle) * baseRadius;
    let edgeY = centerY + sin(angle) * baseRadius;

    let mouseEdgeDistance = dist(mouseX, mouseY, edgeX, edgeY);
    let mouseInfluence = map(mouseEdgeDistance, 0, 250, pullStrength, 0);
    mouseInfluence = constrain(mouseInfluence, 0, pullStrength);

    let radius = baseRadius + wave + mouseInfluence;

    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;

    curveVertex(x, y);
  }

  endShape();

  fill(255, 190);
  textAlign(CENTER);
  textSize(16);
  text("move your mouse around the blob", width / 2, height - 50);

  time += 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}