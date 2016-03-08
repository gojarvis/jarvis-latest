'use strict'
const objectives = [
  {
   name: 'userName',
   humanName: 'User Name',
   resolvers: [
     {
       name: 'getFromUser',
       params: {
         question: "What is your name?"
       },
       dependencies: [],
       target: 'userName'
     }
    ],
  },
  {
    name: 'saveFact',
    humanName: 'Save Fact',
    resolvers: [
      {
        name: 'saveFact',
        params: {
          factType: 'user-fact',
          subject: 'userName',
          payload: '$userName', // marks the position of required in dependencies. Ask roie about this.
          source: 'user'
        },
        dependencies: ['userName'],
        target: 'fact'
      }
     ],
  }

]



module.exports = objectives;
