let ChromeController = require("../controllers/chrome");
let AtomController = require("../controllers/atom");
let TerminalController = require("../controllers/terminal");
let Context = require("../controllers/contextManager");
let History = require("../controllers/historyManager");
let _ = require("lodash");

let context = {};

class SocketManager {
    constructor(socket, io, user) {
        let history = new History(socket, io, user.username);

        if (_.isUndefined(context.user)) {
            context = new Context(
                history,
                { username: user.username },
                socket,
                io
            );
        }

        //Plugins
        try {
            this.chrome = new ChromeController(socket, io, context, history);
            this.atom = new AtomController(socket, io, context, history);
            this.terminal = new TerminalController(
                socket,
                io,
                context,
                history
            );
            console.log("All controller instantiated");
        } catch (e) {
            console.log("Cant instantiate controllers", e);
        }
    }
}
module.exports = SocketManager;
