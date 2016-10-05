let heartbeats = require('heartbeats');
let _ = require('lodash');
let watson = require('watson-developer-cloud');
let thinky = require('../utils/rethink');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let keywordsManager = require('./keywordsManager');
let settingsManager = require('../utils/settings-manager');
let moment = require('moment');
let ReportsController = require('./reports');


class contextManager{
  constructor(history, userInfo, socket, io){

    var db = require('../utils/rethink')
    var type = db.type;

    let User = db.createModel("User", {
      id: type.string(),
      username: type.string(),
    }, { pk: "username"})

    this.socket = socket;
    this.io = io;
    this.user = {};
    this.urls = [];
    this.urlsArtifacts = [];
    this.tabs = [];
    this.commands = [];
    this.files = [];
    this.temporalContext = [];
    this.activeUrl = {};
    this.heart = heartbeats.createHeart(1000);
    this.slowHeart = heartbeats.createHeart(1000);
    this.history = history;
    this.recommendations = [];
    this.lastActiveTimestamp = new Date();


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

        this.slowHeart.createEvent(120, function(heartbeat, last){
          this.handleSlowHeartbeat(heartbeat)
        }.bind(this));


        this.getAndEmitContextUpdates();

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
    this.getAndEmitContextUpdates();

  }

  async handleSlowHeartbeat(heartbeat){
    // this.history.saveContext({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls, commands: this.commands}, timestamp: new Date()  }).then(function(res){})
    // console.log('slow');
    let context = this.temporalContext;
    let modifiers = this.modifiers;

    let user = this.user;

    let allReports = await ReportsController.getAllReports(context, user, modifiers);
    // console.log('All reports', allReports);
    this.io.emit('reports', {
      'reports': allReports
    })
  }

  async getAndEmitContextUpdates(){
    let contextBucktededByHour, globalWeightFactors;
    try {
      contextBucktededByHour = await this.getContextNodesBucketedByHour();
      let nodesArr = contextBucktededByHour.map(item => {
        // console.log('item', item);
        return item.data.id;
      });

      // console.log('Nodes in context', nodesArr);

      globalWeightFactors = await this.getUserGlobalWeightFactors();

      this.io.emit('context-analysis-update', {
        temporalContext: contextBucktededByHour,
        modifiers: globalWeightFactors
      })

      this.updateModifiers(globalWeightFactors[0]);
      this.updateTemporalContext(contextBucktededByHour);

    } catch (e) {
      console.log('cant getAndEmitContextUpdates', e);
    } finally {

    }

  }

  async getUserGlobalWeightFactors(){
    let user = this.user;
    let weights = await graphUtil.getUserGlobalWeightFactors(user);
    return weights;
  }

  async updateModifiers(modifiers){
    this.modifiers = modifiers;
  }

  async updateTemporalContext(temporalContext){
    this.temporalContext = temporalContext;
  }

