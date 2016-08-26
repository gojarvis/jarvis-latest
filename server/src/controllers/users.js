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


  async getTeamInvites(username){
    return new Promise(async function(resolve, reject) {
        let cypher = `match (user:User)-[:invited]-(team:Team) where user.username='${username}' return team`;
        let res ;
        try {
          res = await graphUtil.queryGraph(cypher);
        } catch (e) {
          console.log('cant get invites', e);
        } finally {
          resolve(res);
        }

    });
  }

  async createUser(username, role){
    let userNode = await graphUtil.getSaveUserInGraph({username, role});
    return userNode;
  }

  getAllUsers() {
    return new Promise(async function(resolve, reject) {
        let cypher = 'match (u:User) return u';

        let res = await graphUtil.queryGraph(cypher);

        resolve(res);
    });
  }



}

module.exports = new UsersController();
