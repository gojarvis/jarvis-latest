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
    let nodeId = req.param('nodeId');
    console.log(req.params.nodeId);
// let nodeId = getNodeIdFromResource()
    let cypher = `
      start startNode=node(${nodeId}) match (startNode)-[relationship]-(endNode) return startNode, type(relationship) as relationshipType, relationship.weight, endNode
    `

    try{
      let result = await queryGraph(cypher);
      res.json(result);
    }
    catch(error){
      console.error('Query to graph failed', cypher);
      res.json({'error': error});

    }
  }
}


module.exports =  graphController
