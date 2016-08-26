var readline = require('readline');
var pty = require('pty.js');
var io = require('socket.io-client')('http://localhost:3000')
var utf8 = require('utf8');
var fs = require('fs');
var stripAnsi = require('strip-ansi');
var _ = require('lodash');
var cmd = '';
var res = '';
var previousCmd = '';
var tabbed = false;
var activeTupple = {
  command: '',
  response: ''
}

io.emit('terminal-connected');

var term = pty.spawn('zsh', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

term.on('data', function(data) {
    handleResponse(data)
})

term.on('end', function(){
  console.log('END');
});


term.on('error', function(data) {
    process.stdout.write('ERR:' + data);
})

term.on('close', function(e) {
    console.log("close", e)
});

var rl = readline.createInterface(process.stdin, process.stdout);

process.stdin.setEncoding('utf-8');
process.stdin.setRawMode(true);



process.stdin.on('keypress', function (ch, key) {
  // console.log('got "keypress"', key, key.sequence.length);
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
  if (!_.isUndefined(key) && key.sequence.length === 1 && key.sequence !== '\t' && key.sequence !== '\r'){
    cmd += key.sequence;
  }
  else{
    switch(key.name){
      case 'down' :
      term.write('\u001bOB')
      break;
      case 'left' :
      term.write('\u001bOD')
      break;
      case 'right' :
      term.write('\u001bOC')
      break;
      case 'tab' :
      term.write(cmd);
      term.write('\t');
      tabbed = true;
      break;
      case 'return' :
      execute()
      break;
    }
  }

});

function execute(){
  //Save the previous Command and Response
  if (!_.isEmpty(previousCmd)){
    setActiveCommand(previousCmd);
    setActiveResponse(res);
    saveCommandResponseTupple();
  }

  res = '';
  //Save the command that is going to be executed
  previousCmd = cmd;

  //Execute the command
  term.write(cmd + '\r');

  //Reset the active cmd
  cmd = '';
  tabbed = false;

}

rl.on('line', function(command) {
    // handleLine(command + '\r')
    // rl.prompt();

}).on('close', function() {
    process.exit(0);
});

function handleResponse(response){
  res += response;
  if (!tabbed){
    process.stdout.write(response);
  }
  else{
    console.log('RES', response);
  }
}


function setActiveCommand(command){
    activeTupple.command = command;
}

function setActiveResponse(response){
    activeTupple.response = stripAnsi(response.replace('/r', ''))
    saveCommandResponseTupple();
}

function saveCommandResponseTupple(){
  io.emit('terminal-command', activeTupple)
  console.log('Sending the previous tupple', activeTupple);
  fs.writeFile("/var/log/Jarvis/mlog", JSON.stringify(activeTupple), function(err) {
    if(err) {
        return console.log(err);
    }
  });
}
