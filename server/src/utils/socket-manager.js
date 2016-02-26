const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');
const SlackController = require('../controllers/slack');

const Context = require('../controllers/contextManager');
const History = require('../controllers/historyManager');
const Leap = require('../controllers/leap');
const Proactive = require('../controllers/proactive');
const Deep = require('../controllers/deep');
const Conversations = require('../controllers/conversationsManager');

//The context contains all the urls and files open right now
//Access to the knowledge graph is gained via the context
const userInfo = {
  username: 'parties'
};



class SocketManager {
  constructor(socket, io) {
    let sessionIn = 'GKvm4Sdf';



    const context = new Context(history, userInfo, socket, io);
    const deep = new Deep(history, context, socket, io);

    const history = new History(userInfo.username, socket, io);

    //basic speech in/out
    this.wit = new WitController(socket, sessionIn, context, history, io)

    //Slack
    // this.slack = new SlackController(socket)

    //Basic conversation
    this.teach = new TeachController(socket, sessionIn, context, history, io)
    // this.leap = new Leap(socket, sessionIn, context, history)

    //Sensors (plugins)
    this.chrome = new ChromeController(socket, sessionIn, io, context, history)
    this.atom = new AtomController(socket, sessionIn, io, context, history)

    this.proactive = new Proactive(socket, sessionIn, io, context, history, deep);

    this.conversations = new Conversations(socket, sessionIn, io, context, history, deep);
  }
}
module.exports = SocketManager;
