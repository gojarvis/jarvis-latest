let fs = require('fs');
// let settingsFile = require('../../settings.json');
let path = require('path');


console.log('TRYING TO FIGURE OUT MY PATH');
console.log('============================');
// console.log(path.join(__dirname, './settings.json'));
console.log(path.resolve('settings.json'));

console.log(process.env.PROD);
// let settingsPath = path.resolve(__dirname, 'settings.json');
let settingsPath = 'settings.json';

class ProjectSettingsManager {
    constructor(){
        let settings = this.readSettingsFile()
        this.rootPath = settings.rootPath;
        this.repoCredentials = settings.repoCredentials;
        this.activityManagerCredentials = settings.activityManagerCredentials;
    }

    async setRootPath(path){
      this.rootPath = path
      let newSettings = await this.readSettingsFile();

      newSettings.rootPath = path;
      let savedSettings = await this.saveSettings(newSettings);

      return this.rootPath;
    }


    async setRepoCredentials(credentials){
      console.log('SAVING CREDS', credentials);
      this.repoCredentials = credentials
      let newSettings = await this.readSettingsFile();

      newSettings.repoCredentials = credentials;
      let savedSettings = await this.saveSettings(newSettings);

      return this.repoCredentials;
    }

    async setActivityManagerCredentials(credentials){
      this.activityManagerCredentials = credentials
      let newSettings = await this.readSettingsFile();

      newSettings.activityManagerCredentials = credentials;
      let savedSettings = await this.saveSettings(newSettings);

      return this.activityManagerCredentials;
    }

    getRepoCredentials(){
      return this.repoCredentials
    }

    getActivityManagerCredentials(){
      return this.activityManagerCredentials
    }

    getRootPath(){
      return this.rootPath;
    }

    readSettingsFile(){
      let settings = fs.readFileSync(settingsPath).toString() ;
      return JSON.parse(settings);
    }

    saveSettings(settings){
      return new Promise(function(resolve, reject) {
        console.log('WRITING TO SETTINGS FILE', settings);
        fs.writeFile (settingsPath, JSON.stringify(settings), function(err) {
          if (err) {
            console.log('error saving settings', err);
          }
          else{
            console.log('SAVED SETTINGS');
            resolve(settings);
          }
        })
      });

    }
}


module.exports = ProjectSettingsManager
