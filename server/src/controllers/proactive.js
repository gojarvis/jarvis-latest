import heartbeats from 'heartbeats'
import r from 'rethinkdb'
import _ from 'lodash'
import moment from 'moment'
import Meta from './metadataManager';



class Proactive {
    constructor(socket, sid, io, context, history, deep){
      this.socket = socket;
      this.sid = sid;
      this.io = io;
      this.context = context;
      this.deep = deep;
      this.heart = heartbeats.createHeart(1000);

      //I'm going to throw up on myself, but FUCK IT.
      this.user = this.context.get().user;
      this.metadata = new Meta(this.user);


      this.heart.createEvent(30, function(heartbeat, last){
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
      self.deepContext();
      process.stdout.write('.');
    }

    async deepContext(){
        try{
          let urls = this.context.get().urls;
          if (urls.length === 0) return;
          let keywords = await Promise.all(urls.map(url => this.metadata.getSetKeywordsForUrl(url)));
        }
        catch(err){
          console.log('bad deep', err);
        }
    }

    async recommend(){
      let user = this.context.get().user;
      if (_.isEmpty(user)){
        console.error('No user loaded, cant get recommendations');
      }
      try {
        let anHourAgo = moment().subtract(1, 'hour').format();

        let yesterday = moment().subtract(1, 'day').format();
        let yesterdayHour = moment().subtract(1, 'day').add(1, 'hour').format();
        let startOfDay = moment().startOf('day').format();
        let now = moment().format();

        let social = await this.deep.getSocial(user.username);

        //
        let lastHour = await this.deep.getHistorics(user.username, anHourAgo,now);
        let yesterdayDay = await this.deep.getHistorics(user.username, yesterday,now);
        let yesterdayThisHour = await this.deep.getHistorics(user.username, yesterday,yesterdayHour);

        let historics = {social,lastHour, yesterdayDay, yesterdayThisHour};



        this.io.emit('recommendations', {
          historics: historics,
          social: social
        })

      } catch (e) {
          console.log('whoops', e);
      } finally {

      }


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
