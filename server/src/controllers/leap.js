'use strict'
import Leap from 'leapjs'
import sfx from 'sfx'

// let T = require("timbre");

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
    let i = 0;

    Leap.loop(controllerOptions, function(frame) {
      let position = [100, 100, 100];
      if (frame.hands.length > 0){
        let hand = frame.hands[0];
        position = hand.palmPosition;
        // console.log(position);
      }
      let message = {
        frame: i,
        position: {
          x: position[0],
          y: position[1],
          z: position[2]
        }
      };

      i++;
      // Display Gesture object data
      if (frame.gestures.length > 0) {
          let direction = self.getSwipeDirection(frame);
          if (direction != directionState && (frame.id > directionChangeCursor + 90)){
            directionState = direction;
            directionChangeCursor = frame.id;

            if (typeof direction != 'undefined'){
              // self.socket.emit('speak', 'You swiped ' + direction);
              // self.socket.emit('faceMessage', {
              //   direction: direction
              // });


              message.direction = direction;
            }
            // switch(direction){
            //   case 'right':
            //     // self.socket.emit('speak', 'Ok, done with this, for now.');
            //     // sfx.play('')
            //     self.ding(440,660)
            //     break;
            //   case 'left':
            //     self.ding(660,880)
            //     break;
            //   case 'up':
            //     self.ding(880,1100)
            //     break;
            //   case 'down':
            //     self.ding(220, 110)
            //     break;
            // }

          }

          if (frame.id > directionChangeCursor + 2000){
            console.log('_');
            console.log(frame.id, directionChangeCursor);
            directionState = '';
          }
      }


      self.socket.emit('faceIn', message)
    });

  }

  ding(val1,val2){
    // let sine1 = T("sin", {freq:val1, mul:0.5});
    // let sine2 = T("sin", {freq:val2, mul:0.5});
    //
    // T("perc", {r:500}, sine1, sine2).on("ended", function() {
    //   this.pause();
    // }).bang().play();
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
