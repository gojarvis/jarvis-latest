import projectSettingsManager from "./settings-manager";
let activityManagerCredentials = projectSettingsManager.getActivityManagerCredentials();

let db = require("thinky")({
    host: activityManagerCredentials.address
});

module.exports = db;
