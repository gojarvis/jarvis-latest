import brain from 'brain'
import limdu from 'limdu'
import Redis from 'ioredis'
import serialize from 'serialization'

import IntentsManager from './intentsManager.js';

// First, define our base classifier type (a multi-label classifier based on svm.js):
let TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
  binaryClassifierType: limdu.classifiers.SvmJs.bind(0, {C: 1.0})
});

function newClassifierFunction() {
  var limdu = require('limdu');
  var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
    binaryClassifierType: limdu.classifiers.Winnow.bind(0, {retrain_count: 10})
  });

  var WordExtractor = function (input, features) {
    input.split(" ").forEach(function (word) {
      features[word] = 1;
    });
  };

  // Initialize a classifier with a feature extractor:
  return new limdu.classifiers.EnhancedClassifier({
    classifierType: TextClassifier, featureExtractor: WordExtractor, pastTrainingSamples: [], // to enable retraining
  });
}

class Teach {
  constructor(socket, sid, context, history) {
    this.db = new Redis();
    this.socket = socket;
    this.registerEvents();
    this.context = context;
    this.intents = new IntentsManager(context);
    this.net = newClassifierFunction();
    this.conv = newClassifierFunction();
    this.loadNet();
    this.history = history;

  }

  loadNet() {
    this.db.get('net', function (err, netString) {
      if (netString) {
        this.net = serialize.fromString(netString, __dirname);
      }
    }.bind(this))

    this.db.get('conv', function (err, netString) {
      if (netString) {
        this.conv = serialize.fromString(netString, __dirname);
      }
    }.bind(this))
  }

  saveNet() {
    let intentClassifierString = serialize.toString(this.net, newClassifierFunction);
    let convIntentClassifierString = serialize.toString(this.conv, newClassifierFunction);
    this.db.set('net', intentClassifierString);
    this.db.set('conv', convIntentClassifierString);
  }

  train(intent, response, topic) {
    console.log("training ", intent, "with ", response, "for", topic);
    this.net.trainOnline(response, intent);
    if (topic) {
      console.log('found topic', topic);
      this.conv.trainOnline(response, intent + "_" + topic);
    }

    this.saveNet();
  }

  ask(intent) {
    return this.net.backClassify(intent);
  }

  async intentHandler(witResponse) {
    let self = this;
    let result = await this.intents.handleKnownIntents(witResponse, this.context, this.history);
    self.socket.emit('intent-result', result);
  }

  conversation(msg) {
    let self = this;
    self.socket.emit('log', {
      msg: msg,
      origin: 'server-in-message'
    });
    let {intent, topic} = msg;
    console.log("CONV", intent, topic);

    return this.conv.backClassify(intent + "_" + topic);
  }

  teach(lesson) {
    let {witresult, response, intent, topic} = lesson;
    this.train(intent, response, topic);

  }

  queryNet(intent) {
    return this.net.run(intent)
  }

  registerEvents() {
    let self = this;

    self.socket.on('teach', function (lesson) {
      self.teach(lesson);
    });

    // self.socket.on('ask', function (intent) {
    //   self.socket.emit('net-result', self.ask(intent));
    // });

    self.socket.on('intent', function (witResponse) {
      let result = self.intentHandler(witResponse);
    });

    self.socket.on('conv', function (msg) {
      self.socket.emit('log', {
        msg: msg,
        origin: 'server'
      });
      self.socket.emit('conv-result', self.conversation(msg));
    });
  }
}

module.exports = Teach
