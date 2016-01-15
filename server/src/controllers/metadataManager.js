import request from 'request-promise'
import watson from 'watson-developer-cloud';
import GraphDB from '../utils/graph';
import _ from 'lodash'
import wdk from 'wikidata-sdk';

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
    // console.log(urlNode);
    if (!url.startsWith('http') || url.indexOf('localhost') != -1 || url.startsWith('https://www.google.com') || url.startsWith('http://www.facebook.com') || url.startsWith('http://www.google.com')){
      return;
    }

    try {
      if (_.isUndefined(urlNode.alchemy)){
        try{
          let keywords = await this.getAlchemyKeyWords(url);
          let keywordsNodes = await Promise.all(keywords.map(keyword => this.saveKeyword(keyword)));
          let wikidata = await Promise.all(keywordsNodes.map(keywordNode => this.ensureWikidata(keywordNode)))
          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'fetched');
          let relationship = await Promise.all(keywords.map(keywords => this.relateKeywordToUrl(keywords,urlNode)));
        }
        catch(err){
          let updatedNode = await this.updateUrlKeywordFetchStatus(url, 'failed');
        }
      }

      let relatedKeywords = await graphUtils.getRelatedToUrl(url,'related',1);
      return relatedKeywords;
    } catch (e) {
      // console.log('cant getset kws for url', e);
      process.stdout.write(',');
    } finally {

    }

  }

  async updateUrlKeywordFetchStatus(url, status){
    let urlNode = await this.getUrlNodeByUrl(url);
    urlNode.alchemy = status;
    let updatedNode = await this.saveUrlNode(urlNode);
    // console.log('updated node after fetching meta');

    return updatedNode;

  }

  async ensureWikidata(keywordNode){
    if (_.isUndefined(keywordNode.wikidata)){
        // let url = wdk.searchEntities({search: keywordNode.text, format: 'json', language:'en'});
        // let data = await request(url);
        // console.log('WIKIDATA', data);
    }
  }

  saveKeywordWord(keywordNode){
    return new Promise(function(resolve, reject) {
      graph.save(keywordNode, function(err, node){
        if (err) reject(err)
        else resolve(node)
      })
    });
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
              // console.log('error:', err);
              process.stdout.write('~');
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

  async relateKeywordToUrl(keyword, urlNode){
      try {
        let self = this;
        let keywordNode = await self.getKeywordByText(keyword.text)
        let relationship = await self.relateNodes(keywordNode, urlNode, 'related', keyword.relevance);

        return(relationship);
      } catch (e) {
        // console.log('cant relate keyword to url', e);
        process.stdout.write('$');
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
      graph.find({type: 'keyword', text: keyword.text, alchemy: true},function(err,res){
        if (err) {
          console.log('could not find keyword', err);

        }
        else {
          if (_.isEmpty(res)){
            graph.save({type: 'keyword', text: keyword.text, alchemy:true}, 'Keyword', function(err, node){
              if (err) {
                // console.log('cant save keyword', node, res,err,  keyword.text);
                process.stdout.write(':');
              }
              else {
                process.stdout.write('^');
                resolve(node[0])
              }
            });
          }
          else{
            // console.log('found keyword', res[0]);
            resolve(res[0]);
          }

        }
      })

    });
  }
}

module.exports = MetadataManager;
