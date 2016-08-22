'use strict'
var execFile = require('child_process').exec;

// var child = execFile('/Users/roie/Sites/nodeMan/scripts/list-files.sh', ['~/Sites/'], {});

var child = execFile('/Users/roieki/Sites/nodeMan/scripts/list-files.sh', ['/Users/roieki/Sites'], {
  detached: true,
  stdio: [ 'ignore', 1, 2 ]
});

child.unref();

child.stdout.on('data', function(data){
  console.log(data.toString());
});
