//TODO: All graph methods should live in one place. Currently unused.

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa'
});


class GraphDB{
  constructor(){

  }

  queryGraph(cypher, params){
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  getUrlById(id){
    return new Promise(function(resolve, reject) {
      // console.log('ID', id);
      graph.read(id, function(err,node){
        node = node ? node : {}
        if (err) reject(err)
        else resolve(node);
      })
    });
  }

  getUrlNodeByUrl(url){
    console.log('getUrlNodeByUrl', url);
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

  async getRelatedToUrl(url, relationship, threshold){
    let urlNode = await this.getUrlNodeByUrl(url);    
    let cypher = 'MATCH (n:Url)-[r:'+relationship+']->(q) WHERE n.url = "' + url +'" AND r.weight > ' + threshold +'  RETURN n,r,q ORDER BY r.weight DESC LIMIT 10';
    let params = {url: url, threshold: threshold};
    // console.log(cypher);
    try{
      let res = await this.queryGraph(cypher,params);
      return res;
    }
    catch(err){
      console.log('failed to relate', err);
    }
  }


}


module.exports = GraphDB;
