let _ = require('lodash');


// let ProjectSettingsManager = require('../utils/settings-manager');
let projectSettingsManager = require('../utils/settings-manager');

let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();

class AtomController {
    constructor(socket, io, context, history) {
        this.socket = socket;
        this.registerEvents();
        this.tabs = [];
        this.activeTab = {};
        this.io = io;
        this.context = context;
        this.history = history;
    }

    registerEvents() {
        var self = this;

        self.socket.on('atom-connected', function() {
            console.log('atom-connected', self.socket.id);
        });

        self.socket.on('atom-highlighted', function(msg) {
            let address = msg.uri;
            self.handleFileHighlighted(address).then(function(related) {

            });
        });

        self.socket.on('atom-file-close', function(msg){
            let address = msg.uri;

            self.handleFileClose(address).then(function(){
            })
        })
    }


    async relateOneToMany(origin, others, relationship) {
        // console.log(origin, others, relationship);
        let relationships = [];
        try {
            relationships = await Promise.all(others.map(target => graphUtil.relateNodes(origin, target, relationship)));
        } catch (err) {
            console.log('failed to relate one to many', err);
        }

        return relationships;
    }

    async getAndSave(address) {
        let self = this;
        let fileNode = await graphUtil.getFile(address);
        if (!fileNode) {
            console.log('saving');
            fileNode = await graphUtil.saveFile(address);
        }
        return fileNode

    }

    async handleFileClose(address){

      let projectPath = projectSettingsManager.getRootPath();

      let trimmedAddress = address.replace(projectPath, '');
      let fileNode = await graphUtil.getFile(trimmedAddress);
      this.context.removeFileNode(fileNode)
      return fileNode
    }

    async handleFileHighlighted(address) {
        let fileNode = await this.insertUniqueFile(address)
        let otherNodes = this.tabs.filter(tab => tab.id !== fileNode.id);
        //Killed this because things are being realted in the context controller
        // let rel = await this.relateOneToMany(fileNode, otherNodes, 'openwith');

        this.context.addFileNode(fileNode);
        this.history.saveEvent({
            type: 'highlighted',
            source: 'atom',
            data: {
                nodeId: fileNode.id,
                address: address
            }
        }).then(function(res) {
            // console.log('highlighted atom saved');
        });

        return rel

    }

    // async handleFileClose(address) {
    //     this.removeUniqueFile(address);
    // }

    async insertUniqueFile(address) {

        let projectPath = projectSettingsManager.getRootPath();
        let trimmedAddress = address.replace(projectPath, '');
        let fileNode = await this.getAndSave(trimmedAddress);
        let tab = this.tabs.filter(tab => tab.address === fileNode.address);
        if (tab.length == 0) {

            this.tabs.push(fileNode);
        }
        return fileNode;
    }

    async removeUniqueFile(address) {
        let fileNode = await this.getAndSave(address);
        let tab = this.tabs.filter(tab => tab.address === fileNode.address);
        if (tab.length > 0) {
            this.tabs = this.tabs.filter(tab => tab.address !== address);
        }
    }
}




module.exports = AtomController
