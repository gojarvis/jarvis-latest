function setup(){
  createCanvas(1200, 1200, WEBGL);
}

function draw(){
  background(1);
  // rotateZ(frameCount * 0.01);
  // rotateY(frameCount * 0.01);

  var locY = (mouseY / height - 0.5) * (-2);
  var locX = (mouseX / width - 0.5) * 2;


  ambientLight(50);
  directionalLight(200, 0, 0, 0.25, 0.25, 0.25);
  pointLight(0, 0, 200, 0, 40, 40);
  pointLight(200, 200, 0, -locX, -locY, 0);

  // rotateX(locX)
  // // rotateY(locY)
  // for(var a = 1; a < 4; a++){
  //   for(var b = 1; b < 4; b++){
  //     for(var c = 1; c < 4; c++){
  //       doDraw(a,b,c);
  //     }
  //   }
  // }

  doDraw(10, 10, 10);
  orbitControl();

  normalMaterial();

  function doDraw(k,p,n){
    for(var j = 0; j < n; j++){
      var a = frameCount * 0.03 + j;
      var b = frameCount * 0.03 + j;
      var radius = sin(frameCount * 0.001) * cos(frameCount * 0.01) * a;
      translate(sin(2 * a) * radius * sin(a), cos(b) * radius / 2 , cos(2 * a) * radius * sin(b));

      push();
      for(var i = 0; i < n; i++){
        for(var s = 0; s < p; s++){
          var a = frameCount * 0.03 + j;
          var b = frameCount * 0.03 + i;
          var radius = sin(frameCount * 0.005) * 40;
          translate(cos(2 * a) * radius * sin(b), cos(2 * a) * radius * cos(b), cos(b) * radius / 2 );

          // translate(sin(frameCount * 0.005 + j) * 100, sin(frameCount * 0.005 + j) * 100, i * 0.5);
          rotateZ(frameCount * 0.002);
          rotateX(frameCount * 0.002);
          rotateY(frameCount * 0.002);
          push();
          sphere(3,3,3)
          createVector(81, 159, 204)

          pop();
        }
      }
      pop();
    }
  }
}
