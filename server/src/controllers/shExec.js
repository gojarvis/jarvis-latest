import Q from 'q'
let spawn = require('child_process').spawn;

module.exports = function(command){
  let dfd = Q.defer();

  var worker = spawn(command, [], {
    cwd: './src/scripts/'
  });
  var res = '';

  worker.stdout.on('data', function(data){
    res += data;
    console.log(res);
  });


  worker.stdout.on('end', function(){
    // dfd.resolve(res);
    console.log(res);
  });

  return dfd;

}
