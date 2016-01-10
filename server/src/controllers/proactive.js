import heartbeats from 'heartbeats'
import r from 'rethinkdb'
import _ from 'lodash'



class Proactive {
    constructor(socket, sid, io, context, history, deep){
      this.socket = socket;
      this.sid = sid;
      this.io = io;
      this.context = context;
      this.deep = deep;
      this.heart = heartbeats.createHeart(1000);

      this.heart.createEvent(10, function(heartbeat, last){
        this.handleHeartbeat(heartbeat);
      }.bind(this));

      this.heart.createEvent(100, function(heartbeat, last){
        this.handleDeepconnect(heartbeat);
      }.bind(this));

      this.registerEvents()
    }

    registerEvents(){
      let self = this;
    }

    handleHeartbeat(hb){
      let self = this;
      self.socket.emit('heartbeat', hb);
      self.recommend();
      process.stdout.write('.');
    }

    async recommend(){
      let user = this.context.get().user;
      if (_.isEmpty(user)){
        console.error('No user loaded, cant get recommendations');
      }

      let social = await this.deep.getSocial(user.username);
      let historics = await this.deep.getHistorics(user.username);

      //What did I work on {time}
      this.io.emit('recommendations', {
        historics: historics,
        social: social
      })



    }

    async handleDeepconnect(){

      //Suggest clusters for tagging
      // let possibleClusters = await this.deep.updateClusters()
      // if (possibleClusters > 0){
      //   this.socket.emit('possible-clusters', possibleClusters)
      // }
      //
      // let relevantFiles = await this.relevantFiles()
      // if (relevantFiles > 0){
      //   this.socket.emit('relevant-files', relevantFiles)
      // }
      //
      // let relevantUrls = await this.relevantFiles()
      // if (relevantUrls > 0){
      //   this.socket.emit('relevant-urls', relevantUrls)
      // }


    }

    async getFrame(){
      //https://www.youtube.com/watch?v=2o2xBOQeB7Q
    }



}

module.exports = Proactive
