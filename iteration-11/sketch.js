let video;
let handpose;
let predictions = [];

let shapes = [];
let clusters = [];

let trail = [];

let totalShapes = 120;

let targetX, targetY;
let smoothX, smoothY;

function setup(){

createCanvas(windowWidth,windowHeight);
noStroke();

setupClusters();
createShapes();

video = createCapture(VIDEO);
video.size(640,480);
video.hide();

handpose = ml5.handpose(video, ()=>console.log("handpose ready"));

handpose.on("predict",results=>{
predictions = results;
});

targetX = width/2;
targetY = height/2;
smoothX = width/2;
smoothY = height/2;

}

function setupClusters(){

clusters = [

{pos:createVector(width*0.22,height*0.32),color:[120,170,255]},
{pos:createVector(width*0.74,height*0.30),color:[255,140,190]},
{pos:createVector(width*0.36,height*0.72),color:[140,255,200]},
{pos:createVector(width*0.82,height*0.75),color:[255,210,120]}

];

}

function createShapes(){

shapes=[];

for(let i=0;i<totalShapes;i++){

let cluster = random(clusters);

let angle = random(TWO_PI);
let radius = random(20,180);

let x = cluster.pos.x + cos(angle)*radius;
let y = cluster.pos.y + sin(angle)*radius;

shapes.push(new BlobShape(x,y,cluster.color));

}

}

function draw(){

background(6,7,15);

updateHand();
updateTrail();

drawBackground();
drawTrail();

updateShapes();
drawConnections();
drawShapes();

drawCursor();
drawTitle();

}

function updateHand(){

if(predictions.length>0){

let hand = predictions[0];
let tip = hand.landmarks[8];

targetX = map(tip[0],0,video.width,width,0);
targetY = map(tip[1],0,video.height,0,height);

}

smoothX = lerp(smoothX,targetX,0.18);
smoothY = lerp(smoothY,targetY,0.18);

}

function updateTrail(){

trail.push(createVector(smoothX,smoothY));

if(trail.length>25) trail.shift();

}

function drawTrail(){

for(let i=0;i<trail.length;i++){

let p = trail[i];

let alpha = map(i,0,trail.length,10,80);
let size = map(i,0,trail.length,12,80);

fill(120,180,255,alpha);
ellipse(p.x,p.y,size);

}

}

function drawBackground(){

for(let c of clusters){

fill(c.color[0],c.color[1],c.color[2],15);
ellipse(c.pos.x,c.pos.y,520);

}

fill(120,160,255,10);
ellipse(smoothX,smoothY,260);

}

function updateShapes(){

for(let s of shapes){

s.update(smoothX,smoothY);

}

}

function drawShapes(){

for(let s of shapes){

s.display(smoothX,smoothY);

}

}

class BlobShape{

constructor(x,y,color){

this.baseX=x;
this.baseY=y;

this.x=x;
this.y=y;

this.size=random(10,40);
this.offset=random(1000);
this.rotation=random(TWO_PI);
this.depth=random(0.7,1.4);

this.color=color;
this.type=floor(random(3));

}

update(cx,cy){

let d = dist(cx,cy,this.x,this.y);

if(d<200){

let angle = atan2(this.y-cy,this.x-cx);

let force = map(d,0,200,10,0);

this.x += cos(angle)*force;
this.y += sin(angle)*force;

}else{

this.x = lerp(this.x,this.baseX,0.03);
this.y = lerp(this.y,this.baseY,0.03);

}

let driftX = map(noise(this.offset,frameCount*0.01),0,1,-0.35,0.35);
let driftY = map(noise(this.offset+100,frameCount*0.01),0,1,-0.35,0.35);

this.x += driftX;
this.y += driftY;

this.rotation += 0.002;

}

display(cx,cy){

let d = dist(cx,cy,this.x,this.y);

let react = map(d,0,240,1,0);
react = constrain(react,0,1);

let glow = map(d,0,240,70,10);

fill(this.color[0],this.color[1],this.color[2],20);
ellipse(this.x,this.y,this.size+glow);

push();

translate(this.x,this.y);
rotate(this.rotation);

drawOrganic(this.size,this.color);

pop();

}

}

function drawOrganic(base,color){

let points=22;

fill(color[0],color[1],color[2],220);

beginShape();

for(let i=0;i<points;i++){

let angle = map(i,0,points,0,TWO_PI);

let n = noise(cos(angle)*0.9+frameCount*0.01,sin(angle)*0.9);

let wave = map(n,0,1,-3,3);

let x = cos(angle)*(base+wave);
let y = sin(angle)*(base+wave);

curveVertex(x,y);

}

for(let i=0;i<3;i++){

let angle = map(i,0,points,0,TWO_PI);

let x = cos(angle)*base;
let y = sin(angle)*base;

curveVertex(x,y);

}

endShape();

}

function drawConnections(){

for(let i=0;i<shapes.length;i++){

for(let j=i+1;j<shapes.length;j++){

let a=shapes[i];
let b=shapes[j];

let d=dist(a.x,a.y,b.x,b.y);

if(d<120){

let pulse = sin(frameCount*0.05+i+j)*0.5+0.5;

let alpha = map(d,0,120,180,0)*(0.6+pulse);

stroke(180,200,255,alpha);
strokeWeight(1.2+pulse);

line(a.x,a.y,b.x,b.y);

noStroke();

}

}

}

}

function drawCursor(){

fill(160,210,255,30);
ellipse(smoothX,smoothY,200);

fill(200,240,255,60);
ellipse(smoothX,smoothY,60);

fill(255);
ellipse(smoothX,smoothY,10);

}

function drawTitle(){

fill(255,200);

textAlign(CENTER);

textSize(18);

if(predictions.length==0){

text("show your hand to the webcam",width/2,height-60);

}else{

text("move through the living ecosystem",width/2,height-60);

}

}

function windowResized(){

resizeCanvas(windowWidth,windowHeight);
setupClusters();
createShapes();

}