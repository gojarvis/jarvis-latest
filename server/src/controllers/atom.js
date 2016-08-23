//TODO: Not sure why we're using bluebird here
let Promise = require('bluebird');
let _ = require('lodash');

let config = require('config');


let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();

//TODO: Projects path
let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;



class AtomController {
  constructor(socket,io, context, history){
    this.socket = socket;
    this.registerEvents();
    this.tabs = [];
    this.activeTab = {};
    this.io = io;
    this.context = context;
    this.history = history;
  }

  registerEvents(){
    var self = this;

    self.socket.on('atom-connected', function(){
      console.log('atom-connected', self.socket.id);
    });

    self.socket.on('atom-highlighted', function(msg){
      // console.log('highlight');
      let address = msg.uri;
      self.handleFileHighlighted(address).then(function(related){

      });
    })
  }

  async saveSession(tabs){
    let graphNodes = [];
    this.tabs = tabs;
    try {
      graphNodes = await Promise.all(tabs.map(tab => graphUtil.saveFile(tab.uri)));
      if (graphNodes.length > 0){

      }
    }
    catch(err) {
      //already exists
      graphNodes = await Promise.all(tabs.map(tab => graphUtil.getFile(tab.uri)));
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
      relationships = await Promise.all(others.map(target => graphUtil.relateNodes(origin, target, relationship)));
    }
    catch(err){
      console.log('failed to relate one to many', err);
    }

    return relationships;
  }

  async getAndSave(address){
    let self = this;
    let fileNode = await graphUtil.getFile(address);
    if(!fileNode){
      console.log('saving');
      fileNode = await graphUtil.saveFile(address);
    }
    return fileNode

  }

  async handleFileHighlighted(address){
    // console.log('ADDRESS', address);
    let fileNode = await this.insertUniqueFile(address)
    let otherNodes = this.tabs.filter(tab => tab.id !== fileNode.id);
    let rel = await this.relateOneToMany(fileNode, otherNodes, 'openwith');

    this.context.addFileNode(fileNode);
    this.history.saveEvent({type: 'highlighted', source: 'atom', data: { nodeId: fileNode.id, address: address} }).then(function(res){
      // console.log('highlighted atom saved');
    });

    return rel

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
