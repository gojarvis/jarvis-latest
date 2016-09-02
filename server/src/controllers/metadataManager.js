let request = require('request-promise');
let watson = require('watson-developer-cloud');
let GraphUtil = require('../utils/graph');
let _ = require('lodash');
let wdk = require('wikidata-sdk');
let imm = require('immutable');
let colors = require('colors');
let fs = require('fs');

let graphUtil = new GraphUtil();
//9afdfd3783da57ff673da2316105c8e52f411576

let alchemy_language = watson.alchemy_language({api_key: 'ab2b4727617c0d529641168272d1e661634feb72'});

let ProjectSettingsManager = require('../utils/project-settings-manager');
let projectSettingsManager = new ProjectSettingsManager();

let graphCredentials = projectSettingsManager.getRepoCredentials();

let graph = require("seraph")({
  user: graphCredentials.username,
  pass: graphCredentials.password,
  server: graphCredentials.address
});


class MetadataManager {
  constructor(userName) {
    this.user = userName
    this.localCache = {};
  }

  async getSetKeywordsForUrl(urlNode) {
    let url = urlNode.address;

    // console.log(urlNode);
    if (!url.startsWith('http') || url.indexOf('localhost') != -1 || url.startsWith('https://www.google.com') || url.startsWith('http://www.facebook.com') || url.startsWith('http://www.google.com')) {
      return;
    }

    try {
      if ((_.isUndefined(urlNode.alchemy) || (!_.isUndefined(urlNode.alchemy) && urlNode.alchemy === 'failed')) && _.isUndefined(this.localCache[urlNode.address])) {
        try {
          // console.log('NO ALCHEMY FOR ', urlNode);
          let keywords = await this.getAlchemyKeyWords(url);
          let keywordNodes = await this.saveKeywords(keywords);
          let results = await this.updateNodeAndRelationships(urlNode, keywordNodes);
          // console.log('**** localCache'.red,this.localCache);
          // console.log('------------'.blue);
          // console.log('Final Results: '.red, results);
          // console.log('------------'.blue, 'keywords', keywords);
          this.localCache[urlNode.address] = true;

          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'success');
          // let keywordsNodes = await this.saveKeywords(keywords);
          // console.log('keywordsNodes returned: '.red, keywordsNodes);
          // let wikidata = await Promise.all(keywordsNodes.map(keywordNode => this.ensureWikidata(keywordNode)))
          // let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'fetched');
          // let relationship = await Promise.all(keywords.map(keywords => this.relateKeywordToUrl(keywords, urlNode)));
        } catch (err) {
          // console.log('getSetKeywordsForUrl failed:', err);
          this.localCache[urlNode.address] = true;
          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'error');
        }
      }

      let relatedKeywords = await graphUtil.getRelatedToUrl(url, 'related', 1);
      return relatedKeywords;
    } catch (e) {
      if (e.message.indexOf('alchemy') !== -1) {
        // console.log('Alchemy Error: Hmm... best guess is we exceeded our API limit.')
      } else {
        console.log('cant getset kws for url', e);
      }
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
    let urlUpdateCypher = `MERGE (n:Url { url: ${urlNode.address}, alchemy: 'fetched' }) RETURN n;`
    let updatedUrlNode = txn.query(urlUpdateCypher, {});

    // relate keywords to node
    let relationshipNodes = imm.List();
    keywordNodes.forEach(item => {
      let cypher = `START a=node(${item.node.id}), b=node(${updatedUrlNode.id}) MERGE a-[r:related]-b SET r.weight = coalesce(r.weight, 0) + ${item.relevance}`;
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
    // console.log('Saving alchemy keywords:'.green);

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
        MERGE (a)-[r:related]->(b)
        SET r.weight = coalesce(r.weight, 0) + ${kwObj.relevance}`;

      txn.query(cypher, {}, (err, result) => {
        if (err) {
          // console.log('?'.red, err);
        }

        // console.log('!:'.blue, result);
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
    // console.log('Getting alchemy keywords...'.green)
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
    'MERGE a-[r:' + relationship + ']-b ' + 'SET r.weight = coalesce(r.weight, 0) + ' + rel;
    let params = {
      origin: origin.id,
      target: target.id,
      relationship: relationship
    };

    let res = {};

    try {
      res = await graphUtil.queryGraph(cypher, params);
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
  }
}

module.exports = MetadataManager;
