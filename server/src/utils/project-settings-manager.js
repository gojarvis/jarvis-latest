let fs = require('fs');
let settingsPath = __dirname + '/../../config/settings.json'

class ProjectSettingsManager {
    constructor(){
        this.readSettingsFile().then(settings => {
          this.rootPath = settings.rootPath;
        })
    }

    async setRootPath(path){
      this.rootPath = path
      let newSettings = await this.readSettingsFile();

      newSettings.rootPath = path;
      let savedSettings = await this.saveSettings(newSettings);

      return this.rootPath;
    }

    getRootPath(){
      return this.rootPath;
    }

    readSettingsFile(){
      return new Promise(function(resolve, reject) {
        let settings;
        fs.readFile(settingsPath, 'utf8', function(err, data){
          if (err){
            console.log('cant read settings file', err);
          }
          else{
            settings = JSON.parse(data);
            console.log('READ SETTINGS', settings);
            resolve(settings)
          }
        })
      });
    }

    saveSettings(settings){
      return new Promise(function(resolve, reject) {
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
