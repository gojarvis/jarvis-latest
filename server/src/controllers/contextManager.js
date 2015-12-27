import heartbeats from 'heartbeats'


let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa'
});


class contextManager{
  constructor(history){
    this.urls = [];
    this.files = [];
    this.heart = heartbeats.createHeart(1000);
    this.history = history;
    this.heart.createEvent(10, function(heartbeat, last){
      this.handleHeartbeat(heartbeat);
    }.bind(this));
  }

  get() {
    return {
      urls: this.urls,
      files: this.files
    }
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

  queryGraph(cypher, params){
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  updateStats(){

  }

  updateDelats(){

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


}


module.exports = contextManager;
