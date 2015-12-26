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

graph.constraints.uniqueness.create('File', 'uri', function(err, constraint) {});

class AtomController {
  constructor(socket, sid,io){
    this.redis = new Redis();
    this.socket = socket;
    this.registerEvents();
    this.tabs = [];
    this.activeTab = {};
    this.sid = sid;
    this.io = io;
  }

  registerEvents(){
    console.log('atom-online');
    var self = this;

    self.socket.on('atom-open', function(msg){
      console.log('atom-open', msg);
    });

    // self.socket.on('atom-connected', function(){
    //   console.log('atom-connected');
    // });
    //
    // self.socket.on('atom-file-saved', function(msg){
    //   console.log('atom-file-saved', msg);
    // });

    self.socket.on('atom-file-observed', function(msg){
      self.handleFileObserved(msg.uri);
    })
    //
    self.socket.on('atom-highlighted', function(msg){
      self.handleFileHighlighted(msg.uri);
    })
    //
    self.socket.on('atom-file-open', function(msg){
      self.handleFileOpen(msg.uri);
    })
    //
    self.socket.on('atom-file-close', function(msg){
      self.handleFileClose(msg.uri);
    })
  }

  async saveSession(tabs){
    // let graphNodes = [];
    // this.tabs = tabs;
    // try {
    //   graphNodes = await Promise.all(tabs.map(tab => this.saveFile(tab.uri)));
    //   if (graphNodes.length > 0){
    //
    //   }
    // }
    // catch(err) {
    //   //already exists
    //   graphNodes = await Promise.all(tabs.map(tab => this.getFile(tab.uri)));
    // }
    //
    // this.urls = graphNodes;
    //
    // let relationshipsTop = await Promise.all(graphNodes.map(node =>{
    //   let origin = node;
    //   let others = graphNodes.filter(node => node.id !== origin.id);
    //   let relationship = 'OPENWITH';
    //   return this.relateOneToMany(origin,others,relationship)
    // }));
  }

  async relateOneToMany(origin, others, relationship){
    // console.log(origin, others, relationship);
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

  async getRelated(uri, threshold){
    let cypher = 'MATCH (n:File)-[r:OPENWITH]->() WHERE n.uri = "' + uri +'" AND r.weight > ' + threshold +'  RETURN r ORDER BY r.weight DESC LIMIT 10';
    // console.log(cypher);
    let params = {uri: uri, threshold: threshold};

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

  saveFile(uri){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.save({type: 'file', uri: uri}, 'File', function(err, node){
        node = node ? node : {type: 'file', uri: uri};
        if (err) {
          console.log('err', err);
          reject(err)
        }
        else {
          console.log('node',node);
          resolve(node);
        }
      });
    });
  }

  getFile(uri){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'file', uri: uri}, function(err, node){
        node = node ? node[0] : {type: 'file', uri: uri};
        if (err) reject(err)
        else {
          resolve(node);
        }
      });
    });
  }

  async getAndSave(uri){
    let self = this;
    let fileNode = await self.getFile(uri);
    if(!fileNode){
      console.log('saving');
      fileNode = await self.saveFile(uri);
    }
    return fileNode

  }

  async handleFileHighlighted(uri){
    let fileNode = await this.insertUniqueFile(uri)
    let otherNodes = this.tabs.filter(tab => tab.id !== fileNode.id);

    // console.log('FILENODE',fileNode, otherNodes);
    let rel = await this.relateOneToMany(fileNode, otherNodes, 'OPENWITH');
    console.log(rel);
  }



  async handleFileObserved(uri){
    let fileNode = this.insertUniqueFile(uri)
    console.log(fileNode);
  }

  async handleFileOpen(uri){
    let fileNode = this.insertUniqueFile(uri);
    console.log(fileNode);
  }

  async handleFileClose(uri){
    console.log('close',uri)
    this.removeUniqueFile(uri);
  }

  async insertUniqueFile(uri){
    let fileNode = await this.getAndSave(uri);
    console.log("found", fileNode.uri);
    let tab = this.tabs.filter(tab => tab.uri === fileNode.uri);
    if (tab.length == 0){

      this.tabs.push(fileNode);
    }
    return fileNode;
  }

  async removeUniqueFile(uri){
    let fileNode = await this.getAndSave(uri);
    let tab = this.tabs.filter(tab => tab.uri === fileNode.uri);
    if (tab.length > 0){
      this.tabs = this.tabs.filter(tab => tab.uri !== uri);
    }
  }
}




module.exports = AtomController
