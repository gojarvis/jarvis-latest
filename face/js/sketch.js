var system;

function forEach(array, action) {
  for (var i = 0; i < array.length; i++) {
    action(array[i]);
  }
};

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

CardSystem.prototype.isOverlapping = function (rect1) {
  var is = false;
  forEach(this.cards, function(card) {
    // float x, float y, float w, float h
    // float x, float y, float w, float h
    // are the sides of one rectangle touching the other?

    if (rect1.position.x + rect1.w >= card.position.x && // r1 right edge past r2 left
    rect1.position.x <= card.position.x + card.w && // r1 left edge past r2 right
    rect1.position.y + rect1.h >= card.position.y && // r1 top edge past r2 bottom
    rect1.position.y <= card.position.y + card.h) { // r1 bottom edge past r2 top
      is = true;
    }
  });

  return is;
};

var Card = function (position, data) {
  this.position = {
    x: position.x,
    y: position.y
  };

  this.background = color(255, 255, 255, 1);
  this.color = color(Math.random() * 1000 % 255, Math.random() * 1000 % 255, Math.random() * 1000 % 255);
  this.title = data.title || 'No Title';
  this.text = data.text || 'No Text';
  this.w = data.w || 500;
  this.h = data.h || 200;
  this.counter = 0;
};

Card.prototype.run = function () {
  this.update();
  this.display();
};
Card.prototype.update = function() {
  while (system.isOverlapping(this) && this.counter++ < 4) {
    this.position.x += Math.random() * 100;
    this.position.y += Math.random() * 100;
  }
};
Card.prototype.display = function() {
  fill(this.background);
  rect(this.position.x, this.position.y, this.w, this.h, 21);
};

CardSystem.prototype.generateCards = function(num) {
  for(num; num > 0; num--) {
    this.addCard({});
  }
};

function setup() {
  noLoop();
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

  system.generateCards(10);

  system.addCard(origin, {
    title: 'Test 001',
    text: 'Test Text 001'
  });
}

function draw() {
  system.run();
}
