let _ = require('lodash');
let GraphUtil = require('../utils/graph');
let graphUtil = new GraphUtil();


class TerminalController {
    constructor(socket, io, context, history) {
        console.log('constructing');
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
        console.log('registering terminal events');
        self.socket.on('terminal-connected', function() {
            console.log('terminal-connected', self.socket.id);
        });

        self.socket.on('terminal-command', function(commandResponseTupple) {
            self.handleCommand(commandResponseTupple).then(function(commandNode) {

            });
        });
    }
    //
    //
    //
    async getAndSave(command) {
        let self = this;
        let commandNode = await graphUtil.getCommand(command);
        if (!commandNode) {
            console.log('saving');
            commandNode = await graphUtil.saveCommand(command);
        }
        return commandNode

    }

    async handleCommand(commandResponseTupple) {
        // console.log('ADDRESS', address);
        let {command, response} = commandResponseTupple;
        let commandNode = await this.getAndSave(command)


        this.context.addCommandNode(commandNode);
        this.history.saveEvent({
            type: 'command',
            source: 'terminal',
            data: {
                nodeId: commandNode.id,
                address: command,
                response: response
            }
        }).then(function(res) {
            // console.log('highlighted atom saved');
        });

        return commandNode


    }

}




module.exports = TerminalController
