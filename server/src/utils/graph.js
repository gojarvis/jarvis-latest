let colors = require('colors');
let _ = require('lodash');


let projectSettingsManager = require('./settings-manager');



let graphCredentials = projectSettingsManager.getRepoCredentials();

let graph = require("seraph")({
  user: graphCredentials.username,
  pass: graphCredentials.password,
  server: graphCredentials.address
});

graph.constraints.uniqueness.create('User', 'username', function(err, constraint) {});
graph.constraints.uniqueness.create('Url', 'address', function(err, constraint) {});
graph.constraints.uniqueness.create('File', 'address', function(err, constraint) {});
graph.constraints.uniqueness.create('Command', 'address', function(err, constraint) {});
graph.constraints.uniqueness.create('Regex', 'address', function(err, constraint) {});

class GraphUtil{
  constructor(){

  }

  getGraph(){
    return graph
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
    // console.log('Query:    '.green, cypher);
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
      graph.find({type: 'url', url: url}, function(err, urls){
        if (err)  {
          console.log(err);
          reject(err);
        }
        else {
          resolve(urls[0])
        }
      })
    });
  }

  getNodeByAddress(address){
    return new Promise(function(resolve, reject) {
      graph.find({address: address}, function(err, nodes){
        if (err)  {
          console.log(err);
          reject(err);
        }
        else {
          resolve(nodes[0])
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

    try{
      let res = await this.queryGraph(cypher,params);
      return res;
    }
    catch(err){
      console.log('failed to get related', err);
    }
  }


  //TODO
  async getWhitelistExpressions(username){

  }

  async getBlacklistExpressions(username){

  }

  async getRelevantUrls(){

    let urls = this.context.urls.map(item => item.url);

    let related = await Promise.all(urls.map(url => graph.getRelatedToUrl(url, 'openwith', 30)));
    // console.log(related);
    return related;
  }

  async relateOneToMany(origin, others, relationship){
    let relationships = []; let txn; let results = [];
    try {
      // console.log('relateOneToMany', relationship);
      let relationshipQueries = others.map(target => this.getRelateNodeQuery(origin, target, relationship));
      let results = await this.executeQueries(relationshipQueries);
    } catch (e) {
      console.log('failed relating one to many', e);
    } finally {
      return results;
    }
  }

  async getRelateOneToManyQueries(origin, others, relationship){
    return  others.map(target => this.getRelateNodeQuery(origin, target, relationship));
  }


  async relateManyToOne(many, origin, relationship){
    let relationships = []; let txn; let results = [];
    try {
      // console.log('relateManyToOne', relationship);
      let relationshipQueries = many.map(target => this.getRelateNodeQuery(target, origin, relationship));
      let results = await this.executeQueries(relationshipQueries);
    } catch (e) {
      console.log('failed relating many to one', e);
    } finally {
      return results;
    }
  }

  async getUserGlobalWeightFactors(user){
    let cypher = `
        match (startUserNode:User)-[startUserRel_relationship:touched]->(startNode)-[endUserRel_relationship:openwith]->(endNode)
        match (startUserNode)-[:touched]->(endNode)
        where
        ID(startUserNode)=${user.id}
        and not ID(startNode) = ID(endNode)
        and endUserRel_relationship.weight > 0
        with {
        	avgTouch: avg(startUserRel_relationship.weight) ,
        	maxTouch: max(startUserRel_relationship.weight),
        	stdevTouch: stdev(startUserRel_relationship.weight),

        	avgOpen: avg(endUserRel_relationship.weight),
        	maxOpen: max(endUserRel_relationship.weight),
        	stdevOpen: stdev(endUserRel_relationship.weight)

        } as data
        return data`;
    let globalWeightFactors;


    try {
      globalWeightFactors = await this.queryGraph(cypher);
    } catch (e) {
      console.log('cant getGlobalTouchWeightFactor', e);
    } finally {
      // console.log('getUserGlobalWeightFactors', cypher, globalWeightFactors);
      return globalWeightFactors[0]
    }
  }

  async executeQueries(queries){
    let txn, results;
    try {
      txn = graph.batch();
      queries.forEach(cypher => {
        txn.query(cypher, {}, (err, result) =>{
          if(err){
            console.log('err adding to txn', err.code, cypher);
          }
        })
      })

      results = await this.commitBatch(txn);
    } catch (e) {
      console.log('failed executing queries ', e);
    } finally {
      return results;
    }
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
    if (target.id == origin.id){
      //TODO: Stop gap to avoid inserting open relationships that are between the item and itself.
      return `match (n) where ID(n)=${target.id} return n limit 1`
    }
    let cypher = `START a=node(${origin.id}), b=node(${target.id}) MERGE (a)-[r:${relationship}]->(b) SET r.weight = coalesce(r.weight, 0) + 0.01`;
    return cypher
  }

  async deleteRelationship(origin, target, relationship){
    let cypher = `MATCH (a)-[r:${relationship}]->(b) where ID(a)=${origin.id} and ID(b)=${target.id} DELETE r`;

    let res = {};

    try{
      res = await this.queryGraph(cypher);
    }

    catch(err){
      console.log('failed delete relatioship in graphUtil', err, cypher);
    }
    finally{
      return res
    }
  }

  async relateNodes(origin, target, relationship){
    // console.log('TARGET', target, target.id);
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'MERGE (a)-[r:'+relationship+']->(b) '
                +'SET r.weight = coalesce(r.weight, 0) + 0.01';
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

  async getRelatedNodes(startNode, relationship){
    let cypher =
      `MATCH (startNode)-[relationship:${relationship}]->(endNode) where ID(startNode)=${startNode.id} return endNode`;
    let res = {};
    try {
      res = await this.queryGraph(cypher);
    } catch (err) {
      console.log('failed to get related nodes in graphUtil', err, cypher);
    } finally {
      return res;
    }
  }

  async getSaveUserInGraph(user){
      let userNode, userDefaultFilters;
      try {
         userNode = await this.getUserNodeByUsername(user.username);
         if (_.isEmpty(userNode)){
           console.log('no user found, saving you!!!!');
           userNode = await this.saveUser(user)
           userDefaultFilters = await this.saveUserDefaultFilters(userNode);
         }
      } catch (e) {
        console.log('cant getSave user',e);
      } finally {
        return userNode
      }
  }

  async saveUserDefaultFilters(userNode){
      console.log('saveUserDefaultFilters', userNode);
      let blacklistExpressions = [
        '.*facebook\.com.*',
        '.*gmail\.com.*',
        '.*inbox\.google\.com.*',
        'chrome://newtab/'
      ];

      let whitelistExpressions = [
        '.*google\.com.*',
        '.*github\.com.*',
        '.*stackoverflow\.com.*'
      ];

      let blacklistExpressionsNodes = await Promise.all(blacklistExpressions.map(expression => this.saveRegex(expression)));
      let whitelistExpressionsNodes = await Promise.all(whitelistExpressions.map(expression => this.saveRegex(expression)));


      let blacklistRelationships = await Promise.all(blacklistExpressionsNodes.map(expressionNode => this.relateNodes(userNode, expressionNode, 'blacklist')))
      let whitelistRelationships = await Promise.all(whitelistExpressionsNodes.map(expressionNode => this.relateNodes(userNode, expressionNode, 'whitelist')))
      console.log('done saving default filters');
  }


  // getSaveUserInGraph(user){
  //   return new Promise(function(resolve, reject) {
  //     graph.find(user, function(err, node){
  //       if (err || !node.length){
  //         console.log('user doesnt exist, saving', user);
  //         graph.save(user, "User", function(err, node){
  //           if (err){
  //             console.log('CANT SAVE USER', user, err);
  //             reject(err);
  //           }
  //           else{
  //             console.log('USER SAVED', node);
  //
  //             resolve(node);
  //           }
  //         })
  //       }
  //       else{
  //         resolve(node[0])
  //       }
  //     })
  //   });
  // }

  saveUser(user){
    return new Promise(function(resolve, reject) {
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
    });
  }

  saveFile(address){

    let self = this;
    let projectPath = '';
    let trimmedAddress = address.replace('projectsPath', '');
    // console.log('TRIMMED ADDRESS', trimmedAddress);
    return new Promise(function(resolve, reject) {
      graph.save({type: 'file', address: trimmedAddress}, 'File', function(err, node){
        node = node ? node : {type: 'file', address: address};
        if (err) {
          console.log('err', err);
          reject(err)
        }
        else {
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


  saveRegex(regex){

    let self = this;

    // console.log('TRIMMED ADDRESS', trimmedAddress);
    return new Promise((resolve, reject)  =>{
      console.log('SAVING Regex');
      graph.save({type: 'regex', address: regex}, 'Regex', (err, node) =>{

        if (err) {
          console.log('node probably exists');
          this.getRegex(regex).then((node) =>{
            console.log('Found regex', node);
            resolve(node);
          })          
        }
        else {
          console.log('node',node);
          resolve(node);
        }
      });
    });
  }


  getRegex(address){
    let self = this;
    return new Promise(function(resolve, reject) {
      graph.find({type: 'regex', address: address}, function(err, node){
        node = node ? node[0] : {type: 'regex', address: address};
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
      // console.log('getAndSaveUrlNode', url, title);
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
                    // console.log('already existed', node);
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
                // console.log('SAVED URL', result);
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
                    // console.log('already existed', node);
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


  async updateNodeAndRelationships(urlNode, keywordNodes, keywords) {
    let keywordTextToRelevanceHash = {};

    keywords.forEach(keyword => {
       keywordTextToRelevanceHash[keyword.text] = keyword.relevance;
    })

    let txn = graph.batch();

    keywordNodes.forEach(kwObj => {
      let cypher = `
        START a=node(${kwObj.id}), b=node(${urlNode.id})
        MERGE (a)-[r:related]->(b)
        SET r.weight = coalesce(r.weight, 0) + ${keywordTextToRelevanceHash[kwObj.text]}`;

      txn.query(cypher, {}, (err, result) => {
        if (err) {
          console.log('failed updateNodeAndRelationships', err);
        }
        else{
          return result;
        }
      });
    });



    let res = {};
    try {
      res = await this.executCommitedQueries(txn);
      return res;
    } catch (e) {
      console.log('CANT CREATE RELS');
      throw e;
    } finally {
      return res;
    }
  }

  executCommitedQueries(txn) {
    return new Promise(function (resolve, reject) {
      try {
        txn.commit((err, results) => {
          if (err) {
            reject(err);
          }

          resolve(results);
        });
      } catch (e) {
        reject(e);
      } finally {

      }
    });
  }

}


module.exports = GraphUtil;
