let Redis = require('ioredis');
let serialize = require('serialization');
let model = require('seraph-model');
let Promise = require('bluebird');
let PouchDB = require('pouchdb');
let _ = require('lodash');
let keywordExtractor = require('keyword-extractor');
let MetaInspector = require('node-metainspector');
let config = require('config');

let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;

let graphAsync = Promise.promisifyAll(graph);

graph.constraints.uniqueness.create('File', 'address', function(err, constraint) {});

class AtomController {
  constructor(socket, sid,io, context, history){
    this.redis = new Redis();
    this.socket = socket;
    this.registerEvents();
    this.tabs = [];
    this.activeTab = {};
    this.sid = sid;
    this.io = io;
    this.context = context;
    this.history = history;
  }

  registerEvents(){
    // console.log('atom-online');
    var self = this;

    // self.socket.on('atom-open', function(msg){
    //   console.log('atom-open', msg);
    // });


    self.socket.on('atom-connected', function(){
      console.log('atom-connected', self.socket.id);
    });

    self.socket.on('atom-highlighted', function(msg){
      // console.log('highlight');
      let address = msg.uri;
      self.handleFileHighlighted(address).then(function(related){
        self.io.emit('related-files', related);
      });
    })
  }

  async saveSession(tabs){
    let graphNodes = [];
    this.tabs = tabs;
    try {
      graphNodes = await Promise.all(tabs.map(tab => this.saveFile(tab.uri)));
      if (graphNodes.length > 0){

      }
    }
    catch(err) {
      //already exists
      graphNodes = await Promise.all(tabs.map(tab => this.getFile(tab.uri)));
    }

    this.urls = graphNodes;

    let relationshipsTop = await Promise.all(graphNodes.map(node =>{
      let origin = node;
      let others = graphNodes.filter(node => node.id !== origin.id);
      let relationship = 'openwith';
      return this.relateOneToMany(origin,others,relationship)
    }));
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
                +'MERGE (a)-[r:'+relationship+']-(b) '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      console.log('failed to relate', err, params);
    }

    return res
  }

  // async getRelated(uri, threshold){
  //   let cypher = 'MATCH (n:File)-[r:openwith]->(q) WHERE n.uri = "' + uri +'" RETURN r ';
  //   console.log(cypher);
  //   let params = {uri: uri, threshold: threshold};
  //
  //   try{
  //     let res = await this.queryGraph(cypher,params);
  //     return res;
  //   }
  //   catch(err){
  //     // console.log('failed to relate', err);
  //   }
  // }


  queryGraph(cypher, params){
    console.log('QUERY ATOM', cypher);
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  saveFile(address){
    let self = this;
    let trimmedAddress = address.replace(projectsPath, '');
    // console.log('TRIMMED ADDRESS', trimmedAddress);
    return new Promise(function(resolve, reject) {
      graph.save({type: 'file', address: trimmedAddress}, 'File', function(err, node){
        node = node ? node : {type: 'file', address: address};
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

  getFile(address){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'file', address: address}, function(err, node){
        node = node ? node[0] : {type: 'file', address: address};
        if (err) reject(err)
        else {
          resolve(node);
        }
      });
    });
  }

  async getAndSave(address){
    let self = this;
    let fileNode = await self.getFile(address);
    if(!fileNode){
      console.log('saving');
      fileNode = await self.saveFile(address);
    }
    return fileNode

  }

  async handleFileHighlighted(address){
    // console.log('ADDRESS', address);
    let fileNode = await this.insertUniqueFile(address)
    let otherNodes = this.tabs.filter(tab => tab.id !== fileNode.id);
    let rel = await this.relateOneToMany(fileNode, otherNodes, 'openwith');
    // console.log('done relating', this.socket);
    this.context.addFileNode(fileNode);

    let relatedFiles = await this.getRelatedFiles(address, 3);
    let relatedUrls = await this.getRelatedUrls(address, 3);

    let relatedFilesNodes = await Promise.all(relatedFiles.map(relation => this.getNodeById(relation.end)))
    let relatedUrlNodes = await Promise.all(relatedUrls.map(relation => this.getNodeById(relation.end)))


    let related = _.union(relatedFilesNodes,relatedUrlNodes)
    // let relatedFilesFix = relatedFiles.map(item => {
    //   // console.log(_.lodash(item.address.split("/")));
    //   // console.log(item);
    //
    // });

    this.history.saveEvent({type: 'highlighted', source: 'atom', data: { nodeId: fileNode.id, address: address} }).then(function(res){
      // console.log('highlighted atom saved');
    });

    return related

  }

  async getRelatedUrls(address, threshold){
    let cypher = 'MATCH (n:File)-[r:openwith]->(q:Url) WHERE n.address = "' + address +'" AND r.weight > ' + threshold +'  RETURN r ORDER BY r.weight DESC LIMIT 4';
    let params = {address: address, threshold: threshold};

    try{
      let res = await this.queryGraph(cypher,params);

      return res;
    }
    catch(err){
      // console.log('failed to relate', err);
    }
  }

  async getRelatedFiles(address, threshold){
    let cypher = 'MATCH (n:File)-[r:openwith]->(q:File) WHERE n.address = "' + address +'" AND r.weight > ' + threshold +'  RETURN r ORDER BY r.weight DESC LIMIT 6';
    let params = {address: address, threshold: threshold};

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

  getNodeById(id){
    return new Promise(function(resolve, reject) {
      graph.read(id, function(err,node){
        node = node ? node : {}
        if (err) {
          console.log('Cant getNodeById', id);
          reject(err)
        }
        else resolve(node);
      })
    });
  }

  async handleFileObserved(address){
    let fileNode = await this.insertUniqueFile(address)
    // console.log(fileNode);
    this.context.addFileNode(address);
  }

  async handleFileOpen(address){
    let fileNode = await this.insertUniqueFile(address);
    // console.log(fileNode);
    this.context.addFileNode(fileNode);
  }

  async handleFileClose(address){
    // console.log('close',address)
    this.removeUniqueFile(address);
  }

  async insertUniqueFile(address){
    let trimmedAddress = address.replace(projectsPath, '');
    let fileNode = await this.getAndSave(trimmedAddress);
    // console.log("found", fileNode.address);
    let tab = this.tabs.filter(tab => tab.address === fileNode.address);
    if (tab.length == 0){

      this.tabs.push(fileNode);
    }
    return fileNode;
  }

  async removeUniqueFile(address){
    let fileNode = await this.getAndSave(address);
    let tab = this.tabs.filter(tab => tab.address === fileNode.address);
    if (tab.length > 0){
      this.tabs = this.tabs.filter(tab => tab.address !== address);
    }
  }
}




module.exports = AtomController
