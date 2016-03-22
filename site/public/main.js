function setup() {
  background(250);
  message = 'hello'
  fontSize = parseInt(window.innerHeight / 10);
  createCanvas(window.innerWidth, window.innerHeight);
  elm = createDiv('Cognitive Dynamics');
  elm.style('width:100vw');
  elm.style('overflow:hidden');
  elm.style('text-align: center');
  elm.style('height: 70px');
  elm.style('border: 0px solid white');
  elm.style("font-family: 'Raleway', sans-serif;")
  elm.style('font-size: ' + 50 + 'px');
  elm.style('font-weight', '100');

  elm2 = createDiv('Next-Gen Developer Tools. Powered by AI.');
  elm2.style('width:100vw');
  elm2.style('text-align: center');
  elm2.style('height: 70px');
  elm2.style('border: 0px solid white');
  elm2.style("font-family: 'Raleway', sans-serif;")
  elm2.style('font-size: ' + parseInt(50 / 3) + 'px');
  elm2.style('font-weight', '100');

}

function draw() {

  background(250);
  elm.position(0, window.innerHeight / 2 - (50))
  elm2.position(0, window.innerHeight / 2 + 20)
  message = mouseX + ',' + mouseY;
  // text(message, 10, 50);
  //
  // centerX = window.innerWidth / 2;
  // centerY = window.innerHeight / 2;
  //
  // center = dist(centerX, centerY, mouseX, mouseY)
  // text(center, 10, 70);

  smooth()

}
