import Leap from 'leapjs'
import sfx from 'sfx'

let T = require("timbre");

class LeapController{

  constructor(socket){
    let self = this;
    self.socket = socket;
    self.init();
  }

  init(){
    let self = this;
    let controllerOptions = {enableGestures: true};
    let directionState = '';
    let directionChangeCursor = 0;
    let rest = false;

    Leap.loop(controllerOptions, function(frame) {

      // Display Gesture object data
      if (frame.gestures.length > 0) {
          let direction = self.getSwipeDirection(frame);
          if (direction != directionState && (frame.id > directionChangeCursor + 90)){
            directionState = direction;
            directionChangeCursor = frame.id;
            console.log(direction);
            // if (typeof direction != 'undefined'){
            //   self.socket.emit('speak', 'You swiped ' + direction);
            // }
            switch(direction){
              case 'right':
                // self.socket.emit('speak', 'Ok, done with this, for now.');
                // sfx.play('')
                self.ding()
                break;
              case 'left':
                sfx.bottle()
                break;
              case 'up':
                self.socket.emit('speak', 'I am listening');
                break;
              case 'down':
                self.socket.emit('speak', 'Alright. Message recieved');
                break;
            }

          }

          if (frame.id > directionChangeCursor + 2000){
            console.log('_');
            console.log(frame.id, directionChangeCursor);
            directionState = '';
          }
      }

    });

  }

  ding(){
    let sine1 = T("sin", {freq:440, mul:0.5});
    let sine2 = T("sin", {freq:660, mul:0.5});

    T("perc", {r:500}, sine1, sine2).on("ended", function() {
      this.pause();
    }).bang().play();
  }

  getSwipeDirection(frame){
    for (let i = 0; i < frame.gestures.length; i++) {
      let gesture = frame.gestures[i];
      let swipeDirection = '';
      if(gesture.type == "swipe") {
          //Classify swipe as either horizontal or vertical
          let isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
          //Classify as right-left or up-down
          if(isHorizontal){
              if(gesture.direction[0] > 0){
                  swipeDirection = "right";
              } else {
                  swipeDirection = "left";
              }
          } else { //vertical
              if(gesture.direction[1] > 0){
                  swipeDirection = "up";
              } else {
                  swipeDirection = "down";
              }
          }
          return swipeDirection
       }
     }
  }

}

module.exports = LeapController
