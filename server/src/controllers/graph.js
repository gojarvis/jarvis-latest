import config from 'config';
let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

function queryGraph(cypher, params={}){
  return new Promise(function(resolve, reject) {
    graph.query(cypher, params, function(err, result){
      if (err) reject(err)
      else resolve(result)
    });
  });
}

let graphController = {
  query: async function(req, res){

    let nodeId = getNodeIdFromResource()
    let cypher = `
      start p=node(${nodeId}) match p-[r]-s return p, type(r), r.weight, s
    `
    
    let result = await queryGraph(cypher);
    res.json(result);
  }
}


module.exports =  graphController
