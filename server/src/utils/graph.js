//TODO: All graph methods should live in one place. Currently unused.
let Redis = require('ioredis');
let config = require('config');
let redis = new Redis();
let pipeline = redis.pipeline();
let _ = require('lodash');

let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

//TODO: Change this to be address instead of URL
graph.constraints.uniqueness.create('Url', 'url', function(err, constraint) {});
graph.constraints.uniqueness.create('User', 'username', function(err, constraint) {});
graph.constraints.uniqueness.create('File', 'address', function(err, constraint) {});
graph.constraints.uniqueness.create('Command', 'address', function(err, constraint) {});

class GraphUtil{
  constructor(){

  }

  async getNode(type, index, value){
    return new Promise(function(resolve, reject) {
      let params = {type: type};
      params[index] = value;
      graph.find(params, function(err, node){
        if (err) reject(err)
        else{
          resolve(node)
        }
      })
    });
  }

  queryGraph(cypher, params={}){
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){

        if (err) reject(err)
        else {
          // console.log('QUERY GRAPH RESULT', result);
          resolve(result)
        }
      });
    });
  }

  getNodeById(id){
    return new Promise(function(resolve, reject) {
      graph.read(id, function(err,node){
        node = node ? node : {}
        if (err) reject(err)
        else resolve(node);
      })
    });
  }

  getUrlNodeByUrl(url){
    return new Promise(function(resolve, reject) {
      console.log('FINDING', url);
      graph.find({type: 'url', url: url}, function(err, urls){
        if (err)  {
          console.log(err);
          reject(err);
        }

        else {
          console.log('URLS', urls);
          resolve(urls[0])
        }
      })
    });
  }

  getUserNodeByUsername(username){
    return new Promise(function(resolve, reject) {
      graph.find({username: username}, function(err, userNodes){
        if (err)  {
          console.log(err);
          reject(err);
        }
        else {
          resolve(userNodes[0])
        }
      })
    });
  }

  async getRelatedToUrl(url, relationship, threshold){
    let urlNode = await this.getUrlNodeByUrl(url);
    let cypher = 'MATCH (n:Url)-[r:'+relationship+']-(q) WHERE n.url = "' + url +'" AND r.weight > ' + threshold +'  RETURN r,q ORDER BY r.weight DESC LIMIT 10';
    let params = {url: url, threshold: threshold};
    // console.log(cypher);
    try{
      let res = await this.queryGraph(cypher,params);

      return res;
    }
    catch(err){
      console.log('failed to get related', err);
    }
  }

  async getRelevantNodes(){
    let relevantUrls = await this.getRelevantUrls()
    // let relevantFiles = await this.getRelevantUrls()
    // let relevantKeywords = await this.getRelevantUrls()

    return
  }

  //TODO: BATCH
  async getRelevantUrls(){

    let urls = this.context.urls.map(item => item.url);

    let related = await Promise.all(urls.map(url => graph.getRelatedToUrl(url, 'openwith', 30)));
    // console.log(related);
    return related;
  }

  //TODO: BATCH
  async relateOneToMany(origin, others, relationship){
    let relationships = [];let txn; let results = [];
    try {
      txn = graph.batch();
      let relationshipQueries = others.map(target => this.getRelateNodeQuery(origin, target, relationship));
      relationshipQueries.forEach(cypher => {
        txn.query(cypher, {}, (err, result) => {
          if (err){
            console.log('err adding to txn', err);
          }
        })
      })
      results = this.commitBatch(txn);

    } catch (e) {
      console.log('failed', e);
    } finally {
      console.log('done');
      return results;
    }


    // let relationships = [];
    // try {
    //   relationships = await Promise.all(others.map(target => this.relateNodes(origin, target, relationship)));
    // }
    // catch(err){
    //   console.log('failed to relate one to many', err);
    // }
    //
    // return relationships;
  }

  commitBatch(txn) {
    return new Promise(function (resolve, reject) {
      try {
        txn.commit((err, results) => {
          if (err) {
            reject(err);
          }
          resolve(results);
        });
      } catch (e) {
        console.log('cant commit', e);
        reject(e);
      } finally {

      }
    });
  }

  getRelateNodeQuery(origin, target, relationship){
    let cypher = `START a=node(${origin.id}), b=node(${target.id}) MERGE (a)-[r:${relationship}]->(b) SET r.weight = coalesce(r.weight, 0) + 1`;
    return cypher
  }

  async relateNodes(origin, target, relationship){
    // console.log('TARGET', target, target.id);
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
      console.log('failed relate nodes in graphUtil', err, cypher);
    }
    finally{
      return res
    }


  }

  getSaveUserInGraph(user){
    return new Promise(function(resolve, reject) {
      graph.find(user, function(err, node){
        if (err || !node.length){
          console.log('user doesnt exist, saving', user);
          graph.save(user, "User", function(err, node){
            if (err){
              console.log('CANT SAVE USER', user, err);
              reject(err);
            }
            else{
              console.log('USER SAVED', node);
              resolve(node);
            }
          })
        }
        else{
          // console.log('user found', err, node);
          resolve(node[0])
        }
      })
    });
  }

  saveFile(address){

    let self = this;
    let projectPath = '';
    let trimmedAddress = address.replace('projectsPath', '');
    // console.log('TRIMMED ADDRESS', trimmedAddress);
    return new Promise(function(resolve, reject) {
      console.log('SAVING FILE');
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

  //// Functions moved here for convinience, should be re-written

  async getAndSaveUrlNode(activeUrlDetails){
      let {url, title} = activeUrlDetails;
      console.log('getAndSaveUrlNode', url, title);
      let node;
      try {
        node = await this.saveUrl(url, title)
      } catch (e) {
        console.log('cant get save url');
      } finally {
        return node;
      }
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

  getCommand(command){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'command', address: command}, function(err, node){
        node = node ? node[0] : false;
        if (err) reject(err)
        else {
          resolve(node);
        }
      });
    });
  }


  saveCommand(command){
    let self = this;
    return new Promise(function(resolve, reject) {

      self.getCommand(command).then(function(result){
        let node = result;
        if (!_.isUndefined(node)){
          resolve(node)
        }
        else{
          try {
            graph.save({type: 'command', address: command}, 'Command', function(err, result){
              if (err) {
                try {
                  self.getCommand(command).then(function(result){
                    node = result;
                    console.log('already existed', node);
                    resolve(node)
                  })
                } catch (e) {
                    console.log('cant get or save command', e);
                } finally {

                }
              }
              else{
                node = result;
                console.log('SAVED COMMAND', result);
                resolve(node);
              }

            });
          } catch (e) {
            console.log('command probably exist', e);
          }
        }

      });

    });
  }

}


module.exports = GraphUtil;
