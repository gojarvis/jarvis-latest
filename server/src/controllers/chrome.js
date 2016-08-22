let Promise = require('bluebird');
let _ = require('lodash');

let request = require('request-promise');
let config = require('config');

let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();

let chromeExtensionEnabled = true;

class ChromeController {
  constructor(socket,io, context, history){
    this.socket = socket;
    this.tabs = [];
    this.urls = [];
    this.activeTab = {};
    this.io = io;
    this.context = context;
    this.history = history;

    this.io.emit('load-tabs');
    this.registerEvents();

  }

  registerEvents(){
    var self = this;

    self.socket.on('chrome-init', function(tabs){
      console.log('chrome-init');
      console.log("found ",   tabs.length, "tabs.");
      self.tabs = tabs;
      self.saveSession();
      self.socket.emit('chrome-enabled')
    });

    self.socket.on('chrome-created', function(msg){
      let {active, tabs} = msg;
      console.log('chrome-created', tabs.length);
      self.tabs = tabs;
      console.log('Found ', self.tabs.length, 'tabs');
      self.saveSession();
    });

    self.socket.on('chrome-highlighted', function(msg){
      let {active, tabs} = msg;
      self.tabs = tabs;
      console.log('===>TABS', tabs.length, active);
      self.handleHighlighted(active).then(function(related){
          self.io.emit('related', related)
      });
    });


    self.socket.on('chrome-updated', async function(message){
      console.log('chrome-updated');
      let {active, tabs} = message;
      self.tabs = tabs;
      await self.saveSession()
      // let activeTab = tabs.filter(item => item.active);
      // console.log('Chrome udpated, All tabs', active);
      self.handleUpdated(active).then(function(){

      });

      self.saveSession();
    });


    self.socket.on('chrome-disable', function(){
      chromeExtensionEnabled = false;
      self.io.emit('chrome-disabled')
    })

    self.socket.on('chrome-enable', function(){
      chromeExtensionEnabled = true;
      self.io.emit('chrome-enabled')
    })

    self.socket.on('heartbeat', function(hb){

      self.saveSession();
    });

    self.socket.emit('speak', 'Ready, sir');
    // let rnd = _.random(0,1000);
    // request.get('http://numbersapi.com/'+rnd+'/trivia?notfound=floor&fragment')
    // .then(function(res){
    //   // let joke = JSON.parse(res).value.joke;
    //   let wat = res;
    //   // console.log(joke);
    //   // self.socket.emit('speak', 'The number ' + rnd + ' is ' +  wat);
    //   self.socket.emit('speak', 'Ready, sir');
    // })
    // .catch(function(err){
    //   console.log('no jokes for you', err);
    // });
  }

  async saveSession(){
    let self = this;
    this.context.updateTabs(self.tabs);
    return true;
  }

  getActiveTab(id){
    return this.tabs.filter(tab => tab.id === id)
  }

  async handleUpdated(active){
    if (!chromeExtensionEnabled){
      console.log('Chrome extension disabled');
      return;
    }
    let activeTab = this.getActiveTab(active)
    console.log('HANDLE UPDATED --- ACTIVE TAB');
    let url = activeTab[0].url;
    let title = activeTab[0].title;
    // console.log('URL', url, 'TITIE', title);

    let node = await graphUtil.getUrlNodeByUrl(activeTab[0].url);

    // console.log('NODE', node, this.context.activeUrl.url, activeTab[0].url);
    //
    if (_.isUndefined(node)){
      node = await graphUtil.saveUrl(url, title)
      // console.log('NEW NODE', node);
    }

    console.log('NODE', node, this.context.activeUrl);

    if( this.context.activeUrl.url !== activeTab[0].url){
      this.context.setActiveUrl({url: url, title: title});

      this.history.saveEvent({
        type: 'highlighted',
        source: 'chrome',
        data: {
          nodeId: node.id,
          address: url,
          title: title
        }
      }).then(function(res){

      });

    }





    // return relatedUrls
  }

  async handleHighlighted(active){
    if (!chromeExtensionEnabled){
      console.log('Chrome extension disabled');
      return;
    }
    let activeTab = this.getActiveTab(active.tabIds[0])
    let activeTabTitle = '';
    let activeTabUrl = '';

    if (!activeTab[0]){
      return [];
    }
    else{
      activeTabTitle = activeTab[0].title;
      activeTabUrl = activeTab[0].url
    }

    let activeUrl = { url: activeTabUrl, title: activeTabTitle};
    console.log('ACTIVE URL ', activeUrl);
    let node = await this.context.setActiveUrl(activeUrl);



    this.history.saveEvent({type: 'highlighted', source: 'chrome', data: { nodeId: node.id, address: activeUrl.url, title: activeTab[0].title} }).then(function(res){

    });
  }


}




module.exports = ChromeController
