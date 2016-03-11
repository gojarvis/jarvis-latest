// import io from 'socket.io-client'
import heartbeats from 'heartbeats'
import socketCluster from 'socketcluster-client'


let heart = heartbeats.createHeart(1000);

let options = {
  port: 3000,
  hostname: 'localhost'
}
// let socket = io.connect('http://localhost:3000/main', {reconnect: true});
let socket = socketCluster.connect(options);

socket.subscribe('main');
let tabs = [];

//
socket.on('load-tabs', function(){
  chrome.tabs.query({}, function(res){
      tabs = res
  });
  socket.emit('speak', 'loaded tabs');
})
//Initialize tabs
chrome.tabs.query({}, function(res){
    tabs = res
    console.log('SOCKET', socket);
    socket.emit('chrome-init', res);
});


chrome.tabs.onCreated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      socket.emit('chrome-created', {active:active, tabs:tabs})
  });

});

chrome.tabs.onHighlighted.addListener(function(active){
  socket.emit('chrome-highlighted', {active:active, tabs:tabs})
});

chrome.tabs.onUpdated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      socket.emit('chrome-updated', {active:active, tabs:tabs});
  });
});

chrome.tabs.onActivated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      socket.emit('chrome-activated', {active:active, tabs:tabs});
  });
});

//https://developer.chrome.com/extensions/omnibox
// chrome.onInputEntered()


heart.createEvent(30, function(heartbeat, last){
  chrome.tabs.query({}, function(tabs){
      let hb = { heartbeat: heartbeat, last: last, tabs: tabs};
      socket.emit('heartbeat', hb);
  });

});
