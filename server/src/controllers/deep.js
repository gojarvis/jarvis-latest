import GraphDB from '../utils/graph'
import r from 'rethinkdb'
import Promise from 'bluebird';


let graph = new GraphDB();
let connection = null;


class Deep{
  constructor(history, context){
    this.context = context;
    this.connection = GLOBAL.rethinkdbConnection
  }

  getUrlById(id){
    return new Promise(function(resolve, reject) {
      graph.getNodeById(id).then(function(node){
        resolve(node);
      });
    });
  }

  async getOpenWith(urlNode){
    let url = urlNode.url;
    let self = this;
    let cypher =
`match
(url:Url)-[r:openwith]-(another:Url)
where url.url = '${url}'
and not another.url = '${url}'
return distinct(another.url) as url, another.title as title, another.id as id , another.type as type, r
order by r.weight desc
limit 10
`;

    let openwith = await graph.queryGraph(cypher);
    return openwith;
  }

  async getKeywordRelated(urlNode){
    let url = urlNode.url;
    let cypher =

`match
(url:Url)-[*1..3]-(another:Url),
(another)-[:related]-(keyword:Keyword),
(url)-[:related]-(keyword)
where url.url = '${url}'
and not another.url = '${url}'
return distinct(another.url) as url, another.title as title, another.type as type limit 10`

    let kwrelated = await graph.queryGraph(cypher);
    return kwrelated;
  }

  async getSocial(username, activeUrl){

      let cypher =

`match
(user:User)-[a:touched]-(url:Url)<-[c:openwith]->(anotherUrl:Url),
(anotherUser:User)-[b:touched]->(target:Url)-[s:openwith]-(anotherUrl)
where exists(url.title) and exists(target.title)
and not user.username = anotherUser.username
and url.url = '${activeUrl.url}'
and user.username = '${username}'
and not anotherUser.username = '${username}'
with anotherUrl, s
order by s.weight desc
return distinct(anotherUrl.url) as url, anotherUrl.title as title, anotherUrl.type as type limit 10`;

      try{
        let social = await graph.queryGraph(cypher);
        return social;
      }
      catch(err){
        console.log('cant get social', err);
      }
  }

  getHistorics(username,start,end){
    let self = this;
    return new Promise(function(resolve, reject) {
      r.table('Event').filter(r.row('timestamp')
      .during(new Date(start), new Date(end), {leftBound: "open", rightBound: "closed"}))
      .filter({user: username}).run(self.connection).then(function(cursor){
        return cursor.toArray();
      }).then(function(result){
        resolve(result);
      });
    });
  }

}

module.exports = Deep;
