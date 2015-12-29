import io from 'socket.io-client'
import heartbeats from 'heartbeats'

let heart = heartbeats.createHeart(1000);


let socket = io.connect('http://localhost:3000', {reconnect: true});
let tabs = [];

let refreshTabs = new Promise(function(resolve, reject) {
  chrome.tabs.query({}, function(res){
      tabs = res
      resolve(res);
  });
});

//Initialize tabs
chrome.tabs.query({}, function(res){
    tabs = res
    socket.emit('chrome-init', res);
});


chrome.tabs.onCreated.addListener(function(active){
  refreshTabs().then(function(){
      socket.emit('chrome-created', {active:active, tabs:tabs})
  })

});

chrome.tabs.onHighlighted.addListener(function(active){
  socket.emit('chrome-highlighted', {active:active, tabs:tabs})
});

chrome.tabs.onUpdated.addListener(function(active){
  refreshTabs().then(function(){
      socket.emit('chrome-updated', {active:active, tabs:tabs});
  })
});

//https://developer.chrome.com/extensions/omnibox
// chrome.onInputEntered()


heart.createEvent(30, function(heartbeat, last){
  chrome.tabs.query({}, function(tabs){
      let hb = { heartbeat: heartbeat, last: last, tabs: tabs};
      socket.emit('heartbeat', hb);
  });

});
