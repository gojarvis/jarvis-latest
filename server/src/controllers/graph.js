import _ from 'lodash'
let projectSettingsManager = require('../utils/settings-manager');
let graphCredentials = projectSettingsManager.getRepoCredentials();
let GraphUtil = require('../utils/graph.js');
let graphUtil = new GraphUtil();


let graph = require("seraph")({
  user: graphCredentials.username,
  pass: graphCredentials.password,
  server: graphCredentials.address
});

function queryGraph(cypher, params={}){
  return new Promise(function(resolve, reject) {

    graph.query(cypher, params, function(err, result){
      if (err) reject(err)
      else resolve(result)
    });
  });
}

async function getNormalizedWeight(query){
  let normalizedSumCypherResult = await queryGraph(query);
  let normalizedWeight ;
  if (!_.isNull(normalizedSumCypherResult[0]) &&  normalizedSumCypherResult.length > 0){
    normalizedWeight = parseFloat(normalizedSumCypherResult[0].normalizedSumWeight);
    normalizedWeight = (normalizedWeight > 0) ? normalizedWeight : 1;
  }
  else{
    normalizedWeight = 1;
  }
  return normalizedWeight;

}

let graphController = {
  getUsers: async function(req, res) {
    let cypher = `match (n:User) return n`;
    try {
      let result = await queryGraph(cypher);
      res.json(result);
    } catch (e) {
      console.error('Query to graph for users failed', cypher);
      res.json({'error': e});
    }
  },

  query: async function(req, res){
    let nodeId = req.body.nodeId;
    let user = req.session.passport.user;

    let relationshipType = req.body.relationshipType || false;
    let startNodeType = req.body.startNodeType || false;
    let endNodeType = req.body.endNodeType || false;
    let relationshipCypherVariableString = relationshipType ? 'relationship:' + relationshipType : 'relationship'
    let startNodeString = startNodeType ? 'startNode:' + startNodeType : 'startNode'
    let endNodeString = endNodeType ? 'endNode:' + endNodeType : 'endNode'

    let startUserNodeId = req.body.startUserNodeId || false;
    let endUserNodeIds = req.body.endUserNodeIds || false;
    let normalizedSumCypher;
    let normalizedWeight;

    let globalModifiers = await graphUtil.getUserGlobalWeightFactors(user);

    if (endUserNodeIds.length > 0 ){
      endUserNodeIds = endUserNodeIds.filter(userId => user.id != userId);
    }


    let cypher;

    if (startUserNodeId && (!endUserNodeIds || endUserNodeIds.length === 0)){
      cypher = `match (startUserNode:User)-[${'startUserRel_' + relationshipCypherVariableString}]->(${startNodeString})-[${'endUserRel_' + relationshipCypherVariableString}]->(${endNodeString})`
      cypher += ` match (startUserNode)-[:touched]-(endNode)`
      cypher += ` where ID(startNode) = ${nodeId}`
      cypher += ` and ID(startUserNode) = ${startUserNodeId}`
      cypher += ` and NOT ID(endNode) = ${nodeId}`
      cypher += ` and NOT (startUserNode)-[:blacklisted]-(${endNodeString})`
      normalizedSumCypher = cypher + ` return avg(${'endUserRel_' + relationshipCypherVariableString}.weight) as normalizedSumWeight`;
      // console.log('normalizedSumCypher---', normalizedSumCypher);
      // normalizedWeight = await getNormalizedWeight(normalizedSumCypher)
      // normalizedWeight = globalModifiers.avgOpen;
      normalizedWeight = 1;
      cypher += ` return startNode,type(${'endUserRel_' + relationshipCypherVariableString}) as relationshipType, (${'endUserRel_' + relationshipCypherVariableString}.weight) as relationshipWeight, endNode, `
      cypher += ` sum(${globalModifiers.avgOpen}) as avgOpen, `
      cypher += ` sum(${globalModifiers.avgTouch}) as avgTouch, `
      cypher += ` sum(${globalModifiers.maxOpen}) as maxOpen, `
      cypher += ` sum(${globalModifiers.maxTouch}) as maxTouch `
      cypher += ` order by relationshipWeight desc limit 15`
    }

    if (startUserNodeId && endUserNodeIds && endUserNodeIds.length > 0){
      cypher = `match (startUserNode:User)-[${relationshipCypherVariableString}]->(${startNodeString}) `
      cypher += ` match (endUserNode:User)-[:touched]->(startNode)-[${'endUserRel_' + relationshipCypherVariableString}]->(${endNodeString})`
      cypher += ` match (endUserNode)-[:touched]-(endNode)`
      cypher += ` where ID(startNode) = ${nodeId}`
      cypher += ` and ID(startUserNode) = ${startUserNodeId}`
      cypher += ` and ID(endUserNode) in [${endUserNodeIds.join(',')}]`
      cypher += ` and NOT ID(endNode) = ${nodeId}`
      cypher += ` and NOT (startUserNode)-[:blacklisted]-(${endNodeString})`

      //Filter for excluding things user touched
      // cypher += ` and NOT (startUserNode)-[:touched]-(endNode)`
      normalizedWeight = 1;

      cypher += ` return startNode,`
      cypher += ` type(${'endUserRel_' + relationshipCypherVariableString}) as relationshipType,`
      cypher += ` (${'endUserRel_' + relationshipCypherVariableString}.weight / ${normalizedWeight}) as relationshipWeight,`
      cypher += ` endNode,`
      cypher += ` sum(${globalModifiers.avgOpen}) as avgOpen, `
      cypher += ` sum(${globalModifiers.avgTouch}) as avgTouch, `
      cypher += ` sum(${globalModifiers.maxOpen}) as maxOpen, `
      cypher += ` sum(${globalModifiers.maxTouch}) as maxTouch `
      cypher += ` order by relationshipWeight desc limit 15`
    }
    if (!startUserNodeId && endUserNodeIds && endUserNodeIds.length > 0){
      cypher = `match (startUserNode:User)-[${relationshipCypherVariableString}]->(${startNodeString})-[${'startUserRel_' + relationshipCypherVariableString}]->(${endNodeString})->[${'endUserRel_' + relationshipCypherVariableString}]-(endUserNode:User)`
      cypher += ` match (startUserNode)-[:touched]-(endNode)`
      cypher += ` where ID(startNode) = ${nodeId}`
      cypher += ` and ID(endUserNode) in [${endUserNodeIds.join(',')}]`
      cypher += ` and NOT (startUserNode)-[:blacklisted]-(${endNodeString})`
      cypher += ` and NOT ID(endNode) = ${nodeId}`
      normalizedSumCypher = cypher + ` return avg(${'endUserRel_' + relationshipCypherVariableString}.weight) as normalizedSumWeight`;
      normalizedWeight = globalModifiers.avgOpen;
      // normalizedWeight = globalModifiers.avgGlobalOpen
      cypher += ` return startNode,type(${'endUserRel_' + relationshipCypherVariableString}) as relationshipType, (${'endUserRel_' + relationshipCypherVariableString}.weight / ${normalizedWeight}) as relationshipWeight, endNode,`
      cypher += ` sum(${globalModifiers.avgOpen}) as avgOpen, `
      cypher += ` sum(${globalModifiers.avgTouch}) as avgTouch, `
      cypher += ` sum(${globalModifiers.maxOpen}) as maxOpen, `
      cypher += ` sum(${globalModifiers.maxTouch}) as maxTouch `
      cypher += ` order by relationshipWeight desc limit 15`
    }

    if (endNodeType === "Keyword"){
      if (startUserNodeId && (!endUserNodeIds || endUserNodeIds.length === 0)){
        cypher = `match (startUserNode:User)-[${'startUserRel_' + relationshipCypherVariableString}]->(${startNodeString})<-[o:openwith]-(url:Url)<-[r:related]-(endNode)`
        cypher += ` match (startUserNode)-[:touched]-(endNode)`
        cypher += ` where ID(startNode) = ${nodeId}`
        cypher += ` and ID(startUserNode) = ${startUserNodeId}`
        cypher += ` and NOT ID(endNode) = ${nodeId}`
        cypher += ` and NOT ID(url) = ${nodeId}`

        normalizedSumCypher = cypher + ` return avg(o.weight) as normalizedSumWeight`;
        // console.log('normalizedSumCypher---', normalizedSumCypher);
        normalizedWeight = globalModifiers.avgOpen;
        // normalizedWeight = globalModifiers.avgGlobalOpen
        // console.log('normalizedWeight',normalizedWeight);
        cypher += ` return startNode,type(r) as relationshipType, (o.weight / ${normalizedWeight}) as relationshipWeight, endNode,`
        cypher += ` sum(${globalModifiers.avgOpen}) as avgOpen, `
        cypher += ` sum(${globalModifiers.avgTouch}) as avgTouch, `
        cypher += ` sum(${globalModifiers.maxOpen}) as maxOpen, `
        cypher += ` sum(${globalModifiers.maxTouch}) as maxTouch `
        cypher += ` order by relationshipWeight desc limit 15`
      }

    }
    
    try{

      if (!startUserNodeId && !endUserNodeIds){
        normalizedSumCypher = `start startNode=node(${nodeId}) match (${startNodeString})-[${relationshipCypherVariableString}]->(${endNodeString}) return log(sum(relationship.weight)) as normalizedSumWeight`;
        normalizedWeight = await getNormalizedWeight(normalizedSumCypher);
        // normalizedWeight = globalModifiers.avgGlobalOpen


        cypher = `
          start startNode=node(${nodeId}) match (${startNodeString})-[${relationshipCypherVariableString}]-(${endNodeString}) return collect(distinct startNode)[0] as startNode, collect(distinct type(relationship))[0] as relationshipType, log(relationship.weight)/${normalizedWeight} as relationshipWeight, endNode order by relationshipWeight desc limit 15
        `
      }

      try {
        let result = await queryGraph(cypher);
        // console.log(`======  QUERY   =====`);
        // console.log(`  `);
        // console.log(cypher);
        // console.log(`  `);
        // console.log(`====== END QUERY =====`);
        // console.log(`Found ${result.length} results for the query`);

        result.globalModifiers = globalModifiers;


        res.json(result);
      }
      catch(error){
        console.error('Query to graph failed', cypher, error);
        res.json({'error': error});

      }
    }
    catch(error){
      console.error('Query to graph failed :-()', cypher, error);
      res.json({'error': error});

    }



  },

  blacklistNode: async function(req, res) {
    let nodeId = req.body.nodeId;

    let cypher = `
      START userNode=node(${req.body.userId}), targetNode=node(${req.body.targetId})
      MERGE (userNode)-[rel:blacklisted]->(targetNode)
      return userNode, targetNode, rel
    `;

    // console.log('cypher: ', cypher);

    try {
      let result = await queryGraph(cypher);
      res.json(result);
    } catch(error) {
      console.error(`Blacking node(${req.body.nodeId}) for user(${req.body.userId}) failed`, cypher);
      res.json({'error': error});
    }
  }
}


module.exports =  graphController
