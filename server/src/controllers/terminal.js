let _ = require('lodash');
let config = require('config');


let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();

//TODO: Projects path
let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;

class TerminalController {
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

        self.socket.on('terminal-connected', function() {
            console.log('terminal-connected', self.socket.id);
        });

        self.socket.on('terminal-command', function(msg) {
            self.handleCommand(command).then(function(related) {

            });
        });
    }



    async getAndSave(command) {
        let self = this;
        let commandNode = await graphUtil.getCommand(command);
        if (!commandNode) {
            console.log('saving');
            commandNode = await graphUtil.saveCommand(command);
        }
        return commandNode

    }

    async handleCommand(command) {
        // console.log('ADDRESS', address);
        let commandNode = await this.insertUniqueCommand(address)


        this.context.addCommandNode(commandNode);
        this.history.saveEvent({
            type: 'command',
            source: 'terminal',
            data: {
                nodeId: commandNode.id,
                address: command
            }
        }).then(function(res) {
            // console.log('highlighted atom saved');
        });

        return commandNode

    }


    async insertUniqueCommand(command) {
        let command = await this.getAndSave(command);
        return command;
    }
}




module.exports = TerminalController
