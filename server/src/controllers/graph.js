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
    let relationshipType = req.param('relationshipType') || false;
    let startNodeType = req.param('startNodeType') || false;
    let endNodeType = req.param('endNodeType') || false;

    let relationshipCypherVariableString = relationshipType ? 'relationship:' + relationshipType : 'relationship'
    let startNodeString = startNodeType ? 'startNode:' + startNodeType : 'startNode'
    let endNodeString = endNodeType ? 'endNode:' + endNodeType : 'endNode'

    let normalizedSumCypher = `start startNode=node(${nodeId}) match (${startNodeString})-[${relationshipCypherVariableString}]-(${endNodeString}) return log(sum(relationship.weight)) as normalizedSumWeight`;

    try{
      let normalizedSumCypherResult = await queryGraph(normalizedSumCypher);
      let normalizedWeight = normalizedSumCypherResult[0].normalizedSumWeight

      let cypher = `
        start startNode=node(${nodeId}) match (${startNodeString})-[${relationshipCypherVariableString}]-(${endNodeString}) return startNode, type(relationship) as relationshipType, log(relationship.weight)/${normalizedWeight} as relationshipWeight, endNode order by relationshipWeight desc
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
    catch(error){
      console.error('Query to graph failed', cypher);
      res.json({'error': error});

    }



  }
}


module.exports =  graphController
