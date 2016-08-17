let nodemon = require('nodemon')
let Q = require('q')
let {spawn} = require('child_process');



let execNodeProgram = function(path, args){
  let dfd = Q.defer();
  let child = spawn('./src/scripts/' + path, [args]);
  // nodemon({
  //   'script': './src/scripts/' + path,
  //   'stdout': true
  // }).on('readable', function(){
  //   let res ='';
  //   this.stdout.on('data', function(data){
  //     res += data;
  //   });
  //   this.stdout.on('end', function(){
  //     console.log('RES');
  //     dfd.resolve(res);
  //   });
  // }).on('error', function(err){
  //   console.log('error');
  // });

  let res = ''

  child.stdout.on('data', function (data) {
    res += data;
  });

  child.stdout.on('end', function () {
    console.log('RES');
    dfd.resolve(res);
  });
  return dfd.promise;
}






module.exports = execNodeProgram
