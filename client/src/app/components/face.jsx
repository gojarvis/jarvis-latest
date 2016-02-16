import P5 from 'p5'
import 'p5/lib/addons/p5.sound'
import 'p5/lib/addons/p5.dom'

import reactDom from 'react-dom'
const React = require('react');


const Face = React.createClass({
  getInitialState: function(){
    return ({
      radius: 100,
      p5on: false
    })
  },
  componentDidMount: function(){
    // this.hum();
    let socket = window.socket;
    this.init(socket);
    this.setState({socket: socket})
  },

  componentWillReceiveProps: function(nextProps) {
  },

  init(socket){

    console.log('init');

    let cardsObjs = [
      {text: "hello"},
      {text: "jarvis"},
      {text: "perfect"},
      {text: "awesome"},
      {text: "jabroni"},
    ]

    const s = function (p) {
      p.socket = socket;
      p.position = { x: window.innerWidth / 2 - 100 , y: window.innerHeight - 30}

      p.setup = function () {
        p.cardHeight = 100;
        p.cardWidth = 800;
        p.x = (window.innerWidth / 2) - (p.cardWidth /2) ;
        p.y = 100 ;

        p.mainCanvas = p.createCanvas(window.innerWidth, window.innerHeight)

        socket.on('faceIn', (msg) => p.faceIn(msg))

        socket.on('update', (msg) => p.handleUpdate(msg))

        let angle = 0;
        p.marker = 0;

        p.frameId = 0;
        p.showMessage= false;
        p.messageTime = 200;

        p.messageHeight = 200;
        p.messageWidth = 400;

        p.inputWidth = window.innderWidth - 100;

        let inputPosition = {
          x: 460,
          y: 20
        };

        p.inputBar = p.createInput('')
        p.inputBar.position(inputPosition.x, inputPosition.y);
        p.inputBar.style('width: 700px');
        p.inputBar.style('height: 70px');
        p.inputBar.style('border: 0px solid white');
        p.inputBar.style('font-size: 30px');
        p.inputBar.style('border-bottom: 1px solid rgba(0, 0, 0, 0.38)');
        p.inputBar.id('inputBar');

        // p.inputBar.input(p.hanldeInputUpdate)


        p.selectedCard = 0

        p.cards = cardsObjs.map((card, index) => {
          return p.createCard(card.text, index)
        })

      }

      p.keyPressed = function(){
        if (p.keyCode === p.ENTER){
          let message = p.inputBar.value()
          p.sendMessage(message)
          p.inputBar.value('')
        }
      }

      p.sendMessage = function(message){
        p.socket.emit('text', {text: message});        
      }

      p.handleUpdate = function(msg){

      }

      p.defineRange = function(x,y,w,h){
        return {
          x: {
            min: x,
            max: x + w
          },
          y: {
            min: y,
            max: y + h
          }
        }
      }

      p.isInRange = function(current, range){
        return ((current.x > range.x.min && current.x < range.x.max) && (current.y > range.y.min && current.y < range.y.max))
      }

      p.createCard = function(msg, index){
        let cardHeight = p.cardHeight;
        let cardWidth = p.cardWidth;
        let card = p.createDiv('')
        card.style('border: 1px solid rgba(0, 0, 0, 0.17)')
        card.style('padding: 1px solid #ccccc')
        card.style('width: ' + cardWidth + 'px')
        card.style('height: ' + cardHeight + 'px')
        card.style('box-shadow: 2px 0px 17px 0px rgba(78, 78, 67, 0.42)')
        card.style('padding: 10px')
        card.style('font-family: arial')
        card.style('font-size: 25px')
        card.style('text-align: center')

        card.id('card' + index)

        let cardContent = p.createDiv(msg);
        cardContent.parent(card)
        cardContent.style('float: left')
        cardContent.style('width: 65%')

        let cardControl = p.createDiv('');
        cardControl.parent(card)
        cardControl.style('float: right')
        cardControl.style('width: 30%')

        let buttonDismiss = p.createDiv('Dismiss')
        buttonDismiss.parent(cardControl);
        buttonDismiss.style('width: 80px')
        buttonDismiss.style('height: 30px')
        buttonDismiss.style('float: right')
        buttonDismiss.style('font-size: 12px')
        buttonDismiss.style('display: flex')
        buttonDismiss.style('align-items: center')
        buttonDismiss.style('justify-content: center')

        buttonDismiss.style('margin-right: 10px')
        buttonDismiss.style('background-color: rgba(140, 134, 134, 0.168627)')

        let buttonSave = p.createDiv('Save')
        buttonSave.parent(cardControl);
        buttonSave.style('width: 80px')
        buttonSave.style('height: 30px')
        buttonSave.style('float: right')
        buttonSave.style('font-size: 12px')
        buttonSave.style('display: flex')
        buttonSave.style('align-items: center')
        buttonSave.style('justify-content: center')
        buttonSave.style('margin-right: 10px')
        buttonSave.style('background-color: rgba(110, 226, 7, 0.168627)')

        buttonDismiss.mousePressed(() => {
          p.removeCard(index)
        })

        buttonSave.mousePressed(() => {
          p.saveCard(index)
        })
        // p.push()

        return card;
      }

      p.faceMessage = function(){

      }

      p.messageDone = function(){
        // p.select('#card1').remove()
        console.log('done');
      }

      p.paintCursor = function(breath){
        let t = parseInt(p.position.x) + ',' + parseInt(p.position.y) + ',' + parseInt(p.position.z);
        p.fill(30);
        // let x =(p.position.x * 2) + window.innerWidth / 2
        let x = p.position.x;
        // let y = window.innerHeight - (p.position.y * 2)
        let y = p.position.y;
        p.rect(x , y , 20 * breath, 20 * breath);
        p.text(t, 20,20);
        p.cursor = {
          x: x,
          y: y
        }
      }


      p.removeCard = function(index){
        let card = p.select("#card" + index)
        card.class('animated fadeOutRightBig')
        p.cards = p.cards.filter((card, i) => { return index !== i})
      }

      p.saveCard = function(index){
        let card = p.select("#card" + index)
        card.class('animated fadeOutLeftBig')
        p.cards = p.cards.filter((card, i) => { return index !== i})
      }


      p.renderCard = function(card, index){
        let cardX = p.x;
        let cardY = (p.cardHeight + 60) * (index + 1) - (p.cardHeight / 2);

        let cardElement = p.cards[index];
        // console.log(cardElement);



        let range = p.defineRange(cardX, cardY, p.cardWidth, p.cardHeight)
        let inRange = p.isInRange(p.cursor, range);

        if (p.showMessage){
          // console.log(p.incoming);
          // console.log(range, position);
          // console.log(index, inRange, range, p.position);
          // card.class('animated slideInUp');
          if (p.incoming === 'down' && card.isLocked){
              card.dismissed = true;
              card.isLocked = false

          }
          if (p.incoming === 'up' && inRange){
            // card.isLocked = true;
          }

        }


        if (inRange){
          card.style('background: #FFFCE0')
          // card.class('animated pulse');
          // cardX = p.cursor.x - 20;
          // cardY = p.cursor.y - 20;

        }
        else{
          card.style('background: #FAF3DD')
            // card.removeClass('pulse');
        }

        if (card.dismissed){
          cardY = cardY + (p.messageFrameId * 3);
        }


        card.position(cardX, cardY)
      }

      p.faceIn = function(msg){
          let {frame, position} = msg;
          // p.position = {
          //   x: position.x,
          //   y: position.y,
          //   z: position.z,
          // };
          p.noCursor();

          //DO NOT REMOVE THIS NEXT LINE. It makes sure screen is cleared every render
          p.background(255);


          p.position = {
            x: p.mouseX,
            y: p.mouseY,
            z: position.z
          };


          let breath = p.sin(frame / 30);

          //Render cursor
          p.paintCursor(breath);
          p.frameId = frame;

          //Render cards
          p.cards.map((card, index) => {
            this.renderCard(card, index)
          })




          if (typeof msg.direction !== 'undefined'){
              p.marker = p.frameId;
              p.incoming = msg.direction;
              p.fadeMarker = p.frameId + p.messageTime - parseInt(p.messageTime / 4);
              p.messageFrameId = 1;
              p.showMessage = true;
              p.messageFade = false;
          }
          // console.log(p.showMessage);

          if (p.showMessage){
            // console.log('Showing message');
            p.faceMessage()
            p.messageFrameId++
          }

          if(p.frameId > p.marker + p.messageTime && p.showMessage){
            p.showMessage = false;
            p.messageFade = false;
            p.messageFrameId = 1;
            p.messageDone();
          }

          if(p.frameId < p.marker + p.messageTime && p.frameId > p.fadeMarker && p.showMessage){
            p.messageFade = true;

          }
        }
      }

      new P5(s)
  },


  render(){
    return (
      <div>


      </div>
    )
  },
})


module.exports = Face;
