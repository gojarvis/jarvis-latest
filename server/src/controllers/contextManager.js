import heartbeats from 'heartbeats'
import Thinky from 'thinky'
import _ from 'lodash';
import watson from 'watson-developer-cloud';

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

    this.initContext(userInfo)



  }

  async initContext(userInfo){
    let user
    try{
        user = await this.setUser(userInfo);
        this.user = user;
        console.log('user', this.user);
        this.heart.createEvent(10, function(heartbeat, last){
          this.handleHeartbeat(heartbeat);
        }.bind(this));
    }
    catch(err){
      console.error('cannot initialize context',err);
    }



  }

  get() {
    return {
      urls: this.urls,
      files: this.files
    }
  }

  async setUser(user){
    let graphUser = await this.getSaveUserInGraph(user)

    this.user = graphUser;
    console.log('this.user', this.user);
    return graphUser
  }

  getSaveUserInGraph(user){
    return new Promise(function(resolve, reject) {
      console.log("GETSAVING");
      graph.save(user, "User", function(err, node){
        if (err){
          //exists
          console.log("User probably exists. Fetching...");
          graph.find(user, function(err, node){
            if (err){
              console.log('cant get node',user)
            }
            else{
              console.log('user found')
              resolve(node[0])
            }
          })
        }
        else{
          resolve(node[0]);
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

  updateUrls(urls){
    this.urls = urls;
    // console.log('context updated urls', this.urls.length);
  }

  async relateUrlsToFiles(){
    // console.log(this.urls,this.files)
    let urlToFiles = await Promise.all(this.urls.map(url => this.relateOneToMany(url, this.files, 'OPENWITH')));
    let filesToUrls = await Promise.all(this.files.map(file => this.relateOneToMany(file, this.urls, 'OPENWITH')));

    let watsonium = await Promise.all(this.urls.map(url => this.doTheWatson(url)));
    // console.log('related stuff', this.files.length, this.urls.length);
  }

  async doTheWatson(url){
    console.log('WATSON', url);
  }


  async relateUserToContext(){
    let self = this;
    // console.log(this.user);
    if (_.isUndefined(this.user.id)){
      console.log('User not set yet, cannot relate user to context');
      return;
    }

    // console.log('associating user with context', self.user.id, this.urls.length, this.files.length);

    if (!_.isEmpty(this.urls)){
      let userToUrls = await this.relateOneToMany(this.user, this.urls, 'touched')
      // console.log('associated user with ', this.urls.length, 'urls');
    }
    else{
      console.log('no urls to associate');
    }

    if (!_.isEmpty(this.files)){
      // console.log('assoc files', this.files);
      let userToFiles = await this.relateOneToMany(this.user, this.files, 'touched')
      // console.log('associated user with ', this.files.length, 'files');

    }
    else{
      console.log('no files to associate');
    }


  }

  handleHeartbeat(heartbeat){
    console.log("*", this.files.length, this.urls.length);
    this.relateUrlsToFiles()
    this.updateStats();
    this.relateUserToContext();

    this.history.saveEvent({type: 'heartbeat', source: 'context', data: { files: this.files, urls: this.urls} }).then(function(res){
      // console.log(res);

    })
  }

  async relateOneToMany(origin, others, relationship){
    // console.log('relating one to many', origin, others, relationship);
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
