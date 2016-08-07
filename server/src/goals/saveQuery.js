//TODO: Incomplete
const objectives = [
  {
   name: 'queryName',
   humanName: 'Query Name',
   resolvers: [
     {
       name: 'getFromUser',
       params: {
         question: "What do you want to call this query?"
       },
       dependencies: [],
       target: 'queryName'
     }
    ],
  },
  {
   name: 'queryType',
   humanName: 'Query Type',
   resolvers: [
     {
       name: 'getFromUser',
       params: {
         question: "What database is used for this query?",
         options: ['neo4j', 'rethinkdb']
       },
       dependencies: [],
       target: 'queryName'
     }
    ],
  },
  {
   name: 'queryBody',
   humanName: 'Query Body',
   resolvers: [
     {
       name: 'getFromUser',
       params: {
         question: "What do you want to call this query?"
       },
       dependencies: [],
       target: 'queryName'
     }
    ],
  },
  {
    name: 'saveQuery',
    humanName: 'Save Query',
    resolvers: [
      {
        name: 'saveFact',
        params: {
          factType: 'user-query',
          subject: 'query',
          payload: '$query',
          source: 'user'
        },
        dependencies: ['userName'],
        target: 'fact'
      }
     ],
  }

]



module.exports = objectives;
