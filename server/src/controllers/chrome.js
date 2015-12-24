import level from 'level-browserify'
import levelgraph from 'levelgraph'
import Redis from 'ioredis'
import serialize from 'serialization'
import model from 'seraph-model';
import Promise from 'bluebird';
import PouchDB from 'pouchdb';

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa'
});

let graphAsync = Promise.promisifyAll(graph);

graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});

let db = new PouchDB('sherpa');


class ChromeController {
  constructor(socket, sid,io){
    this.redis = new Redis();
    this.socket = socket;
    this.registerEvents();
    this.tabs = [];
    this.urls = [];
    this.activeTab = {};
    this.sid = sid;
    this.io = io;
  }

  registerEvents(){
    var self = this;

    self.socket.on('chrome-init', function(tabs){
      console.log('chrome-init');
      console.log("found ",   tabs.length, "tabs.");
      self.saveSession(tabs);

    });

    self.socket.on('chrome-created', function(msg){
      let {active, tabs} = msg;
      self.tabs = tabs;
      console.log('Found ', self.tabs.length, 'tabs');
    });

    self.socket.on('chrome-highlighted', function(active){
      self.handleHighlighted(active).then(function(related){
        self.io.emit('related', related);
      });
    });


    self.socket.on('chrome-updated', function(message){
      console.log('updated');
      let {active, tabs} = message;
      self.tabs = tabs;
      self.handleUpdated(active).then(function(related){
        self.io.emit('related', related);
      });
    });

    self.socket.on('heartbeat', function(hb){
      console.log(".");
      self.saveSession(hb.tabs);
    });

    self.socket.emit('speak', "Ready.");
    // console.log('top:', this.socket.id);

  }

  async saveSession(tabs){
    let graphNodes = [];
    this.tabs = tabs;
    try {
      graphNodes = await Promise.all(tabs.map(tab => this.saveUrl(tab.url)));
      if (graphNodes.length > 0){

      }
    }
    catch(err) {
      //already exists
      graphNodes = await Promise.all(tabs.map(tab => this.getUrl(tab.url)));

    }

    this.urls = graphNodes;

    let relationshipsTop = await Promise.all(graphNodes.map(node =>{
      let origin = node;
      let others = graphNodes.filter(node => node.id !== origin.id);
      let relationship = 'OPENWITH'
      return this.relateOneToMany(origin,others,relationship)
    }));
  }



  async relateOneToMany(origin, others, relationship){
    let relationships = [];
    try {
      relationships = await Promise.all(others.map(target => this.relateNodes(origin, target, relationship)));
    }
    catch(err){
      console.log('failed to relate one to many', err);
    }

    return relationships;
  }


  async relateNodes(origin, target, relationship){
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'CREATE UNIQUE a-[r:'+relationship+']-b '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      // console.log('failed to relate', err);
    }

    return res
  }

  async getRelated(url, threshold){
    let cypher = 'MATCH (n:Url)-[r:OPENWITH]->() WHERE n.url = "' + url +'" AND r.weight > ' + threshold +'  RETURN r ORDER BY r.weight DESC LIMIT 5';
    // console.log(cypher);
    let params = {url: url, threshold: threshold};

    try{
      let res = await this.queryGraph(cypher,params);
      return res;
    }
    catch(err){
      // console.log('failed to relate', err);
    }
  }


  queryGraph(cypher, params){
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  saveUrl(url){
    return new Promise(function(resolve, reject) {
      graph.save({type: 'url', url: url}, 'Url', function(err, node){
        node = node ? node : {type: 'url', url: url};
        if (err) reject(err)
        else resolve(node);
      });
    });
  }

  getUrl(url){
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', url: url}, function(err, node){
        node = node ? node[0] : {type: 'url', url: url};
        if (err) reject(err)
        else resolve(node);
      });
    });
  }

  getActiveTab(id){
    return this.tabs.filter(tab => tab.id === id)
  }

  getTabIds(tabs){
    return tabs.map(tab => tab.id)
  }


  findTabIdByUrl(tabs, url){
    let tab = tabs.filter(tab => { if (tab.url === url) return tab})
    return tab[0].id;
  }

  getUrlById(id){
    return new Promise(function(resolve, reject) {
      graph.read(id, function(err,node){
        node = node ? node : {}
        if (err) reject(err)
        else resolve(node);
      })
    });
  }

  async handleUpdated(active){

    let activeTab = this.getActiveTab(active)
    console.log(activeTab[0].url);
    let related = await this.getRelated(activeTab[0].url,2);

    let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))

    return relatedUrls
  }

  async handleHighlighted(active){
    // console.log(active,active.tabIds,active.tabIds[0]);
    let activeTab = this.getActiveTab(active.tabIds[0])
    let activeId = this.urls.filter(node => node.url === activeTab[0].url).id;
    let related = await this.getRelated(activeTab[0].url,2);

    let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))

    return relatedUrls
  }



}




module.exports = ChromeController
