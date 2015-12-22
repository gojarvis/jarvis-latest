import level from 'level-browserify'
import levelgraph from 'levelgraph'

let db = levelgraph(level("chrome"));

// var triple = { subject: "a", predicate: "b", object: "c", "someStuff": 42 };
// db.put(triple, function() {
//   db.get({ subject: "a" }, function(err, list) {
//     console.log('list', list);
//   });
// });

class ChromeController {
  constructor(socket){
    this.socket = socket;
    this.registerEvents();
    this.tabs = [];
    this.activeTab = {};



  }

  getActiveTab(id){
    tabs.filter(tab => tab.id === id)
  }

  registerEvents(){
    var self = this;

    self.socket.on('chrome-init', function(tabs){
      console.log('chrome-init');
      console.log("found ",   tabs.length, "tabs.");
      self.tabs = tabs;
    });

    self.socket.on('chrome-created', function(active){
      console.log('chrome-created');
      self.tabs.push(active);
    });

    self.socket.on('chrome-highlighted', function(active){
      if (self.tabs.length > 0){
        console.log('chrome-highlighted');
        self.activeTab = self.tabs.filter(tab => tab.id === active.tabIds[0])[0]
        self.associateTabs();
        self.showRelations(self.activeTab);
      }

    });

  }

  showRelations(tab){
    console.log('url', tab.url);
    db.get({subject : tab.url}, function(err, list){
      console.log('assosc', list);
    });
  }

  associateTabs(){
    console.log('wat',this.tabs.length)
    this.tabs.map( tab => {
      // console.log('tab',tab);
      let rel = { subject: this.activeTab.url, predicate: 'openWith', object: tab.url};
      // console.log('rel',rel);
      db.put(rel, function(err){
          console.log('put', err);
      });
    })

  }


}




module.exports = ChromeController
