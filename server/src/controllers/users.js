
import config from 'config';
import GraphUtil from '../utils/graph';
let graphUtil = new GraphUtil();
import _ from 'lodash';
import Moniker from 'moniker';


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



}

module.exports = new UsersController();
