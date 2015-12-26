import heartbeats from 'heartbeats'


let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa'
});


class contextManager{
  constructor(){
    this.urls = [];
    this.files = [];
    this.heart = heartbeats.createHeart(1000);

    this.heart.createEvent(10, function(heartbeat, last){
      this.handleHeartbeat(heartbeat);
    }.bind(this));
  }

  updateFiles(files){
    this.files = files;
    console.log('context updated files', this.files);
  }

  addFileNode(fileNode){
    console.log('adding file to context', fileNode);
    let file = this.files.filter(file => file.uri === fileNode.uri);
    console.log('file',file.length);
    if (file.length === 0){
      this.files.push(fileNode);
    }
  }

  updateUrl(urls){
    this.urls = urls;
    console.log('context updated urls', this.urls);
  }

  relateUrlsToFiles(){
    console.log(this.urls,this.files)
  }

  handleHeartbeat(heartbeat){
    console.log("*");
    this.relateUrlsToFiles()

  }


}


module.exports = contextManager;
