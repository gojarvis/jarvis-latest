import ProjectSettingsManager from './project-settings-manager';
let projectSettingsManager = new ProjectSettingsManager();
let activityManagerCredentials = projectSettingsManager.getActivityManagerCredentials();

let db = require('thinky')({
    host: activityManagerCredentials.address
});

module.exports = db;
