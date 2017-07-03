let Promise = require("bluebird");
let _ = require("lodash");

let request = require("request-promise");

let GraphUtil = require("../utils/graph");
let graphUtil = new GraphUtil();
let settingsManager = require("../utils/settings-manager");
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

        this.urlFilterCache = {
            whitelistExpressions: [],
            blacklistExpressions: [],
            blacklistedUrls: [],
            whitelistedUrls: []
        };

        this.io.emit("load-tabs");
        this.registerEvents();
        this.prefillUrlFilterCache();
    }

    registerEvents() {
        var self = this;

        self.socket.on("chrome-init", function(tabs) {
            console.log("chrome-init");
            console.log("found ", tabs.length, "tabs.");
            self.tabs = tabs;
            self.saveSession();
            self.socket.emit("chrome-enabled");
        });

        self.socket.on("chrome-created", function(msg) {
            let { active, tabs } = msg;
            // console.log('chrome-created', tabs.length);
            self.tabs = tabs;
            console.log("Found ", self.tabs.length, "tabs");
            self.saveSession();
        });

        self.socket.on("chrome-highlighted", function(msg) {
            let { active, tabs } = msg;
            self.tabs = tabs;
            // console.log('===>TABS', tabs.length, active);
            self.handleHighlighted(active).then(function(related) {
                self.io.emit("related", related);
            });
        });

        self.socket.on("chrome-closed", async function(message) {
            let { closedTabId, tabs } = message;
            self.handleClosedTab(closedTabId, tabs);
        });

        self.socket.on("chrome-updated", async function(message) {
            // console.log('chrome-updated');
            let { active, tabs } = message;
            self.tabs = tabs;
            await self.saveSession();
            self.handleUpdated(active).then(function() {});

            self.saveSession();
        });

        self.socket.on("chrome-disable", function() {
            chromeExtensionEnabled = false;
            self.io.emit("chrome-disabled");
        });

        self.socket.on("chrome-enable", function() {
            chromeExtensionEnabled = true;
            self.io.emit("chrome-enabled");
        });

        self.socket.on("heartbeat", function(hb) {
            self.saveSession();
        });
    }

    async prefillUrlFilterCache() {
        let self = this;
        console.log("Prefilling url filter cache");
        let user = this.context.user;
        if (_.isEmpty(user)) {
            console.log("no user");
            return false;
        }

        let userNode = await graphUtil.getUserNodeByUsername(user.username);

        self.urlFilterCache.whitelistExpressions = await graphUtil.getRelatedNodes(
            userNode,
            "whitelist"
        );
        self.urlFilterCache.blacklistExpressions = await graphUtil.getRelatedNodes(
            userNode,
            "blacklist"
        );

        // console.log(this.urlFilterCache);
    }

    async saveSession() {
        let self = this;

        let blacklistEnabled = await settingsManager.getFilterStatus(
            "blacklist"
        );
        let whiteListEnabled = await settingsManager.getFilterStatus(
            "whitelist"
        );

        if (
            (self.urlFilterCache.whitelistExpressions.length === 0 ||
                self.urlFilterCache.blacklistExpressions.length === 0) &&
            (blacklistEnabled || whiteListEnabled)
        ) {
            self.prefillUrlFilterCache();
        }

        let filteredFlags = await Promise.all(
            self.tabs.map(tab => {
                return self.urlFilter(tab.url);
            })
        );
        let filteredTabs = [];
        self.tabs.forEach((tab, index) => {
            if (filteredFlags[index] === true) {
                filteredTabs.push(tab);
            }
        });

        this.context.updateTabs(filteredTabs);
        return true;
    }

    //The URL Gatekeeper
    async urlFilter(address) {
        //is blacklist enabled?
        let blacklistEnabled = await settingsManager.getFilterStatus(
            "blacklist"
        );
        let whiteListEnabled = await settingsManager.getFilterStatus(
            "whitelist"
        );

        if (!blacklistEnabled && !whiteListEnabled) {
            return true;
        }

        let block = false;
        let pass = false;

        let blacklisted = await this.isInBlackList(address);
        if (blacklistEnabled && blacklisted) {
            block = true;
        }

        let whitelisted = await this.isInWhiteList(address);
        if (whiteListEnabled) {
            pass = false;
            if (whitelisted) {
                pass = true;
            }
        } else {
            pass = true;
        }

        // console.log('filter', address, 'pass', pass, 'block', block, 'whiteListEnabled:', whiteListEnabled, );
        if (!block && pass) {
            return true;
        } else {
            return false;
        }
    }

    async isInWhiteList(address) {
        let isWhitelisted = false;
        let self = this;

        if (self.urlFilterCache.whitelistedUrls.indexOf(address) !== -1) {
            // console.log('FROM CACHE WL', address);
            return true;
        } else {
            // let userNode = await graphUtil.getUserNodeByUsername(user.username);
            let whitelistExpressions = self.urlFilterCache.whitelistExpressions;

            whitelistExpressions.forEach(expression => {
                if (this.testExpression(expression.address, address)) {
                    isWhitelisted = true;
                }
            });

            if (isWhitelisted) {
                console.log("Pushing to cache WL", address);
                this.urlFilterCache.whitelistedUrls.push(address);
            }

            return isWhitelisted;
        }
    }

    async isInBlackList(address) {
        // let userNode = await graphUtil.getUserNodeByUsername(user.username);
        let self = this;

        let isBlacklisted = false;

        if (this.urlFilterCache.blacklistedUrls.indexOf(address) !== -1) {
            return true;
        } else {
            let blacklistExpressions = this.urlFilterCache.blacklistExpressions;
            blacklistExpressions.forEach(expression => {
                if (this.testExpression(expression.address, address)) {
                    isBlacklisted = true;
                }
            });

            if (isBlacklisted) {
                console.log("Pushing to cache BL", address);
                this.urlFilterCache.blacklistedUrls.push(address);
            }
            return isBlacklisted;
        }
    }

    testExpression(expression, str) {
        return _.isArray(str.match(expression));
    }

    getActiveTab(id) {
        return this.tabs.filter(tab => tab.id === id);
    }

    async handleUpdated(active) {
        if (!chromeExtensionEnabled) {
            console.log("Chrome extension disabled");
            return;
        }
        let activeTab = this.getActiveTab(active);

        if (_.isUndefined(activeTab) || _.isUndefined(activeTab[0])) {
            console.log("tab undefined when handling updated");
            return;
        }

        let url = activeTab[0].url;
        let title = activeTab[0].title;

        let pass = await this.urlFilter(url);
        if (!pass) {
            // console.log('URL disabled by white or black lists', url);
            return;
        }

        let node = await graphUtil.getUrlNodeByUrl(activeTab[0].url);

        // console.log('NODE', node, this.context.activeUrl.url, activeTab[0].url);
        //
        if (_.isUndefined(node)) {
            node = await graphUtil.saveUrl(url, title);
            // console.log('NEW NODE', node);
        }

        // console.log('NODE', node, this.context.activeUrl);

        if (this.context.activeUrl.url !== activeTab[0].url) {
            this.context.setActiveUrl({
                url: url,
                title: title
            });

            this.history
                .saveEvent({
                    type: "highlighted",
                    source: "chrome",
                    data: {
                        nodeId: node.id,
                        address: url,
                        title: title
                    }
                })
                .then(function(res) {});
        }
        // return relatedUrls
    }

    async handleHighlighted(active) {
        if (!chromeExtensionEnabled) {
            console.log("Chrome extension disabled");
            return;
        }

        let activeTab = this.getActiveTab(active.tabIds[0]);
        let activeTabTitle = "";
        let activeTabUrl = "";

        if (!activeTab[0]) {
            return [];
        } else {
            activeTabTitle = activeTab[0].title;
            activeTabUrl = activeTab[0].url;
        }

        let pass = await this.urlFilter(activeTabUrl);
        if (!pass) {
            // console.log('URL disabled by white or black lists', activeTabUrl);
            return;
        }

        let activeUrl = {
            url: activeTabUrl,
            title: activeTabTitle
        };
        let node = await this.context.setActiveUrl(activeUrl);

        this.history
            .saveEvent({
                type: "highlighted",
                source: "chrome",
                data: {
                    nodeId: node.id,
                    address: activeUrl.url,
                    title: activeTab[0].title
                }
            })
            .then(function(res) {});
    }

    async handleClosedTab(closedTabId, tabs) {
        this.context.removeTab(tabs);
    }
}

module.exports = ChromeController;
