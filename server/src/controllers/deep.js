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
return distinct(another.url) as url, another.title as title, another.id as id , another.type as type, r
order by r.weight desc
limit 10
`;



    let openwith = await graph.queryGraph(cypher);
    // let openwithUrls = await Promise.all(openwith.map(entry => {
    //   return { url: entry.url, title: entry.title, id: entry.id }
    // });

    return openwith;

  }


  async getKeywordRelated(urlNode){
    let url = urlNode.url;
    let cypher =
// `match
// (url:Url)-[r:openwith]-(another:Url),
// (another)-[:related]-(keyword:Keyword),
// (target:Url)-[:related]-(keyword)
// where url.url = '${url}'
// return distinct(target.url) as url, target.title as title, target.type as type, another, r, keyword
// order by r.weight desc
// limit 30`;
`match
(url:Url)-[*1..3]-(another:Url),
(another)-[:related]-(keyword:Keyword),
(url)-[:related]-(keyword)
where url.url = '${url}'
return distinct(another.url) as url, another.title as title, another.type as type, keyword limit 10`

    let kwrelated = await graph.queryGraph(cypher);
    return kwrelated;
  }




  async getSocial(username, activeUrl){

      let cypher =

`match
(user:User)-[a:touched]-(url:Url)<-[c:openwith]->(anotherUrl:Url),
(url)-[:related]-(keyword:Keyword)-[:related]-(anotherUrl),
(anotherUser:User)-[b:touched]->(target:Url)-[s:openwith]-(anotherUrl)
where exists(url.title) and exists(target.title)
and url.url = '${activeUrl.url}'
and not anotherUser.username = '${username}'
with anotherUrl, s
order by s.weight desc
return distinct(anotherUrl.url) as url, anotherUrl.title as title, anotherUrl.type as type`;
//
//
// `match
// (user:User)-[a:touched]-(url:Url)<-[c:openwith]->(anotherUrl:Url),
// (anotherUser:User)-[b:touched]-(anotherUrl)
// where url.url = '${activeUrl.url}'
// and exists(url.title) and exists(anotherUrl.title)
// and not anotherUser.username = '${username}'
// return distinct(anotherUrl.url) as url, anotherUrl.title as title,b
// order by b.weight desc
// limit 10`;

      try{
        // console.log('social=============>>>');
        // console.log(cypher);
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
