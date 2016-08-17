let serialize = require('serialization');
let model = require('seraph-model');
let Promise = require('bluebird');
// let PouchDB = require('pouchdb');
let _ = require('lodash');
let keywordExtractor = require('keyword-extractor');
let MetaInspector = require('node-metainspector');

let request = require('request-promise');
let config = require('config');

let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

let chromeExtensionEnabled = true;

let graphAsync = Promise.promisifyAll(graph);

graph.constraints.uniqueness.create('Url', 'address', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});
//
// graph.constraints.uniqueness.create('Keyword', 'text', function(err, constraint) {
//   // console.log(constraint);
//   // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
// });

// let db = new PouchDB('sherpa');


class ChromeController {
  constructor(socket, sid,io, context, history){
    this.socket = socket;
    this.tabs = [];
    this.urls = [];
    this.activeTab = {};
    this.sid = sid;
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
      console.log('===>TABS', tabs.length);
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

  getUrl(url){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', address: url}, function(err, node){
        node = node ? node[0] : {type: 'url', address: url};
        if (err) reject(err)
        else {
          resolve(node);
          if (node && !node.keywords || node.keywords.length === 0){
            self.fetchUrlMetaData(url);
          }
        }


      });
    });
  }

  getActiveTab(id){
    return this.tabs.filter(tab => tab.id === id)
  }


  getUrlById(id){
    return new Promise(function(resolve, reject) {
      // console.log('ID', id);
      graph.read(id, function(err,node){
        node = node ? node : {}
        if (err) {
          console.log(err);
          reject(err)
        }
        else {
          console.log('found url by id', node);
          resolve(node);
        }
      })
    });
  }

  getKeywordByText(keyword){
    return new Promise(function(resolve, reject) {
      graph.find({type: 'keyword', text: keyword}, function(err, keywords){
        if (err) reject (err)
        else resolve(keywords[0])
      })
    });
  }

  getUrlNodeByUrl(url){
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', address: url}, function(err, urls){
        if (err) reject (err)
        else resolve(urls[0])
      })
    });
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

    let node = await this.getUrlNodeByUrl(activeTab[0].url);

    // console.log('NODE', node, this.context.activeUrl.url, activeTab[0].url);
    //
    if (_.isUndefined(node)){
      node = await this.context.saveUrl(url, title)
      // console.log('NEW NODE', node);
    }

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
    // console.log('ACTIVE TAB', activeTab);
    if (!activeTab[0]){
      return [];
    }
    else{
      activeTabTitle = activeTab[0].title;
    }

    let activeUrl = { url: activeTab[0].url, title: activeTabTitle};
    console.log('NODE BY URL', activeTab[0].url);
    let node = await this.getUrlNodeByUrl(activeTab[0].url);


    this.context.setActiveUrl(activeUrl);

    this.history.saveEvent({type: 'highlighted', source: 'chrome', data: { nodeId: node.id, address: activeUrl.url, title: activeTab[0].title} }).then(function(res){

    });
  }





}




module.exports = ChromeController
