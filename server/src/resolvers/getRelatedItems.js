import Thinky from 'thinky'
import EventEmitter from 'events';
import r from 'rethinkdb'
import colors from 'colors';
import GraphDB from '../utils/graph'
let graph = new GraphDB();
let conn = {};

let p = r.connect({db: 'test'});
p.then(function(connection){
  conn = connection;
})


let socket = GLOBAL._socket;

class getRelatedItems {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getRelatedItems';
    console.log('***** RELATED ITEMS ****'.yellow);
    this.master.on('getRelatedItems', this.getRelated.bind(this));


  }

  async getRelated(message) {
    let params = message.params.toJS();
    console.log('GETTING RELATED'.rainbow, params);

    let topKeywords = await this.getTopKeywords(params);
    // console.log('RECENT', recentEvents);
    this.master.emit('resolverDone', { objective: objective, results: recentEvents, resolverName: this.resolverName});


  }

  async getTopKeywords(params){
      console.log('Getting top keywords'.red);
      let {source, relationships, threshold} = params;
      let keywords = source.map(item => {
        console.log(item);
      });
  }

  async getUrlKeyword(urlNode){
    let url = urlNode.url;
    let cypher =
`match
(url:Url)-[*1..3]-(another:Url),
(another)-[:related]-(keyword:Keyword),
(url)-[:related]-(keyword)
where url.url = '${url}'
and not another.url = '${url}'
return distinct(keyword) as keyword limit 10`

    let kwrelated = await graph.queryGraph(cypher);
    return kwrelated;
  }
}

module.exports = getRelatedItems;
