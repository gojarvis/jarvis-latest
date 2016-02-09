var system;

var CardSystem = function (position) {
  this.origin = {
    x: position.x,
    y: position.y
  };
  this.cards = [];
};

CardSystem.prototype.addCard = function (data) {
  this.cards.push(new Card(this.origin, data));
}

CardSystem.prototype.run = function () {
  for (var i = this.cards.length - 1; i >= 0; i--) {
    var card = this.cards[i];
    card.run();
    // if (card.isDead()) {
    //   this.cards.splice(i, 1);
    // }
  }
};

CardSystem.prototype.getSibling = function() {
  var index = (Math.random() * 1000) % this.cards.length;
  console.log('index:', index)
  return this.cards[index];
};

var Card = function (position, data) {
  this.position = {
    x: position.x,
    y: position.y
  };

  this.background = color(Math.random() * 1000 % 255, Math.random() * 1000 % 255, Math.random() * 1000 % 255);
  this.title = data.title;
  this.text = data.text;
  this.w = data.w || 200;
  this.h = data.h || 200;
};

Card.prototype.update = function () {
  // am I colliding?
  // console.log('random sib:', system.getSibling());
};

var rectRect = function (rect1, rect2) {
  // float r1x, float r1y, float r1w, float r1h
  // float r2x, float r2y, float r2w, float r2h
  // are the sides of one rectangle touching the other?

  if (rect1.r1x + rect1.r1w >= rect2.r2x && // r1 right edge past r2 left
  rect1.r1x <= rect2.r2x + rect2.r2w && // r1 left edge past r2 right
  rect1.r1y + rect1.r1h >= rect2.r2y && // r1 top edge past r2 bottom
  rect1.r1y <= rect2.r2y + rect2.r2h) { // r1 bottom edge past r2 top
    return true;
  }
  return false;
}

Card.prototype.display = function () {
  push();

  // outer, invisible box to give margin
  strokeWeight(2);
  fill(this.background);
  rect(this.position.x, this.position.y, this.w, this.h);
  // alert(this.m);
  // alert(this.x + ', ' +  this.y + ', ' + this.w + this.m + ', ' + this.h + this.m);
  // rect(this.position.x, this.position.y, this.w, this.h);

  // inner, visible box
  // strokeWeight(1);
  // fill(255)
  // rect(this.x + this.m / 2, this.y + this.m / 2, this.w, this.h);

  // title text
  // textSize(32);
  // text(this.title, this.x + this.m, this.y + this.m, 100, 100);

  // dividing line
  // line(this.x + this.w + 5, this.y + 42, this.w + 5, this.h + 42);

  // body text
  // textSize(18);
  // text(this.text, this.x + this.m, this.y + 70, this.w - this.m, this.h - 70);

  pop();
};

Card.prototype.run = function () {
  this.update();
  this.display();
}

var cards = [];
var margin = 10;
var width = 200;
var height = 200;

function setup() {
  var origin = {
    x: (windowWidth - 4) / 2,
    y: (windowHeight - 4) / 2
  };

  createCanvas(windowWidth - 4, windowHeight - 4);
  rectMode('center');
  system = new CardSystem({
    x: (windowWidth - 4) / 2,
    y: (windowHeight - 4) / 2
  });

  system.addCard(origin, {
    title: 'Test 001',
    text: 'Test Text 001'
  });
  system.addCard(origin, {
    title: 'Test 002',
    text: 'Test Text 002'
  });
  // translate(windowWidth/2, windowHeight/2);
  // thing = new Thing(50);
  // system = new ParticleSystem(createVector(width/2, 50));
  // text("(click mouse)", 100, 100);
};

function draw() {
  // background(51);

  // stroke(1);

  system.run();

  // translate(width/2, height/2);
  // cards.push(new Card(width, height, 'Hello!', 'I am a card.'));
  // cards.push(new Card(200, 200, 'OMG!', 'Some kind of dopeness came in!'));
};

var Thing = function (radius) {
  this.radius = radius;
  this.pos = {
    x: windowWidth / 4,
    y: windowHeight / 4
  }
};

Thing.prototype.update = function () {
  // this.pos.x = TWO_PI / this.pos.x;
};

Thing.prototype.display = function () {
  stroke(200, 255);
  strokeWeight(2);
  fill(127, 255);
  ellipse(this.pos.x, this.pos.y, this.radius, this.radius)
};

Thing.prototype.run = function () {
  this.update();
  this.display();
}

// A simple Particle class
var Particle = function (pos) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.pos = pos.copy();
  this.lifespan = 255.0;
};

Particle.prototype.run = function () {
  this.update();
  this.display();
};

// Method to update pos
Particle.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.pos.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.pos.x, this.pos.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

var ParticleSystem = function (pos) {
  this.origin = pos.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function () {
  for (var i = this.particles.length - 1; i >= 0; i--) {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};
