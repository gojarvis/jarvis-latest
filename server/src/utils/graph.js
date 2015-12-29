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


}
