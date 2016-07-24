const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');
const SlackController = require('../controllers/slack');

const Context = require('../controllers/contextManager');
const History = require('../controllers/historyManager');
const Proactive = require('../controllers/proactive');
const Deep = require('../controllers/deep');
const Conversations = require('../controllers/conversationsManager');
import config from 'config';
//The context contains all the urls and files open right now
//Access to the knowledge graph is gained via the context
let userConfig = config.get('user');

const userInfo = {
  username: userConfig.username
};

const history = new History(userInfo.username);
const context = new Context(history, userInfo);
const deep = new Deep(history, context);

class SocketManager {
  constructor(socket, io) {
    let sid = 'GKvm4Sdf';

    // basic speech in/out
    this.wit = new WitController(socket, sid, context, history)

    //Slack
    // this.slack = new SlackController(socket)

    //Basic conversation
    this.teach = new TeachController(socket, sid, context, history)
    // this.leap = new Leap(socket, sid, context, history)

    //Sensors (plugins)
    this.chrome = new ChromeController(socket, sid, io, context, history)
    this.atom = new AtomController(socket, sid, io, context, history)

    this.proactive = new Proactive(socket, sid, io, context, history, deep);

    this.conversations = new Conversations(socket, sid, io, context, history, deep);
  }
}
module.exports = SocketManager;
