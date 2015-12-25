import level from 'level-browserify'
import levelgraph from 'levelgraph'
import Redis from 'ioredis'
import serialize from 'serialization'
import model from 'seraph-model';
import Promise from 'bluebird';
import PouchDB from 'pouchdb';

import keywordExtractor from 'keyword-extractor';
import MetaInspector from 'node-metainspector';


let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa'
});

let graphAsync = Promise.promisifyAll(graph);

graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});

graph.constraints.uniqueness.create('Keyword', 'text', function(err, constraint) {
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

    self.socket.on('chrome-highlighted', function(msg){
      let {active, tabs} = msg;
      self.handleHighlighted(active).then(function(related){
        self.io.emit('related', related);
      });
    });


    self.socket.on('chrome-updated', function(message){
      console.log('updated');
      let {active, tabs} = message;
      console.log('tabs', tabs);
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
      let relationship = 'OPENWITH';
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
    // console.log(origin, target, relationship);

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
      // console.log('failed to relate', err, params);
    }

    return res
  }

  async getRelated(url, threshold){
    let cypher = 'MATCH (n:Url)-[r:OPENWITH]->() WHERE n.url = "' + url +'" AND r.weight > ' + threshold +'  RETURN r ORDER BY r.weight DESC LIMIT 10';
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
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.save({type: 'url', url: url, keywords: ''}, 'Url', function(err, node){
        node = node ? node : {type: 'url', url: url};
        if (err) reject(err)
        else {
          resolve(node);
          if (!node.keywords ||node.keywords.length === 0){
            self.fetchUrlMetaData(url);
          }
        }
      });
    });
  }

  getUrl(url){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', url: url}, function(err, node){
        node = node ? node[0] : {type: 'url', url: url};
        if (err) reject(err)
        else {

          resolve(node);
          if (!node.keywords || node.keywords.length === 0){
            self.fetchUrlMetaData(url);
          }
        }


      });
    });
  }

  fetchUrlMetaData(url){
      let self = this;
      try {
        if (url.startsWith("http")){
          let client = new MetaInspector(url, { timeout: 15000 });
          client.on('fetch', function(){
            let description = client.description;
            if (description && description.length > 0 ){
                console.log("found meta data for ", url, description.length);
                self.saveUrlKeywordsFromDescription(url, description);
            }
          });

          client.fetch();
        }
      }
      catch(err){
        console.log('could not fetch ', url);
      }
  }

  async saveUrlKeywordsFromDescription(url, description){
      let keywords = keywordExtractor.extract(description, { language:"english", remove_digits: true, return_changed_case:true, remove_duplicates: false});
      let keywordsNodes = await Promise.all(keywords.map(keyword => this.saveKeyword(keyword)));

      // console.log(url, keywordsNodes);

      let relationships = await Promise.all(keywordsNodes.map(keywordNode => this.relateKeywordToUrl(keywordNode[0].text,url)))

      let updated = await this.updateUrlKeywordFetchStatus(url);

  }

  async updateUrlKeywordFetchStatus(url){
    let urlNode = await this.getUrlNodeByUrl(url);
    urlNode.keywords = 'fetched';
    let updatedNode = await this.saveUrlNode(urlNode);

    return updatedNode;

  }

  saveUrlNode(urlNode){
    return new Promise(function(resolve, reject) {
      graph.save(urlNode, function(err, node){
        if (err) reject(err)
        else resolve(node)
      })
    });
  }

  async relateKeywordToUrl(keyword, url){
      let self = this;
      let keywordNode = await this.getKeywordByText(keyword);
      let urlNode = await this.getUrlNodeByUrl(url);
      let relationship = await self.relateNodes(keywordNode, urlNode, 'related');

      return(relationship);
  }



  saveKeyword(keyword){
    return new Promise(function(resolve, reject) {
      graph.save({type: 'keyword', text: keyword}, 'Keyword', function(err, node){
        if (err) {
          graph.find({type: 'keyword', text: keyword},function(err,node){
            if (err) reject(err)
            else resolve(node);
          })
        }
        else {
          resolve(node);
        }
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
    let related = await this.getRelated(activeTab[0].url,2);
    let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))

    return relatedUrls
  }

  async handleHighlighted(active){
    let activeTab = this.getActiveTab(active.tabIds[0])
    let activeUrl = activeTab[0].url;
    let activeId = this.urls.filter(node => node.url === activeUrl).id;
    let related = await this.getRelated(activeTab[0].url,2);

    let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))

    return relatedUrls
  }



}




module.exports = ChromeController
