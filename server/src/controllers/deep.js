import GraphDB from '../utils/graph'
let graph = new GraphDB();

class Deep{
  constructor(history, context){
    this.context = context;

  }

  async updateClusters(){
      //Find groups of clusters, and add "cluster-handle"
      //node that will relate to the cluster.

      //Find top ten urls

      //Foreach, find most related URLs and files.

      //Whenever checking a candidate cluster, make sure other memebers of
      //top 10 are removed

  }

  async getRelevantNodes(){
    let relevantUrls = await this.getRelevantUrls()
    // let relevantFiles = await this.getRelevantUrls()
    // let relevantKeywords = await this.getRelevantUrls()

    return
  }

  async getRelevantUrls(){

    let urls = this.context.urls.map(item => item.url);

    let related = await Promise.all(urls.map(url => graph.getRelatedToUrl(url, 'OPENWITH', 30)));
    console.log(related);   
    return related;
  }

  async getRelevantFiles(){

  }

  async getRelevantKeywords(){

  }

  // let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))




}

module.exports = Deep;
