var spawn = require('child_process').spawn;
var worker = spawn('list-files', [], {
  cwd: './src/scripts/'
});
var res = '';

worker.stdout.on('data', function(data){
  res += data;
  console.log(res);
});


worker.stdout.on('end', function(){
  console.log(res);
});
