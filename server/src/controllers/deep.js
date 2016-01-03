import graph from '../utils/graph'

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
    // console.log('getRelevantUrls',this.context.urls);
    let urls = this.context.urls.map(item => item.url);
    console.log(graph);
    let related = await Promise.all(urls.map( url => graph.getRelatedToUrl(url, 'OPENWITH', 30)));
    console.log(related);
    return this.context.urls;
  }

  async getRelevantFiles(){

  }

  async getRelevantKeywords(){

  }

  // let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))




}

module.exports = Deep;
