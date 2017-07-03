/**
 * install.js
 * @author: Eric Ogden, @parties
 *
 * Description:
 *    Future: this could be a controlling application that handles checking versions
 *      and calling further setup instructions (possibly just calling install.sh
 *      after calling for prereq-test).
 *
 *    Currently: spawns a process of prereq-test.js and waits for its exit code.
 *
 * Returns:
 *    Future: returns helpful logs about installation process and final installation result.
 *    Currently: Logs result of node and npm version checks.
 */

var ChildProcess = require("child_process");

var prereqSuccess;
var prereqTest = ChildProcess.exec("node prereq-test.js");

function checkVersions() {
    return new Promise(function(fulfill, reject) {
        prereqTest.on("exit", function(code, signal) {
            if (code === 0) {
                fulfill(true);
            } else {
                fulfill(false);
            }
        });
    });
}

checkVersions().then(isValid => {
    console.log("Node and Npm Version Check: ", isValid);
});
