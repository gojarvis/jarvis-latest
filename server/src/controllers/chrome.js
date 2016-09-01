let Promise = require('bluebird');
let _ = require('lodash');

let request = require('request-promise');
let config = require('config');

let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();

let chromeExtensionEnabled = true;

class ChromeController {
    constructor(socket, io, context, history) {
        this.socket = socket;
        this.tabs = [];
        this.urls = [];
        this.activeTab = {};
        this.io = io;
        this.context = context;
        this.history = history;

        this.io.emit('load-tabs');
        this.registerEvents();

    }

    registerEvents() {
        var self = this;

        self.socket.on('chrome-init', function(tabs) {
            console.log('chrome-init');
            console.log("found ", tabs.length, "tabs.");
            self.tabs = tabs;
            self.saveSession();
            self.socket.emit('chrome-enabled')
        });

        self.socket.on('chrome-created', function(msg) {
            let {
                active,
                tabs
            } = msg;
            // console.log('chrome-created', tabs.length);
            self.tabs = tabs;
            console.log('Found ', self.tabs.length, 'tabs');
            self.saveSession();
        });

        self.socket.on('chrome-highlighted', function(msg) {
            let {
                active,
                tabs
            } = msg;
            self.tabs = tabs;
            // console.log('===>TABS', tabs.length, active);
            self.handleHighlighted(active).then(function(related) {
                self.io.emit('related', related)
            });
        });

        self.socket.on('chrome-closed', async function(message) {
            let {
                closedTabId,
                tabs
            } = message;
            self.handleClosedTab(closedTabId, tabs)
        })


        self.socket.on('chrome-updated', async function(message) {
            // console.log('chrome-updated');
            let {
                active,
                tabs
            } = message;
            self.tabs = tabs;
            await self.saveSession()
            self.handleUpdated(active).then(function() {

            });

            self.saveSession();
        });


        self.socket.on('chrome-disable', function() {
            chromeExtensionEnabled = false;
            self.io.emit('chrome-disabled')
        })

        self.socket.on('chrome-enable', function() {
            chromeExtensionEnabled = true;
            self.io.emit('chrome-enabled')
        })

        self.socket.on('heartbeat', function(hb) {

            self.saveSession();
        });

    }

    async saveSession() {
        let self = this;
        this.context.updateTabs(self.tabs);
        return true;
    }

    //TODO
    //The URL Gatekeeper
    async urlFilter(address){
      //is blacklist enabled?
      let block = false;
      let pass = true;
      let isInBlackList = await this.isInBlackList(address)
      if (blacklistEnabled && isInBlackList){
        block = true;
      }

      let isInWhiteList = this.isInWhiteList(address);
      if (whitelistEnabled){
        pass = false;
        if (isInWhiteList){
          pass = true;
        }
      }

      if (!block && pass){
        return address;
      }
      else{
        return false;
      }
    }

    async isInWhiteList(address) {
        let user = this.context.getUser()
        let whitelistExpressions = graphUtil.getWhitelistExpressions(user)
        let isWhitelisted = whitelistExpressions.map(expression => this.testExpression(expression, address))
    }

    async isInBlackList(address) {
        let user = this.context.getUser()
        let blacklistExpression = graphUtil.getBlacklistExpressions(user)
        let isBlacklisted = blacklistExpression.map(expression => this.testExpression(expression, address))
    }
    
    testExpression(expression, str){
          return expression.test(str);
    }

    async addRegexToBlackList(userId, address){
      // let urlNode = await graphUtil.getUrlNodeByUrl(address);
      // let targetId = urlNode.id;
      // let cypher = `
      //   START userNode=node(${userId}), targetNode=node(${targetId})
      //   MERGE (userNode)-[rel:blacklisted]->(targetNode)
      //   return userNode, targetNode, rel
      // `;
      //
      // console.log('cypher: ', cypher);
      //
      // try {
      //   let result = await graphUtil.queryGraph(cypher);
      //   return result
      // } catch(error) {
      //   console.error(`Blacking node(${req.body.nodeId}) for user(${req.body.userId}) failed`, cypher);
      // }
    }

    async addRegexToWhiteList(address){

    }


    getActiveTab(id) {
        return this.tabs.filter(tab => tab.id === id)
    }

    async handleUpdated(active) {

        if (!chromeExtensionEnabled) {
            console.log('Chrome extension disabled');
            return;
        }
        let activeTab = this.getActiveTab(active)
        let url = activeTab[0].url;
        let title = activeTab[0].title;
        // console.log('URL', url, 'TITIE', title);

        let node = await graphUtil.getUrlNodeByUrl(activeTab[0].url);

        // console.log('NODE', node, this.context.activeUrl.url, activeTab[0].url);
        //
        if (_.isUndefined(node)) {
            node = await graphUtil.saveUrl(url, title)
                // console.log('NEW NODE', node);
        }

        // console.log('NODE', node, this.context.activeUrl);

        if (this.context.activeUrl.url !== activeTab[0].url) {
            this.context.setActiveUrl({
                url: url,
                title: title
            });

            this.history.saveEvent({
                type: 'highlighted',
                source: 'chrome',
                data: {
                    nodeId: node.id,
                    address: url,
                    title: title
                }
            }).then(function(res) {

            });

        }
        // return relatedUrls
    }

    async handleHighlighted(active) {
        if (!chromeExtensionEnabled) {
            console.log('Chrome extension disabled');
            return;
        }
        let activeTab = this.getActiveTab(active.tabIds[0])
        let activeTabTitle = '';
        let activeTabUrl = '';

        if (!activeTab[0]) {
            return [];
        } else {
            activeTabTitle = activeTab[0].title;
            activeTabUrl = activeTab[0].url
        }

        let activeUrl = {
            url: activeTabUrl,
            title: activeTabTitle
        };
        let node = await this.context.setActiveUrl(activeUrl);

        this.history.saveEvent({
            type: 'highlighted',
            source: 'chrome',
            data: {
                nodeId: node.id,
                address: activeUrl.url,
                title: activeTab[0].title
            }
        }).then(function(res) {

        });
    }

    async handleClosedTab(closedTabId, tabs) {
        this.context.removeTab(tabs);
    }


}




module.exports = ChromeController
