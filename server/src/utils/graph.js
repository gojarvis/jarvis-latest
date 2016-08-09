//TODO: All graph methods should live in one place. Currently unused.
import Redis from 'ioredis'
import config from 'config';
let redis = new Redis();
let pipeline = redis.pipeline();

let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});



class GraphDB{
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
          console.log('QUERY GRAPH RESULT', result);
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
      graph.find({type: 'url', url: url}, function(err, urls){
        if (err)  {
          console.log(err);
          reject(err);
        }
        else resolve(urls[0])
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

  async getTouchedByOtherUser(){
    // MATCH (n:User)-[t:touched]-(q)-[r]-(s)-[ot:touched]-(ou:User) RETURN n,q,r,s,ou ORDER BY r.weight DESC LIMIT 10
  }



  async getRelevantNodes(){
    let relevantUrls = await this.getRelevantUrls()
    // let relevantFiles = await this.getRelevantUrls()
    // let relevantKeywords = await this.getRelevantUrls()

    return
  }

  async getRelevantUrls(){

    let urls = this.context.urls.map(item => item.url);

    let related = await Promise.all(urls.map(url => graph.getRelatedToUrl(url, 'openwith', 30)));
    // console.log(related);
    return related;
  }



  async getRelevantKeywords(){

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
    console.log('TARGET', target, target.id);
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'CREATE UNIQUE a-[r:'+relationship+']->b '
                +'SET r.weight = coalesce(r.weight, 0) + 1';
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await this.queryGraph(cypher,params);
      console.log('res', res, cypher, params);

    }

    catch(err){
      let cypher = 'START a=node('+origin.id+'), b=node('+target.id+') '
                  +'CREATE UNIQUE a-[r:'+relationship+']->b '
                  +'SET r.weight = coalesce(r.weight, 0) + 1';

      console.log('failed', err, cypher);
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
          console.log('user found', err, node);
          resolve(node[0])
        }
      })
    });
  }



}


module.exports = GraphDB;
