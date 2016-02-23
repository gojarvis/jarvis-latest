import P5 from 'p5'
import 'p5/lib/addons/p5.sound'
import 'p5/lib/addons/p5.dom'
import { Map, List } from 'immutable'

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


    const s = function (p) {
      p.socket = socket;
      p.position = { x: window.innerWidth / 2 - 100 , y: window.innerHeight - 30}

      p.setup = function () {
        p.cardHeight = 100;
        p.cardWidth = 800;
        p.stackX = (window.innerWidth / 2) - (p.cardWidth /2) ;
        p.stackY = 100 ;

        p.marker = 0;
        p.transitionDuration = 60;
        p.markerDone = 0;
        p.transition = false;
        p.activeTransitions = Map();
        p.columnWidth = window.innerWidth / 7
        p.columnsGrid = [
          (p.columnWidth / 7) * 0,
          (p.columnWidth / 7) * 1,
          (p.columnWidth / 7) * 2,
          (p.columnWidth / 7) * 3,
          (p.columnWidth / 7) * 4,
          (p.columnWidth / 7) * 5,
          (p.columnWidth / 7) * 6,
        ];

        p.stackPosition = parseInt(Math.floor(p.columnsGrid.length / 2));



        p.singleColumnWidth = window.innerWidth / 5;
        for (let i=0; i < 5; i++) {
          p.columnsGrid.push({
            start: i * p.singleColumnWidth,
            end: (i + 1) * p.singleColumnWidth,
          })
        }


        p.cards = [];


        p.mainCanvas = p.createCanvas(window.innerWidth, window.innerHeight)

        // socket.on('faceIn', (msg) => p.render(msg))

        socket.on('questionFromJarvis', function(question){

          p.questionIsOpen = true,
          p.questionTarget = question.target



          // self.say(question.text);
        });

        let keywords = ['thanks',
                     'graph',
                     'neo4j',
                     'open source'];

        p.cards = keywords.map((keyword, index) => {
          return p.createCard(keyword, index)
        });

        socket.on('question-result', (result) => {
          p.marker = p.frameId;
          p.markerDone = p.frameId + p.transitionDuration;
          p.cards = result.keywords.map((keyword, index) => {
            return p.createCard(keyword, index)
          })

          // p.renderStack();
        })

        socket.on('update', (msg) => p.handleUpdate(msg))

        let angle = 0;
        p.marker = 0;

        p.frameId = 0;
        p.showMessage= false;
        p.messageTime = 200;

        p.messageHeight = 200;
        p.messageWidth = 400;

        p.inputWidth = 500;

        let inputPosition = {
          x: window.innerWidth / 2 - (p.inputWidth / 2),
          y: window.innerHeight - 100
        };

        p.inputBar = p.createInput('')

        p.inputBar.style('width: 700px');
        p.inputBar.style('height: 70px');
        p.inputBar.style('border: 0px solid white');
        p.inputBar.style('font-size: 30px');
        p.inputBar.style('border-bottom: 1px solid rgba(0, 0, 0, 0.38)');
        p.inputBar.id('inputBar');



        // p.inputBar.input(p.hanldeInputUpdate)
        p.bottomBar = p.createDiv('');
        p.faceContainer = p.createDiv('');


        // // p.face = p.rect(10,10, 10,10);
        //
        // p.face.parent(p.bottomBar);

        p.faceContainer.parent(p.bottomBar);
        p.inputBar.parent(p.bottomBar);
        p.selectedCard = 0
        p.bottomBar.position(inputPosition.x, inputPosition.y);

        // p.cards = cardsObjs.map((card, index) => {
        //   return p.createCard(card.text, index)
        // })




        // let words = rita.tokenize("The elephant took a bite!");
        // for (let i=0, j = words.length; i<j; i++) {
        //     p.text(words[i], 50, 50 + i*20);
        // }



      }

      p.keyPressed = function(){
        if (p.keyCode === p.ENTER){
          let message = p.inputBar.value()
          p.sendMessage(message)
          p.inputBar.value('')
        }

        if (p.keyCode === p.LEFT_ARROW){
          p.startTransition('stacksLeft', p.moveStackLeft)
          if (p.stackPosition > 0){
            p.stackPosition--;
          }
        }

        if (p.keyCode === p.RIGHT_ARROW){
          p.startTransition('stacksRight', p.moveStackRight)
          if (p.stackPosition < p.columnsGrid.length){
            p.stackPosition++;
          }
        }

        if (p.keyCode === p.UP_ARROW){
          p.startTransition('stacksLeft', p.zoomIn)

        }
      }

      p.zoomIn = function(){
        p.textSize(30);
        p.text('ACTIVE: ' + p.activeCard, 10, 60);


      }

      p.moveStackLeft = function(delta){
        let target = p.columnsGrid[p.stackPosition];
        // console.log(p.stackX, p.stackPosition, p.columnsGrid[p.stackPosition]);
        if(p.stackX >= target && p.stackX > 0){

            let dx = target - p.stackX;
            p.stackX = p.stackX - dx  * 1.2
        }
        else{
          // console.log('left', p.activeTransitions.toJS(), p.activeTransition);
          // p.activeTransitions = p.activeTransitions.setIn([p.activeTransition, 'active'], false)
          // p.activeTransition = '';

          // p.text()
        }
      }

      p.moveStackRight = function(delta){
        let target = p.columnsGrid[p.stackPosition];
        if(p.stackX <= (p.columnsGrid[p.stackPosition] + p.columnWidth)){
            let dx = target - p.stackX;
            p.stackX = p.stackX + dx  * 1.2
            // p.stackX = p.stackX + (delta / 10) * 1.2
        }
        else{
          // console.log('right', p.activeTransitions.toJS());
          // p.activeTransitions = p.activeTransitions.setIn([p.activeTransition, 'active'], false)
          // p.activeTransition = '';

        }
      }

      p.startTransition = function(eventName, executor){
        let marker = p.frameCount;
        let markerDone = marker + p.transitionDuration;
        let active = true;
        p.activeTransitions = p.activeTransitions.set(eventName, {marker, markerDone, active, executor});
        console.log('started', p.activeTransitions.toJS());
      }

      p.checkTransitions = function(){
        // console.log(p.activeTransitions.first());
        p.activeTransitions.forEach((transition, name) => {
          let delta = transition.markerDone - p.frameCount;
          p.fill('rgba(34, 140, 47, 0.73)')
          p.textSize(30);
          p.push()
          p.text(p.stackPosition + ' , ' + p.activeTransition, 30, 100);
          p.pop()
          if (transition.active){
            p.rect(20, 20, 20, 20);
            if (p.frameCount > transition.marker && p.frameCount < transition.markerDone){
              transition.active = true;
              transition.executor(delta)
              p.activeTransition = name;
            }
            else{
              transition.active = false;
              transition.marker = 0;
              transition.markerDone = 0;
              p.activeTransitions = p.activeTransitions.delete(name);
              p.activeTransition = '';
            }
          }
        });
      }

      p.sendMessage = function(message){
        if (p.questionIsOpen){
          p.socket.emit(p.questionTarget, {text: message});
          p.questionIsOpen = false;
        }
        else{
            p.socket.emit('text', {text: message});
        }

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
        buttonSave.style('background-color: rgba(140, 134, 134, 0.168627)')

        buttonDismiss.mousePressed(() => {
          console.log('remove', p.activeCard);
          p.removeCard(p.activeCard)
        })

        buttonSave.mousePressed(() => {
          p.saveCard(p.activeCard)
        })
        // p.push()
        card.msg = msg;

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
        let card = p.select("#card-" + index)

        card.class('animated fadeOutRightBig')
        // console.log('before',p.cards.length, index, p.cards[index]);
        p.cards[index].disabled = true;
        p.cards = p.cards.filter(card => !card.disabled);
      }

      p.renderStack = function(){
        p.cardsQueue = {};

        p.activeCards = p.cards.filter(card => !card.disabled)

        p.activeCards.map((card, index) => {
          p.cardsQueue[index] = card;
          this.renderCard(card, index)
        })
      }

      p.saveCard = function(index){
        let card = p.select("#card" + index)
        card.class('animated fadeOutLeftBig')
        p.cards = p.cards.filter((card, i) => { return index !== i})
      }


      p.renderCard = function(card, index){
        let cardX = p.stackX;


        //TRANSITION
        if (p.frameId > p.marker && p.frameId < p.markerDone){

          p.delta = p.frameId - p.marker;

          cardX = p.stackX;
          card.class('animated bounceInUp')
        }

        if (p.frameId > p.markerDone){
          // card.removeClasss('bounceInUp');
          p.markerDone = 0;
          p.marker = 0;
        }

        let cardY = (p.cardHeight + 60) * (index + 1) - (p.cardHeight / 2);

        let cardElement = p.cards[index];
        // console.log(cardElement);

        card.id("card-" + index);
        card.cid = index;

        let range = p.defineRange(cardX, cardY, p.cardWidth, p.cardHeight)
        let inRange = p.isInRange(p.cursor, range);


        if (inRange){
          card.style('background: white')
          card.style('box-shadow: 2px 0px 19px 0px rgba(78, 78, 67, 0.52)')
          p.activeCard = index;
        }
        else{
          card.style('background: white')
          card.style('box-shadow: 2px 0px 17px 0px rgba(78, 78, 67, 0.42)')
        }

        if (card.dismissed){
          cardY = cardY + (p.messageFrameId * 3);
        }


        card.position(cardX, cardY)

      }

      p.render = function(){
          p.noCursor();

          p.background(250);

          p.position = {
            x: p.mouseX,
            y: p.mouseY
          };

          let breath = p.sin(p.frameId / 30);

          p.paintCursor(breath);
          p.renderStack();
          p.frameId++;
          p.checkTransitions()

      }


      p.draw = function(){
        p.render()
      }

    };

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
