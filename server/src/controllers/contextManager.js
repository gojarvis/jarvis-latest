let heartbeats = require('heartbeats');
let _ = require('lodash');
let watson = require('watson-developer-cloud');
let thinky = require('../utils/rethink');
let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let keywordsManager = require('./keywordsManager');
let settingsManager = require('../utils/settings-manager');

class contextManager{
  constructor(history, userInfo, socket, io){

    var db = require('../utils/rethink')
    var type = db.type;

    let User = db.createModel("User", {
      id: type.string(),
      username: type.string(),
    }, { pk: "username"})

    this.io = io;
    this.user = {};
    this.urls = [];
    this.urlsArtifacts = [];
    this.tabs = [];
    this.commands = [];
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


        this.heart.createEvent(30, function(heartbeat, last){
          this.handleHeartbeat(heartbeat);
        }.bind(this));

        this.slowHeart.createEvent(60, function(heartbeat, last){
          this.handleSlowHeartbeat(heartbeat)
        }.bind(this));

        // this.getAndEmitContextUpdates();

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

  getUser(){
    return this.user;
  }

  handleHeartbeat(heartbeat){
    this.saveContext();
    // this.getAndEmitContextUpdates();

  }

  async getAndEmitContextUpdates(){
    console.log('getAndEmitContextUpdates');
    let contextBucktededByHour, globalWeightFactors;
    try {
      contextBucktededByHour = await this.getContextNodesBucketedByHour();
      globalWeightFactors = await this.getGlobalWeightFactors();

      this.io.emit('context-analysis-update', {
        temporalContext: contextBucktededByHour,
        modifiers: globalWeightFactors[0]
      })
    } catch (e) {
      console.log('cant getAndEmitContextUpdates', e);
    } finally {

    }

  }


  async getGlobalWeightFactors(){
    let user = this.user;
    let cypher = `
        match (startUserNode:User)-[startUserRel_relationship:touched]->(startNode:Url)-[endUserRel_relationship:openwith]->(endNode:Url)
        match (startNode)-[globalOpen:openwith]->(endNode)
        where
        ID(startUserNode)=${user.id}
        with {
        	avgTouch: avg(startUserRel_relationship.weight) ,
        	maxTouch: max(startUserRel_relationship.weight),
        	stdevTouch: stdev(startUserRel_relationship.weight),

        	avgOpen: avg(endUserRel_relationship.weight),
        	maxOpen: max(endUserRel_relationship.weight),
        	stdevOpen: stdev(endUserRel_relationship.weight),

        	avgGlobalOpen: avg(globalOpen.weight),
        	maxGlobalOpen: max(globalOpen.weight),
        	stdevGlobalOpen: stdev(globalOpen.weight)
        } as data
        return data`;
    let globalWeightFactors;

    try {
      globalWeightFactors = await graphUtil.queryGraph(cypher);
    } catch (e) {
      console.log('cant getGlobalTouchWeightFactor', e);
    } finally {
      return globalWeightFactors
    }
  }



  async getContextNodesBucketedByHour(){
    let nodeIdsByHours = await this.getContextNodeIdsBucktedByHour();
    let nodes;
    try {
      nodes = await Promise.all(nodeIdsByHours.map( item => this.getBucketedNodeById(item)));
    } catch (e) {
      console.log('cant getContextNodeIdsBucktedByHour', e);
    } finally {
      return nodes;
    }
  }

  async getBucketedNodeById(item){

    let node = {};
    try{
      node.data = await graphUtil.getNodeById(item.nodeId)
      node.count = item.count;

    }
    catch(e){
      console.log('cant getBucketedNodeById', e);
    }
    finally{
      return node
    }
  }


  async getContextNodeIdsBucktedByHour(){
    let username = this.getUser().username;
    let r = thinky.r;
    let contextBucktededByHour;
    let numberOfHoursToAggregate;
    try {
      numberOfHoursToAggregate  = await settingsManager.getAggregationHoursValue() || 1;
      contextBucktededByHour =
        await r.table('Event').filter(function(event){
           return event.hasFields('data')
             .and(event('data').hasFields('address'))
             .and(event('user').eq(username))
             .and(event('source').ne("context"))
        })
        .map(function (row) {
        	return (
          	{
              day: row('timestamp').dayOfYear() ,
              hour: row('timestamp').hours() ,
              dayHour: r.add(row('timestamp').dayOfYear().mul(24), row('timestamp').hours()),
              address: row('data')('address'),
              nodeId:  row('data')('nodeId'),
              timestamp: row('timestamp'),
              source: row('source'),
              eventType: row('eventType'),
              id: row('id')
             }
            )
          }
        )
      .group('dayHour').ungroup().map(function(row){
          return (
            {
              dayHour: row('group'),
              items: row('reduction')
            }
          )
      })
      .orderBy(r.desc('dayHour')).limit(numberOfHoursToAggregate).concatMap(function(row){
        return row("items")
      })
      .group('nodeId').count().ungroup().orderBy(r.desc("reduction"))
      .map(function(row){
        return ({
          nodeId: row("group"),
          count: row("reduction")
        })
      })
      .limit(15)
      .run();
    } catch (e) {
      console.log('cant getContextNodeIdsBucktedByHour', e);
    } finally {
      return contextBucktededByHour
    }


  }

  handleSlowHeartbeat(heartbeat){
    this.history.saveContext({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls, commands: this.commands}, timestamp: new Date()  }).then(function(res){})
  }

