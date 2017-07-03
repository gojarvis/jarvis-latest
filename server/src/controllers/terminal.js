let _ = require("lodash");
let GraphUtil = require("../utils/graph");
let graphUtil = new GraphUtil();

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
        self.socket.on("terminal-connected", function() {
            console.log("terminal-connected", self.socket.id);
        });

        self.socket.on("terminal-command", function(commandResponseTupple) {
            self
                .handleCommand(commandResponseTupple)
                .then(function(commandNode) {
                    // console.log('COMMAND', commandNode);
                });
        });
    }

    async getAndSave(command) {
        let self = this;
        let commandNode = await graphUtil.getCommand(command);
        if (!commandNode) {
            commandNode = await graphUtil.saveCommand(command);
        }
        return commandNode;
    }

    async handleCommand(commandResponseTupple) {
        let { command, response } = commandResponseTupple;
        console.log("Command", command, response);
        let commandNode = await this.getAndSave(command);

        this.context.addCommandNode(commandNode);
        this.history
            .saveEvent({
                type: "command",
                source: "terminal",
                data: {
                    nodeId: commandNode.id,
                    address: command,
                    response: response
                }
            })
            .then(function(res) {
                // console.log('command saved');
            });

        return commandNode;
    }
}

module.exports = TerminalController;
