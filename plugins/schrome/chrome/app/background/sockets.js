import io from 'socket.io-client'
import heartbeats from 'heartbeats'

let heart = heartbeats.createHeart(1000);


let socket = io.connect('http://localhost:3000', {reconnect: true});
let tabs = [];


chrome.tabs.query({}, function(qtabs){
    tabs = qtabs
    socket.emit('chrome-init', qtabs);
});


chrome.tabs.onCreated.addListener(function(active){
  tabs.push(active);
  socket.emit('chrome-created', {active:active, tabs:tabs})

});

chrome.tabs.onHighlighted.addListener(function(active){
  socket.emit('chrome-highlighted', {active:active, tabs:tabs})
});

chrome.tabs.onUpdated.addListener(function(active){
  socket.emit('chrome-updated', {active:active, tabs:tabs})
});


heart.createEvent(30, function(heartbeat, last){
  chrome.tabs.query({}, function(tabs){
      let hb = { heartbeat: heartbeat, last: last, tabs: tabs};
      socket.emit('heartbeat', hb);
  });

});
