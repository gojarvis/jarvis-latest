import request from 'request-promise'
import watson from 'watson-developer-cloud';
import GraphDB from '../utils/graph';
import _ from 'lodash'
import wdk from 'wikidata-sdk';
import imm from 'immutable';
import colors from 'colors';
import fs from 'fs';

let graphUtils = new GraphDB();

let alchemy_language = watson.alchemy_language({api_key: '90b037daf9e184f3f506be9f7667ce289b1392b0'});

let graph = require("seraph")({
  user: 'neo4j', pass: 'sherpa', server: 'http://45.55.36.193:7474',
  // server: 'http://localhost:7474',
});

// we don't want to create constraints on our objects, as it throws an error when we try to MERGE
// graph.constraints.uniqueness.create('Keyword', 'text', function (err, constraint) {
//   // console.log(constraint);
//   // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
// });

class MetadataManager {
  constructor(userName) {
    this.user = userName
    this.localCache = {};
  }

  async getSetKeywordsForUrl(urlNode) {
    let url = urlNode.url;

    // console.log(urlNode);
    if (!url.startsWith('http') || url.indexOf('localhost') != -1 || url.startsWith('https://www.google.com') || url.startsWith('http://www.facebook.com') || url.startsWith('http://www.google.com')) {
      return;
    }

    try {
      if ((_.isUndefined(urlNode.alchemy) || (!_.isUndefined(urlNode.alchemy) && urlNode.alchemy === 'failed')) && _.isUndefined(this.localCache[urlNode.url])) {
        try {
          console.log('NO ALCHEMY FOR ', urlNode);
          let keywords = await this.getAlchemyKeyWords(url);
          let keywordNodes = await this.saveKeywords(keywords);
          let results = await this.updateNodeAndRelationships(urlNode, keywordNodes);
          console.log('**** localCache'.red,this.localCache);
          // console.log('------------'.blue);
          // console.log('Final Results: '.red, results);
          console.log('------------'.blue, 'keywords', keywords);
          this.localCache[urlNode.url] = true;

          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'success');
          // let keywordsNodes = await this.saveKeywords(keywords);
          // console.log('keywordsNodes returned: '.red, keywordsNodes);
          // let wikidata = await Promise.all(keywordsNodes.map(keywordNode => this.ensureWikidata(keywordNode)))
          // let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'fetched');
          // let relationship = await Promise.all(keywords.map(keywords => this.relateKeywordToUrl(keywords, urlNode)));
        } catch (err) {
          console.log('getSetKeywordsForUrl failed:', err);
          this.localCache[urlNode.url] = true;
          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'error');
        }
      }

