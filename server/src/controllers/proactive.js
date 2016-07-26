import heartbeats from 'heartbeats'
import r from 'rethinkdb'
import _ from 'lodash'
import moment from 'moment'
import Meta from './metadataManager';
import graphUtils from '../utils/graph';

class Proactive {
    constructor(socket, sid, io, context, history, deep){
      this.socket = socket;
      this.sid = sid;
      this.io = io;
      this.context = context;
      this.deep = deep;
      this.lastActiveUrl = '';
      this.graph = new graphUtils();
      this.heart = heartbeats.createHeart(1000);

      //I'm going to throw up on myself, but FUCK IT.
      this.user = this.context.get().user;
      this.metadata = new Meta(this.user);

      this.heart.createEvent(10, function(heartbeat, last){
        this.handleHeartbeat(heartbeat);
      }.bind(this));

      this.heart.createEvent(100, function(heartbeat, last){
        this.handleDeepconnect(heartbeat);
      }.bind(this));


    }

    handleHeartbeat(hb){
      let self = this;
      self.socket.emit('heartbeat', hb);
      self.recommend();
    }

    async relateContextToItself(){
        try{
          let urls = this.context.get().urls;
          let files = this.context.get().files;
          // console.log(urls);
          if (urls.length > 0) {
            let urlRelationships = Promise.all(urls.map(url => this.relateUrlToUrls(url,urls)))

            let keywords = await Promise.all(urls.map(url => this.metadata.getSetKeywordsForUrl(url)));
          }

          if (files.length > 0){
            let fileRelationships = Promise.all(files.map(file => this.relateFileToFiles(file, files, 'openwith')));
          }

          if (files.length > 0 && urls.length > 0){
            let fileRelationships = Promise.all(files.map(file => this.graph.relateOneToMany(file, urls, 'openwith')));
          }

        }
        catch(err){
          console.log('bad deep', err);
        }
    }

    async relateUrlToUrls(url, urls){
      let others = urls.filter(item => item.url !== url.url);
      let singleRelationships = await this.graph.relateOneToMany(url, others, 'openwith');
      return singleRelationships;
    }

    async relateFileToFiles(file, files){
      let others = files.filter(file => file.uri !== file.uri);
      let singleRelationships = await this.graph.relateOneToMany(file, others, 'openwith');
      return singleRelationships;
    }

    // async recommend(){
    //   let user = this.context.get().user;
    //
    //   if (_.isEmpty(user)){
    //     console.error('No user loaded, cant get recommendations');
    //   }
    //   try {
    //
    //     let activeUrl = this.context.getActiveUrl();
    //     //If URL did not change
    //     if (activeUrl.url === this.lastActiveUrl || _.isUndefined(activeUrl.url) || activeUrl.url === 'http://localhost:8888/'){
    //       // process.stdout.write('=');
    //       return;
    //     }
    //   } catch (e) {
    //       console.log('whoops', e);
    //   } finally {
    //
    //   }
    // }

    async recommend(){
      let user = this.context.get().user;

      if (_.isEmpty(user)){
        console.error('No user loaded, cant get recommendations');
      }
      try {

        let activeUrl = this.context.getActiveUrl();

        //If the url is the same as before, do nothing

        if (activeUrl.url === this.lastActiveUrl || _.isUndefined(activeUrl.url)){
          process.stdout.write('=');
          return;
        }

        this.lastActiveUrl = activeUrl.url;

        let anHourAgo = moment().subtract(1, 'hour').format();

        let yesterday = moment().subtract(1, 'day').format();
        let yesterdayHour = moment().subtract(1, 'day').add(1, 'hour').format();
        let startOfDay = moment().startOf('day').format();
        let now = moment().format();


        let openwith = [];
        let social = [];
        let kwrelated = [];
        if (!_.isEmpty(activeUrl) && !_.isUndefined(activeUrl)){
          social = await this.deep.getSocial(user.username, activeUrl);
          openwith = await this.deep.getOpenWith(activeUrl);
          kwrelated = await this.deep.getKeywordRelated(activeUrl);
        }
        else{
          process.stdout.write('_');
        }

        //
        let lastHour = await this.deep.getHistorics(user.username, anHourAgo,now);
        let yesterdayDay = await this.deep.getHistorics(user.username, yesterday,now);
        let yesterdayThisHour = await this.deep.getHistorics(user.username, yesterday,yesterdayHour);

        // let historics = {lastHour, yesterdayDay, yesterdayThisHour};
        let historics = {

        };


        console.log('RECOMMENDING', {
          historics: historics,
          social: social,
          openwith: openwith,
          kwrelated: kwrelated
        });
        this.io.emit('recommendations', {
          historics: historics,
          social: social,
          openwith: openwith,
          kwrelated: kwrelated
        })

      } catch (e) {
          console.log('whoops', e);
      } finally {

      }


    }

    async handleDeepconnect(){
      let self = this;
      self.relateContextToItself();
      self.updateUserPools();
      self.updateOverallPools();
    }

    async getUserUrlsByTime(){

    }

    async getUserFilesByTime(){}

    async getRelatedUrl(entry, minWeight){
      //Search Neo4j for URLs that are related to the Entry with at least minWeight weight
    }

    async updateUserPools(){
      let self = this;

      //Get The user's URLs, Files, and Commands by time.
      //This should also include URLs based on time, as well as "overall"
      let userUrlsByTime = await self.getUserUrlsByTime()

      let userFilesByTime = await self.getUserFilesByTime()

      let userCommandsByTime = await self.getUserCommandsByTime()

      //Get urls that are highly related to files and commands
      let weight = 100;

      //Insert URLs to DB
      let urlsDB = await self.updateURLs()
      //Iterate over the URLs, and find all of their keywords

      //Get a list of unique URLs from the database
      let urls = await self.getUniqueUrls(urlsDB)

      //Create list of all Keywords
      let userCurrentKeywordSpace = self.getKeywordsForUrls(urls);

      //Insert Keywords to DB, count and sort by desc frequency of keyword


      //Search which URLs are related to top keywords

      //Search which Files and Commands are related to top URLs (--> keywords)

      //Search for repeating URLs in user's own history



    }

    async updateOverallPools(){

    }




}

module.exports = Proactive
