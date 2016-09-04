/**
 * prereq-test.js
 * @author: Eric Ogden, @parties
 *
 * Description:
 *    Spawns two child processes to check node and npm versions
 *
 * Return:
 *    When spawned with `node prereq-test.js` the process will exit with
 *    either a code 0 (success) or a code 1 (failure).
 *
 * How to use:
 *    In another file, use child_process.exec to create a process, and assign a
 *    function to handle the 'exit' event (fn(code, signal)).
 */

var compareVersions = require('compare-versions');
var process = require('process');
var exec = require('child_process').exec;

let isToolsetValid = false;
let isNodeValid = false;
let isNpmValid = false;

var getNodeVer = 'node -v';
var getNpmVer = 'npm -v';
var minNodeVer = '6.0.0';
var minNpmVer = '3.0.0';
var localNodeVersion, localNpmVersion;

function findVer(cmd) {
  return new Promise(function(fulfill, reject) {
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        fulfill(stdout);
      }
    })
  })
}

Promise.all([
  findVer(getNodeVer),
  findVer(getNpmVer)
]).then(function(results) {
  localNodeVersion = results[0].replace(/\n/g, '').slice(1);
  localNpmVersion = results[1].replace(/\n/g, '');

  isNodeValid = !!(compareVersions(localNodeVersion, minNodeVer) > -1);
  isNpmValid = !!(compareVersions(localNpmVersion, minNpmVer) > -1);

  isToolsetValid = isNodeValid && isNpmValid;

  // console.log(`${localNodeVersion} vs. ${minNodeVer}: ${isNodeValid}`);
  // console.log(`${localNpmVersion} vs. ${minNpmVer}: ${isNpmValid}`);

  if (isToolsetValid) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(function(error) {
  process.exit(1);
});
