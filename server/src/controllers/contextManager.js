import heartbeats from 'heartbeats'
import Thinky from 'thinky'

var db = Thinky();
var type = db.type;

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa',
  server: 'http://45.55.36.193:7474'
});

var User = db.createModel("User", {
  id: type.string(),
  username: type.string(),
}, { pk: "username"})


graph.constraints.uniqueness.create('User', 'username', function(err, constraint) {});

class contextManager{
  constructor(history, userInfo){

    this.user = {};
    this.urls = [];
    this.files = [];
    this.heart = heartbeats.createHeart(1000);
    this.history = history;
    this.heart.createEvent(10, function(heartbeat, last){
      this.handleHeartbeat(heartbeat);
    }.bind(this));

    this.initContext(userInfo)
  }

  async initContext(userInfo){
      this.user = await this.setUser(userInfo);
  }

  get() {
    return {
      urls: this.urls,
      files: this.files
    }
  }

  async setUser(user){
    console.log("SETUSER", user);
    let rethinkUser = await saveUserInRethink(user);
    console.log(rethinkUser);
    // console.log(userInfo);
    // let user = new User(userInfo);
    //
    // let rethinkUser = {};
    // // try {
    //    user = user.save()
    // }
    // catch(err){
    //     user = await User.get(userInfo)
    // }
    // user.save().then(function(err, res){
    //   if (err) {
    //
    //   }
    // });
    // console.log('user',user)
    // console.log('user', rethinkUser);
    let graphUser = await graph.save(rethinkUser, 'User')
    console.log(graphUser);
    return graphUser
  }

  saveUserInRethink(userInfo){
    return new Promise(function(resolve, reject) {
       let user = new User(userInfo);
       user.save().then(function(err,res){
         console.log(err,res);
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
    console.log('adding file to context', fileNode);
    let file = this.files.filter(file => file.uri === fileNode.uri);
    console.log('file',file.length);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  updateUrls(urls){
    this.urls = urls;
    console.log('context updated urls', this.urls.length);
  }

  async relateUrlsToFiles(){
    // console.log(this.urls,this.files)
    let urlToFiles = await Promise.all(this.urls.map(url => this.relateOneToMany(url, this.files, 'OPENWITH')));
    let filesToUrls = await Promise.all(this.files.map(file => this.relateOneToMany(file, this.urls, 'OPENWITH')));
    console.log('related stuff', this.files.length, this.urls.length);
  }


  handleHeartbeat(heartbeat){
    console.log("*", this.files.length, this.urls.length);
    this.relateUrlsToFiles()
    this.updateStats();
    this.history.saveEvent({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls} }).then(function(res){
      // console.log(res);
    })
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
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  updateStats(){}

  updateDelats(){}

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

}


module.exports = contextManager;
