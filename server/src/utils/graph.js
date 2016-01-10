//TODO: All graph methods should live in one place. Currently unused.

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa',
  server: 'http://45.55.36.193:7474'
});


class GraphDB{
  constructor(){

  }

  queryGraph(cypher, params={}){
    // console.log(cypher);
    return new Promise(function(resolve, reject) {
      graph.query(cypher, params, function(err, result){
        if (err) reject(err)
        else resolve(result)
      });
    });
  }

  getNodeById(id){
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
    let cypher = 'MATCH (n:Url)-[r:'+relationship+']->(q) WHERE n.url = "' + url +'" AND r.weight > ' + threshold +'  RETURN r,q ORDER BY r.weight DESC LIMIT 10';
    let params = {url: url, threshold: threshold};
    // console.log(cypher);
    try{
      let res = await this.queryGraph(cypher,params);
      let urls = await Promise.all(res.map())
      return res;
    }
    catch(err){
      console.log('failed to relate', err);
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

    let related = await Promise.all(urls.map(url => graph.getRelatedToUrl(url, 'OPENWITH', 30)));
    // console.log(related);
    return related;
  }



  async getRelevantKeywords(){

  }



}


module.exports = GraphDB;
