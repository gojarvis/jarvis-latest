var theta = 0,
  nInt = 20,
  nAmp = 0.5,
  frms = 200;
var save = false;
var fc, maxV = 3;

function setup() {
  createCanvas(windowWidth, windowHeight-4);
}

function draw() {
  background('#000000');
  createStuff();
  fill(255);
  textAlign(RIGHT);
  text("(click mouse)", width-50,50);
  theta += TWO_PI / frms;
}

function createStuff() {
  for (var j = 0; j < 5; j++) {
    for (var i = 0; i < maxV; i++) {
      noisyarc(TWO_PI / maxV * i, maxV, j);
    }
  }
}


function noisyarc(offSet, maxV, c) {
  this.slices = 100;
  this.rad = width/3;
  push();
  translate(width / 2, height / 2);
  rotate(theta + offSet);
  noFill();
  beginShape();
  this.v = map(sin(theta), -1, 1, 0, 5);
  this.s = map(sin(theta), -1, 1, 255, 50);
  this.segments = this.slices / (maxV + this.v);

  for (var i = (this.segments - 1); i >= 1; i--) {
    var a = TWO_PI / this.slices * i;
    this.nVal = map(noise(cos(theta + a) * nInt + 1 * c, sin(a)), 0.0, 1.0, nAmp, 1.0); // map noise value to match the amplitude
    this.x = cos(a) * rad * nVal;
    this.y = sin(a) * rad * nVal;
    stroke(255,200);
    curveVertex(this.x, this.y);
  }
  this.px = cos(TWO_PI) * this.rad;
  this.py = sin(TWO_PI) * this.rad;
  curveVertex(this.px, this.py);
  endShape();
  pop();
}

function mouseClicked() {
  noiseSeed(random(123456));
  max = random(1, 6);
  nInt = random(5, 10); // noise intensity
  nAmp = random(.25,1); // noise amplitude
  background(20);
  createStuff();
}

function keyPressed() {
  save = true;
  fc = frameCount;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight-4);
}
