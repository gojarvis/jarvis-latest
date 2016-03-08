'use strict'
import heartbeats from 'heartbeats'
import Thinky from 'thinky'
import _ from 'lodash';
import watson from 'watson-developer-cloud';
// import r from 'rethinkdb'
var db = Thinky();
var type = db.type;

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa',
  server: 'http://45.55.36.193:7474'
});

// let connection = null;
// r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
//     if (err) throw err;
//     connection = conn;
// })

let User = db.createModel("User", {
  id: type.string(),
  username: type.string(),
}, { pk: "username"})


graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});
graph.constraints.uniqueness.create('User', 'username', function(err, constraint) {});

class contextManager{
  constructor(history, userInfo, socket, io){
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
    this.socket = socket;
    this.io = io;
    this.initContext(userInfo)

  }

  async initContext(userInfo){
    let user
    try{
        user = await this.setUser(userInfo);
        this.user = user;

        this.heart.createEvent(10, (heartbeat, last) => {
          this.handleHeartbeat(heartbeat)
        });

        this.io.to('main').emit('console', 'Context initialized');
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

  set(field, value){
    this[field]  = value;
  }

  async setUser(user){
    let graphUser = await this.getSaveUserInGraph(user)

    this.user = graphUser;
    console.log('this.user', this.user);
    return graphUser
  }

  getSaveUserInGraph(user){
    return new Promise(function(resolve, reject) {
      graph.find(user, function(err, node){
        if (err){
          console.log('user doesnt exist, saving', user);
          graph.save(user, "User", function(err, node){
            if (err){
              console.log('CANT SAVE USER', user, err);
              reject(err);
            }
            else{
              console.log('USER SAVED', node, node[0]);
              resolve(node[0]);
            }
          })
        }
        else{
          console.log('user found')
          resolve(node[0])
        }
      })

    });
  }

  saveUserInRethink(userInfo){
    return new Promise(function(resolve, reject) {
       let user = new User(userInfo);
       user.save().then(function(err,res){
        //  console.log(err,res);
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
    // console.log('context updated files', this.files);
  }

  addFileNode(fileNode){
    // console.log('adding file to context', fileNode);
    let file = this.files.filter(file => file.uri === fileNode.uri);
    // console.log('file',file.length);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  async updateActivity(){
    let activeUrl = this.getActiveUrl();
    let urlNode = await this.getUrlNodeByUrl(activeUrl.url);



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

    this.updateActivity();
  }

  getActiveUrl(){
    return this.activeUrl;
  }

  async relateUrlsToFiles(){
    // console.log(this.urls,this.files)
    let urlToFiles = await Promise.all(this.urls.map(url => this.relateOneToMany(url, this.files, 'openwith')));
    let filesToUrls = await Promise.all(this.files.map(file => this.relateOneToMany(file, this.urls, 'openwith')));

    console.log('related stuff', this.files.length, this.urls.length);
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

    // process.stdout.write('-');
    this.socket.emit('heartbeat');
    this.saveContext();
  }

  handleSlowHeartbeat(heartbeat){
    this.history.saveEvent({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls} }).then(function(res){})
  }

  async saveContext(){
    let self = this;
    try {
      let urlsArtifacts = this.urlsArtifacts;
      let files = this.files;

      let urls = await Promise.all(urlsArtifacts.map(urlsArtifact => self.saveUrl(urlsArtifact.url, urlsArtifact.title)))
      this.urls = urls;
    } catch (e) {
      console.error('something went wrong when creating a context', e);
    } finally {

    }

    if (this.files.length > 0 ){
      this.relateUrlsToFiles(urls, files);
    }
    this.relateUserToContext();
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
      let cypher = 'START a=node('+origin.id+'), b=node('+target.id+') '
                  +'CREATE UNIQUE a-[r:'+relationship+']-b '
                  +'SET r.weight = coalesce(r.weight, 0) + 1';

      // console.log('failed', err, cypher);
    }

    return res
  }

  //Creates a bi-directional relationship between nodes
  async associateNodes(origin, target, relationship){
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'CREATE UNIQUE a<-[r:'+relationship+']->b '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      let cypher = 'START a=node('+origin.id+'), b=node('+target.id+') '
                  +'CREATE UNIQUE a-[r:'+relationship+']-b '
                  +'SET r.weight = coalesce(r.weight, 0) + 1';

      // console.log('failed', err, cypher);
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
      graph.query('MATCH (n:Url) RETURN count(n)', function(err, result){
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
            graph.save({type: 'url', url: url, keywords: '', title: title}, 'Url', function(err, result){
              console.log(err, result);
              node = result;

              resolve(node);

            });
          } catch (e) {
            console.log('url probably exist', e);


          } finally {

          }
        }

      });

    });
  }

  getUrl(url){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', url: url}, function(err, node){
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
