import heartbeats from 'heartbeats'


class Proactive {
    constructor(socket, sid, io, context){
      this.socket = socket;
      this.sid = sid;
      this.io = io;
      this.context = context;

      this.heart = heartbeats.createHeart(1000);

      this.heart.createEvent(10, function(heartbeat, last){
        this.handleHeartbeat(heartbeat);
      }.bind(this));

      this.registerEvents()
    }

    registerEvents(){
      let self = this;

      // self.socket.emit('speak', 'Proactive is now online.');
    }

    handleHeartbeat(){
      let self = this;



      // self.socket.emit('speak', 'boo boom')
    }

}

module.exports = Proactive
