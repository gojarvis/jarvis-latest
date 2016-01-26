import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    console.log('RESOLVER GOT BUILT'.yellow);
    this.master = master;
    this.resolverName = 'getFromUser';

    this.master.on('getFromUser', this.get.bind(this));

    this.get = this.get.bind(this)
  }

  async get(objective) {
    console.log('hello master! i am here to server !'.blue, objective);
    console.log('emitting:', `objective${this.resolverName}Resolved`, this.master);

    ///MAGIC HERE
    let wait = await this.doAsync()
    console.log('done waiting'.orange);
    this.master.emit(`objectiveResolved`, { objective: objective, results: 'hello from the other side!'});
    // this.doAsync().then(function(){
    //
    // }.bind(this))
    // // when done

  }

  doAsync(){
    return new Promise(function(resolve, reject) {
      setTimeout(function(){
        console.log('done async'.green);
        resolve();
      },10000)
    });
  }


}

module.exports = getFromUser;
