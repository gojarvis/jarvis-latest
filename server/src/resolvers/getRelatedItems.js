const EventEmitter = require('events')
const r = require('rethinkdb')
const colors = require('colors')
const GraphDB = require('../utils/graph')
const imm = require('immutable')

let graph = new GraphDB();
let conn = {};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

let p = r.connect({db: 'test'});
p.then(function(connection){
  conn = connection;
})


let socket = global._socket;

class getRelatedItems {
  constructor(master) {
    // this.master = master;
    this.resolverName = 'getRelatedItems';

  }

  async execute(message){
    console.log('Executing'.green, this.resolverName);
    let result = await this.getRelated(message);
    console.log('Result'.green, result);
    return result;
  }

  async getRelated(message) {
    let {objective, target, params} = message;

    let topKeywords = await this.getTopKeywords(params);
    let results = this.sanitize(topKeywords);

    return({ objective: objective, results: results, resolverName: this.resolverName, target: target});


  }

  sanitize(items){
    let flat = flatten(items)
    console.log('----------------Sanitizing----------------'.blue);

    let cache = {};
    let unique = [];

    flat.forEach(item => {
        let word = item.keyword.toLowerCase();
        if (typeof cache[word] == 'undefined'){
          cache[word] = word;
          unique.push(word);
        }
    })

    console.log('unique'.yellow, unique);

    return unique
  }

  async getTopKeywords(params){
      console.log('Getting top keywords'.red);
      let source = params.get('source');
      let threshold = params.get('threshold')

      let keywords = await Promise.all(source.map(item => {
        let url = item.group;
        return this.getUrlKeyword(url)
      }));

      return keywords;
  }

  async getUrlKeyword(url){
    console.log('getUrlKeyword'.yellow, url);
    let cypher =
`match
(url:Url)-[*1..2]-(another:Url),
(another)-[f:related]-(keyword:Keyword),
(url)-[s:related]-(keyword)
where url.url = '${url}'
and not another.url = '${url}'
return distinct(keyword.text) as keyword, f.weight as weight order by weight desc limit 50`

    let kwrelated = await graph.queryGraph(cypher);
    return kwrelated;
  }
}

module.exports = getRelatedItems;
