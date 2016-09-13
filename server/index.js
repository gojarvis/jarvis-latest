require('babel-core/register');
require('babel-polyfill');
var childProc = require('child_process');

function install() {
  return new Promise(function(fulfill, reject) {
    console.log('Installing node modules...');
    childProc.exec('npm install', function(error, stdout, stderr) {
      // console.log('stdout: ' + stdout);
      if (error !== null) {
        console.log('exec error: ' + error);
        console.log('stderr: ' + stderr);
        reject(error);
      }

      fulfill("Yay!");
    })
  })
}

install().then(function(res) {
  console.log('Success: ', res);
  require('./src/main.js');
}).catch(function(error) {
  console.log('Error: ', error);
})
