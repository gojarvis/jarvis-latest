let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let _ = require('lodash');
let Moniker = require('moniker');
let ProjectSettingsManager = require('../utils/project-settings-manager');
let projectSettingsManager = new ProjectSettingsManager();

class SettingsController {
    constructor() {

    }

    async setRootPath(rootPath) {
        let path = projectSettingsManager.setRootPath(rootPath);
        return path;
    }

    async getRootPath() {
        let path = projectSettingsManager.getRootPath();
        return path;
    }

    async setRepoCredentials(credentials) {
        let creds = await projectSettingsManager.setRepoCredentials(credentials);
        return creds;
    }

    async getRepoCredentials(credentials) {
        let creds = await projectSettingsManager.getRepoCredentials(credentials);
        return creds;
    }

    async setActivityManagerCredentials(credentials) {
        let creds = await projectSettingsManager.setActivityManagerCredentials(credentials);
        return creds;
    }

    async getActivityManagerCredentials(credentials) {
        let creds = await projectSettingsManager.getActivityManagerCredentials(credentials);
        return creds;
    }


    async addExpression(expression, filterType, user){
        console.log('Adding expression to user', expression, user);
        let expressionNode = await graphUtil.saveRegex(expression);
        let userNode = await graphUtil.getUserNodeByUsername(user.username);
        let relationship = await graphUtil.relateNodes(userNode, expressionNode, filterType);
        console.log('----> added expression to user', expression, user);
        return relatioship;
    }

    async listFilterExpression(filterType, user){
        let userNode = await graphUtil.getUserNodeByUsername(user.username);
        let expressions = await graphUtil.getRelatedNodes(userNode, filterType)
        return expressions;
    }


}

module.exports = new SettingsController();
