let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let _ = require('lodash');
let Moniker = require('moniker');
let ProjectSettingsManager = require('../utils/project-settings-manager');
let projectSettingsManager = new ProjectSettingsManager();

let dbConfig = config.get('graph');

let graph = require("seraph")({
  user: dbConfig.user,
  pass: dbConfig.pass,
  server: dbConfig.server
});

class SettingsController{
  constructor(){

  }

  async setRootPath(rootPath){
    console.log('SET ROOT PATH');
    let path = projectSettingsManager.setRootPath(rootPath);
    return path;
  }

  async getRootPath(){    
    let path = projectSettingsManager.getRootPath();
    return path;
  }
}

module.exports = new SettingsController();
