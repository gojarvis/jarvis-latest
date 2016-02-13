//TODO: Incomplete
const objectives = [
 {
    name: 'keyword',
    humanName: 'Keyword',
    resolvers: [
      {
        name: 'getFromUserIntent',
        dependencies: [],
        params: {
          path: ['entities', 'keyword',  0]
        },
        target: 'keyword'
      }
    ],
  },
  {
    //TODO:
     name: 'relatedKeywords',
     humanName: 'Related Keywords',
     resolvers: [
       {
         name: 'getRelatedItems',
         params: {
           source: '$keyword',
           threshold: 1,
           target: 'url'
         },
         dependencies: ['keyword'],
         target: 'urls'
       }
     ]
   }
];

module.exports = objectives;
