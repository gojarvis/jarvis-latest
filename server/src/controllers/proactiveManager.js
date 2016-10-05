let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let keywordsManager = require('./keywordsManager');
let settingsManager = require('../utils/settings-manager');
let ReportsController = require('./reports')


var db = require('../utils/rethink')
var type = db.type;


//TODO: call the reports controller function, and tie them to socket

class proactiveManager{
  constructor(socket, io, userName){
    this.user = userName;
    this.socket = socket;
    this.io = io;

    //TODO:
    this.lastReportDate = '';

    this.registerEvents()
  }


  async getReports(){
    let reports  = [];

  }

  async getUserStats(){
    //Looks at rethink db and count activity types


  }

  async getUserTriggerValues(){
    //from settings
  }




}

module.exports = proactiveManager;
