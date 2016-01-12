import GraphDB from '../utils/graph'
import r from 'rethinkdb'
import Promise from 'bluebird';


let graph = new GraphDB();
let connection = null;

r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

class Deep{
  constructor(history, context){
    this.context = context;

  }

  getUrlById(id){
    return new Promise(function(resolve, reject) {
      graph.getNodeById(id).then(function(node){
        resolve(node);
      });
    });
  }

  async updateClusters(){
      //Find groups of clusters, and add "cluster-handle"
      //node that will relate to the cluster.

      //Find top ten urls

      //Foreach, find most related URLs and files.

      //Whenever checking a candidate cluster, make sure other memebers of
      //top 10 are removed

  }

  async getOpenWith(urlNode){
    let url = urlNode.url;
    let self = this;
    let cypher =
`match
(url:Url)-[r:openwith]-(another:Url)
where url.url = '${url}'
and not another.url = '${url}'
return r
order by r.weight
limit 10
`;


    let openwith = await graph.queryGraph(cypher);    
    let openwithUrls = await Promise.all(openwith.map(rel => self.getUrlById(rel.end)));
    return openwithUrls;

  }


  async getSocial(username){

//       let cypher =
// `MATCH (file:File)-[t:touched]-(user:User),
// (file)-[ow:openwith]-(url:Url),
// (url)<-[s:touched]-(another:User),
// (another)-[p:touched]-(otherUrl:Url),
// (keyword)-[kr:related]-(url),
// (keyword)-[krr:related]-(otherUrl)
// WITH otherUrl, keyword, count(kr) as countKeyword, user, s, another
// where  user.username = '${username}'
// and not (user)-[:touched]-(otherUrl)
// return distinct(otherUrl.url) as url, countKeyword,another.username
// order by countKeyword desc
// limit 10`;
      let cypher =
`match
(url:Url)-[t:touched]-(user:User),
(anotherUrl:Url)-[at:touched]-(anotherUser:User),
(url)-[a:related]-(kw:Keyword)-[b:related]-(anotherUrl)
where user.username = '${username}'
and not anotherUser.username = '${username}'
and exists(url.title) and exists(anotherUrl.title)
return distinct(anotherUrl.url) as url, anotherUrl.title as title, kw as keyword, a ,b, anotherUser
order by a.weight desc limit 8`;

      try{
        let social = await graph.queryGraph(cypher);

        return social;
      }
      catch(err){
        console.log('cant get social', err);
      }

  }

  getHistorics(username,start,end){
    return new Promise(function(resolve, reject) {
      r.table('Event').filter(r.row('timestamp')
      .during(new Date(start), new Date(end), {leftBound: "open", rightBound: "closed"}))
      .filter({user: username}).run(connection).then(function(cursor){
        return cursor.toArray();
      }).then(function(result){
        resolve(result);
      });
    });
  }







  // let relatedUrls = await Promise.all(related.map(relation => this.getUrlById(relation.end)))




}

module.exports = Deep;
