// @flow

class TerminalController {
  socket: Object;
  sid: Object;
  io: Object;
  context: Object;
  history: Object;

  constructor(socket: Object, sid: Object, io: Object, context: Object, history: Object): void {
    this.socket = socket;
    this.sid = sid;
    this.io = io;
    this.context = context;
    this.history = history;

    this.io.emit('load-terminal');
    this.registerEvents();
  }

  registerEvents(): void {
    this.socket.on('atom-cmd', (data) => {
      console.log('atom-cmd:', data);
    });
  }
}

module.exports = TerminalController;
