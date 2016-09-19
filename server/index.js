var childProc = require('child_process');
var fs = require('fs');

function checkIfInstalled(){
  try {
    var flag = fs.statSync('installed.flag')
    var isInstalled = flag.isFile();
    if (isInstalled) return true
    else return false
  } catch(e) {
    return false;
  }
}

function install() {
  return new Promise(function(fulfill, reject) {
    if (checkIfInstalled()) {
      fulfill('Installed');
    } else {
      console.log('Installing node modules...');
      childProc.exec('npm install', function(error, stdout, stderr) {
        // console.log('stdout: ' + stdout);

        if (error !== null) {
          console.log('exec error: ' + error);
          reject(error);
        }

        fulfill("Yay!");
      })
    }
  })
}

install().then(function(res) {
  console.log('Success: ', res);
  fs.writeFileSync('installed.flag');
  require('babel-core/register');
  require('babel-polyfill');
  require('./src/main.js');
}).catch(function(error) {
  console.log('Error: ', error);
})
