import level from 'level-browserify'
import levelgraph from 'levelgraph'
import serialize from 'serialization'
import model from 'seraph-model';
import Promise from 'bluebird';
import PouchDB from 'pouchdb';
import _ from 'lodash';
import keywordExtractor from 'keyword-extractor';
import MetaInspector from 'node-metainspector';

import request from 'request-promise'

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa',
  server: 'http://45.55.36.193:7474'
});

let graphAsync = Promise.promisifyAll(graph);

graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});
//
// graph.constraints.uniqueness.create('Keyword', 'text', function(err, constraint) {
//   // console.log(constraint);
//   // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
// });

let db = new PouchDB('sherpa');


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
      self.io.to('main').emit('console', `found ${tabs.length} tabs.`);
      self.tabs = tabs;
      self.saveSession();
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

      self.handleHighlighted(active).then(function(related){
          self.io.emit('related', related)
      });
    });


    self.socket.on('chrome-updated', function(message){
      console.log('chrome-updated');
      let {active, tabs} = message;
      self.io.to('main').emit('console', `Chrome tab updated.`);
      self.tabs = tabs;
      self.handleUpdated(active).then(function(){

      });

      self.saveSession();
    });

    self.socket.on('heartbeat', function(hb){
      console.log(".");
      self.saveSession();
    });

    // self.socket.emit('speak', 'Ready, sir');
    self.io.to('main').emit('speak', 'I am ready for action');
    console.log('SOCKET', self.socket.id);
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
  }









  getUrl(url){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', url: url}, function(err, node){
        node = node ? node[0] : {type: 'url', url: url};
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
      graph.find({type: 'url', url: url}, function(err, urls){
        if (err) reject (err)
        else resolve(urls[0])
      })
    });
  }

  async handleUpdated(active){
    let activeTab = this.getActiveTab(active)
    // let related = await this.getRelated(activeTab[0].url,10);
    // let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))
    this.context.setActiveUrl({url: activeTab.url, title: activeTab.title});
    // return relatedUrls
  }

  async handleHighlighted(active){
    let self = this;
    let activeTab = this.getActiveTab(active.tabIds[0])

    if (!activeTab[0]){
      return [];
    }
    let activeUrl = { url: activeTab[0].url, title: activeTab[0].title};
    this.context.setActiveUrl(activeUrl);

    this.history.saveEvent({type: 'highlighted', source: 'chrome', data: { url: activeUrl} }).then(function(res){
      self.io.to('main').emit('console',`I noticed ${activeUrl.title}`);
    });
  }


  async associateWithFiles(fileNode){
    console.log('fileNode',fileNode);
    console.log('urls',this.urls);
  }

  async getRelated(url, threshold){
    let cypher = 'MATCH (n:Url)-[r:openwith]->(q:Url) WHERE n.url = "' + url +'" RETURN r ';
    console.log(cypher);
    let params = {url: url, threshold: threshold};

    try{
      let res = await this.queryGraph(cypher,params);
      return res;
    }
    catch(err){
      // console.log('failed to relate', err);
    }
  }



}




module.exports = ChromeController
