let request = require("request-promise");
let watson = require("watson-developer-cloud");
let GraphUtil = require("../utils/graph");
let graphUtil = new GraphUtil();
let _ = require("lodash");
let imm = require("immutable");
let colors = require("colors");
let fs = require("fs");

//9afdfd3783da57ff673da2316105c8e52f411576

let alchemyLanguage = watson.alchemy_language({
    api_key: "ab2b4727617c0d529641168272d1e661634feb72"
});
let projectSettingsManager = require("../utils/settings-manager");

let alchemyBlacklist = [".*google.com.*", ".*localhost.*", ".*facebook.com*"];

let alchemyWhitelist = ["https?://.*"];

class KeywordsManager {
    constructor() {
        this.localCache = {};
    }

    async fetchKeywordsForUrlFromAlchemy(urlNode) {
        //Check if Alchemy was fetched for url
        let pass = await this.filterAlchemy(urlNode.address);

        if (!pass) {
            // console.log('skipping', urlNode.address);
            return;
        }

        let keywords, keywordsNodes, relationships, nodeAfterFetch;
        if (urlNode.alchemy === true) {
            // console.log('Exists', urlNode.address);
            let cypher = `MATCH (url:Url)<-[r:related]-(keyword:Keyword) WHERE url.address = '${urlNode.address}' RETURN url, collect(distinct(keyword)) as keywords, r order by r.desc`;
            keywords = await graphUtil.queryGraph(cypher);
        } else {
            //
            this.localCache[urlNode.address] = true;
            keywords = await this.fetchAlchemyKeywords(urlNode.address);
            keywordsNodes = await this.saveKeywords(keywords);
            nodeAfterFetch = await this.markNodeAsFetched(urlNode.address);
            relationships = await graphUtil.updateNodeAndRelationships(
                urlNode,
                keywordsNodes,
                keywords
            );

            let cypher = `MATCH (url:Url)<-[r:related]-(keyword:Keyword) WHERE url.address = '${urlNode.address}' RETURN url, collect(distinct(keyword)) as keywords, r order by r.desc`;
            keywords = await graphUtil.queryGraph(cypher);
            //cache
        }
        return keywords;
    }

    async markNodeAsFetched(address) {
        let cypher = `MATCH (url:Url) where url.address='${address}' SET url.alchemy = true return url`;
        let result;
        try {
            result = await graphUtil.queryGraph(cypher);
        } catch (e) {
            console.log("failed marking node as fetched");
        } finally {
            return result;
        }
    }

    async filterAlchemy(address) {
        let cached = !_.isUndefined(this.localCache[address]);

        let block = false;
        let pass = false;

        let blacklisted = await this.isInAlchemyBlackList(address);
        let whitelisted = await this.isInAlchemyWhiteList(address);

        if (!blacklisted && whitelisted && !cached) {
            return true;
        } else {
            return false;
        }
    }

    async isInAlchemyBlackList(address) {
        let isBlacklisted = false;
        alchemyBlacklist.forEach(expression => {
            if (this.testExpression(expression, address)) {
                isBlacklisted = true;
            }
        });

        return isBlacklisted;
    }

    async isInAlchemyWhiteList(address) {
        let isWhitelisted = false;
        alchemyWhitelist.forEach(expression => {
            if (this.testExpression(expression, address)) {
                isWhitelisted = true;
            }
        });

        return isWhitelisted;
    }

    testExpression(expression, str) {
        return _.isArray(str.match(expression));
    }

    async saveKeywords(keywords) {
        let result;
        let queries = keywords.map(keyword => {
            return `MERGE (n:Keyword { type: 'keyword', text: '${keyword.text}' }) RETURN n`;
        });

        try {
            result = await graphUtil.executeQueries(queries);
        } catch (e) {
            console.log("failed saving keywords", e);
        } finally {
            let extracted = result.map(item => item[0]);
            return extracted;
        }
    }

    async fetchAlchemyKeywords(url) {
        return new Promise(function(resolve, reject) {
            try {
                let params = {
                    url: url,
                    maxRetrieve: 10
                };

                alchemyLanguage.keywords(params, function(err, response) {
                    if (err) {
                        console.log(
                            "error fetching keywords from alchemy:",
                            err
                        );
                        reject(err);
                    } else {
                        let res = JSON.stringify(response, null, 2); //TODO:remove
                        resolve(response.keywords);
                    }
                });
            } catch (e) {
                console.log("failed fetching keywords from alchemy", e);
            }
        });
    }
}

module.exports = new KeywordsManager();
