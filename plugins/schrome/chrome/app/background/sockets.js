import io from 'socket.io-client'
import heartbeats from 'heartbeats'

let heart = heartbeats.createHeart(1000);


let socket = io.connect('http://localhost:3000', {reconnect: true});
let tabs = [];

let enabled = true;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == 'disable'){
      enabled = false;
    }

    if (request.action == 'enable'){
      enabled = true;
    }
  });




socket.on('load-tabs', function(){
  chrome.tabs.query({}, function(res){
      tabs = res
  });
  socket.emit('speak', 'loaded tabs');
})
//Initialize tabs
chrome.tabs.query({}, function(res){
    tabs = res
    if (enabled) socket.emit('chrome-init', res);
});


chrome.tabs.onCreated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      if (enabled) socket.emit('chrome-created', {active:active, tabs:tabs})
  });

});

chrome.tabs.onUpdated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      if (enabled) socket.emit('chrome-updated', {active:active, tabs:tabs});
  });
});

chrome.tabs.onActivated.addListener(function(active){
  chrome.tabs.query({}, function(res){
      let tabs = res
      if (enabled) socket.emit('chrome-activated', {active:active, tabs:tabs});
  });
});

chrome.tabs.onRemoved.addListener(function(closedTabId){
  chrome.tabs.query({}, function(res){
      let tabs = res
      if (enabled) socket.emit('chrome-closed', {closedTabId:closedTabId, tabs:tabs});
  });
});

// selectInfo {
//  windowId: Integer -- ID of the window the selected tab changed inside of
// }
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  chrome.tabs.query({}, function(res) {
    let tabs = res;
    if (enabled) socket.emit('chrome-highlighted', { active, tabs, selectInfo });
  })
});

chrome.tabs.onHighlighted.addListener(function(active){
  chrome.tabs.query({}, function(res) {
    let tabs = res;
    if (enabled) socket.emit('chrome-highlighted', { active:active, tabs:tabs });
  })
});

//https://developer.chrome.com/extensions/omnibox
// chrome.onInputEntered()


heart.createEvent(30, function(heartbeat, last){
  chrome.tabs.query({}, function(tabs){
      let hb = { heartbeat: heartbeat, last: last, tabs: tabs};
      if (enabled) socket.emit('heartbeat', hb);
  });

});
