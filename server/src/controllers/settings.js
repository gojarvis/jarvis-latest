let config = require('config');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();
let _ = require('lodash');
let Moniker = require('moniker');
let ProjectSettingsManager = require('../utils/project-settings-manager');
let projectSettingsManager = new ProjectSettingsManager();

let graphCredentials = projectSettingsManager.getRepoCredentials();

let graph = require("seraph")({
    user: graphCredentials.username,
    pass: graphCredentials.password,
    server: graphCredentials.address
});
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


}

module.exports = new SettingsController();
