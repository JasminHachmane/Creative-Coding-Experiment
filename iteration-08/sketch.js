let video;
let handpose;
let predictions = [];

let blobs = [];
let totalBlobs = 80;

function setup() {

createCanvas(windowWidth,windowHeight);
noStroke();

video = createCapture(VIDEO);
video.size(640,480);

handpose = ml5.handpose(video, modelLoaded);

handpose.on("predict", results => {
predictions = results;
});

video.hide();

for(let i=0;i<totalBlobs;i++){
blobs.push(new Blob());
}

}

function modelLoaded(){
console.log("handpose ready");
}

function draw(){

background(10,12,20);

let fingerX = mouseX;
let fingerY = mouseY;

if(predictions.length > 0){

let hand = predictions[0];

let indexFinger = hand.landmarks[8];

fingerX = map(indexFinger[0],0,video.width,width,0);
fingerY = map(indexFinger[1],0,video.height,0,height);

}

for(let b of blobs){
b.update(fingerX,fingerY);
b.display();
}

drawConnections();

drawCursor(fingerX,fingerY);

}

class Blob{

constructor(){

this.baseX = random(width);
this.baseY = random(height);

this.x = this.baseX;
this.y = this.baseY;

this.size = random(8,28);

}

update(cx,cy){

let d = dist(cx,cy,this.x,this.y);

if(d < 160){

let angle = atan2(this.y - cy, this.x - cx);

let force = map(d,0,160,7,0);

this.x += cos(angle) * force;
this.y += sin(angle) * force;

}
else{

this.x = lerp(this.x,this.baseX,0.03);
this.y = lerp(this.y,this.baseY,0.03);

}

}

display(){

fill(120,160,255,180);
ellipse(this.x,this.y,this.size);

}

}

function drawConnections(){

for(let i=0;i<blobs.length;i++){

for(let j=i+1;j<blobs.length;j++){

let a = blobs[i];
let b = blobs[j];

let d = dist(a.x,a.y,b.x,b.y);

if(d < 120){

let alpha = map(d,0,120,120,0);

stroke(150,200,255,alpha);
strokeWeight(1.2);

line(a.x,a.y,b.x,b.y);

noStroke();

}

}

}

}

function drawCursor(x,y){

fill(180,220,255,40);
ellipse(x,y,120);

fill(200,240,255);
ellipse(x,y,20);

}

function windowResized(){
resizeCanvas(windowWidth,windowHeight);
}