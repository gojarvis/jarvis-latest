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

Card.prototype.update = function() {};
Card.prototype.display = function() {};
