import request from 'request-promise'
import watson from 'watson-developer-cloud';
import GraphDB from '../utils/graph';
import _ from 'lodash'

let graphUtils = new GraphDB();

let alchemy_language = watson.alchemy_language({
  api_key: 'ab2b4727617c0d529641168272d1e661634feb72'
});

let graph = require("seraph")({
  user: 'neo4j',
  pass: 'sherpa',
  server: 'http://45.55.36.193:7474'
});

graph.constraints.uniqueness.create('Keyword', 'text', function(err, constraint) {
  // console.log(constraint);
  // -> { type: 'UNIQUENESS', label: 'Person', property_keys: ['name'] }
});

class MetadataManager{
  constructor(userName){
    this.user = userName

  }


  async getSetKeywordsForUrl(urlNode){
    let url = urlNode.url;
    try {
      // let urlNode = await this.getUrlNodeByUrl(url);
      if (_.isUndefined(urlNode.alchemy)){

        console.log('no alchemy fetched yet, fetching for', url);
        let keywords = await this.getAlchemyKeyWords(url);

        let keywordsNodes = await Promise.all(keywords.map(keyword => this.saveKeyword(keyword.text)))

        let updatedNode = await this.updateUrlKeywordFetchStatus(url);
        let relationship = await Promise.all(keywords.map(keyword => this.relateKeywordToUrl(keyword,url)));
      }

      let relatedKeywords = await graphUtils.getRelatedToUrl(url,'related',1);
      return relatedKeywords;
    } catch (e) {
      console.log('cant getset kws for url', e);
    } finally {

    }

  }

  async updateUrlKeywordFetchStatus(url){
    let urlNode = await this.getUrlNodeByUrl(url);
    urlNode.alchemy = 'fetched';
    let updatedNode = await this.saveUrlNode(urlNode);
    console.log('updated node after fetching meta');

    return updatedNode;

  }

  saveUrlNode(urlNode){
    return new Promise(function(resolve, reject) {
      graph.save(urlNode, function(err, node){
        if (err) reject(err)
        else resolve(node)
      })
    });
  }

  getAlchemyKeyWords(url){
    return new Promise(function(resolve, reject) {
      if (url.startsWith("http")){
        let params = {
          url: url,
          maxRetrieve: 10
        };

        alchemy_language.keywords(params, function (err, response) {
          if (err){
              console.log('error:', err);
              reject(err);
          }
          else{
            let res = JSON.stringify(response, null, 2);
            resolve(response.keywords)
          }

        });
      }
      else{
        console.log('not http, so no kws');
        resolve([]);
      }


    });

  }

  async relateKeywordToUrl(keyword, url){
      try {
        let self = this;
        let keywordNode = await this.getKeywordByText(keyword.text);
        let urlNode = await this.getUrlNodeByUrl(url);
        let relationship = await self.relateNodes(keywordNode, urlNode, 'related', keyword.relevance);

        return(relationship);
      } catch (e) {
        console.log('cant relate keyword to url', e);
      } finally {

      }
  }

  async relateNodes(origin, target, relationship, relevance){
    let rel = (relevance)
    let cypher = 'START a=node({origin}), b=node({target}) '
                +'CREATE UNIQUE a-[r:'+relationship+']-b '
                +'SET r.weight = coalesce(r.weight, 0) + ' + rel;
    let params = {origin: origin.id, target: target.id, relationship: relationship};

    let res = {};

    try{
      res = await graphUtils.queryGraph(cypher,params);
      // console.log('res', res, cypher, params);
    }

    catch(err){
      console.log('failed to relate', err, params);
    }

    return res
  }

  getUrlNodeByUrl(url){
    return new Promise(function(resolve, reject) {
      graph.find({type: 'url', url: url}, function(err, urls){
        if (err) {
          console.log(err);
          reject (err)
        }
        else resolve(urls[0])
      })
    });
  }

  getKeywordByText(keyword){
    return new Promise(function(resolve, reject) {
      graph.find({type: 'keyword', text: keyword}, function(err, keywords){
        if (err) reject (err)
        else resolve(keywords[0])
      })
    });
  }

  saveKeyword(keyword){
    return new Promise(function(resolve, reject) {
      graph.save({type: 'keyword', text: keyword, alchemy:true}, 'Keyword', function(err, node){
        if (err) {
          graph.find({type: 'keyword', text: keyword, alchemy: true},function(err,node){
            if (err) reject(err)
            else {
              console.log('saved keyword', node);
              resolve(node);
            }
          })
        }
        else {
          resolve(node);
        }
      });
    });
  }
}

module.exports = MetadataManager;
