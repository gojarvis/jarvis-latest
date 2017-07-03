let fs = require("fs");
// let settingsFile = require('../../settings.json');
let path = require("path");

// let settingsPath = path.resolve(__dirname, 'settings.json');
let settingsPath = "settings.json";

class SettingsManager {
    constructor() {
        let settings = this.readSettingsFile();
        this.rootPath = settings.rootPath;
        this.repoCredentials = settings.repoCredentials;
        this.activityManagerCredentials = settings.activityManagerCredentials;
        this.filter_blacklist = settings["filter_blacklist"];
        this.filter_whitelist = settings["filter_whitelist"];
        this.aggregationHoursValue = settings.aggregationHoursValue;
    }

    async setRootPath(path) {
        this.rootPath = path;
        let newSettings = await this.readSettingsFile();

        newSettings.rootPath = path;
        let savedSettings = await this.saveSettings(newSettings);

        return this.rootPath;
    }

    async setRepoCredentials(credentials) {
        let saved = await this.saveSettingsByKey(
            "repoCredentials",
            credentials
        );
        this.repoCredentials = credentials;
        return this.repoCredentials;
    }

    async setAggregationHoursValue(value) {
        let saved = await this.saveSettingsByKey(
            "aggregationHoursValue",
            value
        );
        this.aggregationHoursValue = value;
        return this.aggregationHoursValue;
    }

    async setActivityManagerCredentials(credentials) {
        let saved = await this.saveSettingsByKey(
            "activityManagerCredentials",
            credentials
        );
        this.activityManagerCredentials = credentials;
        return this.activityManagerCredentials;
    }

    async setFilterStatus(filterType, filterStatus) {
        let key = `filter_${filterType}`;
        this[key] = filterStatus;
        let saved = await this.saveSettingsByKey(key, filterStatus);
        return saved;
    }

    async getFilterStatus(filterType) {
        let key = `filter_${filterType}`;
        let value = this[key];
        return value;
    }

    async saveSettingsByKey(key, value) {
        let newSettings = this.readSettingsFile();

        newSettings[key] = value;
        let saved;
        try {
            // console.log('SAVING', newSettings);
            saved = await this.saveSettings(newSettings);
        } catch (e) {
            console.log("cant save settings", e);
        } finally {
            return saved;
        }
    }

    async getAggregationHoursValue() {
        return this.aggregationHoursValue;
    }

    getRepoCredentials() {
        return this.repoCredentials;
    }

    getActivityManagerCredentials() {
        return this.activityManagerCredentials;
    }

    getRootPath() {
        return this.rootPath;
    }

    readSettingsFile() {
        let settings = fs.readFileSync(settingsPath).toString();
        return JSON.parse(settings);
    }

    saveSettings(settings) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(settingsPath, JSON.stringify(settings), function(err) {
                if (err) {
                    console.log("error saving settings", err);
                } else {
                    console.log("SAVED SETTINGS");
                    resolve(settings);
                }
            });
        });
    }
}

let settingsManager = new SettingsManager();
module.exports = settingsManager;