  async getContextNodesBucketedByHour(){
    let nodeIdsByHours = await this.getContextNodeIdsBucktedByHour();
    let nodes;
    try {
      nodes = await Promise.all(nodeIdsByHours.map( item => this.getBucketedNodeById(item)));
      nodes = nodes.filter(item => !_.isEmpty(item))

      nodes = nodes.filter(item => {
        if (item.data.type !== 'keyword') return true;
        else return false;
      })
    } catch (e) {
      // console.log('cant getContextNodeIdsBucktedByHour', e);
    } finally {
      // console.log('NODES', nodes);
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
      // console.log('cant getBucketedNodeById, it probably doesnt exist');
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
          var eventDayHour = r.add(event('timestamp').dayOfYear().mul(24), event('timestamp').hours());
          var nowDayHour = r.add(r.now().dayOfYear().mul(24), r.now().hours());

           return event.hasFields('data')
             .and(event('data').hasFields('address'))
             .and(event('user').eq(username))
             .and(event('source').ne("context"))
             .and(eventDayHour.ge(nowDayHour.sub(numberOfHoursToAggregate)))
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
      .orderBy(r.desc('dayHour')).concatMap(function(row){
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

  clearContext(){
    this.tabs = [];
    this.commands = [];
    this.files = [];
  }

  updateActiveTimestamp(){
    this.lastActiveTimestamp = new Date();
  }

  addFileNode(fileNode){
    let file = this.files.filter(file => file.address === fileNode.address);
    if (file.length === 0){
      this.files.push(fileNode);
    }

    this.updateActiveTimestamp();
  }

  removeFileNode(fileNode){
    let filteredFiles = this.files.filter(file => {
      return file.address !== fileNode.address
    });
    this.files = filteredFiles;

    this.updateActiveTimestamp();
  }

  addUrlNode(urlNode){
    let url = this.urls.filter(url => url.address === urlNode.address);
    if (url.length === 0){
      this.urls.push(urlNode);
    }

    this.updateActiveTimestamp();
  }

  removeUrlNode(urlNode){
    let filteredUrls = this.urls.filter(url => {
      return url.address !== urlNode.address
    });
    this.urls = filteredUrls;

    this.updateActiveTimestamp();
  }

  removeTab(tabs){
    this.updateTabs(tabs)
  }

  addCommandNode(commandNode){

    let command = this.commands.filter(command => command.address === commandNode.address);
    if (command.length === 0){
      this.commands.push(commandNode);
    }

    this.updateActiveTimestamp();
  }

  async updateUserActivity(){
    let activeUrlDetails = this.getActiveUrl();
    let urlNode;

    try {
      urlNode  = await graphUtil.getAndSaveUrlNode(activeUrlDetails);
      this.addUrlNode(urlNode);
      let rel = graphUtil.relateNodes(this.user, urlNode, 'touched');
      let kw = await keywordsManager.fetchKeywordsForUrlFromAlchemy(urlNode);

    } catch (e) {
      console.log('cant updateUserActivity', e);
    } finally {
      return urlNode;
    }
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

  async relateUrlToUrls(url, urls){
    let others = urls.filter(item => item.address !== url.address);
    let queries = await graphUtil.getRelateOneToManyQueries(url, others, 'openwith');
    return queries;
  }

  async relateFileToFiles(file, files){
    let others = files.filter(filterFile => file.address !== filterFile.address);
    let queries = await graphUtil.getRelateOneToManyQueries(file, others, 'openwith');
    return queries;
  }

  async relateCommandToCommands(command, commands){
    let others = commands.filter(item => item.address !== command.address);
    let queries = await graphUtil.getRelateOneToManyQueries(command, others, 'openwith');
    return queries;
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

    let now = new Date();
    let end = moment(now);
    let lastActive = moment(this.lastActiveTimestamp);
    let duration = moment.duration(end.diff(lastActive));

    if (duration.asMinutes() > 2){
      console.log('Not active, time since last activity:', duration.asMinutes());
      this.clearContext();
      return;
    }

    try {
      let urlsArtifacts = this.urlsArtifacts;
      let files = this.files;
      let urls = await Promise.all(urlsArtifacts.map(urlsArtifact => graphUtil.saveUrl(urlsArtifact.url, urlsArtifact.title)))
      this.urls = urls;
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
      console.log('Relating context to itself');
      try{
        let urls = this.urls;
        let files = this.files;

        let commands = this.commands;
        let queries = [];
        // console.log('CONTEXT', urls.map(url => { return url.address}).join(','), '|', files.map(file => { return file.address}).join(','));
        console.log('CONTEXT', urls.length, files.length, commands.length);

        if (urls.length > 0) {
          let urlRelationshipsQueries = await Promise.all(urls.map(url => this.relateUrlToUrls(url,urls)))
          queries = queries.concat(urlRelationshipsQueries);
        }

        if (files.length > 0){
          let fileRelationshipsQueries = await Promise.all(files.map(file => this.relateFileToFiles(file, files, 'openwith')));
          queries = queries.concat(fileRelationshipsQueries);
        }

        if (commands.length > 0){
          let commandInternalRelationshipsQueries = await Promise.all(commands.map(command => this.relateCommandToCommands(command, commands, 'openwith')));
          queries = queries.concat(commandInternalRelationshipsQueries);
        }

        if (files.length > 0 && urls.length > 0){
          let filesToUrlsRelationshipsQueries = await Promise.all(files.map(file => graphUtil.getRelateOneToManyQueries(file, urls, 'openwith')));
          queries = queries.concat(filesToUrlsRelationshipsQueries);

          let urlsToFilesRelationshipsQueries = await Promise.all(urls.map(url => graphUtil.getRelateOneToManyQueries(url, files, 'openwith')));
          queries = queries.concat(urlsToFilesRelationshipsQueries);
        }

        if (commands.length > 0 && files.length > 0){

          let commandToFilesRelationshipsQueries = await Promise.all(commands.map(command => graphUtil.getRelateOneToManyQueries(command, files, 'openwith')));
          let filesToCommandsRelationshipsQueries = await Promise.all(files.map(file => graphUtil.getRelateOneToManyQueries(file, commands, 'openwith')));
          queries = queries.concat(commandToFilesRelationshipsQueries);
          queries = queries.concat(filesToCommandsRelationshipsQueries);
        }

        if (commands.length > 0 && urls.length > 0){
          let commandToUrlsRelationshipsQueries = await Promise.all(commands.map(command => graphUtil.getRelateOneToManyQueries(command, urls, 'openwith')));
          let urlsToCommandsRelationshipsQueries = await Promise.all(urls.map(url => graphUtil.getRelateOneToManyQueries(url, commands, 'openwith')));
          queries = queries.concat(commandToUrlsRelationshipsQueries);
          queries = queries.concat(urlsToCommandsRelationshipsQueries);
        }



        let allQueries = [].concat.apply([], queries);


        let results = await graphUtil.executeQueries(allQueries);
        // console.log('Results', results);
        console.log('Context relation queries', results.length, '/', allQueries.length);
      }
      catch(err){
        console.log('cant relateContextToItself', err);
      }
  }


}

module.exports = contextManager;
