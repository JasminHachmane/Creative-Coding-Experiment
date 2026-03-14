let blobPoints = 90;
let baseRadius = 160;
let time = 0;

let prevMouseX = 0;
let prevMouseY = 0;
let mouseSpeed = 0;
let smoothSpeed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function draw() {
  background(8, 10, 18, 70);

  let centerX = width / 2;
  let centerY = height / 2;

  // mouse speed meten
  mouseSpeed = dist(mouseX, mouseY, prevMouseX, prevMouseY);
  smoothSpeed = lerp(smoothSpeed, mouseSpeed, 0.12);

  prevMouseX = mouseX;
  prevMouseY = mouseY;

  // mood bepalen
  let energy = map(smoothSpeed, 0, 40, 0, 1);
  energy = constrain(energy, 0, 1);

  // afstand tot blob
  let mouseDistance = dist(mouseX, mouseY, centerX, centerY);
  let proximity = map(mouseDistance, width / 2, 0, 0, 1);
  proximity = constrain(proximity, 0, 1);

  // glow
  let glowSize = baseRadius * 2.2 + sin(time * 2) * 10;

  fill(80 + energy * 100, 100, 255, 20);
  ellipse(centerX, centerY, glowSize + 140);

  fill(0, 180 + energy * 50, 255, 30);
  ellipse(centerX, centerY, glowSize + 60);

  // kleur blob verandert met energy
  let r = map(energy, 0, 1, 80, 255);
  let g = map(energy, 0, 1, 180, 90);
  let b = 255;

  fill(r, g, b, 230);

  beginShape();

  for (let i = 0; i < blobPoints; i++) {
    let angle = map(i, 0, blobPoints, 0, TWO_PI);

    // rustige blob = minder vervorming
    // drukke blob = meer vervorming
    let distortionAmount = map(energy, 0, 1, 18, 55);

    let noiseX = cos(angle) * 0.8 + 1;
    let noiseY = sin(angle) * 0.8 + 1;

    let wave = map(
      noise(noiseX + i * 0.05, noiseY + time * (0.7 + energy * 1.8)),
      0,
      1,
      -distortionAmount,
      distortionAmount
    );

    // blob trekt naar cursor als je dichtbij komt
    let edgeX = centerX + cos(angle) * baseRadius;
    let edgeY = centerY + sin(angle) * baseRadius;

    let angleToMouse = atan2(mouseY - centerY, mouseX - centerX);
    let angleDifference = abs(atan2(sin(angle - angleToMouse), cos(angle - angleToMouse)));

    let pull = map(angleDifference, 0, PI, 35 * proximity, 0);
    pull = constrain(pull, 0, 35 * proximity);

    let radius = baseRadius + wave + pull;

    // heel klein ademend effect
    radius += sin(time * 2 + i * 0.15) * (4 + energy * 5);

    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;

    curveVertex(x, y);
  }

  // eerste punten herhalen voor smooth closing
  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, blobPoints, 0, TWO_PI);

    let distortionAmount = map(energy, 0, 1, 18, 55);

    let noiseX = cos(angle) * 0.8 + 1;
    let noiseY = sin(angle) * 0.8 + 1;

    let wave = map(
      noise(noiseX + i * 0.05, noiseY + time * (0.7 + energy * 1.8)),
      0,
      1,
      -distortionAmount,
      distortionAmount
    );

    let angleToMouse = atan2(mouseY - centerY, mouseX - centerX);
    let angleDifference = abs(atan2(sin(angle - angleToMouse), cos(angle - angleToMouse)));

    let pull = map(angleDifference, 0, PI, 35 * proximity, 0);
    pull = constrain(pull, 0, 35 * proximity);

    let radius = baseRadius + wave + pull;
    radius += sin(time * 2 + i * 0.15) * (4 + energy * 5);

    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;

    curveVertex(x, y);
  }

  endShape();

  // tekst
  fill(255, 190);
  textAlign(CENTER);
  textSize(16);

  let moodText = "calm";
  if (energy > 0.3) moodText = "curious";
  if (energy > 0.6) moodText = "excited";
  if (energy > 0.85) moodText = "overstimulated";

  text("mood: " + moodText, width / 2, height - 70);
  text("move slowly or quickly to change the blob's behaviour", width / 2, height - 45);

  time += 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}