let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let _ = require('lodash');
let Moniker = require('moniker');


let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

class UsersController{
  constructor(){

  }

  async setUserAsAdmin(username){
    let userNode = await graphUtil.getUserNodeByUsername(username);
    userNode.role = 'admin';
    graph.save(userNode, function(err, node){
      console.log('Set user role to admin', node);
    })
  }

  getAllUsers() {
    return new Promise(async function(resolve, reject) {
        let cypher = 'match (u:User) return u';
        console.log('getAllUsers', cypher);
        let res = await graphUtil.queryGraph(cypher);
        console.log(res);
        resolve(res);
    });
  }



}

module.exports = new UsersController();
