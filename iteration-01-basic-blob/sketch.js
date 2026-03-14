let points = 40;
let radius = 150;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(15, 15, 25);

  translate(width/2, height/2);

  fill(0, 200, 255);
  noStroke();

  beginShape();

  for(let i = 0; i < points; i++){

    let angle = map(i,0,points,0,TWO_PI);

    let offset = sin(frameCount * 0.03 + i) * 20;

    let r = radius + offset;

    let x = cos(angle) * r;
    let y = sin(angle) * r;

    vertex(x,y);

  }

  endShape(CLOSE);

}