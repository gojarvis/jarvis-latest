let heartbeats = require('heartbeats');
let _ = require('lodash');
let watson = require('watson-developer-cloud');
let r = require('rethinkdb');
let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let Meta = require('./metadataManager')
let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

// var db = Thinky();
class contextManager{
  constructor(history, userInfo){

    var db = global.thinky;
    var type = db.type;

    let User = db.createModel("User", {
      id: type.string(),
      username: type.string(),
    }, { pk: "username"})


    this.user = {};
    this.urls = [];
    this.urlsArtifacts = [];
    this.tabs = [];
    this.files = [];
    this.activeUrl = {};
    this.heart = heartbeats.createHeart(1000);
    this.slowHeart = heartbeats.createHeart(1000);
    this.history = history;
    this.recommendations = [];
    this.initContext(userInfo);
  }

  async initContext(userInfo){
    let user
    try{
        user = await this.setUser(userInfo);
        this.user = user;

        this.metadata = new Meta(this.user);

        this.heart.createEvent(30, function(heartbeat, last){
          this.handleHeartbeat(heartbeat);
        }.bind(this));

        this.slowHeart.createEvent(300, function(heartbeat, last){

        }.bind(this));

        return user;
    }
    catch(err){
      console.error('cannot initialize context',err);
    }



  }

  async setUser(user){
    let graphUser = await graphUtil.getSaveUserInGraph(user)

    this.user = graphUser;
    console.log('User assigned to context', this.user);
    return graphUser
  }

  handleHeartbeat(heartbeat){
    this.saveContext();
  }

  handleSlowHeartbeat(heartbeat){
    this.history.saveEvent({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls} }).then(function(res){})
  }

  addFileNode(fileNode){
    let file = this.files.filter(file => file.address === fileNode.address);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  async updateUserActivity(){
    console.log('updateUserActivity');
    let activeUrlDetails = this.getActiveUrl();
    let urlNode;

    try {
      urlNode  = await graphUtil.getAndSaveUrlNode(activeUrlDetails);
      console.log('updateUserActivity - ACTIVE URL', urlNode);
      let rel = graphUtil.relateNodes(this.user, urlNode, 'touched');



    } catch (e) {
      console.log('cant updateUserActivity', e);
    } finally {
      return urlNode;
    }
    //Mark URL as touched

  }

  updateTabs(tabs){
    let urlsArtifacts = tabs.map(tab => {
      return {
        url: tab.url,
        title: tab.title
      }
    })
    this.urlsArtifacts = urlsArtifacts;
    // console.log('updated tabs', this.urlsArtifacts);
  }

  async setActiveUrl(url){
    this.activeUrl = url;
    let activeUrlNode;
    try {
      activeUrlNode = await this.updateUserActivity();
    } catch (e) {
      console.log('cant set active url', );
    } finally {
      return activeUrlNode;
    }

  }

  getActiveUrl(){
    return this.activeUrl;
  }

  async relateUrlsToFiles(urls, files){
    let urlToFiles = await Promise.all(urls.map(url => graphUtil.relateOneToMany(url, files, 'openwith')));
    let filesToUrls = await Promise.all(files.map(file => graphUtil.relateOneToMany(file, urls, 'openwith')));
  }

  async relateUrlsToUrls(urls){
    //This will create a relationship with each URL and evrey url in the same context (including itself, TODO: Fix that)
    // console.log("relateUrlsToUrls");
    //TODO: otherUrls = > filter url from urls

    let urlToUrlsRelationships =[];
    try{
      urlToUrlsRelationships = await Promise.all(urls.map(url => this.relateUrlToOthers(url, urls)));
    }
    catch(e){
      console.log('error relating urls to urls', e);
    }
    finally{
      return urlToUrlsRelationships;
    }

  }

  async relateUrlToUrls(url, urls){
    let others = urls.filter(item => item.address !== url.address);
    let singleRelationships = await this.graph.relateOneToMany(url, others, 'openwith');
    return singleRelationships;
  }

  async relateUrlToOthers(url, urls){
    let others = urls.filter(node => node.id !== url.id);
    let innerUrlToUrlsRelationships = [];
    try{
      innerUrlToUrlsRelationships = await Promise.all(urls.map(url => graphUtil.relateOneToMany(url, others, 'openwith')));
    }
    catch(e){
      console.log(err);
    }
    finally{
      return innerUrlToUrlsRelationships
    }
  }

  async relateFileToFiles(file, files){
    let others = files.filter(file => file.address !== file.address);
    let singleRelationships = await graphUtil.relateOneToMany(file, others, 'openwith');
    return singleRelationships;
  }

  async relateUserToContext(){
    let self = this;
    // console.log(this.user);
    if (_.isUndefined(this.user.id)){
      console.log('User not set yet, cannot relate user to context');
      return;
    }


    if (!_.isEmpty(this.urls)){
      let userToUrls = await graphUtil.relateOneToMany(this.user, this.urls, 'touched')
      // console.log('associated user with ', this.urls.length, 'urls');
    }
    else{
      // console.log('no urls to associate');
    }

    if (!_.isEmpty(this.files)){
      // console.log('assoc files', this.files);
      let userToFiles = await graphUtil.relateOneToMany(this.user, this.files, 'touched')
      // console.log('associated user with ', this.files.length, 'files');

    }
    else{
      // console.log('no files to associate');
    }
  }

  async saveContext(){
    let self = this;
    //Save URL nodes
    try {
      let urlsArtifacts = this.urlsArtifacts;
      let files = this.files;
      // console.log('FILES', files.length);
      // console.log('urlsArtifacts',urlsArtifacts);
      let urls = await Promise.all(urlsArtifacts.map(urlsArtifact => graphUtil.saveUrl(urlsArtifact.url, urlsArtifact.title)))
      // console.log('saved urls', urls.length);
      this.urls = urls;

      if (files.length > 0 ){
        this.relateUrlsToFiles(urls, files);
      }
      let urlsRels = await this.relateUrlsToUrls(urls);

      this.relateUserToContext();

      //TODO: Looks like this is partially done on "saveContext. remove duplication"
      this.relateContextToItself();

    } catch (e) {
      console.error('something went wrong when creating a context', e);
    } finally {

    }
  }

  //TODO: Moved this from "proactive.js", should be unified with saveContext
  async relateContextToItself(){
      try{
        let urls = this.urls;
        let files = this.files;
        // console.log(urls);
        if (urls.length > 0) {
          let urlRelationships = Promise.all(urls.map(url => this.relateUrlToUrls(url,urls)))

          let keywords = await Promise.all(urls.map(url => this.metadata.getSetKeywordsForUrl(url)));
        }

        if (files.length > 0){
          let fileRelationships = Promise.all(files.map(file => this.relateFileToFiles(file, files, 'openwith')));
        }

        if (files.length > 0 && urls.length > 0){
          let fileRelationships = Promise.all(files.map(file => graphUtil.relateOneToMany(file, urls, 'openwith')));
        }

      }
      catch(err){
        console.log('bad deep', err);
      }
  }


}

module.exports = contextManager;
