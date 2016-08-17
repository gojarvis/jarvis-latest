let heartbeats = require('heartbeats')
let _ = require('lodash')
let watson = require('watson-developer-cloud')
let r = require('rethinkdb')
let config = require('config')
let GraphUtil = require('../utils/graph')
let graphUtil = new GraphUtil();

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

    graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {
      // console.log(constraint);
      // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
    });
    graph.constraints.uniqueness.create('User', 'username', function(err, constraint) {});

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
        console.log('USER', user);

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

  get() {
    return {
      urls: this.urls,
      files: this.files,
      user: this.user,
      recommendations: []
    }
  }

  async setUser(user){
    let graphUser = await graphUtil.getSaveUserInGraph(user)

    this.user = graphUser;
    console.log('this.user', this.user);
    return graphUser
  }

  saveUserInRethink(userInfo){
    return new Promise(function(resolve, reject) {
       let user = new User(userInfo);
       user.save().then(function(err,res){
         if (err) {
           User.get(userInfo).then(function(err,res){
             if (err){
               console.log('cant get', err)
             }
             else{
               resolve(res);
             }
           })
         }
         else resolve(res);
       });
    });
  }

  updateFiles(files){
    this.files = files;
    console.log('context updated files', this.files);
  }

  addFileNode(fileNode){
    let file = this.files.filter(file => file.address === fileNode.address);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  async updateUserActivity(){

    let activeUrl = this.getActiveUrl();
    let urlNode = await this.getUrlNodeByUrl(activeUrl.url);

    //Mark URL as touched
    let rel = this.relateNodes(this.user, urlNode, 'touched');

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

  setActiveUrl(url){
    this.activeUrl = url;


    this.updateUserActivity();
  }

  getActiveUrl(){
    return this.activeUrl;
  }

  async relateUrlsToFiles(urls, files){
    // console.log('relateUrlsToFiles', urls,files);
    let urlToFiles = await Promise.all(urls.map(url => this.relateOneToMany(url, files, 'openwith')));
    let filesToUrls = await Promise.all(files.map(file => this.relateOneToMany(file, urls, 'openwith')));

    // console.log('related stuff', files.length, urls.length);
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

    // _.forEach(urls, async function(url){
    //   let others = urls.filter(node => node.id !== url.id);
    //   console.log('RUU-------->', url.title, others);
    //   let urlToUrlsRelationships = await Promise.all(urls.map(url => this.relateOneToMany(url, others, 'openwith')));
    //   relationships.push(urlToUrlsRelationships);
    //
    // }.bind(this));


    // console.log('related urls', urls);
  }

  async relateUrlToOthers(url, urls){
    let others = urls.filter(node => node.id !== url.id);
    let innerUrlToUrlsRelationships = [];
    try{
      innerUrlToUrlsRelationships = await Promise.all(urls.map(url => this.relateOneToMany(url, others, 'openwith')));
    }
    catch(e){
      console.log(err);
    }
    finally{
      return innerUrlToUrlsRelationships
    }
  }


  async relateUserToContext(){
    let self = this;
    // console.log(this.user);
    if (_.isUndefined(this.user.id)){
      console.log('User not set yet, cannot relate user to context');
      return;
    }


    if (!_.isEmpty(this.urls)){
      let userToUrls = await this.relateOneToMany(this.user, this.urls, 'touched')
      // console.log('associated user with ', this.urls.length, 'urls');
    }
    else{
      // console.log('no urls to associate');
    }

    if (!_.isEmpty(this.files)){
      // console.log('assoc files', this.files);
      let userToFiles = await this.relateOneToMany(this.user, this.files, 'touched')
      // console.log('associated user with ', this.files.length, 'files');

    }
    else{
      // console.log('no files to associate');
    }
  }

  handleHeartbeat(heartbeat){
    // process.stdout.write('-*-');
    this.saveContext();
  }

  handleSlowHeartbeat(heartbeat){
    this.history.saveEvent({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls} }).then(function(res){})
  }

  async saveContext(){
    let self = this;
    //Save URL nodes
    try {
      let urlsArtifacts = this.urlsArtifacts;
      let files = this.files;
      // console.log('FILES', files.length);
      // console.log('urlsArtifacts',urlsArtifacts);
      let urls = await Promise.all(urlsArtifacts.map(urlsArtifact => self.saveUrl(urlsArtifact.url, urlsArtifact.title)))
      // console.log('saved urls', urls.length);
      this.urls = urls;

      if (files.length > 0 ){
        this.relateUrlsToFiles(urls, files);
      }
      let urlsRels = await this.relateUrlsToUrls(urls);

      this.relateUserToContext();

    } catch (e) {
      console.error('something went wrong when creating a context', e);
    } finally {

    }


  }

  async relateOneToMany(origin, others, relationship){
    let relationships = [];
    try {
      relationships = await Promise.all(others.map(target => this.relateNodes(origin, target, relationship)));
      return relationships;
    }
    catch(err){
      console.log('failed to relate one to many', err);
    }
    finally{

      return relationships;
    }


  }

  async relateNodes(origin, target, relationship){
    // console.log('RELATE NODES', origin, target);
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'MERGE (a)-[r:'+relationship+']->(b) '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};
    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      let cypher = 'START a=node('+origin.id+'), b=node('+target.id+') '
                  +'MERGE (a)-[r:'+relationship+']->(b) '
                  +'SET r.weight = coalesce(r.weight, 0) + 1';

      console.log('context manager failed relateNodes');
    }

    return res
  }

  //Creates a bi-directional relationship between nodes
  async associateNodes(origin, target, relationship){
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'MERGE (a)-[r:'+relationship+']->(b) '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      let cypher = 'START a=node('+origin.id+'), b=node('+target.id+') '
                  +'MERGE (a)-[r:'+relationship+']->(b) '
                  +'SET r.weight = coalesce(r.weight, 0) + 1';

      console.log('context manager failed associateNodes');
    }

    return res
  }

  queryGraph(cypher, params){

    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) {
          console.log('err', err);
          reject(err)
        }
        else resolve(result)
      });
    });
  }

  getUrlCount(){
    return new Promise(function(resolve, reject) {
      graph.query('MATCH (n:Url) RETURN count(n)', function(err, result){
        if (err) reject(err)
      });
    });
  }

  getFileCount(){
    return new Promise(function(resolve, reject) {
      graph.query('MATCH (n:File) RETURN count(n)', function(err, result){
        if (err) reject(err)
      });
    });
  }

  saveUrl(url, title){
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getUrl(url).then(function(result){
        let node = result;
        if (!_.isUndefined(node)){
          resolve(node)
        }
        else{
          try {
            graph.save({type: 'url', address: url, keywords: '', title: title}, 'Url', function(err, result){
              // console.log(err, result);
              if (err) {
                try {
                  self.getUrl(url).then(function(result){
                    node = result;
                    console.log('already existed', node);
                    resolve(node)
                  })
                } catch (e) {
                    console.log('cant get or save url', e);
                } finally {

                }
                // console.log('Cant save node', err);
                // reject(err);
              }
              else{
                node = result;
                console.log('SAVED URL', result);
                resolve(node);
              }

            });
          } catch (e) {
            console.log('url probably exist', e);
          }
        }

      });

    });
  }

  getUrl(url){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', address: url}, function(err, node){
        node = node ? node[0] : false;
        if (err) reject(err)
        else {
          resolve(node);
        }
      });
    });
  }

}

module.exports = contextManager;