  addFileNode(fileNode){
    let file = this.files.filter(file => file.address === fileNode.address);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  removeFileNode(fileNode){
    let filteredFiles = this.files.filter(file => {
      return file.address !== fileNode.address
    });
    this.files = filteredFiles;
  }

  removeTab(tabs){
    this.updateTabs(tabs)
  }

  addCommandNode(commandNode){

    let command = this.commands.filter(command => command.address === commandNode.address);
    if (command.length === 0){
      this.commands.push(commandNode);
    }
  }

  async updateUserActivity(){
    // console.log('updateUserActivity');
    let activeUrlDetails = this.getActiveUrl();
    let urlNode;

    try {
      urlNode  = await graphUtil.getAndSaveUrlNode(activeUrlDetails);
      let rel = graphUtil.relateNodes(this.user, urlNode, 'touched');

      let kw = await keywordsManager.fetchKeywordsForUrlFromAlchemy(urlNode);


    } catch (e) {
      console.log('cant updateUserActivity', e);
    } finally {
      return urlNode;
    }
    //Mark URL as touched

  }

  updateTabs(tabs){
    let urlsArtifacts = tabs.map(tab => {
      if (!_.isUndefined(tab)){
        return {
          url: tab.url,
          title: tab.title
        }
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
    let singleRelationships = await graphUtil.relateOneToMany(url, others, 'openwith');
    return singleRelationships;
  }

  async relateUrlToOthers(url, urls){
    let others = urls.filter(node => node.address !== url.address);
    let innerUrlToUrlsRelationships = [];
    try{
      innerUrlToUrlsRelationships = await Promise.all(urls.map(url => graphUtil.relateOneToMany(url, others, 'openwith')));
    }
    catch(e){
      console.log('error relating url to others',e);
    }
    finally{
      return innerUrlToUrlsRelationships
    }
  }

  async relateFileToFiles(file, files){
    let others = files.filter(filterFile => file.address !== filterFile.address);
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

    if (!_.isEmpty(this.commands)){
      let userToCommands = await graphUtil.relateOneToMany(this.user, this.commands, 'touched')

    }
    else{
      // console.log('no coomands to associate');
    }
  }

  clearCommandsContext(){
    this.commands = [];
  }

  async saveContext(){
    let self = this;
    //Save URL nodes
    try {
      let urlsArtifacts = this.urlsArtifacts;
      let files = this.files;
      let urls = await Promise.all(urlsArtifacts.map(urlsArtifact => graphUtil.saveUrl(urlsArtifact.url, urlsArtifact.title)))

      this.urls = urls;

      if (files.length > 0 ){
        this.relateUrlsToFiles(urls, files);
      }
      let urlsRels = await this.relateUrlsToUrls(urls);

      let userContext = await this.relateUserToContext();

      let relatedContext = await this.relateContextToItself();

      //Empty the commands buffer every heartbeat
      this.clearCommandsContext()

    } catch (e) {
      console.error('something went wrong when creating a context', e);
    } finally {

    }
  }

  //TODO: Moved this from "proactive.js", should be unified with saveContext
  async relateContextToItself(){
    // console.log('Relating context to itself');
      try{
        let urls = this.urls;
        let files = this.files;

        let commands = this.commands;
        // console.log('CONTEXT', urls.map(url => { return url.address}).join(','), '|', files.map(file => { return file.address}).join(','));
        console.log('CONTEXT', urls.length, files.length, commands.length);
        if (urls.length > 0) {
          let urlRelationships = Promise.all(urls.map(url => this.relateUrlToUrls(url,urls)))

        }

        if (files.length > 0){
          let fileRelationships = Promise.all(files.map(file => this.relateFileToFiles(file, files, 'openwith')));
        }

        if (files.length > 0 && urls.length > 0){
          let fileRelationships = Promise.all(files.map(file => graphUtil.relateOneToMany(file, urls, 'openwith')));
        }

        if (commands.length > 0 && files.length > 0){

          let commandToFilesRelationships = Promise.all(commands.map(command => graphUtil.relateOneToMany(command, files, 'openwith')));
          let filesToCommandsRelationships = Promise.all(files.map(file => graphUtil.relateOneToMany(file, commands, 'openwith')));
        }

        if (commands.length > 0 && urls.length > 0){
          let commandToUrlsRelationships = Promise.all(commands.map(command => graphUtil.relateOneToMany(command, urls, 'openwith')));
          let urlsToCommandsRelationships = Promise.all(urls.map(url => graphUtil.relateOneToMany(url, commands, 'openwith')));

        }

        if (commands.length > 0){
          let commandInternalRelationships = Promise.all(commands.map(command => graphUtil.relateOneToMany(command, commands, 'openwith')));
        }


      }
      catch(err){
        console.log('cant relateContextToItself', err);
      }
  }


}

module.exports = contextManager;
