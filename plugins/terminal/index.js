var readline = require('readline');
var pty = require('pty.js');
var io = require('socket.io-client')('http://localhost:3000')
var utf8 = require('utf8');
var fs = require('fs');

var activeTupple = {
  command: '',
  response: ''
}

var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

term.on('data', function(data) {
    handleResponse(data)
})


term.on('error', function(data) {
    process.stdout.write('ERR:' + data);
})

term.on('close', function(e) {
    console.log("close", e)
});

var rl = readline.createInterface(process.stdin, process.stdout);

process.stdin.setEncoding('utf-8');
process.stdin.setRawMode(true);

process.stdin.on('data', function(chunk){
    if (chunk === '\t'){
      term.write('\t');
    }
})

rl.on('line', function(command) {
    handleLine(command + '\r')
    // rl.prompt();

}).on('close', function() {
    process.exit(0);
});

function handleResponse(response){
  process.stdout.write(response)
  //TODO - find a better way to filte out noise
  // console.log(response.length);
  if (response.length > 10){
    setActiveResponse(response.replace(/\x1B\[([0-9]{1,3}((;[0-9]{1,3})*)?)?[m|K]/g,''))
  }

}

function handleLine(command) {
    if (command === "!\r") rl.close();
    term.write(command);
    setActiveCommand(command.replace(/\x1B\[([0-9]{1,3}((;[0-9]{1,3})*)?)?[m|K]/g,''))
}

function setActiveCommand(command){

    activeTupple.command = command;
    activeTupple.response = '';
}

function setActiveResponse(response){
    activeTupple.response = response
    saveCommandResponseTupple();
}

function saveCommandResponseTupple(){
  fs.writeFile("/var/log/Jarvis/mlog", JSON.stringify(activeTupple), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
}
