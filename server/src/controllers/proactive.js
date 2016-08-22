let heartbeats = require('heartbeats')
let r = require('rethinkdb')
let _ = require('lodash')
let moment = require('moment')
let Meta = require('./metadataManager')
let graphUtils = require('../utils/graph')

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


      this.heart.createEvent(30, function(heartbeat, last){
        this.relateContextToItself(heartbeat);
      }.bind(this));


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
      let others = urls.filter(item => item.address !== url.address);
      let singleRelationships = await this.graph.relateOneToMany(url, others, 'openwith');
      return singleRelationships;
    }

    async relateFileToFiles(file, files){
      let others = files.filter(file => file.address !== file.address);
      let singleRelationships = await this.graph.relateOneToMany(file, others, 'openwith');
      return singleRelationships;
    }

}

module.exports = Proactive