      let relatedKeywords = await graphUtils.getRelatedToUrl(url, 'related', 1);
      return relatedKeywords;
    } catch (e) {
      console.log('cant getset kws for url', e);
    } finally {}

  }

  // DEPRECATED && UNUSED
  // a failed attempt at doing this all in one go
  // it is a little tricky because when you create the keyword nodes, you're only getting temporary
  // references to them, not their actual nodes with actual node.id's
  // the id's are needed to associate the urlNode with the keyword, so this is essentially all scrapped
  async saveAndRelateKeywordsToUrl(keywords, urlNode) {
    let txn = graph.batch();

    // create save keyword queries
    let keywordNodes = imm.List();
    keywords.forEach(item => {
      let cypher = `MERGE (n:Keyword { type: 'keyword', text: '${item.text}', alchemy: true}) RETURN n`;
      keywordNodes = keywordNodes.push({
        relevance: item.relevance,
        node: txn.query(cypher, {})
      });
    });

    // save wiki data

    // update url node to fetched
    let urlUpdateCypher = `MERGE (n:Url { url: ${urlNode.url}, alchemy: 'fetched' }) RETURN n;`
    let updatedUrlNode = txn.query(urlUpdateCypher, {});

    // relate keywords to node
    let relationshipNodes = imm.List();
    keywordNodes.forEach(item => {
      let cypher = `START a=node(${item.node.id}), b=node(${updatedUrlNode.id}) CREATE UNIQUE a-[r:related]-b SET r.weight = coalesce(r.weight, 0) + ${item.relevance}`;
      console.log('Cypher:', cypher);
      relationshipNodes = relationshipNodes.push(txn.query(cypher, {}));
    });

    let res = {};
    try {
      res = await this.doCommit(txn);
    } catch (e) {
      throw e;
    } finally {
      return res;
    }
  }

  async saveKeywords(keywords) {
    console.log('Saving alchemy keywords:'.green);

    if (!imm.is(keywords)) {
      keywords = imm.fromJS(keywords);
    }

    let txn = graph.batch();

    keywords.forEach(item => {
      let cypher = `MERGE (n:Keyword { type: 'keyword', text: '${item.get("text")}', alchemy: true}) RETURN n`;
      txn.query(cypher, {});
    });

    let res = '';
    try {
      res = await this.doCommit(txn);
    } catch (e) {
      throw e;
    } finally {
      // return an object like [{ relevance: <int>, node: <node>}]
      // pair the keywordNode with the keyword.relevance data
      // this.dataToFile('./keywords.json', keywords.toJS());
      // this.dataToFile('./keywordNodes.json', res);

      let fixed = res.map(node => {
        return node[0];
      });

      let ret = fixed.map(node => {
        let kw = keywords.find(keyword => {
          // console.log('!'.yellow, keyword, node.text)
          // currently keyword.text is returning undefined, haven't investigated yet
          return keyword.get('text') === node.text;
        });

        if (kw) {
          return {
            relevance: kw.get('relevance'),
            node: node
          }
        }
      });

      return ret;
    }
  }

  // take new keyword nodes and associate them with the urlNode
  async updateNodeAndRelationships(urlNode, keywordNodes) {
    // console.log('------------'.red);
    // console.log('UrlNode:', urlNode);
    // console.log('------------'.red);
    // console.log('keywordNodes:', keywordNodes);
    // console.log('------------'.red);

    let txn = graph.batch();

    keywordNodes.forEach(kwObj => {
      let cypher = `
        START a=node(${kwObj.node.id}), b=node(${urlNode.id})
        CREATE UNIQUE (a)-[r:related]-(b)
        SET r.weight = coalesce(r.weight, 0) + ${kwObj.relevance}`;

      txn.query(cypher, {}, (err, result) => {
        if (err) {
          console.log('?'.red, err);
        }

        console.log('!:'.blue, result);
      });
    });



    let res = {};
    try {
      res = await this.doCommit(txn);
      return res;
    } catch (e) {
      console.log('CANT CREATE RELS');
      throw e;
    } finally {
      return res;
    }
  }

  dataToFile(filename, data) {
    fs.writeFile(filename, JSON.stringify(data, null, 2), error => {
      if (error) {
        console.log('Error writing file:'.red, error);
      }
    });
  }

  doCommit(txn) {
    return new Promise(function (resolve, reject) {
      try {
        txn.commit((err, results) => {
          if (err) {
            reject(err);
          }

          resolve(results);
        });
      } catch (e) {
        reject(e);
      } finally {

      }
    });
  }

  async updateUrlKeywordFetchStatus(url, status) {
    let urlNode = await this.getUrlNodeByUrl(url);
    urlNode.alchemy = status;
    let updatedNode = await this.saveUrlNode(urlNode);
    // console.log('updated node after fetching meta');

    return updatedNode;

  }

  async ensureWikidata(keywordNode) {
    if (_.isUndefined(keywordNode.wikidata)) {
      // let url = wdk.searchEntities({search: keywordNode.text, format: 'json', language:'en'});
      // let data = await request(url);
      // console.log('WIKIDATA', data);
    }
  }

  saveKeywordWord(keywordNode) {
    return new Promise(function (resolve, reject) {
      graph.save(keywordNode, function (err, node) {
        if (err)
          reject(err)
        else
          resolve(node)
      })
    });
  }

  saveUrlNode(urlNode) {
    return new Promise(function (resolve, reject) {
      graph.save(urlNode, function (err, node) {
        if (err)
          reject(err)
        else
          resolve(node)
      })
    });
  }

  getAlchemyKeyWords(url) {
    console.log('Getting alchemy keywords...'.green)
    return new Promise(function (resolve, reject) {
      if (url.startsWith("http")) {
        let params = {
          url: url,
          maxRetrieve: 10
        };

        alchemy_language.keywords(params, function (err, response) {
          if (err) {
            console.log('error:', err);
            reject(err);
          } else {
            let res = JSON.stringify(response, null, 2);
            resolve(response.keywords)
          }

        });
      } else {
        console.log('not http, so no kws');
        resolve([]);
      }

    });

  }

  async relateKeywordToUrl(keyword, urlNode) {
    try {
      let self = this;
      let keywordNode = await self.getKeywordByText(keyword.text)
      let relationship = await self.relateNodes(keywordNode, urlNode, 'related', keyword.relevance);

      return (relationship);
    } catch (e) {
      console.log('cant relate keyword to url', e);
    } finally {}
  }

  async relateNodes(origin, target, relationship, relevance) {
    let rel = (relevance)
    let cypher = 'START a=node({origin}), b=node({target}) ' +
    'CREATE UNIQUE a-[r:' + relationship + ']-b ' + 'SET r.weight = coalesce(r.weight, 0) + ' + rel;
    let params = {
      origin: origin.id,
      target: target.id,
      relationship: relationship
    };

    let res = {};

    try {
      res = await graphUtils.queryGraph(cypher, params);
      // console.log('res', res, cypher, params);
    } catch (err) {
      console.log('failed to relate', err, params);
    }

    return res
  }

  getUrlNodeByUrl(url) {
    return new Promise(function (resolve, reject) {
      graph.find({
        type: 'url',
        url: url
      }, function (err, urls) {
        if (err) {
          console.log(err);
          reject(err)
        } else
          resolve(urls[0])
      })
    });
  }

  getKeywordByText(keyword) {
    return new Promise(function (resolve, reject) {
      graph.find({
        type: 'keyword',
        text: keyword
      }, function (err, keywords) {
        if (err)
          reject(err)
        else
          resolve(keywords[0])
      })
    });
  }

  async saveKeyword(keyword) {
    let cypher = `MERGE (n:Keyword { type: 'keyword', text: ${keyword.text}, alchemy: true}) RETURN n`;

    try {
      let res = await this.queryGraph(cypher, {});
      return res;
    } catch (err) {
      console.error('!: ', error);
    }

    // return new Promise(function(resolve, reject) {
    //   graph.find({type: 'keyword', text: keyword.text, alchemy: true},function(err,res){
    //     if (err) {
    //       console.log('could not find keyword', err);
    //
    //     }
    //     else {
    //       if (_.isEmpty(res)){
    //         graph.save({type: 'keyword', text: keyword.text, alchemy:true}, 'Keyword', function(err, node){
    //           if (err) {
    //             console.log('cant save keyword', node, res,err,  keyword.text);
    //           }
    //           else {
    //             console.log('saved keyword', node);
    //             resolve(node[0])
    //           }
    //         });
    //       }
    //       else{
    //         // console.log('found keyword', res[0]);
    //         resolve(res[0]);
    //       }
    //
    //     }
    //   })
    //
    // });
  }
}

module.exports = MetadataManager;
